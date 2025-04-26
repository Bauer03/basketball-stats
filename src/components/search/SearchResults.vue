<template>
  <div 
    class="search-results"
    :class="{ loading: isLoading }"
  >
    <!-- Teams Filters -->
    <div v-if="type === 'Teams'" class="results-section">
      <div class="filters">
        <v-select
          v-model="selectedConference"
          :items="['All', 'East', 'West']"
          label="Conference"
          variant="outlined"
          density="comfortable"
          hide-details
          bg-color="rgba(147, 51, 234, 0.1)"
          class="conference-select"
          @update:model-value="handleConferenceChange"
        ></v-select>
      </div>
    </div>

    <!-- Players Filters -->
    <div v-else-if="type === 'Players'" class="results-section">
      <div class="filters">
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
              @update:model-value="handlePositionChange"
            ></v-select>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Games Filters -->
    <div v-else-if="type === 'Games'" class="results-section">
      <div class="filters">
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
        <v-row class="teams-filter-row">
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
  date.setDate(date.getDate() + 7)
  return date.toISOString().split('T')[0]
})())
const selectedTeams = ref([])
const selectedTeam = ref(null)
const selectedPosition = ref(null)
const teams = ref([])
const positions = ['PG', 'SG', 'SF', 'PF', 'C']
const localLoading = ref(false)

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
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return

    const formattedStartDate = start.toISOString().split('T')[0]
    const formattedEndDate = end.toISOString().split('T')[0]
    
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

// Add watchers for debugging
watch(() => props.isVisible, (newVal) => {
  console.log('SearchResults visibility changed:', newVal)
})

watch(() => props.teams, (newVal) => {
  console.log('Teams data updated:', newVal)
})

watch(() => props.players, (newVal) => {
  console.log('Players data updated:', newVal)
})

watch(() => props.games, (newVal) => {
  console.log('Games data updated:', newVal)
})

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
  if (teams.value.length === 0) {
    try {
      const response = await api.get('/teams')
      teams.value = response.data.data
    } catch (err) {
      console.error('Failed to load teams:', err)
    }
  }
}

watch(() => props.type, async (newType) => {
  if (newType === 'Games' || newType === 'Players') {
    await fetchTeams()
  }
}, { immediate: true })

const showTeamStatsModal = ref(false)
const selectedItem = ref(null)
const teamDetails = ref(null)
const isLoadingDetails = ref(false)

const CURRENT_SEASON = 2024
const NBA_START_YEAR = 1946

const availableSeasons = computed(() => {
  const seasons = []
  for (let year = CURRENT_SEASON; year >= NBA_START_YEAR; year--) {
    seasons.push(year)
  }
  return seasons
})

const selectedSeason = ref(2024)

const handleItemSelect = (item) => {
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

watch(showTeamStatsModal, async (newValue) => {
  if (newValue && selectedItem.value) {
    await fetchTeamDetailedStats();
  }
});

const handleSearch = async () => {
  if (!isDateRangeValid.value) return
  
  localLoading.value = true
  try {
    const response = await gamesApi.getGames({
      start_date: startDate.value,
      end_date: endDate.value,
      team_ids: selectedTeams.value
    })
    
    if (response && response.data) {
      emit('search-select', { type: 'Games', item: response.data })
    }
  } catch (error) {
    console.error('Error searching games:', error)
  } finally {
    localLoading.value = false
  }
}

const isDateRangeValid = computed(() => {
  if (!startDate.value || !endDate.value) return false
  return new Date(startDate.value) <= new Date(endDate.value)
})

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
  background: var(--background-dark, #1a1a1a);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
}

.results-section {
  padding: 1rem;
  background: var(--background-dark, #1a1a1a);
}

.filters {
  position: relative;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

:deep(.v-field) {
  background: rgba(147, 51, 234, 0.1) !important;
  border-color: rgba(147, 51, 234, 0.2) !important;
}

:deep(.v-field:hover) {
  border-color: rgba(147, 51, 234, 0.3) !important;
}

:deep(.v-field--focused) {
  border-color: #9333ea !important;
}

:deep(.v-label) {
  color: rgba(233, 213, 255, 0.7) !important;
}

:deep(.v-field__input) {
  color: #e9d5ff !important;
}

:deep(.v-select__selection) {
  color: #e9d5ff !important;
}

.team-chip {
  background: rgba(147, 51, 234, 0.15);
  color: #e9d5ff;
  border: 1px solid rgba(147, 51, 234, 0.3);
}

:deep(.v-chip__close) {
  color: #e9d5ff;
  opacity: 0.7;
}

:deep(.v-chip__close:hover) {
  opacity: 1;
}

/* Date picker styles */
:deep(.date-filter input[type="date"]) {
  color: #e9d5ff !important;
}

:deep(.date-filter input[type="date"]::-webkit-calendar-picker-indicator) {
  filter: invert(1) hue-rotate(180deg) brightness(1.5);
  opacity: 0.7;
  cursor: pointer;
}

:deep(.date-filter input[type="date"]::-webkit-calendar-picker-indicator:hover) {
  opacity: 1;
}

/* Row spacing */
.date-filters-row,
.teams-filter-row {
  margin: 0;
}

.teams-filter-row {
  margin-top: 1rem;
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