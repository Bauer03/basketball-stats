<template>
  <div class="players-container">
    <div class="players-header">
      <h1 class="text-h4 font-weight-bold mb-6">Players</h1>
    </div>

    <div class="players-layout">
      <!-- Players Grid Column -->
      <div class="players-grid-column">
        <div v-if="error" class="players-error">
          <v-alert type="error" text="Failed to load players. Please try again."></v-alert>
        </div>

        <div v-if="isLoading" class="players-grid">
          <div v-for="i in 6" :key="`skeleton-${i}`" class="player-card">
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
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- Player Details Column -->
      <div v-if="selectedPlayer" class="player-details-column">
        <div class="player-details-header">
          <h2 class="text-h5">{{ selectedPlayer.first_name }} {{ selectedPlayer.last_name }}</h2>
          <div class="player-badges">
            <span class="team-badge">{{ selectedPlayer.team?.full_name }}</span>
            <span class="position-badge">{{ selectedPlayer.position }}</span>
            <span class="jersey-badge">#{{ selectedPlayer.jersey_number }}</span>
          </div>
          <div class="player-meta mt-4">
            <span>{{ selectedPlayer.height }} • {{ selectedPlayer.weight }} lbs</span>
          </div>
        </div>

        <v-divider class="my-6"></v-divider>

        <v-btn
          color="primary"
          block
          class="mb-6"
          @click="showPlayerModal = true"
          :loading="isLoadingDetails"
        >
          See Detailed Stats
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

    <!-- Player Details Modal -->
    <v-dialog
      v-model="showPlayerModal"
      max-width="800"
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>{{ selectedPlayer?.first_name }} {{ selectedPlayer?.last_name }} - Detailed Stats</span>
          <v-btn icon="mdi-close" variant="text" @click="showPlayerModal = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="season-selector mb-6">
            <v-select
              v-model="selectedSeason"
              :items="availableSeasons"
              label="Select Season"
              variant="outlined"
              density="comfortable"
              @update:model-value="fetchDetailedStats"
            ></v-select>
          </div>

          <div v-if="isLoadingDetails" class="loading-skeleton pa-4">
            <div v-for="i in 6" :key="i" class="skeleton-stat-item">
              <div class="skeleton-value"></div>
              <div class="skeleton-label"></div>
            </div>
          </div>

          <div v-else-if="playerStats" class="detailed-stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ playerStats.pts?.toFixed(1) || '0.0' }}</span>
              <span class="stat-label">Points Per Game</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ playerStats.ast?.toFixed(1) || '0.0' }}</span>
              <span class="stat-label">Assists Per Game</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ playerStats.reb?.toFixed(1) || '0.0' }}</span>
              <span class="stat-label">Rebounds Per Game</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ playerStats.stl?.toFixed(1) || '0.0' }}</span>
              <span class="stat-label">Steals Per Game</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ playerStats.blk?.toFixed(1) || '0.0' }}</span>
              <span class="stat-label">Blocks Per Game</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ (playerStats.fg_pct * 100)?.toFixed(1) || '0.0' }}%</span>
              <span class="stat-label">Field Goal %</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ (playerStats.fg3_pct * 100)?.toFixed(1) || '0.0' }}%</span>
              <span class="stat-label">3PT %</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ (playerStats.ft_pct * 100)?.toFixed(1) || '0.0' }}%</span>
              <span class="stat-label">Free Throw %</span>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()
const players = ref([])
const selectedPlayer = ref(null)
const playerStats = ref(null)
const isLoading = ref(true)
const error = ref(null)
const showPlayerModal = ref(false)
const selectedSeason = ref(2024)
const availableSeasons = ref([2024, 2023, 2022])
const isLoadingDetails = ref(false)

// Define the functions first
const handleSearchSelection = async ({ type, item }) => {
  if (type === 'Players') {
    await selectPlayer(item)
  } else if (type === 'Teams') {
    router.push('/teams')
  } else if (type === 'Games') {
    router.push('/games')
  }
}

const handleSearchGridUpdate = ({ type, results }) => {
  console.log('Handling search grid update:', { type, results })
  if (type === 'Players') {
    isLoading.value = true
    players.value = [] // Clear current players
    
    // Short timeout to ensure skeleton is shown
    setTimeout(() => {
      if (results?.data) {
        console.log('Updating players with:', results.data)
        players.value = results.data
        // Select first player from search results if available
        if (players.value.length > 0) {
          selectPlayer(players.value[0])
        }
      }
      isLoading.value = false
    }, 300)
  }
}

// Then expose them
defineExpose({
  handleSearchSelection,
  handleSearchGridUpdate
})

const selectPlayer = async (player, season = 2024) => {
  console.log('Selecting player:', player)
  selectedPlayer.value = player
  try {
    console.log('Fetching player stats for ID:', player.id)
    const response = await api.get(`/players/${player.id}`, {
      params: {
        season: season
      }
    })
    console.log('Player stats response:', response.data)
    
    // Update player details with the full data from the response
    selectedPlayer.value = response.data.player.data
    
    // Check if stats exist for the season
    const stats = response.data.stats.data
    if (stats && stats.length > 0) {
      playerStats.value = stats[0]
    } else {
      playerStats.value = null
    }
    
    console.log('Updated playerStats:', playerStats.value)
  } catch (err) {
    console.error('Failed to fetch player stats:', err)
    error.value = 'Failed to load player statistics'
  }
}

const fetchPlayers = async () => {
  try {
    isLoading.value = true
    error.value = null
    const response = await api.get('/players')
    players.value = response.data.data
    
    // Automatically select the first player if available
    if (players.value.length > 0 && !selectedPlayer.value) {
      await selectPlayer(players.value[0])
    }
  } catch (err) {
    console.error('Failed to fetch players:', err)
    error.value = 'Failed to load players'
  } finally {
    isLoading.value = false
  }
}

const fetchDetailedStats = async () => {
  try {
    isLoadingDetails.value = true
    error.value = null
    const response = await api.get(`/players/${selectedPlayer.value.id}`, {
      params: {
        season: selectedSeason.value
      }
    })
    console.log('Player stats response:', response.data)
    
    // Update player details with the full data from the response
    selectedPlayer.value = response.data.player.data
    
    // Check if stats exist for the season
    const stats = response.data.stats.data
    if (stats && stats.length > 0) {
      playerStats.value = stats[0]
    } else {
      playerStats.value = null
    }
    
    console.log('Updated playerStats:', playerStats.value)
  } catch (err) {
    console.error('Failed to fetch player stats:', err)
    error.value = 'Failed to load player statistics'
  } finally {
    isLoadingDetails.value = false
  }
}

onMounted(async () => {
  await fetchPlayers()
})
</script>

<style scoped>
.players-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.players-header {
  margin-bottom: 2rem;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-top: 4px;
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
  font-size: 1.1rem;
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
  top: 2rem;
}

.player-badges {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
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

/* Modal Styles */
.detailed-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.skeleton-stat-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.skeleton-value {
  height: 32px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-label {
  height: 16px;
  width: 80%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.season-selector {
  max-width: 200px;
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

@media (max-width: 1200px) {
  .players-layout {
    grid-template-columns: 1fr;
  }

  .player-details-column {
    position: static;
  }
}

@media (max-width: 768px) {
  .players-grid {
    grid-template-columns: 1fr;
  }
}
</style> 