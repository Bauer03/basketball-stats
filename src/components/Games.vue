<template>
  <div class="games-container">
    <div class="games-header">
      <h1 class="games-title">NBA Games</h1>
      <div class="filter-controls">
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="startDate"
              label="Start Date"
              type="date"
              density="comfortable"
              class="date-filter"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="endDate"
              label="End Date"
              type="date"
              density="comfortable"
              class="date-filter"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="selectedTeams"
              :items="teams"
              item-title="full_name"
              item-value="id"
              label="Teams"
              multiple
              chips
              density="comfortable"
              class="teams-filter"
            ></v-select>
          </v-col>
        </v-row>
        <v-btn
          color="#9333ea"
          @click="fetchGames"
          :loading="isLoading"
        >
          Search Games
        </v-btn>
      </div>
    </div>

    <div v-if="error" class="games-error">
      <v-alert type="error" text="Failed to load games. Please try again."></v-alert>
    </div>

    <div v-else-if="isLoading" class="games-loading">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      ></v-progress-circular>
    </div>

    <div v-else class="games-content">
      <div class="games-grid">
        <v-card
          v-for="game in games"
          :key="game.id"
          class="game-card"
          @click="selectGame(game)"
          elevation="2"
        >
          <div class="game-header">
            <div class="game-date">{{ formatDate(game.date) }}</div>
            <div class="game-status" :class="game.status.toLowerCase()">{{ game.status }}</div>
          </div>
          
          <div class="game-teams">
            <div class="team" :class="{ 'winner': game.home_team_score > game.visitor_team_score }">
              <div class="team-name">{{ game.home_team.full_name }}</div>
              <div class="team-score">{{ game.home_team_score }}</div>
            </div>
            <div class="vs">VS</div>
            <div class="team" :class="{ 'winner': game.visitor_team_score > game.home_team_score }">
              <div class="team-name">{{ game.visitor_team.full_name }}</div>
              <div class="team-score">{{ game.visitor_team_score }}</div>
            </div>
          </div>

          <div class="game-venue">
            <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
            {{ game.venue }}
          </div>
        </v-card>
      </div>

      <div class="pagination-controls">
        <v-btn
          color="#9333ea"
          variant="outlined"
          :disabled="!canGoBack"
          @click="goBack"
        >
          Previous
        </v-btn>
        <v-btn
          color="#9333ea"
          variant="outlined"
          :disabled="!hasNextPage"
          @click="loadNextPage"
        >
          Next
        </v-btn>
      </div>
    </div>

    <!-- Game Details Dialog -->
    <v-dialog v-model="showGameDetails" max-width="800px">
      <v-card v-if="selectedGame" class="game-details">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Game Details</span>
          <v-btn icon @click="showGameDetails = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div class="details-header">
            <div class="game-date">{{ formatDate(selectedGame.date) }}</div>
            <div class="game-status" :class="selectedGame.status.toLowerCase()">{{ selectedGame.status }}</div>
          </div>

          <div class="details-teams">
            <div class="team" :class="{ 'winner': selectedGame.home_team_score > selectedGame.visitor_team_score }">
              <div class="team-name">{{ selectedGame.home_team.full_name }}</div>
              <div class="team-score">{{ selectedGame.home_team_score }}</div>
            </div>
            <div class="vs">VS</div>
            <div class="team" :class="{ 'winner': selectedGame.visitor_team_score > selectedGame.home_team_score }">
              <div class="team-name">{{ selectedGame.visitor_team.full_name }}</div>
              <div class="team-score">{{ selectedGame.visitor_team_score }}</div>
            </div>
          </div>

          <div class="details-venue">
            <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
            {{ selectedGame.venue }}
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
const showGameDetails = ref(false)
const isLoading = ref(false)
const error = ref(null)

// Date filters
const startDate = ref('')
const endDate = ref('')

// Team filters
const selectedTeams = ref([])

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

    if (selectedTeams.value.length > 0) {
      params.team_ids = selectedTeams.value
    }

    const response = await api.get('/games', { params })
    games.value = response.data.data
    hasNextPage.value = !!response.data.meta.next_cursor
    currentCursor.value = response.data.meta.next_cursor
  } catch (err) {
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
  showGameDetails.value = true
}

onMounted(() => {
  fetchTeams()
})
</script>

<style scoped>
.games-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.games-header {
  margin-bottom: 2rem;
}

.games-title {
  font-size: 2rem;
  font-weight: 600;
  color: #e9d5ff;
  margin-bottom: 1.5rem;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.game-card {
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
  border-color: rgba(147, 51, 234, 0.4);
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

.team-name {
  color: #e9d5ff;
  font-weight: 500;
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

.pagination-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.games-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.game-details {
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.details-teams {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.details-venue {
  color: rgba(233, 213, 255, 0.7);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}
</style> 