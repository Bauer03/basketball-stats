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
        <div v-for="(player, index) in players" :key="player.id" class="result-item player-item" @click="handleItemSelect(player)" :data-index="index">
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
        <div v-for="(game, index) in games" :key="game.id" class="result-item game-item" @click="handleItemSelect(game)" :data-index="index">
          <div class="game-info">
            <div class="game-teams">{{ game.home_team.abbreviation }} vs {{ game.visitor_team.abbreviation }}</div>
            <div class="game-date">{{ formatDate(game.date) }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        No games found
      </div>
    </div>

    <!-- Details Modal -->
    <v-dialog v-model="showModal" max-width="800">
      <v-card class="details-modal">
        <v-card-title class="d-flex justify-space-between align-center pa-6">
          <span class="text-h5">{{ modalTitle }}</span>
          <v-btn icon="mdi-close" variant="text" @click="showModal = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <!-- Team Details -->
          <div v-if="selectedItem && type === 'Teams'" class="team-details">
            <div class="details-header mb-4">
              <div class="badges-container">
                <div class="conference-badge" :class="selectedItem.conference.toLowerCase()">
                  {{ selectedItem.conference }} Conference
                </div>
                <div class="division-badge">
                  {{ selectedItem.division }} Division
                </div>
              </div>
            </div>

            <div v-if="teamDetails" class="stats-grid mb-6">
              <div class="stat-item">
                <span class="label">Record</span>
                <span class="value">{{ teamDetails.standings.wins }}-{{ teamDetails.standings.losses }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Conference Rank</span>
                <span class="value">#{{ teamDetails.standings.conference_rank }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Division Rank</span>
                <span class="value">#{{ teamDetails.standings.division_rank }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Win %</span>
                <span class="value">{{ ((teamDetails.standings.wins / (teamDetails.standings.wins + teamDetails.standings.losses)) * 100).toFixed(1) }}%</span>
              </div>
            </div>

            <v-btn
              color="#9333ea"
              block
              class="details-btn"
              @click="showTeamStatsModal = true"
              :loading="isLoadingDetails"
              elevation="0"
            >
              View Detailed Stats
            </v-btn>
          </div>

          <!-- Player Details -->
          <div v-else-if="selectedItem && type === 'Players'" class="player-details">
            <div class="details-header mb-4">
              <div class="badges-container">
                <div class="team-badge">{{ selectedItem.team?.full_name }}</div>
                <div class="position-badge">{{ selectedItem.position }}</div>
                <div class="jersey-badge">#{{ selectedItem.jersey_number }}</div>
              </div>
              <div class="meta-info mt-4">
                <span>{{ selectedItem.height }} • {{ selectedItem.weight }} lbs</span>
              </div>
            </div>

            <div v-if="playerStats" class="stats-grid mb-6">
              <div class="stat-item">
                <span class="label">Points</span>
                <span class="value">{{ playerStats.pts?.toFixed(1) || '0.0' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Rebounds</span>
                <span class="value">{{ playerStats.reb?.toFixed(1) || '0.0' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Assists</span>
                <span class="value">{{ playerStats.ast?.toFixed(1) || '0.0' }}</span>
              </div>
              <div class="stat-item">
                <span class="label">FG%</span>
                <span class="value">{{ (playerStats.fg_pct * 100)?.toFixed(1) || '0.0' }}%</span>
              </div>
            </div>

            <v-btn
              color="#9333ea"
              block
              class="details-btn"
              @click="showPlayerStatsModal = true"
              :loading="isLoadingDetails"
              elevation="0"
            >
              View Detailed Stats
            </v-btn>
          </div>

          <!-- Game Details -->
          <div v-else-if="selectedItem && type === 'Games'" class="game-details">
            <div class="details-header mb-4">
              <div class="badges-container">
                <div class="game-status-badge">{{ selectedItem.status }}</div>
                <div class="game-date-badge">{{ formatDate(selectedItem.date) }}</div>
              </div>
            </div>

            <div class="teams-matchup mb-6">
              <div class="team home">
                <div class="team-name">{{ selectedItem.home_team.full_name }}</div>
                <div class="team-score">{{ selectedItem.home_team_score }}</div>
              </div>
              <div class="vs">VS</div>
              <div class="team away">
                <div class="team-name">{{ selectedItem.visitor_team.full_name }}</div>
                <div class="team-score">{{ selectedItem.visitor_team_score }}</div>
              </div>
            </div>

            <v-btn
              color="#9333ea"
              block
              class="details-btn"
              @click="showGameStatsModal = true"
              :loading="isLoadingDetails"
              elevation="0"
            >
              View Detailed Stats
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Team Stats Modal -->
    <v-dialog v-model="showTeamStatsModal" max-width="800" scrollable>
      <v-card class="details-modal">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>{{ selectedItem?.full_name }} - Detailed Stats</span>
          <v-btn icon="mdi-close" variant="text" @click="showTeamStatsModal = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
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

          <div v-if="isLoadingDetails" class="loading-skeleton pa-4">
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
import { defineProps, defineEmits, ref, onMounted, watch, computed, nextTick } from 'vue'
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

// Add watchers to debug data
watch(() => props.games, (newGames) => {
  console.log('Games data in SearchResults:', newGames)
}, { deep: true })

watch(() => props.teams, (newTeams) => {
  console.log('Teams data in SearchResults:', newTeams)
}, { deep: true })

const showModal = ref(false)
const selectedItem = ref(null)
const teamDetails = ref(null)
const playerStats = ref(null)
const isLoadingDetails = ref(false)

const modalTitle = computed(() => {
  if (!selectedItem.value) return ''
  
  switch (props.type) {
    case 'Teams':
      return selectedItem.value.full_name
    case 'Players':
      return `${selectedItem.value.first_name} ${selectedItem.value.last_name}`
    case 'Games':
      return `${selectedItem.value.home_team.abbreviation} vs ${selectedItem.value.visitor_team.abbreviation}`
    default:
      return ''
  }
})

const handleItemSelect = async (item) => {
  selectedItem.value = item
  showModal.value = true
  
  // Load additional details based on type
  if (props.type === 'Teams') {
    await loadTeamDetails(item.id)
  } else if (props.type === 'Players') {
    await loadPlayerStats(item.id)
  }
  
  // Still emit the select event for parent components
  emit('select', { type: props.type, item })
}

const loadTeamDetails = async (teamId) => {
  isLoadingDetails.value = true
  try {
    const response = await api.get(`/teams/${teamId}`)
    teamDetails.value = response.data
  } catch (err) {
    console.error('Failed to load team details:', err)
  } finally {
    isLoadingDetails.value = false
  }
}

const loadPlayerStats = async (playerId) => {
  isLoadingDetails.value = true
  try {
    const response = await api.get(`/players/${playerId}/stats`)
    playerStats.value = response.data.data[0]
  } catch (err) {
    console.error('Failed to load player stats:', err)
  } finally {
    isLoadingDetails.value = false
  }
}

// Update click handlers
const updateClickHandlers = () => {
  const teamItems = document.querySelectorAll('.team-item')
  const playerItems = document.querySelectorAll('.player-item')
  const gameItems = document.querySelectorAll('.game-item')

  teamItems.forEach(item => {
    item.onclick = (e) => {
      const team = props.teams[e.currentTarget.dataset.index]
      handleItemSelect(team)
    }
  })

  playerItems.forEach(item => {
    item.onclick = (e) => {
      const player = props.players[e.currentTarget.dataset.index]
      handleItemSelect(player)
    }
  })

  gameItems.forEach(item => {
    item.onclick = (e) => {
      const game = props.games[e.currentTarget.dataset.index]
      handleItemSelect(game)
    }
  })
}

// Watch for changes in the lists to update click handlers
watch([() => props.teams, () => props.players, () => props.games], () => {
  nextTick(updateClickHandlers)
})

// Add new refs for modals and stats
const showTeamStatsModal = ref(false);
const showPlayerStatsModal = ref(false);
const showGameStatsModal = ref(false);
const selectedSeason = ref(2024);
const availableSeasons = ref([2024, 2023, 2022]);
const teamDetailedStats = ref(null);

// Add new method for fetching detailed team stats
const fetchTeamDetailedStats = async () => {
  if (!selectedItem.value) return;
  
  isLoadingDetails.value = true;
  try {
    const response = await api.get(`/teams/${selectedItem.value.id}`, {
      params: {
        season: selectedSeason.value
      }
    });
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

.games-filters-row {
  gap: 16px;
  margin: 0 -8px;
}

:deep(.v-col) {
  padding: 8px;
}

/* Update existing styles for consistency */
:deep(.v-text-field.date-filter .v-field) {
  border-radius: 12px;
  background: rgba(147, 51, 234, 0.1) !important;
  border-color: rgba(147, 51, 234, 0.2) !important;
}

:deep(.v-text-field.date-filter .v-field:hover) {
  background: rgba(147, 51, 234, 0.15) !important;
}

:deep(.v-text-field.date-filter .v-field--focused) {
  background: rgba(147, 51, 234, 0.2) !important;
  border-color: #9333ea !important;
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

:deep(.date-filter) {
  .v-field__input {
    color: #e9d5ff !important;
    font-size: 0.95rem;
    font-weight: 500;
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
</style> 