<template>
  <div class="games-container" @search-select="handleSearchSelection">
    <div v-if="error" class="mt-4">
      <v-alert type="error" text="Failed to load games. Please try again."></v-alert>
    </div>

    <div class="games-layout">
      <!-- Games Grid Column -->
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
                <div class="game-status" :class="game.status.toLowerCase()">
                  <v-icon size="small" class="mr-1">{{ game.status === 'Final' ? 'mdi-whistle' : 'mdi-clock-outline' }}</v-icon>
                  {{ game.status }}{{ game.period > 4 ? ` (OT${game.period - 4})` : '' }}
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
            <div class="d-flex gap-3" v-if="selectedGame.status !== 'Final'">
              <v-btn
                color="#9333ea"
                class="details-btn flex-grow-1"
                @click="showGameModal = true"
                elevation="0"
              >
                View Detailed Stats
              </v-btn>
              <v-btn
                color="#fbbf24"
                class="bet-btn"
                @click="handleBet"
                elevation="0"
              >
                Bet
              </v-btn>
            </div>
            <v-btn
              v-else
              color="#9333ea"
              block
              class="details-btn"
              @click="showGameModal = true"
              elevation="0"
            >
              View Detailed Stats
            </v-btn>
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
              <v-icon size="20" class="mr-2">mdi-calendar</v-icon>
              <span>Season {{ selectedGame.season }}</span>
            </div>
            <div class="meta-item">
              <v-icon size="20" class="mr-2">mdi-trophy</v-icon>
              <span>{{ selectedGame.postseason ? 'Playoff Game' : 'Regular Season' }}</span>
            </div>
            <div class="meta-item">
              <v-icon size="20" class="mr-2">mdi-clock-outline</v-icon>
              <span>{{ selectedGame.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Details Modal -->
    <v-dialog v-model="showGameModal" max-width="800">
      <v-card v-if="selectedGame" class="game-details-modal">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>Game Details</span>
          <v-btn icon="mdi-close" variant="text" @click="showGameModal = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="modal-section">
            <h3 class="text-h6 mb-4">Game Information</h3>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Date</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(selectedGame.date) }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>Status</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedGame.status }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-trophy</v-icon>
                </template>
                <v-list-item-title>Game Type</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedGame.postseason ? 'Playoff Game' : 'Regular Season' }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-basketball</v-icon>
                </template>
                <v-list-item-title>Season</v-list-item-title>
                <v-list-item-subtitle>{{ selectedGame.season }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="modal-section">
            <h3 class="text-h6 mb-4">Team Information</h3>
            <div class="teams-detail">
              <div class="team-detail">
                <h4 class="text-h6 mb-2">Home Team</h4>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>{{ selectedGame.home_team.full_name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedGame.home_team.abbreviation }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Conference</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedGame.home_team.conference }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Division</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedGame.home_team.division }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>

              <v-divider vertical></v-divider>

              <div class="team-detail">
                <h4 class="text-h6 mb-2">Visitor Team</h4>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>{{ selectedGame.visitor_team.full_name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedGame.visitor_team.abbreviation }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Conference</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedGame.visitor_team.conference }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Division</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedGame.visitor_team.division }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="modal-section">
            <h3 class="text-h6 mb-4">Player Stats</h3>
            <v-data-table
              :headers="[
                { title: 'Player', key: 'player_name' },
                { title: 'Team', key: 'team' },
                { title: 'PTS', key: 'points' },
                { title: 'REB', key: 'rebounds' },
                { title: 'AST', key: 'assists' },
                { title: 'STL', key: 'steals' },
                { title: 'BLK', key: 'blocks' },
                { title: 'FG', key: 'field_goals_made', format: value => `${value}/${value + field_goals_attempt}` },
                { title: 'FG%', key: 'field_goal_percentage', format: value => `${(value * 100).toFixed(1)}%` },
                { title: '3P', key: 'field_goals3_made', format: value => `${value}/${value + field_goals3_attempt}` },
                { title: '3P%', key: 'field_goal3_percentage', format: value => `${(value * 100).toFixed(1)}%` }
              ]"
              :items="selectedGame.playerStats"
              class="player-stats-table"
            ></v-data-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()
const games = ref([])
const teams = ref([])
const selectedGame = ref(null)
const isLoading = ref(true)  // Changed to true by default
const error = ref(null)
const showGameModal = ref(false)

// Date filters
const startDate = ref('2024-10-01')  // Start of 2024-25 season
const endDate = ref('2025-06-30')    // End of 2024-25 season

// Team filters
const selectedTeams = ref([14])  // Lakers team ID is 14

// Pagination
const cursorStack = ref([])
const currentCursor = ref(null)
const hasNextPage = ref(false)
const perPage = 25

const canGoBack = computed(() => cursorStack.value.length > 0)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
    const params = {
      start_date: startDate.value,
      end_date: endDate.value,
      per_page: perPage
    }

    if (cursor) {
      params.cursor = cursor
    }

    // Always include Lakers if no other team is selected
    if (selectedTeams.value.length > 0) {
      params.team_ids = selectedTeams.value
    } else {
      params.team_ids = [14]  // Lakers team ID
    }

    console.log('Fetching games with params:', params)
    const response = await api.get('/games', { params })
    console.log('Games data:', response.data.data)
    
    // Just use the data directly, no need to map it
    games.value = response.data.data

    hasNextPage.value = !!response.data.meta.next_cursor
    currentCursor.value = response.data.meta.next_cursor

    // Select the first game by default
    if (games.value.length > 0 && !selectedGame.value) {
      selectGame(games.value[0])
    }
  } catch (err) {
    console.error('Error fetching games:', err)
    error.value = err.message
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

const handleSearchSelection = async ({ type, item }) => {
  if (type === 'Games') {
    await selectGame(item)
  } else if (type === 'Teams') {
    router.push('/teams')
  } else if (type === 'Players') {
    router.push('/players')
  }
}

const handleBet = () => {
  alert('betting')
}

onMounted(async () => {
  await fetchTeams()
  await fetchGames()  // This will use the default filters
})
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
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  background: rgba(147, 51, 234, 0.1);
  color: var(--color-text);
  font-weight: 500;
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

.game-status.final {
  background: rgba(22, 163, 74, 0.1);
  color: rgb(22, 163, 74);
}

.game-status.in_progress {
  background: rgba(234, 179, 8, 0.1);
  color: rgb(234, 179, 8);
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

/* Skeleton styling, can change */
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
  background: #1a1a1a;
  color: #e9d5ff;
}

.modal-section {
  margin-bottom: 2rem;
}

.teams-detail {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: start;
}

.team-detail {
  flex: 1;
}

:deep(.v-list) {
  background: transparent !important;
}

:deep(.v-list-item) {
  color: rgba(233, 213, 255, 0.7) !important;
}

:deep(.v-list-item-title) {
  color: #e9d5ff !important;
}

:deep(.v-list-item-subtitle) {
  color: rgba(233, 213, 255, 0.7) !important;
}

.details-btn {
  height: 44px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.details-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  background-color: rgba(147, 51, 234, 0.9) !important;
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

.header-left h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e9d5ff;
  margin-bottom: 0.75rem;
}

.bet-btn {
  min-width: 100px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  color: #000 !important;
}

.bet-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style> 