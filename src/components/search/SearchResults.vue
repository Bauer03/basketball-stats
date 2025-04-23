<template>
  <div 
    class="search-results"
    :class="{ loading: isLoading }"
  >
    <div class="search-header">
      <div class="search-title">{{ title }}</div>
      <v-btn
        v-if="type === 'Games'"
        color="primary"
        size="small"
        class="search-button"
        @click="handleSearch"
        :loading="isLoading"
      >
        <v-icon left>mdi-magnify</v-icon>
        Search
      </v-btn>
    </div>
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
      <div v-if="processedTeams.length > 0" class="results-list">
        <div v-for="(team, index) in processedTeams" :key="team.id" class="result-item team-item" @click="handleItemSelect(team)" :data-index="index">
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
    <div v-else-if="type === 'Players'" class="results-section">
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
        <div 
          v-for="(player, index) in players" 
          :key="player.id" 
          class="result-item player-item" 
          @click.stop="handleItemSelect(player)" 
          :data-index="index"
        >
          <div class="player-avatar">
            <!-- Add player avatar here -->
          </div>
          <div class="player-info">
            <div class="player-name">{{ player.first_name }} {{ player.last_name }}</div>
            <div class="player-details">
              <span class="player-position">{{ player.position }}</span>
              <span class="player-team">{{ player.team?.full_name || player.team?.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        No players found
      </div>
    </div>

    <!-- Games Results -->
    <div v-else-if="type === 'Games'" class="results-section">
      <div class="filters" v-if="!isLoading">
        <v-row class="date-filters-row">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="startDate"
              label="Start Date"
              type="date"
              density="comfortable"
              hide-details
              bg-color="rgba(147, 51, 234, 0.1)"
              class="date-filter"
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="endDate"
              label="End Date"
              type="date"
              density="comfortable"
              hide-details
              bg-color="rgba(147, 51, 234, 0.1)"
              class="date-filter"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row class="teams-filter-row mt-4">
          <v-col cols="12">
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
              closable-chips
              bg-color="rgba(147, 51, 234, 0.1)"
              class="teams-filter"
              @update:model-value="handleTeamChange"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  :text="item.raw.full_name"
                  class="team-chip"
                  closable
                >
                  {{ item.raw.full_name }}
                </v-chip>
              </template>
            </v-select>
          </v-col>
        </v-row>
        <v-row class="mt-4">
          <v-col cols="12">
            <v-btn
              color="primary"
              block
              @click="handleSearch"
              :loading="localLoading"
              :disabled="!isDateRangeValid"
            >
              Search Games
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div v-if="localLoading" class="skeleton-container">
        <div v-for="i in 5" :key="`game-skeleton-${i}`" class="skeleton-item game-skeleton">
          <div class="skeleton-lines">
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
          </div>
        </div>
      </div>
      <div v-else-if="searchResults.length" class="results-list">
        <div 
          v-for="(game, index) in searchResults" 
          :key="game.id" 
          class="result-item game-item" 
          @click="handleItemSelect(game)" 
          :data-index="index"
        >
          <div class="game-info">
            <div class="game-teams">
              {{ game.home_team?.abbreviation || 'TBD' }} vs {{ game.visitor_team?.abbreviation || 'TBD' }}
            </div>
            <div class="game-date">{{ formatDate(game.date) }}</div>
            <div class="game-score" v-if="game.home_team_score !== undefined">
              {{ game.home_team_score }} - {{ game.visitor_team_score }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        No games found
      </div>
    </div>

    <!-- Team Stats Modal -->
    <v-dialog v-model="showTeamStatsModal" max-width="800" scrollable>
      <v-card class="details-modal" v-if="selectedItem">
        <v-card-title class="d-flex justify-space-between align-center pa-6">
          <span class="text-h5">{{ selectedItem.full_name }} - Detailed Stats</span>
          <v-btn icon="mdi-close" variant="text" @click="showTeamStatsModal = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="season-selector mb-6">
            <v-select
              v-model="selectedSeason"
              :items="availableSeasons"
              label="Select Season"
              variant="outlined"
              density="comfortable"
              bg-color="rgba(147, 51, 234, 0.1)"
              @update:model-value="fetchTeamDetailedStats"
            ></v-select>
          </div>

          <div v-if="isLoadingDetails" class="loading-skeleton">
            <div v-for="i in 6" :key="i" class="skeleton-stat-item">
              <div class="skeleton-value"></div>
              <div class="skeleton-label"></div>
            </div>
          </div>

          <div v-else-if="teamDetailedStats" class="detailed-stats-grid">
            <div class="stat-item">
              <span class="label">Home Record</span>
              <span class="value">{{ teamDetailedStats.standings.home_record }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Road Record</span>
              <span class="value">{{ teamDetailedStats.standings.road_record }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Last 10</span>
              <span class="value">{{ teamDetailedStats.standings.last_10 }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Streak</span>
              <span class="value">{{ teamDetailedStats.standings.streak }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Points Per Game</span>
              <span class="value">{{ teamDetailedStats.stats?.points_per_game?.toFixed(1) || '0.0' }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Points Allowed</span>
              <span class="value">{{ teamDetailedStats.stats?.points_allowed_per_game?.toFixed(1) || '0.0' }}</span>
            </div>
          </div>
          <div v-else class="no-stats-message">
            <v-alert type="info" variant="tonal" class="mt-4">
              No statistics available for the selected season
            </v-alert>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, watch, computed, nextTick, onUnmounted } from 'vue'
import api from '@/api/axios'
import { gamesApi } from '@/services/api/games'

const selectedConference = ref('All')
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref((() => {
  const date = new Date()
  date.setDate(date.getDate() + 7) // Add 7 days to today
  return date.toISOString().split('T')[0]
})())
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
  'refocus',
  'search-select'
])

const handleConferenceChange = (value) => {
  emit('conference-change', value)
  emit('refocus')
}

const handleDateChange = () => {
  if (!startDate.value || !endDate.value) return

  try {
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date format')
      return
    }

    const formattedStartDate = start.toISOString().split('T')[0]
    const formattedEndDate = end.toISOString().split('T')[0]

    console.log('Emitting date change:', { startDate: formattedStartDate, endDate: formattedEndDate })
    
    emit('date-change', { 
      startDate: formattedStartDate, 
      endDate: formattedEndDate 
    })
    emit('refocus')
  } catch (err) {
    console.error('Error formatting dates:', err)
  }
}

const handleTeamChange = (value) => {
  const teamIds = Array.isArray(value) 
    ? value.map(team => typeof team === 'object' ? team.id : team)
    : []
  
  console.log('Selected teams:', value)
  console.log('Emitting team IDs:', teamIds)
  
  emit('team-change', teamIds)
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
    required: true
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

// Add computed property for teams
const processedTeams = computed(() => {
  const teamsData = props.teams
  const teamsArray = Array.isArray(teamsData) ? [...teamsData] : 
                    teamsData?.target ? [...teamsData.target] :
                    []
  return teamsArray
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const fetchTeams = async () => {
  // Only fetch teams if we don't have any yet
  if (teams.value.length === 0) {
    try {
      const response = await api.get('/teams')
      teams.value = response.data.data
    } catch (err) {
      console.error('Failed to load teams:', err)
    }
  }
}

// Add watcher for type changes
watch(() => props.type, async (newType) => {
  if (newType === 'Games' || newType === 'Players') {
    await fetchTeams()
  }
}, { immediate: true })

// Update watchers to debug data
watch(() => props.games, (newGames) => {
  console.log('Games data in SearchResults:', newGames)
}, { deep: true })

watch(() => props.teams, (newTeams) => {
  console.log('Teams data in SearchResults:', newTeams)
}, { deep: true })

const showTeamStatsModal = ref(false)
const selectedItem = ref(null)
const teamDetails = ref(null)
const isLoadingDetails = ref(false)

const CURRENT_SEASON = 2024
const NBA_START_YEAR = 1946

// Generate available seasons
const availableSeasons = computed(() => {
  const seasons = []
  for (let year = CURRENT_SEASON; year >= NBA_START_YEAR; year--) {
    seasons.push(year)
  }
  return seasons
})

const selectedSeason = ref(2024)

const handleItemSelect = (item) => {
  console.log('Item selected:', item)
  emit('select', { type: props.type, item })
}

const fetchTeamDetailedStats = async () => {
  if (!selectedItem.value) return;
  
  isLoadingDetails.value = true;
  try {
    const response = await api.get(`/teams/${selectedItem.value.id}`, {
      params: {
        season: selectedSeason.value
      }
    });
    teamDetails.value = response.data;
    teamDetailedStats.value = response.data;
  } catch (error) {
    console.error('Failed to fetch team detailed stats:', error);
  } finally {
    isLoadingDetails.value = false;
  }
};

// Update watchers
watch(showTeamStatsModal, async (newValue) => {
  if (newValue && selectedItem.value) {
    await fetchTeamDetailedStats();
  }
});

// Add local loading state
const localLoading = ref(false)
const searchResults = ref([])

const handleSearch = async () => {
  if (!isDateRangeValid.value) return;
  
  localLoading.value = true;
  try {
    console.log('Searching games with params:', {
      start_date: startDate.value,
      end_date: endDate.value,
      team_ids: selectedTeams.value
    });

    const response = await gamesApi.getGames({
      start_date: startDate.value,
      end_date: endDate.value,
      team_ids: selectedTeams.value
    });
    
    console.log('Search results:', response);
    
    if (response && response.data) {
      searchResults.value = response.data;
      if (response.data.length > 0) {
        emit('search-select', { type: 'Games', item: response.data[0] });
      }
    }
  } catch (error) {
    console.error('Error searching games:', error);
  } finally {
    localLoading.value = false;
  }
};

const isDateRangeValid = computed(() => {
  if (!startDate.value || !endDate.value) return false;
  return new Date(startDate.value) <= new Date(endDate.value);
});

const title = computed(() => {
  switch (props.type) {
    case 'Teams':
      return 'Teams'
    case 'Players':
      return 'Players'
    case 'Games':
      return 'Games'
    default:
      return 'Results'
  }
})
</script>

<style scoped>
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--v-surface-variant);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--v-border-color);
}

.search-title {
  font-weight: 600;
  color: var(--v-primary-color);
}

.search-button {
  margin-left: 8px;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.player-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.player-position {
  padding: 0.125rem 0.375rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.player-team {
  color: var(--color-text-muted);
}

/* Game Styles */
.game-item {
  padding: 0.75rem;
}

.game-teams {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 1.1rem;
  letter-spacing: 0.5px;
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

.date-filters-row,
.teams-filter-row {
  margin: 0;
}

.teams-filter-row {
  margin-top: 1rem;
}

/* Add styles for team chips */
:deep(.team-chip) {
  background: rgba(147, 51, 234, 0.15);
  color: #e9d5ff;
  border: 1px solid rgba(147, 51, 234, 0.3);
  margin: 1px;
  padding: 0 8px;
}

:deep(.team-chip .v-chip__close) {
  opacity: 0.7;
  color: #e9d5ff;
}

:deep(.team-chip .v-chip__close:hover) {
  opacity: 1;
}

:deep(.v-select .v-select__content) {
  background: #1a1a1a;
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
}

:deep(.v-select .v-select__selection) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.teams-filter .v-field__input) {
  min-height: 56px;
  padding-top: 4px;
  padding-bottom: 4px;
}

:deep(.v-select__selection-text) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 4px 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .date-filters-row > .v-col,
  .teams-filter-row > .v-col {
    padding: 8px;
  }
  
  :deep(.team-chip) {
    margin: 1px;
  }
}

/* Update existing styles for consistency */
:deep(.v-text-field.date-filter .v-field),
:deep(.v-select.teams-filter .v-field) {
  border-radius: 12px;
  background: rgba(147, 51, 234, 0.1) !important;
  border-color: rgba(147, 51, 234, 0.2) !important;
  height: 44px;
  min-height: 44px !important;
  padding: 2px 8px !important;
}

:deep(.date-filter) {
  .v-field__input {
    color: #e9d5ff !important;
    font-size: 0.95rem;
    font-weight: 500;
    min-height: 44px !important;
    padding: 2px 8px !important;
  }

  .v-field__field {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .v-field {
    min-height: 44px !important;
  }

  .v-field__outline {
    color: rgba(147, 51, 234, 0.2) !important;
  }

  .v-field__outline__start,
  .v-field__outline__end,
  .v-field__outline__notch {
    border-color: rgba(147, 51, 234, 0.2) !important;
  }

  &:hover .v-field__outline {
    color: rgba(147, 51, 234, 0.3) !important;
  }

  .v-field--focused .v-field__outline {
    color: #9333ea !important;
  }

  .v-label {
    color: rgba(233, 213, 255, 0.7) !important;
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1) hue-rotate(180deg) brightness(1.5);
    opacity: 0.7;
    cursor: pointer;
  }

  input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
}

.details-modal {
  background: #1a1a1a;
  color: #e9d5ff;
  border: 1px solid rgba(147, 51, 234, 0.2);
}

.conference-badge,
.division-badge,
.position-badge,
.jersey-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-block;
  margin-right: 8px;
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
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.standings-grid,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.standings-item,
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

.teams-matchup {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 2rem;
}

.team {
  flex: 1;
  text-align: center;
}

.team-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.team-score {
  font-size: 2rem;
  font-weight: 700;
  color: #9333ea;
}

.vs {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(233, 213, 255, 0.7);
}

.game-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
  font-weight: 500;
  font-size: 0.875rem;
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

/* Add styles for tabs */
:deep(.v-tab) {
  color: rgba(233, 213, 255, 0.7);
  font-weight: 500;
  min-width: 120px;
}

:deep(.v-tab--selected) {
  color: #e9d5ff;
  background: rgba(147, 51, 234, 0.2);
}

:deep(.v-tabs) {
  border-radius: 8px;
  overflow: hidden;
}

/* Add more specific styles for the teams filter */
:deep(.teams-filter) {
  .v-field__input {
    min-height: 44px !important;
    padding: 2px 8px !important;
  }

  .v-field__field {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .v-field {
    min-height: 44px !important;
  }

  .v-select__selection {
    padding: 0 !important;
  }
}

:deep(.team-chip) {
  height: 24px !important;
  padding: 0 8px !important;
  margin: 2px !important;
}

:deep(.v-select__selection-text) {
  padding: 2px 0 !important;
}
</style> 