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

      <v-menu
        v-model="showResults"
        :close-on-content-click="false"
        location="bottom"
        offset="10"
        transition="scale-transition"
        :width="searchInput?.$el?.offsetWidth"
        :z-index="9999"
        :close-on-click="false"
        :close-delay="0"
        :open-delay="0"
        :close-on-back="false"
        persistent
      >
        <template v-slot:activator="{ props }">
          <div v-bind="props" class="search-activator" style="width: 100%; height: 0;"></div>
        </template>

        <v-card class="search-results-card" style="width: 100%;">
          <SearchResults
            :type="searchType"
            :is-loading="isSearching"
            :is-visible="true"
            :teams="teamsData"
            :players="searchResults?.players || []"
            :games="searchResults?.games || []"
            @select="handleSelect"
            @conference-change="handleConferenceChange"
            @date-change="handleDateChange"
            @team-change="handleTeamChange"
            @player-team-change="handlePlayerTeamChange"
            @position-change="handlePositionChange"
            @refocus="handleRefocus"
          />
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useSearch } from '@/composables/useSearch'
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

const { searchResults, isLoading: isSearching, debouncedSearch } = useSearch()
const router = useRouter()

const searchType = computed(() => searchTypes[currentTypeIndex.value])
const hasResults = computed(() => {
  if (!searchResults) return false
  
  switch (searchType.value) {
    case 'Teams':
      return searchResults.teams?.length > 0
    case 'Players':
      return searchResults.players?.length > 0
    case 'Games':
      return searchResults.games?.length > 0
    default:
      return false
  }
})

const teamsData = computed(() => {
  const results = searchResults.value
  console.log('Search results in SearchBar:', results)
  const teamsProxy = results?.teams
  const teams = teamsProxy ? [...teamsProxy] : []
  console.log('Teams data being passed to SearchResults:', teams)
  return teams
})

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
  
  if (displayQuery.value) {
    debouncedSearch(displayQuery.value, searchType.value)
  }
}

const handleInput = () => {
  showResults.value = true
}

const handleEnter = async (e) => {
  console.log('Enter key pressed')
  e.preventDefault()
  if (!displayQuery.value.trim() || isSearching.value) {
    console.log('Search query empty or already searching')
    return
  }
  
  try {
    console.log('Making API call for search:', displayQuery.value)
    
    // Include all current filters in the search
    const filters = {
      conference: currentConference.value,
      ...currentDateRange.value,
      teams: currentTeams.value,
      team: currentPlayerTeam.value,
      position: currentPosition.value
    }
    
    // Wait for the search to complete and get the results
    await debouncedSearch(displayQuery.value, searchType.value, 0, filters.conference, filters)
    
    // Ensure we have the latest results after the search completes
    await nextTick()
    
    // Get the results based on search type
    const results = searchType.value === 'Teams' ? searchResults.value?.teams :
                   searchType.value === 'Players' ? searchResults.value?.players :
                   searchResults.value?.games

    if (!results) {
      console.error('No results available after search')
      return
    }

    console.log(`${searchType.value} search results received:`, results)
    
    const updateData = { 
      type: searchType.value, 
      results,
      query: displayQuery.value 
    }
    
    // Then navigate to the appropriate route if not already there
    const route = searchType.value.toLowerCase()
    if (router.currentRoute.value.path !== `/${route}`) {
      await router.push(`/${route}`)
      // Wait for navigation to complete
      await nextTick()
    }

    // Now that we have results and are on the correct route, emit the event
    console.log('Emitting search-grid-update event with:', updateData)
    window.dispatchEvent(new CustomEvent('search-grid-update', { 
      detail: updateData
    }))

  } catch (err) {
    console.error('Failed to fetch search results:', err)
  }
}

const handleSelect = (item) => {
  const selectionData = { type: searchType.value, item }
  console.log('Emitting search-selection event with:', selectionData)
  window.dispatchEvent(new CustomEvent('search-selection', { 
    detail: selectionData
  }))
  displayQuery.value = ''
  nextTick(() => {
    showResults.value = false
  })
}

const handleFocus = () => {
  if (displayQuery.value || props.showByDefault) {
    showResults.value = true
    if (displayQuery.value) {
      debouncedSearch(displayQuery.value, searchType.value)
    }
  }
}

const handleBlur = (e) => {
  // Only hide results if clicking outside both the input and results
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
  // Store the conference filter without triggering a search
  currentConference.value = conference
}

const handleDateChange = ({ startDate, endDate }) => {
  // Store the date filters without triggering a search
  currentDateRange.value = { startDate, endDate }
}

const handleTeamChange = (teams) => {
  // Store the team filters without triggering a search
  currentTeams.value = teams
}

const handlePlayerTeamChange = (team) => {
  // Store the player team filter without triggering a search
  currentPlayerTeam.value = team
}

const handlePositionChange = (position) => {
  // Store the position filter without triggering a search
  currentPosition.value = position
}

const handleRefocus = () => {
  // Focus the input but keep the results visible
  searchInput.value?.focus()
  showResults.value = true
}

const handleEscape = () => {
  showResults.value = false
  searchInput.value?.blur()
}

const handleKeyDown = (e) => {
  // Prevent default tab behavior
  if (e.key === 'Tab') {
    e.preventDefault()
    cycleSearchType()
  }
  // Handle arrow down
  if (e.key === 'ArrowDown' && showResults.value) {
    e.preventDefault()
    emit('move-selection', 'down')
  }
}

const handleKeyUp = (e) => {
  // Handle arrow up
  if (e.key === 'ArrowUp' && showResults.value) {
    e.preventDefault()
    emit('move-selection', 'up')
  }
}

// debug, watching game data
watch(() => searchResults.value?.games, (newGames) => {
  console.log('Games data in SearchBar before passing to SearchResults:', newGames)
}, { deep: true })

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Create a ref to store the event handler function
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

// Register event listeners in onMounted
onMounted(async () => {
  // wait 150ms and then try focusing
  await wait(150);
  const input = searchInput.value?.$el?.querySelector('input')
  if (input) {
    input.focus()
    showResults.value = true
  }

  // Add event listeners
  window.addEventListener('keydown', handleKeyPress)

  // Listen for view changes
  window.addEventListener('stats-view-changed', (event) => {
    const view = event.detail
    debouncedViewChange(view)
  })
})

// Clean up event listeners in onUnmounted
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

// Expose search functionality to parent components
defineExpose({
  searchQuery,
  searchType
})

// Add debounced view change handler
const debouncedViewChange = debounce((view) => {
  const index = searchTypes.findIndex(type => type.toLowerCase() === view)
  if (index !== -1) {
    currentTypeIndex.value = index
    if (displayQuery.value) {
      debouncedSearch(displayQuery.value, searchType.value)
    }
  }
}, 500)

// Add refs for storing filter values
const currentConference = ref(null)
const currentDateRange = ref(null)
const currentTeams = ref([])
const currentPlayerTeam = ref(null)
const currentPosition = ref(null)
</script>

<style scoped>
.search-container {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 9999;
  width: 100%;
}

.search-wrapper {
  position: relative;
  z-index: 9999;
  width: 100%;
}

.search-bar {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  z-index: 9999;
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
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

:deep(.v-menu__content) {
  z-index: 9999 !important;
}
</style> 