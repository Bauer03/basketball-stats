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
          color="#9333ea"
          variant="text"
          class="search-type-btn"
          @click="cycleSearchType"
          @mousedown.prevent
        >
          {{ currentSearchType }}
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
              :type="currentSearchType"
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

const currentSearchType = computed(() => {
  const type = searchTypes[currentTypeIndex.value]
  return type || 'Teams'
})

const placeholderText = computed(() => {
  switch (currentSearchType.value) {
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

const cycleSearchType = async () => {
  const oldIndex = currentTypeIndex.value
  currentTypeIndex.value = (currentTypeIndex.value + 1) % searchTypes.length
  const newType = searchTypes[currentTypeIndex.value].toLowerCase()
  
  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('stats-view-changed', {
    detail: newType
  }))
  
  // Navigate to new route if needed
  if (router.currentRoute.value.path !== `/${newType}`) {
    await router.push(`/${newType}`)
  }
}

const handleInput = () => {
  showResults.value = true
}

const handleEnter = async (e) => {
  e.preventDefault()
  
  if (currentSearchType.value === 'Games') {
    try {
      isSearching.value = true
      const filters = {
        conference: currentConference.value,
        ...currentDateRange.value,
        teams: currentTeams.value,
        team: currentPlayerTeam.value,
        position: currentPosition.value
      }
      
      const response = await api.get('/games', { params: filters })
      const results = response.data.data || []
      
      const updateData = { 
        type: currentSearchType.value, 
        results,
        query: displayQuery.value || '',
        shouldOpenModal: false
      }
      
      window.dispatchEvent(new CustomEvent('search-grid-update', { 
        detail: updateData
      }))

      const route = currentSearchType.value.toLowerCase()
      if (router.currentRoute.value.path !== `/${route}`) {
        await router.push(`/${route}`)
      }
      
      return
    } catch (err) {
      console.error('Failed to fetch games:', err)
      return
    } finally {
      isSearching.value = false
    }
  }
  
  if (!displayQuery.value.trim() || isSearching.value) return
  
  try {
    isSearching.value = true
    
    const filters = {
      conference: currentConference.value,
      ...currentDateRange.value,
      teams: currentTeams.value,
      team: currentPlayerTeam.value,
      position: currentPosition.value
    }
    
    let response
    let results = []
    
    if (currentSearchType.value === 'Teams') {
      response = await api.get('/teams', { params: { 'team-search': displayQuery.value } })
      results = response.data.data.filter(team => 
        team.full_name.toLowerCase().includes(displayQuery.value.toLowerCase()) ||
        team.name.toLowerCase().includes(displayQuery.value.toLowerCase()) ||
        team.abbreviation.toLowerCase().includes(displayQuery.value.toLowerCase())
      )
    } else if (currentSearchType.value === 'Players') {
      response = await api.get('/players', { params: { 'name-search': displayQuery.value, ...filters } })
      results = response.data.data || []
    }
    
    const updateData = { 
      type: currentSearchType.value, 
      results,
      query: displayQuery.value,
      shouldOpenModal: false
    }
    
    window.dispatchEvent(new CustomEvent('search-grid-update', { 
      detail: updateData
    }))

    const route = currentSearchType.value.toLowerCase()
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
  window.dispatchEvent(new CustomEvent('search-select', { 
    detail: { 
      type: currentSearchType.value,
      item,
      shouldOpenModal: true
    }
  }))
}

const handleFocus = () => {
  if (displayQuery.value || props.showByDefault) {
    showResults.value = true
  }
}

const handleBlur = (e) => {
  setTimeout(() => {
    const activeElement = document.activeElement
    const clickedElement = e.relatedTarget
    const searchContainer = document.querySelector('.search-container')
    const isClickingSearchContainer = searchContainer?.contains(clickedElement)
    const isClickingResults = activeElement?.closest('.search-results-card') || clickedElement?.closest('.search-results-card')
    
    if (!isClickingResults && !isClickingSearchContainer) {
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
  // Initialize search type based on current route
  const currentPath = router.currentRoute.value.path.slice(1) // Remove leading slash
  const initialType = currentPath || 'teams'
  
  const typeIndex = searchTypes.findIndex(type => type.toLowerCase() === initialType)
  
  if (typeIndex !== -1) {
    currentTypeIndex.value = typeIndex
  }

  await wait(150)
  const input = searchInput.value?.$el?.querySelector('input')
  if (input) {
    input.focus()
    showResults.value = true
  }

  window.addEventListener('keydown', handleKeyPress)
  window.addEventListener('search-enter-pressed', handleEnter)
  window.addEventListener('search-type-changed', handleSearchTypeChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('search-enter-pressed', handleEnter)
  window.removeEventListener('search-type-changed', handleSearchTypeChange)
})

const handleSearchTypeChange = (event) => {
  const newType = event.detail
  
  const newIndex = searchTypes.findIndex(type => type.toLowerCase() === newType.toLowerCase())
  
  if (newIndex !== -1) {
    currentTypeIndex.value = newIndex
  }
}

defineExpose({
  searchQuery,
  currentSearchType
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
})

const handleSearchSelection = async ({ type, item }) => {
  if (type === 'Teams') {
    const teamData = item.item || item
    await selectTeam(teamData, true)
  } else if (type === 'Players') {
    router.push('/players')
  } else if (type === 'Games') {
    router.push('/games')
  }
}

const handleSearchGridUpdate = (data) => {
  if (data.type === 'Teams') {
    if (data.query && data.query.trim()) {
      teams.value = data.results
      isInFavoritesView.value = false
      
      if (data.results.length > 0) {
        selectTeam(data.results[0], false)
      }
    } else {
      fetchTeams()
    }
  }
}

// Add watcher for currentTypeIndex
watch(currentTypeIndex, (newIndex, oldIndex) => {
}, { immediate: true })

// Add watcher for route changes
watch(() => router.currentRoute.value.path, (newPath) => {
  const type = newPath.slice(1) || 'teams'
  const typeIndex = searchTypes.findIndex(t => t.toLowerCase() === type)
  if (typeIndex !== -1 && typeIndex !== currentTypeIndex.value) {
    currentTypeIndex.value = typeIndex
  }
}, { immediate: true })
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