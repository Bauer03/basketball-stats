<template>
  <div class="players-container">
    <h1 class="text-h4 font-weight-bold mb-6">NBA Players</h1>
    
    <div v-if="error" class="mt-4">
      <v-alert type="error" text="Failed to load players. Please try again."></v-alert>
    </div>

    <div v-else class="players-layout">
      <!-- Players Grid Column -->
      <div class="players-grid-column">
        <div v-if="loading" class="skeleton-container">
          <div class="skeleton-grid">
            <div v-for="i in 6" :key="`player-skeleton-${i}`" class="skeleton-card">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-info">
                <div class="skeleton-name"></div>
                <div class="skeleton-meta">
                  <div class="skeleton-team"></div>
                  <div class="skeleton-position"></div>
                </div>
              </div>
            </div>
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
            <v-card-item>
              <div class="d-flex align-center mb-2">
                <v-avatar color="surface-variant" size="48" class="mr-4">
                  <v-icon size="32" color="primary">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <v-card-title class="text-h6 pa-0">{{ player.first_name }} {{ player.last_name }}</v-card-title>
                  <v-card-subtitle class="pa-0">{{ player.team?.full_name || 'N/A' }}</v-card-subtitle>
                </div>
              </div>
              <v-divider class="mb-4"></v-divider>
              <div class="d-flex justify-space-between">
                <div class="text-caption">
                  <span class="font-weight-bold">Position:</span>
                  {{ player.position || 'N/A' }}
                </div>
                <div class="text-caption">
                  <span class="font-weight-bold">Jersey:</span>
                  #{{ player.jersey_number || 'N/A' }}
                </div>
              </div>
            </v-card-item>
          </v-card>
        </div>

        <div v-if="!loading && players.length === 0" class="d-flex justify-center my-8">
          <v-alert type="info" text="No players found matching your search criteria."></v-alert>
        </div>

        <div v-if="!loading && canLoadMore" class="d-flex justify-center my-8">
          <v-btn color="primary" variant="outlined" @click="loadMore" :loading="loading">
            Load More
          </v-btn>
        </div>
      </div>

      <!-- Player Details Column -->
      <div class="player-details-column">
        <div v-if="loadingDetails" class="skeleton-details">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-badges">
              <div class="skeleton-badge"></div>
              <div class="skeleton-badge"></div>
            </div>
          </div>
          <div class="skeleton-divider"></div>
          <div class="skeleton-info-grid">
            <div v-for="i in 8" :key="`info-skeleton-${i}`" class="skeleton-info-item">
              <div class="skeleton-label"></div>
              <div class="skeleton-value"></div>
            </div>
          </div>
          <div class="skeleton-stats-title"></div>
          <div class="skeleton-stats-grid">
            <div v-for="i in 5" :key="`stat-skeleton-${i}`" class="skeleton-stat-item">
              <div class="skeleton-stat-value"></div>
              <div class="skeleton-stat-label"></div>
            </div>
          </div>
        </div>

        <div v-else-if="selectedPlayer" class="player-details">
          <div class="details-header d-flex flex-column">
            <div class="header-left">
              <h2 class="text-h4">{{ selectedPlayer.first_name }} {{ selectedPlayer.last_name }}</h2>
              <div class="player-info">
                <span class="conference-badge" :class="selectedPlayer.team?.conference.toLowerCase()">
                  {{ selectedPlayer.team?.conference }} Conference
                </span>
                <span class="jersey-badge">
                  #{{ selectedPlayer.jersey_number }}
                </span>
              </div>
            </div>
            <v-btn color="primary" variant="outlined" @click="showPlayerDetails = true" class="mt-4">
              View Full Details
            </v-btn>
          </div>

          <v-divider class="my-6"></v-divider>

          <div class="player-info-grid mb-6">
            <div class="info-item">
              <div class="info-label">Team</div>
              <div class="info-value">{{ selectedPlayer.team?.full_name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Position</div>
              <div class="info-value">{{ selectedPlayer.position }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Height</div>
              <div class="info-value">{{ selectedPlayer.height }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Weight</div>
              <div class="info-value">{{ selectedPlayer.weight }} lbs</div>
            </div>
          </div>

          <h3 class="text-h6 mb-4">Key Statistics</h3>
          <div v-if="playerStats" class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ playerStats.pts.toFixed(1) }}</div>
              <div class="stat-label">Points Per Game</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ playerStats.ast.toFixed(1) }}</div>
              <div class="stat-label">Assists Per Game</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ playerStats.reb.toFixed(1) }}</div>
              <div class="stat-label">Rebounds Per Game</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ (playerStats.fg_pct * 100).toFixed(1) }}%</div>
              <div class="stat-label">Field Goal %</div>
            </div>
          </div>
          <div v-else class="d-flex justify-center my-8">
            <v-alert type="info" text="No statistics available for this season."></v-alert>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Details Modal -->
    <v-dialog v-model="showPlayerDetails" max-width="800">
      <v-card v-if="selectedPlayer" class="player-details-modal">
        <v-card-title class="d-flex justify-space-between align-center pa-6">
          <span class="text-h5">Player Details</span>
          <v-btn icon="mdi-close" variant="text" @click="showPlayerDetails = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="modal-section">
            <h3 class="text-h6 mb-4">Player Information</h3>
            <div class="player-info-grid">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Name</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedPlayer.first_name }} {{ selectedPlayer.last_name }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-basketball</v-icon>
                  </template>
                  <v-list-item-title>Position</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedPlayer.position }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-tshirt-crew</v-icon>
                  </template>
                  <v-list-item-title>Jersey Number</v-list-item-title>
                  <v-list-item-subtitle>#{{ selectedPlayer.jersey_number }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-school</v-icon>
                  </template>
                  <v-list-item-title>College</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedPlayer.college }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-earth</v-icon>
                  </template>
                  <v-list-item-title>Country</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedPlayer.country }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-trophy</v-icon>
                  </template>
                  <v-list-item-title>Draft</v-list-item-title>
                  <v-list-item-subtitle>
                    Round {{ selectedPlayer.draft_round }} Pick {{ selectedPlayer.draft_number }} ({{ selectedPlayer.draft_year }})
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="modal-section">
            <h3 class="text-h6 mb-4">Season Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.pts.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">Points Per Game</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.ast.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">Assists Per Game</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.reb.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">Rebounds Per Game</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.stl.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">Steals Per Game</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.blk.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">Blocks Per Game</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats ? (playerStats.fg_pct * 100).toFixed(1) : '0.0' }}%</div>
                <div class="stat-label">Field Goal %</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats ? (playerStats.fg3_pct * 100).toFixed(1) : '0.0' }}%</div>
                <div class="stat-label">3PT %</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats ? (playerStats.ft_pct * 100).toFixed(1) : '0.0' }}%</div>
                <div class="stat-label">Free Throw %</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.turnover.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">Turnovers Per Game</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.pf.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">Personal Fouls Per Game</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.min || '0:00' }}</div>
                <div class="stat-label">Minutes Per Game</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ playerStats?.games_played || '0' }}</div>
                <div class="stat-label">Games Played</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { useTeamsStore } from '@/stores/teams'

const playersStore = usePlayersStore()
const teamsStore = useTeamsStore()

const searchQuery = ref('')
const selectedTeam = ref(null)
const selectedPosition = ref(null)
const loading = ref(false)
const loadingDetails = ref(false)
const error = ref(null)
const selectedPlayer = ref(null)
const playerStats = ref(null)
const showPlayerDetails = ref(false)

const positions = [
  'G', 'G-F', 'F', 'F-C', 'C'
]

const players = ref([])
const teams = ref([])
const canLoadMore = ref(false)

const handleSearch = () => {
  playersStore.$reset()
  fetchPlayers()
}

const fetchPlayers = async () => {
  try {
    loading.value = true
    error.value = null

    const options = {
      teamId: selectedTeam.value,
      position: selectedPosition.value
    }

    const result = await playersStore.searchPlayers(searchQuery.value, options)
    players.value = result.data
    canLoadMore.value = playersStore.canLoadMore

    // Only try to select a player if we have results and no player is currently selected
    if (players.value.length > 0 && !selectedPlayer.value) {
      // Try to find LeBron James first
      const lebron = players.value.find(p => p.id === 237)
      if (lebron) {
        await selectPlayer(lebron)
      } else {
        // If LeBron isn't in the results, select the first player
        await selectPlayer(players.value[0])
      }
    } else if (players.value.length === 0) {
      // Clear selected player if no results
      selectedPlayer.value = null
      playerStats.value = null
    }
  } catch (err) {
    error.value = err.message
    console.error('Failed to fetch players:', err)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value || !canLoadMore.value) return

  try {
    loading.value = true
    const options = {
      teamId: selectedTeam.value,
      position: selectedPosition.value,
      cursor: playersStore.cursor
    }

    const result = await playersStore.searchPlayers(searchQuery.value, options)
    players.value = [...players.value, ...result.data]
    canLoadMore.value = playersStore.canLoadMore
  } catch (err) {
    error.value = err.message
    console.error('Failed to load more players:', err)
  } finally {
    loading.value = false
  }
}

const selectPlayer = async (player) => {
  if (!player) return

  try {
    loadingDetails.value = true
    const result = await playersStore.fetchPlayerById(player.id)
    selectedPlayer.value = result.player
    playerStats.value = result.stats
  } catch (err) {
    console.error('Failed to fetch player details:', err)
    // If the player exists in our local list, use that data
    selectedPlayer.value = player
    playerStats.value = null
  } finally {
    loadingDetails.value = false
  }
}

const fetchTeams = async () => {
  try {
    await teamsStore.searchTeams()
    teams.value = teamsStore.teams
  } catch (err) {
    console.error('Failed to fetch teams:', err)
  }
}

// On mount, fetch initial data and try to select LeBron James
onMounted(async () => {
  try {
    await Promise.all([fetchPlayers(), fetchTeams()])
  } catch (err) {
    console.error('Failed to initialize players view:', err)
    error.value = 'Failed to load initial data. Please try again.'
  }
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
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  transition: all 0.2s ease;
  transform: translateY(0);
  will-change: transform;
}

.player-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
  border-color: rgba(147, 51, 234, 0.4);
}

.player-card.selected {
  background-color: rgba(147, 51, 234, 0.1);
  border-color: #9333ea;
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

.player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
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

.jersey-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.875rem;
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.rank-badge {
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.player-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  padding: 0.75rem;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 6px;
}

.info-label {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 500;
  color: #e9d5ff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  padding: 1rem;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 6px;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #9333ea;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
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

/* Skeleton Loading Styles */
.skeleton-container {
  width: 100%;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.skeleton-card {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: pulse 1.5s infinite;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(147, 51, 234, 0.1);
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
}

.skeleton-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.skeleton-team,
.skeleton-position {
  height: 16px;
  width: 40%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

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

.skeleton-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.skeleton-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-label {
  height: 16px;
  width: 40%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-value {
  height: 20px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-stats-title {
  height: 24px;
  width: 40%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 1.5rem;
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

.player-details-modal {
  background: #1a1a1a;
  color: #e9d5ff;
  border-radius: 16px;
  overflow: hidden;
}

.player-details-modal :deep(.v-card-title) {
  border-bottom: 1px solid rgba(147, 51, 234, 0.2);
}

.modal-section {
  margin-bottom: 2.5rem;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.player-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

:deep(.v-list) {
  background: transparent !important;
  padding: 0;
}

:deep(.v-list-item) {
  color: rgba(233, 213, 255, 0.7) !important;
  padding: 0.75rem 0;
}

:deep(.v-list-item-title) {
  color: #e9d5ff !important;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.v-list-item-subtitle) {
  color: rgba(233, 213, 255, 0.7) !important;
  font-size: 1rem;
}

:deep(.v-list-item__prepend) {
  margin-right: 1rem;
}

:deep(.v-icon) {
  color: #9333ea !important;
}
</style> 