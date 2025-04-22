<template>
  <v-container class="betting-container">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4">Your Bets</h1>
          <div class="d-flex gap-4">
            <v-btn
              color="#FFA500"
              class="stats-btn"
              @click="showStatsDialog = true"
              :disabled="betsStore.isLoading"
            >
              <v-icon start>mdi-chart-bar</v-icon>
              Statistics
            </v-btn>
            <v-btn
              color="#FFA500"
              class="new-bet-btn"
              @click="showNewBetDialog = true"
              :disabled="betsStore.isLoading"
            >
              Place New Bet
            </v-btn>
          </div>
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="betsStore.error"
          type="error"
          closable
          class="mb-4"
          @click:close="betsStore.clearError()"
        >
          {{ betsStore.error }}
        </v-alert>

        <!-- Loading State -->
        <v-row v-if="betsStore.isLoading">
          <v-col v-for="i in 4" :key="i" cols="12" md="6">
            <v-card class="bet-card mb-4">
              <v-card-title>
                <v-skeleton-loader type="heading" width="60%" height="24"></v-skeleton-loader>
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="stat-section">
                      <h3 class="text-subtitle-1 mb-4">Predictions</h3>
                      <v-skeleton-loader
                        v-for="j in 3"
                        :key="j"
                        type="text"
                        class="mb-3"
                      ></v-skeleton-loader>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="stat-section">
                      <h3 class="text-subtitle-1 mb-4">Actual Stats</h3>
                      <v-skeleton-loader
                        v-for="j in 3"
                        :key="j"
                        type="text"
                        class="mb-3"
                      ></v-skeleton-loader>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- No Bets State -->
        <v-card v-else-if="!betsWithDetails.length" class="no-bets-card pa-6 text-center">
          <v-icon size="64" color="#FFA500" class="mb-4">mdi-chart-box-outline</v-icon>
          <h2 class="text-h5 mb-2">No Bets Yet</h2>
          <p class="text-body-1 mb-4">Start placing bets on NBA games to track your predictions!</p>
          <v-btn
            color="#FFA500"
            class="new-bet-btn"
            @click="showNewBetDialog = true"
          >
            Place Your First Bet
          </v-btn>
        </v-card>

        <v-row v-else>
          <v-col v-for="bet in betsWithDetails" :key="bet._id" cols="12" md="6">
            <v-card class="bet-card mb-4">
              <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6">{{ bet.player.name }}</span>
                <v-chip
                  :color="getBetStatusColor(bet.status)"
                  size="small"
                >
                  {{ bet.status }}
                </v-chip>
              </v-card-title>

              <v-card-subtitle class="game-info">
                {{ bet.game.homeTeam }} vs {{ bet.game.awayTeam }}
                <br>
                {{ formatDate(bet.game.date) }}
              </v-card-subtitle>

              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="stat-section">
                      <h3 class="text-subtitle-1 mb-2">Predictions</h3>
                      <div class="stat-grid">
                        <div class="stat-item">
                          <span class="stat-label">Points:</span>
                          <span class="stat-value">{{ bet.predictions.points }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Assists:</span>
                          <span class="stat-value">{{ bet.predictions.assists }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Rebounds:</span>
                          <span class="stat-value">{{ bet.predictions.rebounds }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">3PM:</span>
                          <span class="stat-value">{{ bet.predictions.threes }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Steals:</span>
                          <span class="stat-value">{{ bet.predictions.steals }}</span>
                        </div>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="stat-section">
                      <h3 class="text-subtitle-1 mb-2">Actual Stats</h3>
                      <div class="stat-grid">
                        <div class="stat-item">
                          <span class="stat-label">Points:</span>
                          <span class="stat-value">{{ bet.actualStats.points ?? '-' }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Assists:</span>
                          <span class="stat-value">{{ bet.actualStats.assists ?? '-' }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Rebounds:</span>
                          <span class="stat-value">{{ bet.actualStats.rebounds ?? '-' }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">3PM:</span>
                          <span class="stat-value">{{ bet.actualStats.threes ?? '-' }}</span>
                        </div>
                        <div class="stat-item">
                          <span class="stat-label">Steals:</span>
                          <span class="stat-value">{{ bet.actualStats.steals ?? '-' }}</span>
                        </div>
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <div v-if="bet.score !== null" class="score-section mt-4">
                  <v-divider class="mb-2"></v-divider>
                  <div class="text-center">
                    <span class="text-h6">Score: {{ bet.score }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- New Bet Dialog -->
    <v-dialog v-model="showNewBetDialog" max-width="800px">
      <v-card class="bet-dialog">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h5">Place New Bet</span>
          <v-btn icon @click="showNewBetDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <!-- Search filters -->
          <v-row>
            <v-col cols="12">
              <div class="search-section">
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="playerName"
                      label="Player name"
                      placeholder="Enter player name"
                      variant="outlined"
                      density="comfortable"
                      :loading="playersStore.loading"
                      :disabled="playersStore.loading"
                      @keyup.enter="handleSearch"
                      class="search-field"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-text-field
                      v-model="gameFilters.startDate"
                      label="Start Date"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      class="date-field"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-text-field
                      v-model="gameFilters.endDate"
                      label="End Date"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      class="date-field"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" sm="2" class="d-flex align-center">
                    <v-btn
                      color="#FFA500"
                      :loading="playersStore.loading"
                      :disabled="!canSearch"
                      @click="handleSearch"
                      block
                      class="search-btn"
                    >
                      Search
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>

          <!-- Available games -->
          <v-row v-if="availableGames.length">
            <v-col cols="12">
              <div class="text-subtitle-1 mb-4">Available Games</div>
              <div class="games-list-container">
                <v-row dense>
                  <v-col v-for="game in availableGames" :key="game.id" cols="12">
                    <v-card
                      :class="['game-card', { 'selected': newBet.gameId === game.id }]"
                      @click="selectGame(game)"
                      elevation="0"
                    >
                      <v-card-item>
                        <div class="d-flex justify-space-between align-center">
                          <div>
                            <v-card-title class="text-h6 pa-0">{{ game.homeTeam }} vs {{ game.awayTeam }}</v-card-title>
                            <v-card-subtitle class="pa-0 mt-1">
                              {{ formatDate(game.date) }}
                            </v-card-subtitle>
                          </div>
                          <v-icon :color="newBet.gameId === game.id ? '#FFA500' : 'grey'" icon="mdi-chevron-right"></v-icon>
                        </div>
                      </v-card-item>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>

          <!-- Predictions form -->
          <v-row v-if="newBet.gameId">
            <v-col cols="12">
              <div class="text-subtitle-1 mb-2">Predictions</div>
              <div class="predictions-section">
                <v-row>
                  <v-col
                    v-for="(value, stat) in newBet.predictions"
                    :key="stat"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="newBet.predictions[stat]"
                      :label="formatStatLabel(stat)"
                      type="number"
                      min="0"
                      variant="outlined"
                      density="comfortable"
                      class="prediction-field"
                      hide-details
                    />
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showNewBetDialog = false"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="#FFA500"
            @click="submitBet"
            :loading="isSubmitting"
            :disabled="!isValidBet"
            class="submit-btn"
          >
            Place Bet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Statistics Dialog -->
    <v-dialog v-model="showStatsDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Betting Statistics</span>
          <v-btn icon @click="showStatsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-card class="stat-card">
                <v-card-text>
                  <div class="text-h6 mb-2">Overall Stats</div>
                  <div class="stat-grid">
                    <div class="stat-item">
                      <span class="stat-label">Total Bets:</span>
                      <span class="stat-value">{{ completedBets.length }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Average Score:</span>
                      <span class="stat-value">{{ averageScore.toFixed(1) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Pending Bets:</span>
                      <span class="stat-value">{{ pendingBets.length }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card class="stat-card">
                <v-card-text>
                  <div class="text-h6 mb-2">Prediction Accuracy</div>
                  <div class="stat-grid">
                    <div class="stat-item">
                      <span class="stat-label">Points:</span>
                      <span class="stat-value">{{ getPredictionAccuracy('points') }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Assists:</span>
                      <span class="stat-value">{{ getPredictionAccuracy('assists') }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Rebounds:</span>
                      <span class="stat-value">{{ getPredictionAccuracy('rebounds') }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">3PM:</span>
                      <span class="stat-value">{{ getPredictionAccuracy('threes') }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Steals:</span>
                      <span class="stat-value">{{ getPredictionAccuracy('steals') }}%</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBetsStore } from '@/stores/betsStore'
import { usePlayersStore } from '@/stores/players'
import { gamesApi } from '@/services/api/games'
import { playersApi } from '@/services/api/players'

const betsStore = useBetsStore()
const playersStore = usePlayersStore()
const showNewBetDialog = ref(false)
const showStatsDialog = ref(false)
const betForm = ref(null)
const isFormValid = ref(false)
const isSubmitting = ref(false)
const isLoadingGames = ref(false)
const isLoadingPlayers = ref(false)

const newBet = ref({
  gameId: null,
  playerId: null,
  predictions: {
    points: null,
    assists: null,
    rebounds: null,
    threes: null,
    steals: null
  }
})

// Available games state
const availableGames = ref([])

// Initialize dates for a week range
const initializeDates = () => {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  
  return {
    startDate: today.toISOString().split('T')[0],
    endDate: nextWeek.toISOString().split('T')[0]
  }
}

// Game filters state with default dates
const gameFilters = ref(initializeDates())

// Available players state
const availablePlayers = ref([])

const playerName = ref('')

// Computed properties
const canSearch = computed(() => {
  return playerName.value.trim() && !playersStore.loading
})

const getBetStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'orange'
    case 'won':
      return 'success'
    case 'lost':
      return 'error'
    default:
      return 'grey'
  }
}

// Search games with the current filters
const searchGames = async () => {
  try {
    isLoadingGames.value = true
    console.log('🎮 Starting game search with filters:', {
      ...gameFilters.value,
      playerName: playerName.value
    })
    
    const { startDate, endDate } = gameFilters.value
    const searchName = playerName.value.trim()
    
    if (!searchName) {
      throw new Error('Please enter a player name')
    }
    
    if (!startDate || !endDate) {
      throw new Error('Please select both start and end dates')
    }

    // First get the player ID from the name
    console.log('🎮 Searching for player:', searchName)
    const playerResponse = await playersApi.searchPlayers(searchName)
    if (!playerResponse?.data?.length) {
      throw new Error('No player found with that name')
    }
    const playerId = playerResponse.data[0].id

    // Now fetch games using the correct endpoint
    console.log('🎮 Fetching games for player:', playerId, 'from', startDate, 'to', endDate)
    const response = await playersStore.fetchPlayerGameLog(playerId, startDate, endDate)
    
    if (!response?.data || !Array.isArray(response.data)) {
      console.error('🎮 Invalid API response structure:', response)
      throw new Error('Invalid response from games API')
    }
    
    console.log('🎮 Processing games data:', response.data)
    
    // Map the games data to include team names
    availableGames.value = response.data.map(game => ({
      id: game.id,
      homeTeam: game.home_team?.full_name || 'Unknown Team',
      awayTeam: game.visitor_team?.full_name || 'Unknown Team',
      date: game.date,
      playerId: playerId
    }))

    console.log('🎮 Final processed games:', availableGames.value)
  } catch (error) {
    console.error('🎮 Error fetching games:', error)
    availableGames.value = []
  } finally {
    isLoadingGames.value = false
  }
}

// Update the search button click handler
const handleSearch = () => {
  if (playerName.value.trim()) {
    searchGames()
  }
}

const resetForm = () => {
  newBet.value = {
    gameId: null,
    playerId: null,
    predictions: {
      points: null,
      assists: null,
      rebounds: null,
      threes: null,
      steals: null
    }
  }
  availableGames.value = []
  playerName.value = ''
}

const handleSubmit = async () => {
  if (!isValidBet.value) return

  isSubmitting.value = true
  try {
    console.log('🎲 Submitting bet:', {
      gameId: newBet.value.gameId,
      playerId: newBet.value.playerId,
      predictions: newBet.value.predictions
    })
    
    const response = await betsStore.createBet({
      ...newBet.value,
      playerId: availableGames.value.find(g => g.id === newBet.value.gameId)?.playerId
    })
    
    console.log('🎲 Bet submission response:', response)
    showNewBetDialog.value = false
    resetForm()
    
    // Refresh bets list
    console.log('🎲 Refreshing bets list...')
    const updatedBets = await betsStore.fetchBets()
    console.log('🎲 Updated bets:', updatedBets)
  } catch (error) {
    console.error('Error submitting bet:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Fetch player details by ID
const fetchPlayerDetails = async (playerId) => {
  try {
    console.log('Fetching player details for ID:', playerId)
    const result = await playersStore.fetchPlayerById(playerId)
    if (result?.player) {
      console.log('Player details fetched successfully:', result.player)
      // Update the mockPlayers in the betsStore
      betsStore.mockPlayers[playerId] = {
        id: playerId,
        name: result.player.first_name && result.player.last_name 
          ? `${result.player.first_name} ${result.player.last_name}` 
          : 'Unknown Player',
        team: result.player.team?.full_name || result.player.team?.name || 'Unknown Team'
      }
      console.log('Updated mockPlayers with player data:', betsStore.mockPlayers[playerId])
      return result.player
    }
    console.log('No player data found for ID:', playerId)
    return null
  } catch (error) {
    console.error('Error fetching player details for ID:', playerId, error)
    return null
  }
}

// Fetch game details by ID
const fetchGameDetails = async (gameId) => {
  try {
    console.log('Fetching game details for ID:', gameId)
    const result = await gamesApi.getGameById(gameId)
    console.log('Game API response:', result)
    
    if (result?.game) {
      console.log('Game details fetched successfully:', result.game)
      // Update the mockGames in the betsStore
      betsStore.mockGames[gameId] = {
        id: gameId,
        homeTeam: result.game.home_team || 'Unknown Team',
        awayTeam: result.game.visitor_team || 'Unknown Team',
        date: result.game.date || new Date().toISOString()
      }
      console.log('Updated mockGames with game data:', betsStore.mockGames[gameId])
      
      // Check if we have player stats in the response
      if (result.playerStats && Array.isArray(result.playerStats) && result.playerStats.length > 0) {
        console.log('Player stats found in game response:', result.playerStats.length, 'players')
        
        // Find the bet for this game
        const bet = betsStore.bets.find(b => b.gameId === gameId)
        if (bet && bet.playerId) {
          // Get the player name from mockPlayers
          const playerName = betsStore.mockPlayers[bet.playerId]?.name
          
          if (playerName) {
            console.log('Looking for player with name:', playerName)
            
            // Find the player's stats in the game by name
            const playerStats = result.playerStats.find(p => p.player_name === playerName)
            
            if (playerStats) {
              console.log('Found player stats for player name:', playerName, playerStats)
              
              // Update the bet's actualStats
              bet.actualStats = {
                points: playerStats.points || 0,
                assists: playerStats.assists || 0,
                rebounds: playerStats.rebounds || 0,
                threes: playerStats.field_goals3_made || 0,
                steals: playerStats.steals || 0
              }
              
              console.log('Updated bet with actual stats:', bet)
            } else {
              console.log('No stats found for player name:', playerName, 'in game:', gameId)
            }
          } else {
            console.log('No player name found for player ID:', bet.playerId)
          }
        }
      }
      
      return result.game
    }
    console.log('No game data found for ID:', gameId)
    return null
  } catch (error) {
    console.error('Error fetching game details for ID:', gameId, error)
    return null
  }
}

// Fetch bets when component mounts
onMounted(async () => {
  try {
    console.log('Fetching user bets...')
    const response = await betsStore.fetchBets()
    console.log('Bets API Response:', response)
    
    // Fetch player and game details for each bet
    if (Array.isArray(betsStore.bets) && betsStore.bets.length > 0) {
      console.log('Fetching details for bets...')
      console.log('Total bets to process:', betsStore.bets.length)
      
      // Create a map to track unique player and game IDs to avoid duplicate fetches
      const playerIds = new Set()
      const gameIds = new Set()
      
      betsStore.bets.forEach(bet => {
        if (bet.playerId) playerIds.add(bet.playerId)
        if (bet.gameId) gameIds.add(bet.gameId)
      })
      
      console.log('Unique player IDs to fetch:', Array.from(playerIds))
      console.log('Unique game IDs to fetch:', Array.from(gameIds))
      
      // Fetch player details
      console.log('Starting player details fetch...')
      const playerResults = await Promise.allSettled(Array.from(playerIds).map(id => fetchPlayerDetails(id)))
      console.log('Player fetch results:', playerResults.map(result => result.status))
      
      // Fetch game details
      console.log('Starting game details fetch...')
      const gameResults = await Promise.allSettled(Array.from(gameIds).map(id => fetchGameDetails(id)))
      console.log('Game fetch results:', gameResults.map(result => result.status))
      
      console.log('Finished fetching details for bets')
      console.log('Updated mockPlayers:', betsStore.mockPlayers)
      console.log('Updated mockGames:', betsStore.mockGames)
    }
    
    console.log('Processed bets with details:', betsWithDetails.value)
  } catch (error) {
    console.error('Failed to fetch bets:', error)
  }
})

const betsWithDetails = computed(() => betsStore.getBetsWithDetails)

const completedBets = computed(() => 
  betsWithDetails.value.filter(bet => bet.status === 'completed' && bet.score !== null)
)

const pendingBets = computed(() => 
  betsWithDetails.value.filter(bet => bet.status === 'pending')
)

const averageScore = computed(() => {
  if (completedBets.value.length === 0) return 0
  const totalScore = completedBets.value.reduce((sum, bet) => sum + bet.score, 0)
  return totalScore / completedBets.value.length
})

const getPredictionAccuracy = (stat) => {
  const completedBetsWithStats = completedBets.value.filter(bet => 
    bet.actualStats[stat] !== null && bet.predictions[stat] !== null
  )
  
  if (completedBetsWithStats.length === 0) return 0
  
  const accuratePredictions = completedBetsWithStats.filter(bet => 
    Math.abs(bet.actualStats[stat] - bet.predictions[stat]) <= 2
  ).length
  
  return Math.round((accuratePredictions / completedBetsWithStats.length) * 100)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
}

const formatStatLabel = (stat) => {
  switch (stat) {
    case 'points':
      return 'Points'
    case 'assists':
      return 'Assists'
    case 'rebounds':
      return 'Rebounds'
    case 'threes':
      return 'Three Pointers'
    case 'steals':
      return 'Steals'
    default:
      return stat.charAt(0).toUpperCase() + stat.slice(1)
  }
}

const isValidBet = computed(() => {
  if (!newBet.value.gameId) return false
  
  return Object.values(newBet.value.predictions).every(val => 
    val !== null && val >= 0 && Number.isInteger(Number(val))
  )
})

const submitBet = () => {
  if (isValidBet.value) {
    handleSubmit()
  }
}

// Add the selectGame function
const selectGame = (game) => {
  console.log('🎮 Selecting game:', game)
  newBet.value.gameId = game.id
  newBet.value.playerId = game.playerId
}
</script>

<style scoped>
.betting-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
}

.bet-card {
  background: rgba(255, 165, 0, 0.05);
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 12px;
}

.game-info {
  color: var(--v-theme-text-secondary);
  margin-top: 8px;
}

.stat-section {
  background: rgba(255, 165, 0, 0.05);
  padding: 12px;
  border-radius: 8px;
}

.stat-grid {
  display: grid;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgba(255, 165, 0, 0.1);
  border-radius: 4px;
}

.stat-label {
  color: var(--v-theme-text-secondary);
}

.stat-value {
  font-weight: 600;
}

.new-bet-btn {
  background-color: rgba(255, 165, 0, 0.2) !important;
  color: #FFA500 !important;
  border: 1px solid rgba(255, 165, 0, 0.3) !important;
}

.new-bet-btn:hover {
  background-color: rgba(255, 165, 0, 0.3) !important;
  color: #FFB52E !important;
  border-color: rgba(255, 165, 0, 0.4) !important;
}

.stats-btn {
  background-color: rgba(255, 165, 0, 0.2) !important;
  color: #FFA500 !important;
  border: 1px solid rgba(255, 165, 0, 0.3) !important;
}

.stats-btn:hover {
  background-color: rgba(255, 165, 0, 0.3) !important;
  color: #FFB52E !important;
  border-color: rgba(255, 165, 0, 0.4) !important;
}

.stat-card {
  background: rgba(255, 165, 0, 0.05);
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 12px;
  height: 100%;
}

.gap-4 {
  gap: 1rem;
}

/* Fix layout shifting for dropdowns */
:deep(.v-select .v-field__input) {
  min-height: 56px !important;
}

:deep(.v-select .v-field) {
  position: relative !important;
}

:deep(.v-select .v-overlay__content) {
  position: fixed !important;
}

/* Add max-height to dropdown menus */
:deep(.v-select .v-overlay__content .v-list) {
  max-height: 300px;
  overflow-y: auto;
}

.no-bets-card {
  background: rgba(255, 165, 0, 0.05);
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 12px;
  max-width: 600px;
  margin: 2rem auto;
}

.no-bets-card h2 {
  color: #FFA500;
}

.no-bets-card p {
  color: var(--v-theme-text-secondary);
}

.game-selection-section {
  background: rgba(255, 165, 0, 0.05);
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.game-filters {
  background: rgba(255, 165, 0, 0.05);
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.games-list-container {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
  background: rgba(255, 165, 0, 0.02);
  padding: 8px;
}

.game-card {
  background: rgba(255, 165, 0, 0.05) !important;
  border: 1px solid rgba(255, 165, 0, 0.1) !important;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 8px;
}

.game-card:hover {
  background: rgba(255, 165, 0, 0.1) !important;
  border-color: rgba(255, 165, 0, 0.2) !important;
  transform: translateX(4px);
}

.game-card.selected {
  background: rgba(255, 165, 0, 0.15) !important;
  border-color: #FFA500 !important;
}

.game-card .v-card-title {
  font-size: 1.1rem !important;
  line-height: 1.4 !important;
  color: rgba(255, 255, 255, 0.9);
}

.game-card .v-card-subtitle {
  color: rgba(255, 165, 0, 0.8) !important;
  font-size: 0.9rem !important;
}

.game-card:hover .v-icon {
  transform: translateX(4px);
}

/* Custom scrollbar for games list */
.games-list-container::-webkit-scrollbar {
  width: 8px;
}

.games-list-container::-webkit-scrollbar-track {
  background: rgba(255, 165, 0, 0.05);
  border-radius: 4px;
}

.games-list-container::-webkit-scrollbar-thumb {
  background: rgba(255, 165, 0, 0.2);
  border-radius: 4px;
}

.games-list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 165, 0, 0.3);
}

.search-btn,
.submit-btn {
  background-color: rgba(255, 165, 0, 0.2) !important;
  color: #FFA500 !important;
  border: 1px solid rgba(255, 165, 0, 0.3) !important;
}

.search-btn:hover,
.submit-btn:hover {
  background-color: rgba(255, 165, 0, 0.3) !important;
  color: #FFB52E !important;
  border-color: rgba(255, 165, 0, 0.4) !important;
}

.player-selection-section {
  background: rgba(255, 165, 0, 0.05);
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.team-filter {
  min-width: 200px;
}

.predictions-grid {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 8px;
  align-items: center;
}

.prediction {
  text-align: center;
}

.actual {
  text-align: center;
  color: rgba(255, 165, 0, 0.8);
}

.bet-dialog {
  background: #1E1E1E;
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 12px;
}

.search-field,
.date-field,
.prediction-field {
  border-radius: 8px;
}

/* Simplify input styling to only modify outline color */
:deep(.v-field.v-field--variant-outlined .v-field__outline) {
  color: rgba(255, 165, 0, 0.3);
}

:deep(.v-field.v-field--variant-outlined:hover .v-field__outline) {
  color: rgba(255, 165, 0, 0.5);
}

:deep(.v-field.v-field--variant-outlined.v-field--focused .v-field__outline) {
  color: #FFA500;
}

/* Remove any other input field styles that were previously added */
.search-field,
.date-field,
.prediction-field {
  border-radius: 8px;
}

.cancel-btn {
  background-color: rgba(255, 165, 0, 0.2) !important;
  color: #FFA500 !important;
  border: 1px solid rgba(255, 165, 0, 0.3) !important;
}

.cancel-btn:hover {
  background-color: rgba(255, 165, 0, 0.3) !important;
  color: #FFB52E !important;
  border-color: rgba(255, 165, 0, 0.4) !important;
}

.search-section {
  background: rgba(255, 165, 0, 0.05);
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.predictions-section {
  background: rgba(255, 165, 0, 0.05);
  border: 1px solid rgba(255, 165, 0, 0.1);
  border-radius: 12px;
  padding: 16px;
}
</style> 