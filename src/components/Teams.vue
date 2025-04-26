<template>
  <div class="teams-container">
    <div class="teams-layout">
      <!-- Teams Grid Column -->
      <div class="teams-grid-column">
        <div v-if="error" class="teams-error">
          <v-alert type="error" text="Failed to load teams. Please try again."></v-alert>
        </div>

        <div v-if="isInFavoritesView && teams.length === 0" class="empty-favorites-state">
          <v-icon size="64" color="rgba(233, 213, 255, 0.7)" class="mb-4">mdi-star-outline</v-icon>
          <h3 class="text-h5 mb-2">No Favorite Teams</h3>
          <p class="text-body-1 text-medium-emphasis">Click the star icon on any team card to add it to your favorites.</p>
        </div>

        <div v-else class="teams-grid">
          <template v-if="isLoading">
            <div v-for="i in 16" :key="`team-skeleton-${i}`" class="skeleton-card">
              <div class="team-card-content">
                <div class="skeleton-abbr"></div>
                <div class="skeleton-name"></div>
                <div class="skeleton-division"></div>
              </div>
            </div>
          </template>
          <template v-else>
            <v-card
              v-for="team in filteredTeams"
              :key="team.id"
              class="team-card"
              :class="{ 'selected': selectedTeam?.id === team.id }"
              @click="selectTeam(team, false)"
              elevation="2"
            >
              <v-icon
                size="24"
                class="favorite-btn"
                @click.stop="toggleFavorite(team)"
                :color="isFavorite(team.id) ? '#e9d5ff' : 'grey-lighten-1'"
                style="cursor: pointer"
              >
                {{ isFavorite(team.id) ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
              <div class="team-card-content">
                <div class="team-abbr">{{ team.abbreviation }}</div>
                <div class="team-name">{{ team.full_name }}</div>
                <div class="team-division">{{ team.division }}</div>
              </div>
            </v-card>
          </template>
        </div>
      </div>

      <!-- Team Details Column -->
      <div class="team-details-column">
        <div v-if="isLoading" class="skeleton-details">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-badges">
              <div class="skeleton-badge"></div>
              <div class="skeleton-badge"></div>
            </div>
          </div>
          <div class="skeleton-divider"></div>
          <div class="skeleton-stats-title"></div>
          <div class="skeleton-stats-grid">
            <div v-for="i in 4" :key="`stat-skeleton-${i}`" class="skeleton-stat-item">
              <div class="skeleton-stat-value"></div>
              <div class="skeleton-stat-label"></div>
            </div>
          </div>
          <div class="skeleton-divider"></div>
          <div class="skeleton-stats-title"></div>
          <div class="skeleton-stats-grid">
            <div v-for="i in 4" :key="`stat-skeleton-${i + 4}`" class="skeleton-stat-item">
              <div class="skeleton-stat-value"></div>
              <div class="skeleton-stat-label"></div>
            </div>
          </div>
        </div>

        <div v-else-if="selectedTeam" class="team-details">
          <div class="details-header">
            <div class="header-left">
              <h2>{{ selectedTeam.full_name }}</h2>
              <div class="conference-info">
                <div class="conference-badge" :class="selectedTeam?.conference?.toLowerCase() || 'unknown'">
                  {{ selectedTeam.conference }} Conference
                </div>
                <div class="division-badge">
                  {{ selectedTeam.division }} Division
                </div>
              </div>
            </div>
            <div class="header-right">
              <v-icon
                size="24"
                class="favorite-btn-details"
                @click="toggleFavorite(selectedTeam)"
                :color="isFavorite(selectedTeam.id) ? '#e9d5ff' : 'grey-lighten-1'"
                style="cursor: pointer"
              >
                {{ isFavorite(selectedTeam.id) ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </div>
          </div>

          <v-btn
            color="#e9d5ff"
            block
            class="details-btn mt-4"
            @click="showTeamModal = true"
            :loading="isLoadingDetails"
            elevation="0"
          >
            View Detailed Stats
          </v-btn>

          <v-divider class="my-4"></v-divider>

          <div v-if="teamDetails" class="standings-section">
            <h3 class="text-h6 mb-4">Season {{ teamDetails.standings.season }} Stats</h3>
            <div class="standings-grid">
              <div class="standings-item">
                <span class="value">{{ teamDetails.standings.wins }}-{{ teamDetails.standings.losses }}</span>
                <span class="label">Record</span>
              </div>
              <div class="standings-item">
                <span class="value">#{{ teamDetails.standings.conference_rank }}</span>
                <span class="label">Conference Rank</span>
              </div>
              <div class="standings-item">
                <span class="value">#{{ teamDetails.standings.division_rank }}</span>
                <span class="label">Division Rank</span>
              </div>
              <div class="standings-item">
                <span class="value">{{ teamDetails.standings.home_record }}</span>
                <span class="label">Home Record</span>
              </div>
              <div class="standings-item">
                <span class="value">{{ teamDetails.standings.road_record }}</span>
                <span class="label">Road Record</span>
              </div>
              <div class="standings-item">
                <span class="value">{{ teamDetails.standings.conference_record }}</span>
                <span class="label">Conference Record</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Details Modal -->
    <v-dialog
      v-model="showTeamModal"
      max-width="1000"
      scrollable
    >
      <v-card class="team-details-modal">
        <v-card-title class="d-flex justify-space-between align-center pa-6">
          <div class="d-flex align-center">
            <span class="text-h5">{{ selectedTeam?.full_name }}</span>
            <span class="team-abbr-badge ml-4">{{ selectedTeam?.abbreviation }}</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="showTeamModal = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="season-selector mb-8">
            <v-select
              v-model="selectedSeason"
              :items="availableSeasons"
              label="Select Season"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="fetchDetailedStats"
            ></v-select>
          </div>

          <div v-if="isLoadingDetails" class="loading-skeleton pa-4">
            <div v-for="i in 6" :key="i" class="skeleton-stat-item">
              <div class="skeleton-value"></div>
              <div class="skeleton-stat-label"></div>
            </div>
          </div>

          <div v-else-if="detailedTeamStats" class="detailed-stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ detailedTeamStats.wins }}-{{ detailedTeamStats.losses }}</span>
              <span class="stat-label">Record</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">#{{ detailedTeamStats.conference_rank }}</span>
              <span class="stat-label">Conference Rank</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">#{{ detailedTeamStats.division_rank }}</span>
              <span class="stat-label">Division Rank</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ detailedTeamStats.home_record }}</span>
              <span class="stat-label">Home Record</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ detailedTeamStats.road_record }}</span>
              <span class="stat-label">Road Record</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ detailedTeamStats.conference_record }}</span>
              <span class="stat-label">Conference Record</span>
            </div>
          </div>
          <div v-else class="no-stats-message">
            <v-alert
              type="info"
              variant="tonal"
              class="mt-4"
            >
              No statistics available for the selected season
            </v-alert>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favoritesStore'
import api from '@/api/axios'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const teams = ref([])
const selectedTeam = ref(null)
const teamDetails = ref(null)
const isLoading = ref(true)
const isLoadingDetails = ref(false)
const error = ref(null)
const showTeamModal = ref(false)
const selectedSeason = ref(2024)
const availableSeasons = ref([2024, 2023, 2022, 2021, 2020])
const detailedTeamStats = ref(null)
const isInFavoritesView = ref(false)

const handleSearchSelection = async ({ type, item }) => {
  if (type === 'Teams') {
    // Extract the team data from the item structure
    const teamData = item.item || item
    await selectTeam(teamData, true)
  } else if (type === 'Players') {
    router.push('/players')
  } else if (type === 'Games') {
    router.push('/games')
  }
}

const isFavorite = (teamId) => {
  return favoritesStore.isTeamFavorited(teamId)
}

const toggleFavorite = async (team) => {
  if (!team || !team.id) {
    console.error('Cannot toggle favorite - invalid team:', team)
    return
  }

  try {
    await favoritesStore.toggleFavoriteTeam(team.id)
    
    // If we're in favorites view and the team was unfavorited, remove it from the list
    if (isInFavoritesView.value && !favoritesStore.isTeamFavorited(team.id)) {
      teams.value = teams.value.filter(t => t.id !== team.id)
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
  }
}

const updateTeams = async (newTeams) => {
  console.log('Teams view received update request:', newTeams)
  
  // If newTeams is falsy or empty, don't do anything as initialization is handled in onMounted
  if (!newTeams || !Array.isArray(newTeams) || newTeams.length === 0) {
    console.log('No teams provided, skipping update')
    return
  }
  
  // Filter out invalid entries and ensure all required fields are present
  const validTeams = newTeams.filter(team => 
    team && 
    team.id && 
    team.full_name && 
    team.conference && 
    team.division
  )
  
  console.log('Valid teams to display:', validTeams)
  
  teams.value = validTeams
  isInFavoritesView.value = true
  
  // If we have teams, select the first one without opening modal
  if (validTeams.length > 0) {
    console.log('Selecting first team:', validTeams[0])
    selectTeam(validTeams[0], false)
  }
}

const loadFavoriteTeams = async () => {
  try {
    isLoading.value = true
    console.log('Loading favorite teams...')
    
    // Get favorite team IDs from the store
    const favoriteTeamIds = Array.from(favoritesStore.favoriteTeamIds)
    console.log('Favorite team IDs:', favoriteTeamIds)
    
    if (!favoriteTeamIds || favoriteTeamIds.length === 0) {
      teams.value = []
      return
    }
    
    // Fetch details for each favorite team
    const teamDetailsPromises = favoriteTeamIds.map(async (teamId) => {
      try {
        const response = await api.get(`/teams/${teamId}`)
        console.log(`Team details response for ID ${teamId}:`, response.data)
        
        // Extract team data from the response
        const teamData = response.data.team || response.data
        if (!teamData) {
          console.error(`Invalid team details response for ID ${teamId}:`, response.data)
          return null
        }
        
        // Map to consistent team structure
        return {
          id: teamData.id,
          full_name: teamData.full_name,
          name: teamData.name,
          abbreviation: teamData.abbreviation,
          city: teamData.city,
          conference: teamData.conference,
          division: teamData.division
        }
      } catch (error) {
        console.error(`Failed to fetch details for team ${teamId}:`, error)
        return null
      }
    })
    
    // Wait for all team details and filter out failed requests
    const teamDetails = await Promise.all(teamDetailsPromises)
    const validTeams = teamDetails.filter(team => team !== null)
    console.log('Valid favorite teams loaded:', validTeams)
    
    // Update the teams array with valid teams
    teams.value = validTeams
    
    // Select first team if available (without opening modal)
    if (validTeams.length > 0) {
      selectTeam(validTeams[0], false)
    }
    
  } catch (error) {
    console.error('Error loading favorite teams:', error)
  } finally {
    isLoading.value = false
  }
}

const filteredTeams = computed(() => teams.value)

const fetchTeams = async () => {
  isLoading.value = true
  error.value = null
  isInFavoritesView.value = false
  
  try {
    const response = await api.get('/teams')
    console.log('Fetched all teams:', response.data.data)
    teams.value = response.data.data
    // Find and select the LA Lakers by default, without opening modal
    const lakers = teams.value.find(team => team.full_name === 'Los Angeles Lakers')
    if (lakers) {
      selectedTeam.value = lakers
      await fetchTeamDetails(lakers.id)
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const fetchTeamDetails = async (teamId) => {
  isLoadingDetails.value = true
  console.log('Fetching initial team details:', { teamId })
  
  // Skip the API call if teamId is undefined
  if (!teamId) {
    console.warn('Skipping team details fetch - teamId is undefined')
    isLoadingDetails.value = false
    return
  }
  
  try {
    const response = await api.get(`/teams/${teamId}`)
    console.log('Initial team details API response:', response.data)
    teamDetails.value = response.data
  } catch (err) {
    console.error('Failed to load initial team details:', {
      error: err.message,
      teamId,
      status: err.response?.status
    })
  } finally {
    isLoadingDetails.value = false
  }
}

const selectTeam = async (team, openModal = false) => {
  if (!team) {
    console.warn('Cannot select team - team is undefined')
    return
  }
  
  // Handle different team object structures
  const teamId = team.id || (team.item && team.item.id)
  const teamData = team.item || team
  
  if (!teamId) {
    console.warn('Cannot fetch team details - team ID is undefined', team)
    return
  }
  
  selectedTeam.value = teamData
  
  // Only show modal if explicitly requested
  if (openModal) {
    showTeamModal.value = true
  }
  
  // Always fetch team details for the side panel
  await fetchTeamDetails(teamId)
}

const fetchDetailedStats = async () => {
  if (!selectedTeam.value || !selectedSeason.value) {
    console.log('Skipping team details fetch - no team or season selected', {
      team: selectedTeam.value?.id,
      season: selectedSeason.value
    })
    return
  }
  
  isLoadingDetails.value = true
  detailedTeamStats.value = null // Clear previous stats while loading
  
  try {
    const params = new URLSearchParams()
    params.append('season', selectedSeason.value.toString())
    
    const url = `/teams/${selectedTeam.value.id}?${params.toString()}`
    console.log('Making request to:', url)
    
    const response = await api.get(url)
    console.log('Team details API response:', response.data)
    
    if (response.data.standings) {
      detailedTeamStats.value = response.data.standings
    } else {
      console.warn('No standings data in response:', response.data)
    }
  } catch (err) {
    console.error('Failed to fetch team details:', {
      error: err.message,
      teamId: selectedTeam.value.id,
      season: selectedSeason.value,
      status: err.response?.status
    })
  } finally {
    isLoadingDetails.value = false
  }
}

// Reset detailed stats when team changes
watch(() => selectedTeam.value, () => {
  if (selectedTeam.value && teamDetails.value) {
    detailedTeamStats.value = teamDetails.value.standings
    selectedSeason.value = teamDetails.value.standings.season // Set to current season
  } else {
    detailedTeamStats.value = null
    selectedSeason.value = 2024 // Reset to current season
  }
})

// Watch for modal visibility to prevent content snap
watch(showTeamModal, async (isOpen) => {
  if (isOpen) {
    document.body.style.paddingRight = window.innerWidth - document.documentElement.clientWidth + 'px'
    document.body.style.overflow = 'hidden'
    
    // Fetch stats when modal opens
    if (selectedTeam.value) {
      isLoadingDetails.value = true
      try {
        await fetchDetailedStats()
      } catch (err) {
        console.error('Failed to load initial stats:', err)
      }
    }
  } else {
    document.body.style.paddingRight = ''
    document.body.style.overflow = ''
  }
})

// Add event listener for stats-view-changed
const handleStatsViewChanged = (event) => {
  const view = event.detail
  if (view === 'teams') {
    // Clear any existing search results
    teams.value = []
    isInFavoritesView.value = false
  }
}

// Initialize the component
const initialize = async () => {
  try {
    isLoading.value = true
    
    // First load favorites from the store
    await favoritesStore.loadFavorites()
    
    // Then load favorite teams
    await loadFavoriteTeams()
    
    // Finally load all teams
    await fetchTeams()
  } catch (error) {
    console.error('Error during initialization:', error)
  } finally {
    isLoading.value = false
  }
}

// Update onMounted to use initialize
onMounted(() => {
  initialize()
  window.addEventListener('stats-view-changed', handleStatsViewChanged)
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('stats-view-changed', handleStatsViewChanged)
})

const handleSearchGridUpdate = (data) => {
  console.log('Teams view received search grid update:', data)
  if (data.type === 'Teams') {
    // Only update if we have a search query
    if (data.query && data.query.trim()) {
      console.log('Updating teams grid with search results:', data.results)
      teams.value = data.results
      isInFavoritesView.value = false
      
      // If we have teams, select the most relevant one based on the search query
      if (data.results.length > 0) {
        // Find the team that best matches the search query
        const query = data.query.toLowerCase()
        const bestMatch = data.results.reduce((best, team) => {
          const nameMatch = team.full_name.toLowerCase().includes(query)
          const abbreviationMatch = team.abbreviation.toLowerCase().includes(query)
          
          // If current team is an exact match, it's the best
          if (team.full_name.toLowerCase() === query || 
              team.abbreviation.toLowerCase() === query) {
            return team
          }
          
          // If current team matches and best doesn't, current is better
          if ((nameMatch || abbreviationMatch) && 
              !(best.full_name.toLowerCase().includes(query) || 
                best.abbreviation.toLowerCase().includes(query))) {
            return team
          }
          
          return best
        }, data.results[0])
        
        console.log('Selected best matching team:', bestMatch.full_name)
        selectTeam(bestMatch, false)
      }
    } else {
      // If no search query, fetch all teams
      console.log('No search query, fetching all teams')
      fetchTeams()
    }
  }
}

// Make sure the component exposes the handler
defineExpose({
  handleSearchSelection,
  handleSearchGridUpdate,
  updateTeams
})
</script>

<style scoped>
.teams-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.teams-layout {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.teams-grid-column {
  overflow-y: auto;
  padding-right: 1rem;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-top: 4px;
}

/* responsive grid layout */
@media (max-width: 1400px) {
  .teams-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1100px) {
  .teams-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/*
formatting for mobile, may add more stuff specifically here...
*/
 
@media (max-width: 950px) {
  .teams-grid {
    grid-template-columns: 1fr;
  }
  
  .teams-layout {
    grid-template-columns: 1fr;
  }
  
  .team-details-column {
    position: static;
    margin-top: 2rem;
  }
}

.team-card {
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 140px;
  width: 100%;
  position: relative;
  transform: translateY(0);
  user-select: none;
  -webkit-user-select: none;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
  border-color: rgba(147, 51, 234, 0.4);
}

.team-card.selected {
  background-color: rgba(147, 51, 234, 0.1);
  border-color: #9333ea;
}

.team-card-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.team-abbr {
  font-size: 1.25rem;
  font-weight: bold;
  color: #e9d5ff;
}

.team-name {
  color: #e9d5ff;
  font-size: 1rem;
  font-weight: 500;
}

.team-division {
  color: rgba(233, 213, 255, 0.7);
  font-size: 0.75rem;
}

.team-details {
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
  padding-top: 2.5rem;
}

.team-details h2 {
  color: #e9d5ff;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
}

.team-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 120px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(147, 51, 234, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.15);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #9333ea;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(233, 213, 255, 0.7);
  text-align: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
}

.error-message {
  color: rgb(244, 67, 54);
  text-align: center;
  padding: 2rem;
}

.add-team-btn {
  background: linear-gradient(135deg, #9333ea, #7928ca) !important;
  transition: opacity 0.2s ease;
}

.add-team-btn:hover {
  opacity: 0.9;
}

.team-details-column {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  margin-top: 8px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conference-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.conference-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.875rem;
}

.conference-badge.east {
  background: rgba(0, 118, 206, 0.1);
  color: #0076ce;
}

.conference-badge.west {
  background: rgba(206, 0, 0, 0.1);
  color: #ce0000;
}

.division-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.875rem;
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.standings-section {
  margin-top: 2rem;
}

.standings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.standings-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.standings-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #9333ea;
  display: block;
  margin-bottom: 0.25rem;
}

.standings-item .label {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
}

.details-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.team-card-skeleton {
  aspect-ratio: 1;
  border-radius: 8px;
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
}

:deep(.v-skeleton-loader__card) {
  height: 100% !important;
  width: 100% !important;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  opacity: 0;
  transition: all 0.2s ease;
}

/* Show favorite button on hover for non-favorited items */
.team-card:hover .favorite-btn:not([color="#e9d5ff"]) {
  opacity: 1;
}

/* Always show favorite button for favorited items */
.favorite-btn[color="#e9d5ff"] {
  opacity: 1;
}

/* Remove the background from the button */
:deep(.v-btn) {
  background: none !important;
}

:deep(.v-btn:hover) {
  background: none !important;
}

.skeleton-card {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  animation: pulse 1.5s infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  width: 100%;
}

.skeleton-abbr {
  height: 24px;
  width: 40px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-name {
  height: 20px;
  width: 80%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-division {
  height: 16px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* Skeleton Loading Styles */
.skeleton-details {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 2rem;
  animation: pulse 1.5s infinite;
}

.skeleton-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.skeleton-title {
  height: 32px;
  width: 70%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-badges {
  display: flex;
  gap: 0.5rem;
}

.skeleton-badge {
  height: 24px;
  width: 120px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 16px;
}

.skeleton-divider {
  height: 1px;
  background: rgba(147, 51, 234, 0.2);
  margin: 1.5rem 0;
}

.skeleton-stats-title {
  height: 24px;
  width: 40%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.skeleton-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.skeleton-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.skeleton-stat-value {
  height: 32px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-stat-label {
  height: 16px;
  width: 80%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.team-details-modal {
  background: #1a1a1a;
  color: #e9d5ff;
  border-radius: 16px;
  overflow: hidden;
}

.team-details-modal :deep(.v-card-title) {
  border-bottom: 1px solid rgba(147, 51, 234, 0.2);
}

.detailed-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 1rem;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.skeleton-stat-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-height: 120px;
}

.skeleton-value {
  height: 40px;
  width: 70%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-label {
  height: 20px;
  width: 80%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.details-btn {
  height: 44px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  background-color: rgba(147, 51, 234) !important;
}

.details-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  background-color: rgba(147, 51, 234, 0.9) !important;
}

.season-selector {
  max-width: 400px;
}

.empty-favorites-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 400px;
  padding: 2rem;
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  color: rgba(233, 213, 255, 0.7);
}

.empty-favorites-state h3 {
  color: #e9d5ff;
}

.empty-favorites-state p {
  max-width: 400px;
  line-height: 1.6;
}

.favorite-btn-details {
  opacity: 1 !important;
  position: static !important;
}

@media (max-width: 768px) {
  .detailed-stats-grid,
  .loading-skeleton {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .detailed-stats-grid,
  .loading-skeleton {
    grid-template-columns: 1fr;
  }
}

.team-abbr-badge {
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
}

.season-tabs {
  background: rgba(147, 51, 234, 0.05);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid rgba(147, 51, 234, 0.1);
}

:deep(.season-tab) {
  color: rgba(233, 213, 255, 0.7) !important;
  min-width: 100px;
  border-radius: 6px;
  margin: 4px;
  transition: all 0.2s ease;
}

:deep(.season-tab--selected) {
  color: #e9d5ff !important;
  background: rgba(147, 51, 234, 0.2);
}

:deep(.v-tab:hover) {
  color: #e9d5ff !important;
  background: rgba(147, 51, 234, 0.1);
}

:deep(.v-window__container) {
  height: auto !important;
}

:deep(.v-window-item) {
  height: auto !important;
}

:deep(.v-window__container) {
  transition: none !important;
}

:deep(.v-window-item--active) {
  transition: none !important;
}
</style> 