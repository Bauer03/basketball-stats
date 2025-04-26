<template>
  <div class="games-container" @search-select="handleSearchSelection">
    <div v-if="error" class="mt-4">
      <v-alert type="error" text="Failed to load games. Please try again."></v-alert>
    </div>

    <div class="games-layout">
      <div class="games-grid-column">
        <div v-if="isLoading" class="skeleton-container">
          <div class="skeleton-grid">
            <div v-for="i in 6" :key="`game-skeleton-${i}`" class="skeleton-card">
              <div class="skeleton-header">
                <div class="skeleton-date"></div>
                <div class="skeleton-status"></div>
              </div>
              <div class="skeleton-teams">
                <div class="skeleton-team">
                  <div class="skeleton-team-info">
                    <div class="skeleton-team-name"></div>
                    <div class="skeleton-team-abbr"></div>
                  </div>
                  <div class="skeleton-team-score"></div>
                </div>
                <div class="skeleton-team">
                  <div class="skeleton-team-info">
                    <div class="skeleton-team-name"></div>
                    <div class="skeleton-team-abbr"></div>
                  </div>
                  <div class="skeleton-team-score"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="games-grid">
          <v-card
            v-for="game in games"
            :key="game.id"
            class="game-card"
            :class="{ 'selected': selectedGame?.id === game.id }"
            @click="selectGame(game)"
            elevation="2"
          >
            <v-card-text>
              <div class="game-header">
                <div class="game-date">
                  <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                  {{ formatDate(game.date) }}
                </div>
                <div class="game-status" :class="game.status.toLowerCase().replace(' ', '_')">
                  <v-icon size="small" class="mr-1">
                    {{ game.status === 'Final' ? 'mdi-whistle' : 'mdi-clock-outline' }}
                  </v-icon>
                  {{ getGameStatus(game) }}
                </div>
              </div>
              
              <div class="game-teams">
                <div class="team" :class="{ 'winner': game.home_team_score > game.visitor_team_score }">
                  <div class="team-info">
                    <div class="team-name">{{ game.home_team.full_name }}</div>
                    <div class="team-meta">
                      <span class="team-abbr">{{ game.home_team.abbreviation }}</span>
                      <span class="team-conference">{{ game.home_team.conference }}</span>
                    </div>
                  </div>
                  <div class="team-score">{{ game.home_team_score }}</div>
                </div>
                <div class="team" :class="{ 'winner': game.visitor_team_score > game.home_team_score }">
                  <div class="team-info">
                    <div class="team-name">{{ game.visitor_team.full_name }}</div>
                    <div class="team-meta">
                      <span class="team-abbr">{{ game.visitor_team.abbreviation }}</span>
                      <span class="team-conference">{{ game.visitor_team.conference }}</span>
                    </div>
                  </div>
                  <div class="team-score">{{ game.visitor_team_score }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <div v-if="!isLoading && games.length === 0" class="d-flex justify-center my-8">
          <v-alert type="info" text="No games found matching your search criteria."></v-alert>
        </div>

        <div v-if="!isLoading && hasNextPage" class="d-flex justify-center my-8">
          <v-btn color="primary" variant="outlined" @click="loadNextPage" :loading="isLoading">
            Load More
          </v-btn>
        </div>
      </div>

      <!-- Game Details Column -->
      <div class="game-details-column">
        <div v-if="isLoading" class="skeleton-details">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-badges">
              <div class="skeleton-badge"></div>
              <div class="skeleton-badge"></div>
            </div>
          </div>
          <div class="skeleton-divider"></div>
          <div class="skeleton-teams">
            <div class="skeleton-team">
              <div class="skeleton-team-info">
                <div class="skeleton-team-name"></div>
                <div class="skeleton-team-abbr"></div>
              </div>
              <div class="skeleton-team-score"></div>
            </div>
            <div class="skeleton-team">
              <div class="skeleton-team-info">
                <div class="skeleton-team-name"></div>
                <div class="skeleton-team-abbr"></div>
              </div>
              <div class="skeleton-team-score"></div>
            </div>
          </div>
          <div class="skeleton-venue"></div>
          <div class="skeleton-stats-title"></div>
          <div class="skeleton-stats-grid">
            <div v-for="i in 4" :key="`stat-skeleton-${i}`" class="skeleton-stat-item">
              <div class="skeleton-stat-value"></div>
              <div class="skeleton-stat-label"></div>
            </div>
          </div>
        </div>

        <div v-else-if="selectedGame" class="game-details">
          <div class="details-header d-flex flex-column gap-4">
            <div class="header-left">
              <h2 class="text-h5">{{ formatDate(selectedGame.date) }}</h2>
            </div>
            <div class="button-container">
              <v-btn
                color="#9333ea"
                class="details-btn"
                @click="showGameModal = true"
                elevation="0"
              >
                View Detailed Stats
              </v-btn>
            </div>
          </div>

          <v-divider class="my-6"></v-divider>

          <div class="game-teams">
            <div class="team" :class="{ 'winner': selectedGame.home_team_score > selectedGame.visitor_team_score }">
              <div class="team-info">
                <div class="team-abbr">{{ selectedGame.home_team.abbreviation }}</div>
                <div class="team-name">{{ selectedGame.home_team.full_name }}</div>
              </div>
              <div class="team-score">{{ selectedGame.home_team_score }}</div>
            </div>
            <div class="team" :class="{ 'winner': selectedGame.visitor_team_score > selectedGame.home_team_score }">
              <div class="team-info">
                <div class="team-abbr">{{ selectedGame.visitor_team.abbreviation }}</div>
                <div class="team-name">{{ selectedGame.visitor_team.full_name }}</div>
              </div>
              <div class="team-score">{{ selectedGame.visitor_team_score }}</div>
            </div>
          </div>

          <div class="game-meta mt-6">
            <div class="meta-item">
              <v-icon size="20" class="mr-2">mdi-clock-outline</v-icon>
              <span>{{ formatGameTime(selectedGame.date) }}</span>
            </div>
            <div class="meta-item">
              <v-icon size="20" class="mr-2">mdi-trophy</v-icon>
              <span>{{ selectedGame.postseason ? 'Playoff Game' : 'Regular Season' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Details Modal -->
    <v-dialog 
      v-model="showGameModal" 
      max-width="90vw"
      class="game-details-dialog"
    >
      <v-card v-if="selectedGame" class="game-details-modal">
        <v-card-text class="pa-6">
          <div v-if="isLoadingGameDetails" class="modal-skeleton">
            <div class="skeleton-header">
              <div class="skeleton-title"></div>
              <div class="skeleton-status"></div>
            </div>
            
            <div class="skeleton-teams-score">
              <div class="skeleton-team">
                <div class="skeleton-team-info">
                  <div class="skeleton-team-name"></div>
                  <div class="skeleton-team-meta">
                    <div class="skeleton-team-abbr"></div>
                    <div class="skeleton-team-conference"></div>
                  </div>
                </div>
                <div class="skeleton-score"></div>
              </div>
              
              <div class="skeleton-divider">
                <div class="skeleton-vs"></div>
              </div>
              
              <div class="skeleton-team">
                <div class="skeleton-team-info">
                  <div class="skeleton-team-name"></div>
                  <div class="skeleton-team-meta">
                    <div class="skeleton-team-abbr"></div>
                    <div class="skeleton-team-conference"></div>
                  </div>
                </div>
                <div class="skeleton-score"></div>
              </div>
            </div>
            
            <div class="skeleton-stats">
              <div class="skeleton-stats-title"></div>
              <div class="skeleton-stats-table">
                <div class="skeleton-table-header"></div>
                <div v-for="i in 5" :key="`skeleton-row-${i}`" class="skeleton-table-row"></div>
              </div>
            </div>
          </div>
          <div v-else>
            <!-- Game Header -->
            <div class="modal-header">
              <div class="header-content">
                <div class="date-status">
                  <h2 class="text-h4 font-weight-bold">{{ formatDate(selectedGame.date) }}</h2>
                  <div class="game-status" :class="selectedGame.status.toLowerCase()">
                    <v-icon size="20" class="mr-2">
                      {{ selectedGame.status === 'Final' ? 'mdi-whistle' : 'mdi-clock-outline' }}
                    </v-icon>
                    {{ selectedGame.status }}
                  </div>
                </div>
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="showGameModal = false"
                  class="close-btn"
                ></v-btn>
              </div>

              <div class="teams-score-display">
                <div class="modal-team-score" :class="{ 'winner': selectedGame.home_team_score > selectedGame.visitor_team_score }">
                  <div class="team-info">
                    <div class="team-name">{{ selectedGame.home_team.full_name }}</div>
                    <div class="team-meta">
                      <span class="team-abbr">{{ selectedGame.home_team.abbreviation }}</span>
                      <span class="team-conference">{{ selectedGame.home_team.conference }}</span>
                    </div>
                  </div>
                  <div class="score">{{ selectedGame.home_team_score }}</div>
                </div>

                <div class="score-divider">
                  <div class="vs">VS</div>
                </div>

                <div class="modal-team-score" :class="{ 'winner': selectedGame.visitor_team_score > selectedGame.home_team_score }">
                  <div class="team-info">
                    <div class="team-name">{{ selectedGame.visitor_team.full_name }}</div>
                    <div class="team-meta">
                      <span class="team-abbr">{{ selectedGame.visitor_team.abbreviation }}</span>
                      <span class="team-conference">{{ selectedGame.visitor_team.conference }}</span>
                    </div>
                  </div>
                  <div class="score">{{ selectedGame.visitor_team_score }}</div>
                </div>
              </div>

              <div class="game-meta-info">
                <div class="meta-item">
                  <v-icon size="20" class="mr-2">mdi-basketball</v-icon>
                  <span>Season {{ selectedGame.season }}</span>
                </div>
                <div class="meta-item">
                  <v-icon size="20" class="mr-2">mdi-trophy</v-icon>
                  <span>{{ selectedGame.postseason ? 'Playoff Game' : 'Regular Season' }}</span>
                </div>
              </div>
            </div>

            <v-divider class="my-6"></v-divider>

            <!-- Player Stats Section -->
            <div class="stats-section">
              <h3 class="text-h5 font-weight-bold mb-4">Player Statistics</h3>
              <v-data-table
                :headers="[
                  { title: 'Player', key: 'player_name', align: 'start' },
                  { 
                    title: 'Team', 
                    key: 'team', 
                    align: 'start',
                    value: (item) => {
                      const teamName = item.team;
                      return teamName === selectedGame.home_team.full_name ? 
                        selectedGame.home_team.abbreviation : 
                        selectedGame.visitor_team.abbreviation;
                    }
                  },
                  { 
                    title: 'MIN', 
                    key: 'minutes', 
                    align: 'end',
                    value: (item) => item.isDNP ? 'DNP' : item.minutes
                  },
                  { 
                    title: 'PTS', 
                    key: 'points', 
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : item.points
                  },
                  { 
                    title: 'REB', 
                    key: 'rebounds', 
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : item.rebounds
                  },
                  { 
                    title: 'AST', 
                    key: 'assists', 
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : item.assists
                  },
                  { 
                    title: 'STL', 
                    key: 'steals', 
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : item.steals
                  },
                  { 
                    title: 'BLK', 
                    key: 'blocks', 
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : item.blocks
                  },
                  { 
                    title: 'FG',
                    key: 'field_goals',
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : `${item.field_goals_made}/${item.field_goals_attempt}`
                  },
                  { 
                    title: 'FG%',
                    key: 'field_goal_percentage',
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : (item.field_goal_percentage ? `${(item.field_goal_percentage * 100).toFixed(1)}%` : '-')
                  },
                  { 
                    title: '3P',
                    key: 'three_points',
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : `${item.field_goals3_made}/${item.field_goals3_attempt}`
                  },
                  { 
                    title: '3P%',
                    key: 'field_goal3_percentage',
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : (item.field_goal3_percentage ? `${(item.field_goal3_percentage * 100).toFixed(1)}%` : '-')
                  },
                  { 
                    title: 'FT',
                    key: 'free_throws',
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : `${item.freethrows_made}/${item.freethrows_attempt}`
                  },
                  { 
                    title: 'FT%',
                    key: 'freethrow_percentage',
                    align: 'end',
                    value: (item) => item.isDNP ? '-' : (item.freethrow_percentage ? `${(item.freethrow_percentage * 100).toFixed(1)}%` : '-')
                  }
                ]"
                :items="selectedGame.playerStats || []"
                :items-per-page="-1"
                hide-default-footer
                class="player-stats-table"
                :loading="isLoadingGameDetails"
                density="compact"
              ></v-data-table>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import debounce from 'lodash/debounce'

const router = useRouter()
const games = ref([])
const teams = ref([])
const selectedGame = ref(null)
const isLoading = ref(true)
const error = ref(null)
const showGameModal = ref(false)
const selectedTeams = ref([])
const cursorStack = ref([])
const currentCursor = ref(null)
const hasNextPage = ref(false)
const isInFavoritesView = ref(false)
const perPage = 25
const isLoadingGameDetails = ref(false)

const startDate = ref((() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})())

const endDate = ref((() => {
  const date = new Date()
  date.setDate(date.getDate() + 7)  // Next 7 days
  return date.toISOString().split('T')[0]
})())

// Add event listener for stats-view-changed
const handleStatsViewChanged = (event) => {
  const view = event.detail
  if (view === 'games') {
    // Clear any existing search results
    games.value = []
    isInFavoritesView.value = false
  }
}

// Add debounced initialization
const debouncedInitialize = debounce(async () => {
  try {
    await fetchTeams()
    await fetchGames()
  } catch (err) {
    console.error('Error during initialization:', err)
    error.value = 'Failed to initialize component'
  }
}, 500)

onMounted(() => {
  debouncedInitialize()
  window.addEventListener('stats-view-changed', handleStatsViewChanged)
})

onUnmounted(() => {
  window.removeEventListener('stats-view-changed', handleStatsViewChanged)
})

// Watch showGameModal to fetch game details when opened
watch(showGameModal, async (isOpen) => {
  if (isOpen && selectedGame.value) {
    try {
      isLoadingGameDetails.value = true
      const gameId = selectedGame.value.id
      const response = await api.get(`/games/${gameId}`)
      
      selectedGame.value = {
        ...selectedGame.value,
        date: response.data.game.date,
        status: response.data.game.status,
        home_team_score: response.data.game.home_team_score,
        visitor_team_score: response.data.game.visitor_team_score,
        home_team: {
          ...selectedGame.value.home_team,
          full_name: response.data.game.home_team || selectedGame.value.home_team.full_name
        },
        visitor_team: {
          ...selectedGame.value.visitor_team,
          full_name: response.data.game.visitor_team || selectedGame.value.visitor_team.full_name
        },
        playerStats: response.data.playerStats?.map(stat => ({
          ...stat,
          field_goal_percentage: typeof stat.field_goal_percentage === 'string' ? 
            parseFloat(stat.field_goal_percentage) : stat.field_goal_percentage,
          field_goal3_percentage: typeof stat.field_goal3_percentage === 'string' ? 
            parseFloat(stat.field_goal3_percentage) : stat.field_goal3_percentage,
          freethrow_percentage: typeof stat.freethrow_percentage === 'string' ? 
            parseFloat(stat.freethrow_percentage) : stat.freethrow_percentage,
          isDNP: !stat.minutes || stat.minutes === "00" || stat.minutes === "0"
        })) || []
      }
    } catch (err) {
      console.error('Failed to fetch game details:', err)
      error.value = 'Failed to load game details'
    } finally {
      isLoadingGameDetails.value = false
    }
  }
})

const validateDates = (start, end) => {
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false
    if (startDate > endDate) return false
    
    return true
  } catch (err) {
    return false
  }
}

const canGoBack = computed(() => cursorStack.value.length > 0)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

const formatGameTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

const fetchTeams = async () => {
  try {
    const response = await api.get('/teams')
    teams.value = response.data.data
  } catch (err) {
    console.error('Failed to load teams:', err)
  }
}

const fetchGames = async (cursor = null) => {
  isLoading.value = true
  error.value = null
  
  try {
    if (!validateDates(startDate.value, endDate.value)) {
      error.value = 'Invalid date range selected'
      return
    }

    const params = new URLSearchParams({
      start_date: startDate.value,
      end_date: endDate.value,
      per_page: perPage
    })

    if (cursor) {
      params.append('cursor', cursor)
    }

    if (selectedTeams.value.length > 0) {
      selectedTeams.value.forEach(id => {
        params.append('team_ids[]', id.toString())
      })
    }

    const response = await api.get('/games', { params })
    games.value = response.data.data
    hasNextPage.value = !!response.data.meta?.next_cursor
    currentCursor.value = response.data.meta?.next_cursor

    if (games.value.length > 0 && !selectedGame.value) {
      selectGame(games.value[0])
    }
  } catch (err) {
    error.value = 'Failed to load games. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const loadNextPage = async () => {
  if (currentCursor.value) {
    cursorStack.value.push(currentCursor.value)
    await fetchGames(currentCursor.value)
  }
}

const goBack = async () => {
  if (cursorStack.value.length > 0) {
    cursorStack.value.pop()
    const previousCursor = cursorStack.value[cursorStack.value.length - 1]
    await fetchGames(previousCursor)
  }
}

const selectGame = (game) => {
  selectedGame.value = game
}

const handleSearchSelection = async ({ type, item, shouldOpenModal = false }) => {
  if (type === 'Games') {
    if (Array.isArray(item)) {
      games.value = item
      isInFavoritesView.value = false
      
      if (item.length > 0) {
        selectGame(item[0])
        if (shouldOpenModal) {
          showGameModal.value = true
        }
      }
    } else if (item && item.data) {
      games.value = item.data
      isInFavoritesView.value = false
      
      if (item.data.length > 0) {
        selectGame(item.data[0])
        if (shouldOpenModal) {
          showGameModal.value = true
        }
      }
    } else {
      selectGame(item)
      if (shouldOpenModal) {
        showGameModal.value = true
      }
    }
  } else if (type === 'Players') {
    router.push('/players')
  } else if (type === 'Teams') {
    router.push('/teams')
  }
}

const handleSearchGridUpdate = (data) => {
  if (data.type === 'Games') {
    const results = Array.isArray(data.results) ? data.results : 
                   (data.results && data.results.data) ? data.results.data : 
                   []
    
    if (data.query && data.query.trim()) {
      games.value = results
      isInFavoritesView.value = false
      
      if (results.length > 0) {
        selectGame(results[0])
      }
    } else {
      fetchGames()
    }
  }
}

const handleBet = () => {
  alert('betting')
}

const updateDateRange = async (newStartDate, newEndDate) => {
  console.log('Updating date range:', { newStartDate, newEndDate })
  
  if (!validateDates(newStartDate, newEndDate)) {
    error.value = 'Invalid date range selected'
    return
  }
  
  startDate.value = newStartDate
  endDate.value = newEndDate
  await fetchGames()
}

const getGameStatus = (game) => {
  if (game.status === 'Final') return 'Complete'
  if (game.status === 'In Progress') return 'Ongoing'
  
  const gameTime = new Date(game.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  }).toLowerCase()
  
  return `Scheduled @${gameTime}`
}
</script>

<style scoped>
.games-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.games-header {
  margin-bottom: 2rem;
}

.games-layout {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 2rem;
}

.games-grid-column {
  overflow-y: auto;
  padding-right: 1rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-top: 4px;
}

.game-card {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.1);
  transition: all 0.2s ease;
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

.game-card:hover {
  background: rgba(147, 51, 234, 0.1);
  border-color: rgba(147, 51, 234, 0.2);
  transform: translateY(-2px);
}

.game-card.selected {
  background: rgba(147, 51, 234, 0.15);
  border-color: rgba(147, 51, 234, 0.3);
}

.gap-4 {
  gap: 1rem;
}

.game-details-column {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.game-date {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
}

.game-status {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  gap: 0.5rem;
  white-space: nowrap;
}

.game-status.final {
  background: rgba(22, 163, 74, 0.1);
  color: rgb(22, 163, 74);
}

.game-status.in_progress {
  background: rgba(234, 179, 8, 0.1);
  color: rgb(234, 179, 8);
}

.game-status.scheduled {
  background: rgba(147, 51, 234, 0.1);
  color: rgb(147, 51, 234);
}

.game-teams {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.team {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  width: 100%;
}

.team.winner {
  background: rgba(147, 51, 234, 0.1);
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.team-name {
  font-weight: 500;
  color: var(--color-text);
  font-size: 1.25rem;
}

.team-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.team-abbr {
  font-weight: 500;
}

.team-score {
  font-size: 1.5rem;
  font-weight: bold;
  min-width: 40px;
  text-align: right;
}

.game-venue {
  color: rgba(233, 213, 255, 0.7);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
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

/* Skeleton styling, can change, definitely not efficient but wtv */
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
  animation: pulse 1.5s infinite;
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.skeleton-date {
  height: 16px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-status {
  height: 24px;
  width: 80px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-teams {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.skeleton-team {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
}

.skeleton-team-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skeleton-team-name {
  height: 16px;
  width: 160px; /* Increased width since we have more horizontal space */
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-team-abbr {
  height: 12px;
  width: 80px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-team-score {
  height: 32px;
  width: 40px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-venue {
  height: 16px;
  width: 80%;
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

.skeleton-title {
  height: 32px;
  width: 70%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 1rem;
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
  margin: 1.5rem 0;
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

@media (max-width: 1200px) {
  .games-layout {
    grid-template-columns: 1fr;
  }

  .game-details-column {
    position: static;
  }
}

@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
}

.game-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  color: rgba(233, 213, 255, 0.7);
}

.game-details-modal {
  background: var(--background-dark, #1a1a1a);
  color: #e9d5ff;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(147, 51, 234, 0.2);
}

.stats-section {
  margin-top: 2rem;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(147, 51, 234, 0.1);
}

:deep(.player-stats-table) {
  background: transparent !important;
  width: 100%;
  min-width: 1200px;
}

:deep(.v-data-table) {
  background: transparent !important;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-data-table__wrapper) {
  background: transparent !important;
}

:deep(.v-data-table .v-table__wrapper > table) {
  background: transparent !important;
  border-spacing: 0;
  border-collapse: separate;
}

:deep(.v-data-table__tr) {
  background: transparent !important;
  border-bottom: 1px solid rgba(147, 51, 234, 0.1) !important;
  transition: all 0.2s ease;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(147, 51, 234, 0.1) !important;
}

:deep(.v-data-table__th) {
  color: rgba(233, 213, 255, 0.9) !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  background: rgba(147, 51, 234, 0.1) !important;
  border-bottom: 2px solid rgba(147, 51, 234, 0.2) !important;
  padding: 12px 16px !important;
}

:deep(.v-data-table__td) {
  color: #e9d5ff !important;
  font-size: 0.9rem !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid rgba(147, 51, 234, 0.1) !important;
}

/* Style for DNP rows */
:deep(.v-data-table__tr.dnp) {
  opacity: 0.7;
  background: rgba(147, 51, 234, 0.02) !important;
}

:deep(.v-data-table__tr.dnp:hover) {
  background: rgba(147, 51, 234, 0.08) !important;
}

:deep(.v-data-table__tr.dnp td) {
  color: rgba(233, 213, 255, 0.7) !important;
  font-style: italic;
}

/* loading state */
:deep(.v-data-table-loader) {
  background: rgba(147, 51, 234, 0.05) !important;
}

/* empty state */
:deep(.v-data-table__empty-wrapper) {
  color: rgba(233, 213, 255, 0.7) !important;
  background: rgba(147, 51, 234, 0.05) !important;
  padding: 2rem !important;
  text-align: center;
  border-radius: 8px;
}

/* scrollbar */
.game-details-modal::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.game-details-modal::-webkit-scrollbar-track {
  background: rgba(147, 51, 234, 0.05);
  border-radius: 6px;
}

.game-details-modal::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.2);
  border-radius: 6px;
  border: 3px solid rgba(147, 51, 234, 0.05);
}

.game-details-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.3);
}

/* Style for horizontal scrollbar in stats section */
.stats-section {
  overflow-x: auto;
}

.stats-section::-webkit-scrollbar {
  height: 12px;
}

.stats-section::-webkit-scrollbar-track {
  background: rgba(147, 51, 234, 0.05);
  border-radius: 6px;
}

.stats-section::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.2);
  border-radius: 6px;
  border: 3px solid rgba(147, 51, 234, 0.05);
}

.stats-section::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.3);
}

/* Add subtle animation for modal opening */
:deep(.v-dialog-transition-enter-active) {
  transition: all 0.3s ease-out;
}

:deep(.v-dialog-transition-leave-active) {
  transition: all 0.2s ease-in;
}

:deep(.v-dialog-transition-enter-from),
:deep(.v-dialog-transition-leave-to) {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-section {
    padding: 1rem;
  }

  :deep(.v-data-table__th),
  :deep(.v-data-table__td) {
    padding: 8px 12px !important;
    font-size: 0.85rem !important;
  }
}

.modal-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  width: 100%;
}

.date-status {
  display: flex;
  /* flex-direction: column; */
  justify-content: space-between;
  gap: 0.5rem;
}

.game-status {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  gap: 0.5rem;
}

.game-status.final {
  background: rgba(22, 163, 74, 0.1);
  color: rgb(22, 163, 74);
}

.teams-score-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(147, 51, 234, 0.1);
}

.team-score {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.team-score.winner {
  background: rgba(147, 51, 234, 0.1);
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e9d5ff;
}

.team-meta {
  display: flex;
  gap: 1rem;
  color: rgba(233, 213, 255, 0.7);
}

.score {
  font-size: 3rem;
  font-weight: 700;
  color: #e9d5ff;
}

.score-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
}

.vs {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(233, 213, 255, 0.7);
}

.game-meta-info {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  color: rgba(233, 213, 255, 0.7);
  font-size: 0.9rem;
}

.close-btn {
  color: rgba(233, 213, 255, 0.7) !important;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #e9d5ff !important;
  transform: scale(1.1);
}

:deep(.game-details-dialog) {
  .v-overlay__content {
    width: 90vw;
    max-width: 1600px !important;
  }
}

@media (max-width: 768px) {
  .teams-score-display {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .team-score {
    width: 100%;
  }

  .score-divider {
    display: none;
  }

  .game-meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.modal-team-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-team-score.winner {
  background: rgba(147, 51, 234, 0.1);
}

/* Modal Skeleton Loading Styles */
.modal-skeleton {
  padding: 2rem;
  animation: pulse 1.5s infinite;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.skeleton-title {
  height: 32px;
  width: 200px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-status {
  height: 24px;
  width: 100px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 16px;
}

.skeleton-teams-score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(147, 51, 234, 0.1);
}

.skeleton-team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 1rem;
}

.skeleton-team-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-team-name {
  height: 24px;
  width: 180px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-team-meta {
  display: flex;
  gap: 1rem;
}

.skeleton-team-abbr {
  height: 16px;
  width: 40px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-team-conference {
  height: 16px;
  width: 80px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-score {
  height: 48px;
  width: 60px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
}

.skeleton-vs {
  height: 24px;
  width: 40px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-stats {
  margin-top: 2rem;
}

.skeleton-stats-title {
  height: 24px;
  width: 150px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.skeleton-stats-table {
  background: rgba(147, 51, 234, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(147, 51, 234, 0.1);
}

.skeleton-table-header {
  height: 24px;
  width: 100%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.skeleton-table-row {
  height: 16px;
  width: 100%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.bet-btn {
  min-width: 80px !important;
  font-weight: 600;
  background-color: rgba(255, 165, 0, 0.2) !important;
  color: #FFA500 !important;
  border: 1px solid rgba(255, 165, 0, 0.3) !important;
}

.bet-btn:hover {
  background-color: rgba(255, 165, 0, 0.3) !important;
  color: #FFB52E !important;
  border-color: rgba(255, 165, 0, 0.4) !important;
}

.button-group {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.details-btn {
  height: 44px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  background-color: #9333ea !important;
  padding: 0 24px;
  min-width: 200px;
  width: 100%;
  margin: 8px 0;
}

.details-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  background-color: rgba(147, 51, 234, 0.9) !important;
}

.button-container {
  width: 100%;
  padding: 8px 0;
}
</style> 