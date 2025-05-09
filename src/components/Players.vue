<template>
  <div class="players-container">
    <div class="players-layout">
      <!-- Players Grid Column -->
      <div class="players-grid-column">
        <div v-if="error" class="players-error">
          <v-alert type="error" text="Failed to load players. Please try again."></v-alert>
        </div>

        <div v-if="isInFavoritesView && players.length === 0" class="empty-favorites-state">
          <v-icon size="64" color="rgba(233, 213, 255, 0.7)" class="mb-4">mdi-star-outline</v-icon>
          <h3 class="text-h5 mb-2">No Favorite Players</h3>
          <p class="text-body-1 text-medium-emphasis">Click the star icon on any player card to add them to your favorites.</p>
        </div>

        <div v-else>
          <div v-if="isLoading" class="players-grid">
            <div v-for="i in 25" :key="`skeleton-${i}`" class="player-card">
              <v-card-text class="player-card-content">
                <div class="skeleton-info">
                  <div class="skeleton-name"></div>
                  <div class="skeleton-meta">
                    <div class="skeleton-team"></div>
                    <div class="skeleton-position"></div>
                  </div>
                </div>
              </v-card-text>
            </div>
          </div>
          <div v-else class="players-grid">
            <v-card
              v-for="player in players"
              :key="player.id"
              class="player-card"
              :class="{ 'selected': selectedPlayer?.id === player.id }"
              @click="selectPlayer(player)"
              elevation="2"
            >
              <v-card-text class="player-card-content">
                <div class="player-info">
                  <div class="player-name">{{ player.first_name }} {{ player.last_name }}</div>
                  <div class="player-meta">
                    <span>{{ player.team?.full_name }}</span>
                    <span>•</span>
                    <span>{{ player.position }}</span>
                  </div>
                </div>
                <v-icon
                  size="24"
                  class="favorite-btn"
                  @click.stop="toggleFavorite(player)"
                  :color="isFavorite(player.id) ? '#e9d5ff' : 'grey-lighten-1'"
                  style="cursor: pointer"
                >
                  {{ isFavorite(player.id) ? 'mdi-star' : 'mdi-star-outline' }}
                </v-icon>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </div>

      <!-- Player Details Column -->
      <div v-if="selectedPlayer" class="player-details-column">
        <div class="player-details-header">
          <div class="header-left">
            <h2 class="text-h5">{{ selectedPlayer.first_name }} {{ selectedPlayer.last_name }}</h2>
            <div class="player-badges">
              <span class="team-badge">{{ selectedPlayer.team?.full_name }}</span>
              <span class="position-badge">{{ selectedPlayer.position }}</span>
              <span class="jersey-badge">#{{ selectedPlayer.jersey_number }}</span>
            </div>
          </div>
          <div class="header-right">
            <v-icon
              size="24"
              class="favorite-btn-details"
              @click="toggleFavorite(selectedPlayer)"
              :color="isFavorite(selectedPlayer.id) ? '#e9d5ff' : 'grey-lighten-1'"
              style="cursor: pointer"
            >
              {{ isFavorite(selectedPlayer.id) ? 'mdi-star' : 'mdi-star-outline' }}
            </v-icon>
          </div>
        </div>

        <v-btn
          color="#e9d5ff"
          block
          class="details-btn mt-4"
          @click="showModal = true"
          :loading="isLoadingStats"
          elevation="0"
        >
          View Detailed Stats
        </v-btn>

        <div class="player-stats">
          <h3 class="text-h6 mb-4">Player Info</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ selectedPlayer.draft_year || 'Undrafted' }}</span>
              <span class="stat-label">Draft Year</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ selectedPlayer.draft_number ? `#${selectedPlayer.draft_number}` : '-' }}</span>
              <span class="stat-label">Draft Pick</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ selectedPlayer.height }}</span>
              <span class="stat-label">Height</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ selectedPlayer.weight }} lbs</span>
              <span class="stat-label">Weight</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ selectedPlayer.college || '-' }}</span>
              <span class="stat-label">College</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ selectedPlayer.country }}</span>
              <span class="stat-label">Country</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Stats Modal -->
    <v-dialog v-model="showModal" max-width="800" scrollable>
      <v-card class="details-modal" v-if="selectedPlayer">
        <v-card-title class="d-flex justify-space-between align-center pa-6">
          <span class="text-h5">{{ selectedPlayer.first_name }} {{ selectedPlayer.last_name }}</span>
          <v-btn icon="mdi-close" variant="text" @click="showModal = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="player-details">
            <div class="details-header mb-4">
              <div class="badges-container">
                <div class="team-badge">{{ selectedPlayer.team?.full_name }}</div>
                <div class="position-badge">{{ selectedPlayer.position }}</div>
                <div class="jersey-badge">#{{ selectedPlayer.jersey_number }}</div>
              </div>
              <div class="meta-info mt-4">
                <span>{{ selectedPlayer.height }} • {{ selectedPlayer.weight }} lbs</span>
              </div>
            </div>

            <!-- Add season selector -->
            <div class="season-selector mb-6">
              <v-select
                v-model="selectedSeasons"
                :items="availableSeasons"
                label="Select Seasons"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                closable-chips
                bg-color="rgba(147, 51, 234, 0.1)"
                @update:model-value="fetchDetailedStats"
              ></v-select>
            </div>

            <div v-if="isLoadingStats" class="loading-skeleton">
              <div v-for="i in 6" :key="i" class="skeleton-stat-item">
                <div class="skeleton-value"></div>
                <div class="skeleton-label"></div>
              </div>
            </div>

            <template v-else-if="playerStats && playerStats.length > 0">
              <v-tabs
                v-model="activeSeasonTab"
                bg-color="rgba(147, 51, 234, 0.1)"
                centered
                class="mb-6"
              >
                <v-tab
                  v-for="seasonStats in playerStats"
                  :key="seasonStats.season"
                  :value="seasonStats.season"
                >
                  Season {{ seasonStats.season }}
                </v-tab>
              </v-tabs>

              <v-window v-model="activeSeasonTab">
                <v-window-item
                  v-for="seasonStats in playerStats"
                  :key="seasonStats.season"
                  :value="seasonStats.season"
                >
                  <div class="stats-grid">
                    <div class="stat-item">
                      <span class="label">Points</span>
                      <span class="value">{{ seasonStats.pts?.toFixed(1) || '0.0' }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Rebounds</span>
                      <span class="value">{{ seasonStats.reb?.toFixed(1) || '0.0' }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Assists</span>
                      <span class="value">{{ seasonStats.ast?.toFixed(1) || '0.0' }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">FG%</span>
                      <span class="value">{{ (seasonStats.fg_pct * 100)?.toFixed(1) || '0.0' }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">3PT%</span>
                      <span class="value">{{ (seasonStats.fg3_pct * 100)?.toFixed(1) || '0.0' }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">FT%</span>
                      <span class="value">{{ (seasonStats.ft_pct * 100)?.toFixed(1) || '0.0' }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Steals</span>
                      <span class="value">{{ seasonStats.stl?.toFixed(1) || '0.0' }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Blocks</span>
                      <span class="value">{{ seasonStats.blk?.toFixed(1) || '0.0' }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Games</span>
                      <span class="value">{{ seasonStats.games_played || '0' }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="label">Minutes</span>
                      <span class="value">{{ seasonStats.min || '0' }}</span>
                    </div>
                  </div>
                </v-window-item>
              </v-window>
            </template>
            <div v-else class="no-stats-message">
              <v-alert type="info" variant="tonal" class="mt-4">
                No statistics available for the selected seasons
              </v-alert>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favoritesStore'
import api from '@/api/axios'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const players = ref([])
const selectedPlayer = ref(null)
const playerStats = ref([])
const isLoading = ref(true)
const error = ref(null)
const showModal = ref(false)
const selectedSeasons = ref([])
const availableSeasons = ref([])
const isLoadingStats = ref(false)
const activeSeasonTab = ref(null)
const CURRENT_SEASON = 2024
const NBA_START_YEAR = 1946
const seasonErrorMessage = ref('')
const detailedPlayerStats = ref(null)
const isInFavoritesView = ref(false)
const lastFetchTime = ref(0)
const FETCH_DEBOUNCE_TIME = 500

// Helper function to validate a season
const isValidSeason = (season) => {
  if (typeof season !== 'number') {
    const parsed = parseInt(season)
    if (isNaN(parsed)) return false
    season = parsed
  }
  return season >= NBA_START_YEAR && season <= CURRENT_SEASON + 1
}

// Season validation rule
const seasonRules = (value) => {
  if (!value || value.length === 0) return true
  
  const invalidSeasons = value.filter(season => !isValidSeason(season))
  if (invalidSeasons.length > 0) {
    seasonErrorMessage.value = `Invalid year(s): ${invalidSeasons.join(', ')}. Years must be between ${NBA_START_YEAR} and ${CURRENT_SEASON + 1}`
    return false
  }
  
  seasonErrorMessage.value = ''
  return true
}

// Generate all available NBA seasons
const generateAllNBASeasons = () => {
  const years = []
  for (let year = CURRENT_SEASON; year >= NBA_START_YEAR; year--) {
    years.push(year)
  }
  return years
}

// Update generateAvailableSeasons to always return all NBA seasons
const generateAvailableSeasons = () => {
  return generateAllNBASeasons()
}

const handleSearchSelection = async ({ type, item }) => {
  if (type === 'Players') {
    const playerData = item.item || item
    await selectPlayer(playerData, true)
  }
}

const handleSearchGridUpdate = (data) => {
  if (data.type === 'Players' && Array.isArray(data.results)) {
    if (data.query && data.query.trim()) {
      players.value = data.results
      isInFavoritesView.value = false
      error.value = null
      
      if (data.results.length > 0) {
        selectPlayer(data.results[0], false)
      }
    } else {
      fetchPlayers()
    }
  }
}

// Then expose them
defineExpose({
  handleSearchSelection,
  handleSearchGridUpdate,
  updatePlayers: (newPlayers) => {
    console.log('Updating players with:', newPlayers)
    players.value = newPlayers
    isInFavoritesView.value = true
    
    // Set favorite status for all loaded players
    newPlayers.forEach(player => {
      if (player.id) {
        favoritesStore.addFavoritePlayer(player.id)
      }
    })
    
    // If we have players, select the first one without opening modal
    if (newPlayers.length > 0) {
      selectPlayer(newPlayers[0], false)
    }
  }
})

const selectPlayer = async (player, shouldOpenModal = false) => {
  if (!player?.id) return
  
  selectedPlayer.value = player
  selectedSeasons.value = []
  playerStats.value = []
  availableSeasons.value = generateAllNBASeasons()
  
  try {
    const defaultSeason = player.draft_year || CURRENT_SEASON
    selectedSeasons.value = [defaultSeason]
    await fetchDetailedStats()
    
    if (shouldOpenModal) {
      showModal.value = true
    }
  } catch (err) {
    console.error('Failed to fetch player stats:', err)
    error.value = 'Failed to load player statistics'
  }
}

const fetchPlayers = async () => {
  isLoading.value = true
  error.value = null
  isInFavoritesView.value = false
  
  try {
    const response = await api.get('/players')
    
    if (response.data && Array.isArray(response.data.data)) {
      players.value = response.data.data
      
      if (players.value.length > 0) {
        selectedPlayer.value = players.value[0]
        await fetchPlayerDetails(players.value[0].id)
      }
    } else {
      error.value = 'Invalid data received from server'
    }
  } catch (err) {
    error.value = err.message || 'Failed to load players. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const fetchPlayerDetails = async (playerId) => {
  try {
    const response = await api.get(`/players/${playerId}`)
    if (response.data && response.data.data) {
      selectedPlayer.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch player details:', err)
  }
}

const fetchDetailedStats = async () => {
  const now = Date.now()
  if (now - lastFetchTime.value < FETCH_DEBOUNCE_TIME) return
  lastFetchTime.value = now
  
  try {
    isLoadingStats.value = true
    error.value = null
    
    const promises = selectedSeasons.value.map(season => {
      const url = `/players/${selectedPlayer.value.id}`
      return api.get(url, { params: { season } })
    })
    
    const responses = await Promise.all(promises)
    
    const allStats = responses
      .map(response => {
        const stats = response.data.stats?.data?.[0]
        if (stats) {
          return {
            ...stats,
            season: stats.season
          }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => b.season - a.season)
    
    playerStats.value = allStats
    
    if (allStats.length > 0) {
      activeSeasonTab.value = allStats[0].season
    }
    
    const mostRecentResponse = responses.find(r => r.data.stats?.data?.[0]?.season === Math.max(...selectedSeasons.value))
    if (mostRecentResponse?.data.player?.data) {
      selectedPlayer.value = mostRecentResponse.data.player.data
    }
  } catch (err) {
    console.error('Failed to fetch player stats:', err)
    error.value = 'Failed to load player statistics'
    playerStats.value = []
    activeSeasonTab.value = null
  } finally {
    isLoadingStats.value = false
  }
}

// Watch for modal visibility changes
watch(showModal, (newValue) => {
  if (!newValue) {
    // Reset selections when modal is closed
    selectedSeasons.value = []
    playerStats.value = []
    activeSeasonTab.value = null
  }
})

const isFavorite = (playerId) => {
  return favoritesStore.isPlayerFavorited(playerId)
}

const toggleFavorite = async (player) => {
  try {
    await favoritesStore.toggleFavoritePlayer(player.id)
    
    // If we're in favorites view and the player was unfavorited, remove them from the list
    if (isInFavoritesView.value && !favoritesStore.isPlayerFavorited(player.id)) {
      players.value = players.value.filter(p => p.id !== player.id)
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err)
  }
}

const loadFavoritePlayers = async () => {
  try {
    isLoading.value = true
    const favoritePlayerIds = Array.from(favoritesStore.favoritePlayerIds)
    
    if (!favoritePlayerIds || favoritePlayerIds.length === 0) {
      players.value = []
      return
    }
    
    const playerDetailsPromises = favoritePlayerIds.map(async (playerId) => {
      try {
        const response = await api.get(`/players/${playerId}`)
        if (!response.data || !response.data.player) {
          console.error(`Invalid player details response for ID ${playerId}`)
          return null
        }
        return response.data.player
      } catch (error) {
        console.error(`Failed to fetch player ${playerId}:`, error)
        return null
      }
    })
    
    const playerDetails = await Promise.all(playerDetailsPromises)
    const validPlayers = playerDetails.filter(player => player !== null)
    
    players.value = validPlayers
    
    if (validPlayers.length > 0) {
      selectPlayer(validPlayers[0], false)
    }
  } catch (error) {
    console.error('Error loading favorite players:', error)
  } finally {
    isLoading.value = false
  }
}

// Initialize component
onMounted(async () => {
  await favoritesStore.loadFavorites()
  await loadFavoritePlayers()
  await fetchPlayers()
  
  window.addEventListener('search-grid-update', (event) => handleSearchGridUpdate(event.detail))
  window.addEventListener('search-selection', (event) => handleSearchSelection(event.detail))
  window.addEventListener('stats-view-changed', handleStatsViewChanged)
})

// Update onUnmounted to remove both event listeners
onUnmounted(() => {
  window.removeEventListener('search-grid-update', (event) => handleSearchGridUpdate(event.detail))
  window.removeEventListener('search-selection', (event) => handleSearchSelection(event.detail))
  window.removeEventListener('stats-view-changed', handleStatsViewChanged)
})

// Add event listener for stats-view-changed
const handleStatsViewChanged = (event) => {
  const view = event.detail
  if (view === 'players') {
    // Clear any existing search results
    players.value = []
    isInFavoritesView.value = false
  }
}
</script>

<style scoped>
.players-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.players-layout {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 2rem;
}

.players-grid-column {
  overflow-y: auto;
  padding-right: 1rem;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-top: 4px;
}

/* Add responsive grid layout */
@media (max-width: 1400px) {
  .players-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1100px) {
  .players-grid {
    grid-template-columns: 1fr;
  }

  /* .players-layout {
    grid-template-columns: 1fr;
  } */

  .player-badges {
    flex-direction: column;
  }
  
  .player-details-column {
    position: static;
    margin-top: 2rem;
  }
}

.player-card {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.1);
  transition: all 0.2s ease;
}

.player-card:hover {
  background: rgba(147, 51, 234, 0.1);
  border-color: rgba(147, 51, 234, 0.2);
  transform: translateY(-2px);
}

.player-card.selected {
  background: rgba(147, 51, 234, 0.15);
  border-color: rgba(147, 51, 234, 0.3);
}

.player-card-content {
  padding: 1rem;
  display: flex;
  align-items: center;
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.player-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
}

.player-details-column {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  top: 2rem;
}

.player-badges {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  align-items: center;
}

.team-badge,
.position-badge,
.jersey-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.team-badge {
  background: rgba(0, 118, 206, 0.1);
  color: #0076ce;
}

.position-badge {
  background: rgba(206, 0, 0, 0.1);
  color: #ce0000;
}

.jersey-badge {
  background: rgba(147, 51, 234, 0.1); 
  color: #9333ea;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #9333ea;
  display: block;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
}

/* Skeleton Loading Styles */
.skeleton-card {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.player-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(147, 51, 234, 0.1);
  animation: pulse 1.5s infinite;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-name {
  height: 24px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-meta {
  height: 16px;
  width: 40%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

/* Updated Modal Styles */
.player-stats-modal {
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.season-selector-container {
  width: 100%;
  max-width: 300px;
}

.stats-content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.stats-display {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.season-tabs {
  flex-shrink: 0;
}

.stats-window {
  flex: 1;
  overflow-y: auto;
}

.detailed-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding: 1.5rem 0;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  padding: 1.5rem 0;
  min-height: 400px;
}

.no-stats-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 1.5rem 0;
}

.details-btn {
  height: 44px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  background-color: #9333ea !important;
  color: #e9d5ff !important;
}

.details-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  background-color: rgba(147, 51, 234, 0.9) !important;
}

.player-details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.header-left {
  flex: 1;
}

.header-right {
  padding-top: 4px;
}

.favorite-btn-details {
  opacity: 1 !important;
  position: static !important;
}

/* Add modal styles */
.details-modal {
  background: #1a1a1a;
  color: #e9d5ff;
  border: 1px solid rgba(147, 51, 234, 0.2);
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.team-badge,
.position-badge,
.jersey-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.875rem;
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.label {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
  display: block;
  margin-bottom: 4px;
}

.value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e9d5ff;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.skeleton-stat-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  animation: pulse 1.5s infinite;
}

.skeleton-value {
  height: 24px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-label {
  height: 16px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  width: 60%;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Add styles for tabs */
.v-tabs {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-tab) {
  color: rgba(233, 213, 255, 0.7);
  font-weight: 500;
  min-width: 120px;
}

:deep(.v-tab--selected) {
  color: #e9d5ff;
  background: rgba(147, 51, 234, 0.2);
}

/* Add styles for the season selector container */
.season-selector {
  min-height: 120px; /* Allocate space for the dropdown */
  margin-bottom: 1.5rem;
  position: relative;
}

:deep(.v-select) {
  min-height: 56px; /* Match the height of the select input */
}

:deep(.v-select__selection) {
  min-height: 56px; /* Ensure consistent height for the selection area */
}

:deep(.v-field__input) {
  min-height: 56px; /* Maintain consistent input height */
}

:deep(.v-menu__content) {
  max-height: 300px; /* Limit dropdown height */
  overflow-y: auto;
}

/* Ensure the modal content maintains consistent height */
.details-modal :deep(.v-card-text) {
  min-height: 600px; /* Set a minimum height for the modal content */
  display: flex;
  flex-direction: column;
}

.player-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 500px; /* Ensure consistent height for the details section */
}

/* Ensure the stats grid maintains consistent spacing */
.stats-grid {
  margin-top: 1.5rem;
  flex: 1;
}

/* Modal header adjustments */
.details-modal :deep(.v-card-title) {
  padding: 1rem 1.5rem;
}

/* Player details header adjustments */
.details-header {
  margin-bottom: 1rem;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.meta-info {
  margin-top: 0.25rem !important;
}

/* Season selector adjustments */
.season-selector {
  min-height: 80px; /* Reduced from 120px */
  margin-bottom: 1rem; /* Reduced from 1.5rem */
  position: relative;
}

:deep(.v-select) {
  min-height: 40px; /* Reduced from 56px */
}

:deep(.v-select__selection) {
  min-height: 40px; /* Reduced from 56px */
}

:deep(.v-field__input) {
  min-height: 40px; /* Reduced from 56px */
  padding-top: 0;
  padding-bottom: 0;
}

/* Stats tabs adjustments */
:deep(.v-tabs) {
  margin-bottom: 1rem;
  min-height: 36px;
}

:deep(.v-tab) {
  min-height: 36px;
}

/* Stats grid adjustments */
.stats-grid {
  margin-top: 1rem; /* Reduced from 1.5rem */
  gap: 0.75rem; /* Reduced from 1rem */
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.stat-item {
  padding: 0.75rem; /* Reduced from 1rem */
}

/* Adjust modal content spacing */
.details-modal :deep(.v-card-text) {
  padding: 1rem 1.5rem;
  min-height: 500px; /* Reduced from 600px */
}

.player-details {
  min-height: 400px; /* Reduced from 500px */
}

/* Adjust stat item text sizes */
.stat-item .label {
  font-size: 0.75rem; /* Slightly smaller label */
  margin-bottom: 2px; /* Reduced from 4px */
}

.stat-item .value {
  font-size: 1.125rem; /* Slightly smaller value */
  line-height: 1.2;
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
.player-card:hover .favorite-btn:not([color="#e9d5ff"]) {
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
</style> 