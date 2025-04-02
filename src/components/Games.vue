<template>
  <div class="games-container">
    <div class="games-header">
      <h1 class="text-h4 font-weight-bold mb-6">NBA Games</h1>
    </div>

    <div v-if="error" class="mt-4">
      <v-alert type="error" text="Failed to load games. Please try again."></v-alert>
    </div>

    <div v-else class="games-layout">
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
                    <div class="skeleton-team-abbr"></div>
                    <div class="skeleton-team-name"></div>
                  </div>
                  <div class="skeleton-team-score"></div>
                </div>
                <div class="skeleton-vs"></div>
                <div class="skeleton-team">
                  <div class="skeleton-team-info">
                    <div class="skeleton-team-abbr"></div>
                    <div class="skeleton-team-name"></div>
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
            <v-card-item>
              <div class="game-header">
                <div class="game-date">{{ formatDate(game.date) }}</div>
                <div class="game-status" :class="game.status.toLowerCase()">
                  {{ game.status }}{{ game.period > 4 ? ` (OT${game.period - 4})` : '' }}
                </div>
              </div>
              
              <div class="game-teams">
                <div class="team" :class="{ 'winner': game.home_team_score > game.visitor_team_score }">
                  <div class="team-info">
                    <div class="team-abbr">{{ game.home_team.abbreviation }}</div>
                    <div class="team-name">{{ game.home_team.name }}</div>
                  </div>
                  <div class="team-score">{{ game.home_team_score }}</div>
                </div>
                <div class="vs">VS</div>
                <div class="team" :class="{ 'winner': game.visitor_team_score > game.home_team_score }">
                  <div class="team-info">
                    <div class="team-abbr">{{ game.visitor_team.abbreviation }}</div>
                    <div class="team-name">{{ game.visitor_team.name }}</div>
                  </div>
                  <div class="team-score">{{ game.visitor_team_score }}</div>
                </div>
              </div>
            </v-card-item>
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
              <div class="skeleton-team-name"></div>
              <div class="skeleton-team-score"></div>
            </div>
            <div class="skeleton-vs"></div>
            <div class="skeleton-team">
              <div class="skeleton-team-name"></div>
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
          <div class="details-header d-flex flex-column">
            <div class="header-left">
              <h2 class="text-h4">{{ formatDate(selectedGame.date) }}</h2>
            </div>
            <v-btn color="primary" variant="outlined" @click="showGameDetails = true" class="mt-4">
              View Full Details
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
            <div class="vs">VS</div>
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
    <v-dialog v-model="showGameDetails" max-width="800">
      <v-card v-if="selectedGame" class="game-details-modal">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>Game Details</span>
          <v-btn icon="mdi-close" variant="text" @click="showGameDetails = false"></v-btn>
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
                  {{ selectedGame.period > 4 ? ` (OT${selectedGame.period - 4})` : '' }}
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
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const games = ref([])
const teams = ref([])
const selectedGame = ref(null)
const isLoading = ref(true)  // Changed to true by default
const error = ref(null)
const showGameDetails = ref(false)

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
    console.log('Games API full response:', response)
    console.log('Games data:', response.data.data)
    console.log('Games meta:', response.data.meta)
    
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
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  transition: all 0.2s ease;
  transform: translateY(0);
  will-change: transform;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
  border-color: rgba(147, 51, 234, 0.4);
}

.game-card.selected {
  background-color: rgba(147, 51, 234, 0.1);
  border-color: #9333ea;
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
}

.game-date {
  color: #e9d5ff;
  font-size: 0.875rem;
}

.game-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.game-status.scheduled {
  background-color: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.game-status.finished {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.game-teams {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.team {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
}

.team.winner {
  background-color: rgba(147, 51, 234, 0.1);
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.team-abbr {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e9d5ff;
}

.team-name {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
}

.team-score {
  color: #e9d5ff;
  font-size: 1.25rem;
  font-weight: 600;
}

.vs {
  color: rgba(233, 213, 255, 0.5);
  text-align: center;
  font-size: 0.875rem;
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
  animation: pulse 1.5s infinite;
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
}

.skeleton-team {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
}

.skeleton-team-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skeleton-team-abbr {
  height: 20px;
  width: 40px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-team-name {
  height: 14px;
  width: 120px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-team-score {
  height: 20px;
  width: 30px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-vs {
  height: 16px;
  width: 30px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin: 0 auto;
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
</style> 