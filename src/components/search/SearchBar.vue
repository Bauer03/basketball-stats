<template>
  <div class="search-container">
    <div class="search-wrapper">
      <div class="search-bar">
        <v-text-field
          v-model="displayQuery"
          :placeholder="placeholderText"
          variant="outlined"
          density="comfortable"
          hide-details
          class="search-input"
          @keydown.tab.prevent="cycleSearchType"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown.enter.prevent="handleEnter"
          @keydown.down.prevent="handleKeyDown"
          @keydown.up.prevent="handleKeyUp"
          @keydown.esc.prevent="handleEscape"
          ref="searchInput"
          bg-color="surface"
          rounded="xl"
          :style="{ '--v-theme-surface': 'rgba(147, 51, 234, 0.1)' }"
          :readonly="isSearching"
        >
          <template v-slot:prepend-inner>
            <v-icon color="rgba(147, 51, 234, 0.7)">{{ isSearching ? 'mdi-loading mdi-spin' : 'mdi-magnify' }}</v-icon>
          </template>
        </v-text-field>
        <v-btn
          :color="searchType"
          variant="text"
          class="search-type-btn"
          @click="cycleSearchType"
          @mousedown.prevent
        >
          {{ searchType }}
        </v-btn>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showResults" class="search-results-overlay">
        <div 
          class="search-results-backdrop" 
          @click="showResults = false"
          @mousedown.prevent
        ></div>
        <div 
          class="search-results-container"
          :style="{
            top: searchInput ? `${searchInput.$el.getBoundingClientRect().bottom + 8}px` : '0px',
            left: searchInput ? `${searchInput.$el.getBoundingClientRect().left}px` : '0px',
            width: searchInput ? `${searchInput.$el.offsetWidth}px` : 'auto',
            maxHeight: 'calc(100vh - 96px)',
          }"
        >
          <v-card class="search-results-card">
            <SearchResults
              :type="searchType"
              :is-loading="isSearching"
              :is-visible="showResults"
              :teams="teams"
              :players="players"
              :games="games"
              @select="handleSelect"
              @conference-change="handleConferenceChange"
              @date-change="handleDateChange"
              @team-change="handleTeamChange"
              @player-team-change="handlePlayerTeamChange"
              @position-change="handlePositionChange"
              @refocus="handleRefocus"
            />
          </v-card>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import SearchResults from './SearchResults.vue'
import api from '@/api/axios'
import { useRouter } from 'vue-router'
import debounce from 'lodash/debounce'

const emit = defineEmits(['search-select', 'update-grid', 'move-selection'])

const props = defineProps({
  showByDefault: {
    type: Boolean,
    default: false
  }
})

const searchTypes = ['Teams', 'Players', 'Games']
const currentTypeIndex = ref(0)
const searchQuery = ref('')
const displayQuery = ref('')
const searchInput = ref(null)
const showResults = ref(props.showByDefault)
const isSearching = ref(false)
const router = useRouter()

// Add state for search results
const teams = ref([])
const players = ref([])
const games = ref([])

const searchType = computed(() => searchTypes[currentTypeIndex.value])

const placeholderText = computed(() => {
  switch (searchType.value) {
    case 'Teams':
      return 'Search for teams...'
    case 'Players':
      return 'Search for players...'
    case 'Games':
      return 'Search for games...'
    default:
      return 'Search...'
  }
})

const cycleSearchType = () => {
  currentTypeIndex.value = (currentTypeIndex.value + 1) % searchTypes.length
  const newType = searchTypes[currentTypeIndex.value].toLowerCase()
  
  // Emit the stats-view-changed event with the new view type
  window.dispatchEvent(new CustomEvent('stats-view-changed', { 
    detail: newType
  }))
  
  // Navigate to the appropriate route
  switch (newType) {
    case 'teams':
      router.push('/teams')
      break
    case 'players':
      router.push('/players')
      break
    case 'games':
      router.push('/games')
      break
  }
}

const handleInput = () => {
  console.log('Input handled, showing results')
  showResults.value = true
}

const handleEnter = async (e) => {
  console.log('Enter key pressed')
  e.preventDefault()
  
  // For Games search, we want to trigger the search even if the query is empty
  if (searchType.value === 'Games') {
    console.log('Games search - triggering search on Enter')
    try {
      isSearching.value = true
      // Include all current filters in the search
      const filters = {
        conference: currentConference.value,
        ...currentDateRange.value,
        teams: currentTeams.value,
        team: currentPlayerTeam.value,
        position: currentPosition.value
      }
      
      // Make API call directly
      const response = await api.get('/games', { params: filters })
      const results = response.data.data || []
      
      console.log(`Games search results:`, results)
      
      const updateData = { 
        type: searchType.value, 
        results,
        query: displayQuery.value || '',
        shouldOpenModal: false
      }
      
      // First dispatch the event globally
      window.dispatchEvent(new CustomEvent('search-grid-update', { 
        detail: updateData
      }))

      // Then navigate to the appropriate route if not already there
      const route = searchType.value.toLowerCase()
      if (router.currentRoute.value.path !== `/${route}`) {
        await router.push(`/${route}`)
      }
      
      return
    } catch (err) {
      console.error('Failed to fetch games search results:', err)
      return
    } finally {
      isSearching.value = false
    }
  }
  
  // For other search types, only proceed if there's a query
  if (!displayQuery.value.trim() || isSearching.value) {
    console.log('Search query empty or already searching')
    return
  }
  
  try {
    isSearching.value = true
    console.log('Making API call for search:', displayQuery.value)
    
    // Include all current filters in the search
    const filters = {
      conference: currentConference.value,
      ...currentDateRange.value,
      teams: currentTeams.value,
      team: currentPlayerTeam.value,
      position: currentPosition.value
    }
    
    // Make API call based on search type
    let response
    let results = []
    
    if (searchType.value === 'Teams') {
      response = await api.get('/teams', { params: { 'team-search': displayQuery.value } })
      // Filter teams client-side as well to ensure we get the best match
      results = response.data.data.filter(team => 
        team.full_name.toLowerCase().includes(displayQuery.value.toLowerCase()) ||
        team.name.toLowerCase().includes(displayQuery.value.toLowerCase()) ||
        team.abbreviation.toLowerCase().includes(displayQuery.value.toLowerCase())
      )
    } else if (searchType.value === 'Players') {
      response = await api.get('/players', { params: { 'name-search': displayQuery.value, ...filters } })
      results = response.data.data || []
    }
    
    console.log(`${searchType.value} search results:`, results)
    
    const updateData = { 
      type: searchType.value, 
      results,
      query: displayQuery.value,
      shouldOpenModal: false
    }
    
    // First dispatch the event globally
    window.dispatchEvent(new CustomEvent('search-grid-update', { 
      detail: updateData
    }))

    // Then navigate to the appropriate route if not already there
    const route = searchType.value.toLowerCase()
    if (router.currentRoute.value.path !== `/${route}`) {
      await router.push(`/${route}`)
    }
  } catch (err) {
    console.error('Failed to fetch search results:', err)
  } finally {
    isSearching.value = false
  }
}

const handleSelect = (item) => {
  console.log('Search item selected:', item)
  window.dispatchEvent(new CustomEvent('search-select', { 
    detail: { 
      type: searchType.value,
      item,
      shouldOpenModal: true
    }
  }))
}

const handleFocus = () => {
  console.log('Search input focused')
  if (displayQuery.value || props.showByDefault) {
    console.log('Showing results due to focus')
    showResults.value = true
  }
}

const handleBlur = (e) => {
  console.log('Search input blur event')
  // Only hide results if clicking outside both the input and results
  setTimeout(() => {
    const activeElement = document.activeElement
    const clickedElement = e.relatedTarget
    const searchContainer = document.querySelector('.search-container')
    const isClickingSearchContainer = searchContainer?.contains(clickedElement)
    const isClickingResults = activeElement?.closest('.search-results-card') || clickedElement?.closest('.search-results-card')
    
    console.log('Blur check:', {
      isClickingSearchContainer,
      isClickingResults
    })
    
    if (!isClickingResults && !isClickingSearchContainer) {
      console.log('Hiding results due to blur')
      showResults.value = false
    }
  }, 0)
}

const handleConferenceChange = (conference) => {
  currentConference.value = conference
}

const handleDateChange = ({ startDate, endDate }) => {
  currentDateRange.value = { startDate, endDate }
}

const handleTeamChange = (teams) => {
  currentTeams.value = teams
}

const handlePlayerTeamChange = (team) => {
  currentPlayerTeam.value = team
}

const handlePositionChange = (position) => {
  currentPosition.value = position
}

const handleRefocus = () => {
  searchInput.value?.focus()
  showResults.value = true
}

const handleEscape = () => {
  showResults.value = false
  searchInput.value?.blur()
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    handleEnter(e)
  }
}

const handleKeyUp = (e) => {
  if (e.key === 'ArrowUp' && showResults.value) {
    e.preventDefault()
    emit('move-selection', 'up')
  }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const handleKeyPress = (event) => {
  if (event.key === '/' && !event.target.matches('input, textarea')) {
    event.preventDefault()
    const input = searchInput.value?.$el?.querySelector('input')
    if (input) {
      input.focus()
      showResults.value = true
    }
  }
}

onMounted(async () => {
  await wait(150)
  const input = searchInput.value?.$el?.querySelector('input')
  if (input) {
    input.focus()
    showResults.value = true
  }

  window.addEventListener('keydown', handleKeyPress)
  window.addEventListener('search-enter-pressed', handleEnter)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('search-enter-pressed', handleEnter)
})

defineExpose({
  searchQuery,
  searchType
})

const debouncedViewChange = debounce((view) => {
  const index = searchTypes.findIndex(type => type.toLowerCase() === view)
  if (index !== -1) {
    currentTypeIndex.value = index
  }
}, 500)

const currentConference = ref(null)
const currentDateRange = ref(null)
const currentTeams = ref([])
const currentPlayerTeam = ref(null)
const currentPosition = ref(null)

// Add watcher for showResults
watch(showResults, (newVal) => {
  console.log('showResults changed:', newVal)
})
</script>

<style scoped>
.search-container {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 100;
  width: 100%;
}

.search-wrapper {
  position: relative;
  z-index: 100;
  width: 100%;
}

.search-bar {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  z-index: 100;
}

.search-input {
  width: 100%;
}

:deep(.v-input__control) {
  width: 100%;
}

.search-type-btn {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  font-weight: 500;
  text-transform: capitalize;
  border-radius: 9999px;
  min-width: 80px;
  height: 32px;
}

.search-results-card {
  background-color: var(--color-bg-elevated) !important;
  border: 1px solid var(--color-border-light) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: 0 4px 20px var(--shadow-color) !important;
}

:deep(.v-field) {
  border-radius: var(--radius-full) !important;
  background: var(--searchbar-bg) !important;
  /* padding-right: 100px !important; */
  transition: all 0.2s ease !important;
  position: relative;
  z-index: 0;
  width: 100%;
}

:deep(.v-field__field) {
  width: 100%;
}

:deep(.v-field__input) {
  color: var(--color-text-primary) !important;
  padding: var(--spacing-md) var(--spacing-lg) !important;
  padding-right: 96px;
  position: relative;
  z-index: 9999;
}

:deep(.v-field__prepend-inner) {
  padding-inline-start: var(--spacing-lg) !important;
  color: var(--color-interactive) !important;
  transition: all 0.2s ease;
  position: relative;
  z-index: 9999;
}

:deep(.v-field__append-inner) {
  padding-inline-end: 0 !important;
}

:deep(.mdi-spin) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(input::placeholder) {
  color: var(--color-text-muted) !important;
}

:deep(.v-progress-circular) {
  margin-right: var(--spacing-md);
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.search-results-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

.search-results-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.search-results-container {
  pointer-events: auto;
  background: var(--background-dark, #1a1a1a);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: absolute !important;
  min-width: 320px;
}

.search-results-card {
  background: var(--background-dark, #1a1a1a) !important;
  border: 1px solid rgba(147, 51, 234, 0.2);
  width: 100%;
  overflow: visible !important;
}

:deep(.v-card) {
  background: var(--background-dark, #1a1a1a) !important;
  color: var(--color-text-primary) !important;
}

:deep(.v-overlay__content) {
  pointer-events: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 96px);
}
</style> 