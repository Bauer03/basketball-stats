<template>
  <div 
    class="search-results"
    :class="{ loading: isLoading }"
  >
    <!-- Teams Results -->
    <div v-if="type === 'Teams'" class="results-section">
      <div class="filters" v-if="!isLoading">
        <v-select
          v-model="selectedConference"
          :items="['All', 'East', 'West']"
          label="Conference"
          variant="outlined"
          density="comfortable"
          hide-details
          bg-color="rgba(147, 51, 234, 0.1)"
          class="mb-4 conference-select"
          @update:model-value="handleConferenceChange"
        ></v-select>
      </div>
      <div v-if="isLoading" class="skeleton-container">
        <div v-for="i in 5" :key="`team-skeleton-${i}`" class="skeleton-item team-skeleton">
          <div class="skeleton-circle"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>
      <div v-else-if="teams.length" class="results-list">
        <div v-for="team in teams" :key="team.id" class="result-item team-item" @click="$emit('select', team)">
          <div class="team-logo">
            <!-- Add team logo here -->
          </div>
          <div class="team-info">
            <div class="team-name">{{ team.name }}</div>
            <div class="team-conference">{{ team.conference }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        No teams found
      </div>
    </div>

    <!-- Players Results -->
    <div v-if="type === 'Players'" class="results-section">
      <div class="filters" v-if="!isLoading">
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="selectedTeam"
              :items="teams"
              item-title="full_name"
              item-value="id"
              label="Filter by Team"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              bg-color="rgba(147, 51, 234, 0.1)"
              class="mb-4"
              @update:model-value="handlePlayerTeamChange"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="selectedPosition"
              :items="positions"
              label="Filter by Position"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              bg-color="rgba(147, 51, 234, 0.1)"
              class="mb-4"
              @update:model-value="handlePositionChange"
            ></v-select>
          </v-col>
        </v-row>
      </div>
      <div v-if="isLoading" class="skeleton-container">
        <div v-for="i in 5" :key="`player-skeleton-${i}`" class="skeleton-item player-skeleton">
          <div class="skeleton-circle"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>
      <div v-else-if="players.length" class="results-list">
        <div v-for="player in players" :key="player.id" class="result-item player-item" @click="$emit('select', player)">
          <div class="player-avatar">
            <!-- Add player avatar here -->
          </div>
          <div class="player-info">
            <div class="player-name">{{ player.name }}</div>
            <div class="player-team">{{ player.team }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        No players found
      </div>
    </div>

    <!-- Games Results -->
    <div v-if="type === 'Games'" class="results-section">
      <div class="filters" v-if="!isLoading">
        <v-row class="games-filters-row">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="startDate"
              label="Start Date"
              type="date"
              density="comfortable"
              hide-details
              bg-color="rgba(147, 51, 234, 0.1)"
              class="date-filter"
              @update:model-value="handleDateChange"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="endDate"
              label="End Date"
              type="date"
              density="comfortable"
              hide-details
              bg-color="rgba(147, 51, 234, 0.1)"
              class="date-filter"
              @update:model-value="handleDateChange"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedTeams"
              :items="teams"
              item-title="full_name"
              item-value="id"
              label="Filter by Teams"
              variant="outlined"
              density="comfortable"
              hide-details
              multiple
              chips
              bg-color="rgba(147, 51, 234, 0.1)"
              class="teams-filter"
              @update:model-value="handleTeamChange"
              return-object
            ></v-select>
          </v-col>
        </v-row>
      </div>
      <div v-if="isLoading" class="skeleton-container">
        <div v-for="i in 5" :key="`game-skeleton-${i}`" class="skeleton-item game-skeleton">
          <div class="skeleton-lines">
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
          </div>
        </div>
      </div>
      <div v-else-if="games.length" class="results-list">
        <div v-for="game in games" :key="game.id" class="result-item game-item" @click="$emit('select', game)">
          <div class="game-info">
            <div class="game-teams">{{ game.homeTeam }} vs {{ game.visitorTeam }}</div>
            <div class="game-date">{{ formatDate(game.date) }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        No games found
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue'
import api from '@/api/axios'

const selectedConference = ref('All')
const startDate = ref('')
const endDate = ref('')
const selectedTeams = ref([])
const selectedTeam = ref(null)
const selectedPosition = ref(null)
const teams = ref([])
const positions = ['PG', 'SG', 'SF', 'PF', 'C']

const emit = defineEmits([
  'select', 
  'conference-change', 
  'date-change', 
  'team-change',
  'player-team-change',
  'position-change',
  'refocus'
])

const handleConferenceChange = (value) => {
  emit('conference-change', value)
  emit('refocus')
}

const handleDateChange = () => {
  emit('date-change', { startDate: startDate.value, endDate: endDate.value })
  emit('refocus')
}

const handleTeamChange = (value) => {
  emit('team-change', value)
  emit('refocus')
}

const handlePlayerTeamChange = (value) => {
  emit('player-team-change', value)
  emit('refocus')
}

const handlePositionChange = (value) => {
  emit('position-change', value)
  emit('refocus')
}

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['Teams', 'Players', 'Games'].includes(value)
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: false
  },
  teams: {
    type: Array,
    default: () => []
  },
  players: {
    type: Array,
    default: () => []
  },
  games: {
    type: Array,
    default: () => []
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
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

onMounted(async () => {
  await fetchTeams()
})
</script>

<style scoped>
.search-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background-color: var(--color-bg-elevated);
  position: relative;
  z-index: 9999;
}

.results-section {
  padding: 0.5rem;
  position: relative;
  z-index: 9999;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 9999;
}

.result-item:hover {
  background-color: var(--searchbar-bg-hover);
}

.filters {
  position: relative;
  z-index: 9999;
  margin-bottom: 1rem;
}

:deep(.v-select) {
  position: relative;
  z-index: 9999;
}

:deep(.v-menu__content) {
  z-index: 9999 !important;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-muted);
}

/* Skeleton styles */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: var(--searchbar-bg);
  border-radius: var(--radius-md);
  animation: pulse 1.5s infinite;
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--searchbar-bg-hover);
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 12px;
  background-color: var(--searchbar-bg-hover);
  border-radius: var(--radius-sm);
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.medium {
  width: 80%;
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

/* Team Styles */
.team-item {
  gap: 1rem;
}

.team-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-info {
  flex: 1;
}

.team-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.team-conference {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Player Styles */
.player-item {
  gap: 1rem;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.player-team {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Game Styles */
.game-item {
  padding: 0.75rem;
}

.game-teams {
  font-weight: 500;
  color: var(--color-text-primary);
}

.game-date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

:deep(.conference-select .v-field__append-inner) {
  display: none !important;
}

:deep(.conference-select .v-field) {
  padding-right: 0 !important;
}

.games-filters-row {
  margin: 0 -8px;
}

.games-filters-row .v-col {
  padding: 0 8px;
}

.date-filter :deep(.v-field__input) {
  min-height: 40px !important;
  padding: 0 0 0 12px !important;
}

.date-filter :deep(.v-field) {
  border-radius: 6px !important;
  padding-right: 0 !important;
}

.date-filter :deep(.v-field__outline) {
  --v-field-border-opacity: 0.2;
}

.date-filter :deep(.v-field--variant-outlined .v-field__outline__start),
.date-filter :deep(.v-field--variant-outlined .v-field__outline__end) {
  border-color: rgba(147, 51, 234, var(--v-field-border-opacity));
}

.date-filter :deep(.v-field:hover .v-field__outline__start),
.date-filter :deep(.v-field:hover .v-field__outline__end) {
  border-color: rgba(147, 51, 234, 0.4);
}

.date-filter :deep(.v-field--focused .v-field__outline__start),
.date-filter :deep(.v-field--focused .v-field__outline__end) {
  border-color: rgba(147, 51, 234, 0.7);
}

.teams-filter :deep(.v-field) {
  padding: 0 8px !important;
}

.teams-filter :deep(.v-field__input) {
  padding: 8px !important;
}
</style> 