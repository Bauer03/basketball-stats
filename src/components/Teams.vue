<template>
  <div class="teams-container">
    <div class="teams-layout">
      <!-- Teams Grid Column -->
      <div class="teams-grid-column">
        <div v-if="error" class="teams-error">
          <v-alert type="error" text="Failed to load teams. Please try again."></v-alert>
        </div>

        <div class="teams-grid">
          <template v-if="isLoading">
            <div v-for="i in 16" :key="`team-skeleton-${i}`" class="skeleton-card">
              <div class="team-card-content">
                <div class="skeleton-abbr"></div>
                <div class="skeleton-name"></div>
                <div class="skeleton-division"></div>
              </div>
            </div>
          </template>
          <template v-else>
            <v-card
              v-for="team in filteredTeams"
              :key="team.id"
              class="team-card"
              :class="{ 'selected': selectedTeam?.id === team.id }"
              @click="selectTeam(team)"
              elevation="2"
            >
              <v-icon
                size="24"
                class="favorite-btn"
                @click.stop="toggleFavorite(team)"
                :color="isFavorite(team.id) ? '#e9d5ff' : 'grey-lighten-1'"
                style="cursor: pointer"
              >
                {{ isFavorite(team.id) ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
              <div class="team-card-content">
                <div class="team-abbr">{{ team.abbreviation }}</div>
                <div class="team-name">{{ team.full_name }}</div>
                <div class="team-division">{{ team.division }}</div>
              </div>
            </v-card>
          </template>
        </div>
      </div>

      <!-- Team Details Column -->
      <div class="team-details-column">
        <div v-if="isLoading" class="skeleton-details">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-badges">
              <div class="skeleton-badge"></div>
              <div class="skeleton-badge"></div>
            </div>
          </div>
          <div class="skeleton-divider"></div>
          <div class="skeleton-stats-title"></div>
          <div class="skeleton-stats-grid">
            <div v-for="i in 4" :key="`stat-skeleton-${i}`" class="skeleton-stat-item">
              <div class="skeleton-stat-value"></div>
              <div class="skeleton-stat-label"></div>
            </div>
          </div>
          <div class="skeleton-divider"></div>
          <div class="skeleton-stats-title"></div>
          <div class="skeleton-stats-grid">
            <div v-for="i in 4" :key="`stat-skeleton-${i + 4}`" class="skeleton-stat-item">
              <div class="skeleton-stat-value"></div>
              <div class="skeleton-stat-label"></div>
            </div>
          </div>
        </div>

        <div v-else-if="selectedTeam" class="team-details">
          <div class="details-header">
            <div class="header-left">
              <h2>{{ selectedTeam.full_name }}</h2>
              <div class="conference-info">
                <div class="conference-badge" :class="selectedTeam.conference.toLowerCase()">
                  {{ selectedTeam.conference }} Conference
                </div>
                <div class="division-badge">
                  {{ selectedTeam.division }} Division
                </div>
              </div>
            </div>
            <div class="header-right">
              <v-icon
                size="24"
                class="favorite-btn"
                @click="toggleFavorite(selectedTeam)"
                :color="isFavorite(selectedTeam.id) ? '#e9d5ff' : 'grey-lighten-1'"
                style="cursor: pointer"
              >
                {{ isFavorite(selectedTeam.id) ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </div>
          </div>

          <v-btn
            color="#e9d5ff"
            block
            class="details-btn mt-4"
            @click="showTeamModal = true"
            :loading="isLoadingDetails"
            elevation="0"
          >
            View Detailed Stats
          </v-btn>

          <v-divider class="my-4"></v-divider>

          <div v-if="teamDetails" class="standings-section">
            <h3 class="text-h6 mb-4">Season {{ teamDetails.standings.season }} Stats</h3>
            <div class="standings-grid">
              <div class="standings-item">
                <span class="value">{{ teamDetails.standings.wins }}-{{ teamDetails.standings.losses }}</span>
                <span class="label">Record</span>
              </div>
              <div class="standings-item">
                <span class="value">#{{ teamDetails.standings.conference_rank }}</span>
                <span class="label">Conference Rank</span>
              </div>
              <div class="standings-item">
                <span class="value">#{{ teamDetails.standings.division_rank }}</span>
                <span class="label">Division Rank</span>
              </div>
              <div class="standings-item">
                <span class="value">{{ teamDetails.standings.home_record }}</span>
                <span class="label">Home Record</span>
              </div>
              <div class="standings-item">
                <span class="value">{{ teamDetails.standings.road_record }}</span>
                <span class="label">Road Record</span>
              </div>
              <div class="standings-item">
                <span class="value">{{ teamDetails.standings.conference_record }}</span>
                <span class="label">Conference Record</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Details Modal -->
    <v-dialog
      v-model="showTeamModal"
      max-width="800"
      scrollable
    >
      <v-card class="team-details-modal">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>{{ selectedTeam?.full_name }} - Detailed Stats</span>
          <v-btn icon="mdi-close" variant="text" @click="showTeamModal = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="season-selector mb-6">
            <v-select
              v-model="selectedSeasons"
              :items="availableSeasons"
              label="Select Seasons"
              variant="outlined"
              density="comfortable"
              multiple
              chips
              hide-details
              @update:model-value="fetchDetailedStats"
            ></v-select>
          </div>

          <div v-if="isLoadingDetails" class="loading-skeleton pa-4">
            <div v-for="i in 6" :key="i" class="skeleton-stat-item">
              <div class="skeleton-value"></div>
              <div class="skeleton-label"></div>
            </div>
          </div>

          <div v-else-if="detailedTeamStats" class="detailed-stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ detailedTeamStats.wins }}-{{ detailedTeamStats.losses }}</span>
              <span class="stat-label">Record</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">#{{ detailedTeamStats.conference_rank }}</span>
              <span class="stat-label">Conference Rank</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">#{{ detailedTeamStats.division_rank }}</span>
              <span class="stat-label">Division Rank</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ detailedTeamStats.home_record }}</span>
              <span class="stat-label">Home Record</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ detailedTeamStats.road_record }}</span>
              <span class="stat-label">Road Record</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ detailedTeamStats.conference_record }}</span>
              <span class="stat-label">Conference Record</span>
            </div>
          </div>
          <div v-else class="no-stats-message">
            <v-alert
              type="info"
              variant="tonal"
              class="mt-4"
            >
              No statistics available for the selected seasons
            </v-alert>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()
const teams = ref([])
const selectedTeam = ref(null)
const teamDetails = ref(null)
const isLoading = ref(true)
const isLoadingDetails = ref(false)
const error = ref(null)
const favoriteTeams = ref(new Set())
const showTeamModal = ref(false)
const selectedSeasons = ref([])
const availableSeasons = ref([2024, 2023, 2022, 2021, 2020])
const detailedTeamStats = ref(null)

const handleSearchSelection = async ({ type, item }) => {
  if (type === 'Teams') {
    await selectTeam(item)
  } else if (type === 'Players') {
    router.push('/players')
  } else if (type === 'Games') {
    router.push('/games')
  }
}

const isFavorite = (teamId) => favoriteTeams.value.has(teamId)

const toggleFavorite = (team) => {
  if (isFavorite(team.id)) {
    favoriteTeams.value.delete(team.id)
  } else {
    favoriteTeams.value.add(team.id)
  }
  // Save to localStorage
  localStorage.setItem('favoriteTeams', JSON.stringify([...favoriteTeams.value]))
}

const filteredTeams = computed(() => teams.value)

const fetchTeams = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await api.get('/teams')
    teams.value = response.data.data
    // Find and select the LA Lakers by default
    const lakers = teams.value.find(team => team.full_name === 'Los Angeles Lakers')
    if (lakers) {
      selectedTeam.value = lakers
      await fetchTeamDetails(lakers.id)
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const fetchTeamDetails = async (teamId) => {
  isLoadingDetails.value = true
  console.log('Fetching initial team details:', { teamId })
  
  try {
    const response = await api.get(`/teams/${teamId}`)
    console.log('Initial team details API response:', response.data)
    teamDetails.value = response.data
  } catch (err) {
    console.error('Failed to load initial team details:', {
      error: err.message,
      teamId,
      status: err.response?.status
    })
  } finally {
    isLoadingDetails.value = false
  }
}

const selectTeam = async (team) => {
  selectedTeam.value = team
  await fetchTeamDetails(team.id)
}

const fetchDetailedStats = async () => {
  if (!selectedTeam.value || !selectedSeasons.value.length) {
    console.log('Skipping team details fetch - no team or seasons selected', {
      team: selectedTeam.value?.id,
      seasons: selectedSeasons.value
    })
    return
  }
  
  isLoadingDetails.value = true
  console.log('Fetching team details:', {
    teamId: selectedTeam.value.id,
    seasons: selectedSeasons.value
  })

  try {
    const params = new URLSearchParams()
    selectedSeasons.value.forEach(season => params.append('seasons[]', season))
    
    const url = `/teams/${selectedTeam.value.id}?${params.toString()}`
    console.log('Making request to:', url)
    
    const response = await api.get(url)
    console.log('Team details API response:', response.data)
    
    detailedTeamStats.value = response.data.standings
  } catch (err) {
    console.error('Failed to fetch team details:', {
      error: err.message,
      teamId: selectedTeam.value.id,
      seasons: selectedSeasons.value,
      status: err.response?.status
    })
  } finally {
    isLoadingDetails.value = false
  }
}

// Reset detailed stats when team changes
watch(() => selectedTeam.value, () => {
  if (selectedTeam.value && teamDetails.value) {
    detailedTeamStats.value = teamDetails.value.standings
    selectedSeasons.value = [teamDetails.value.standings.season] // Set to current season
  } else {
    detailedTeamStats.value = null
    selectedSeasons.value = [2024] // Reset to current season
  }
})

// Load favorites from localStorage on mount
onMounted(() => {
  const savedFavorites = localStorage.getItem('favoriteTeams')
  if (savedFavorites) {
    favoriteTeams.value = new Set(JSON.parse(savedFavorites))
  }
  fetchTeams()
})
</script>

<style scoped>
.teams-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.teams-layout {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 2rem;
}

.teams-grid-column {
  overflow-y: auto;
  padding-right: 1rem;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-top: 4px;
}

.team-card {
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 140px;
  width: 100%;
  position: relative;
  transform: translateY(0);
  user-select: none;
  -webkit-user-select: none;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
  border-color: rgba(147, 51, 234, 0.4);
}

.team-card.selected {
  background-color: rgba(147, 51, 234, 0.1);
  border-color: #9333ea;
}

.team-card-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.team-abbr {
  font-size: 1.25rem;
  font-weight: bold;
  color: #e9d5ff;
}

.team-name {
  color: #e9d5ff;
  font-size: 1rem;
  font-weight: 500;
}

.team-division {
  color: rgba(233, 213, 255, 0.7);
  font-size: 0.75rem;
}

.team-details {
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 2rem;
  min-height: 400px;
  padding-top: 2.5rem;
}

.team-details h2 {
  color: #e9d5ff;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
}

.team-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  background-color: rgba(147, 51, 234, 0.1);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 6px;
  padding: 1rem;
}

.stat-label {
  color: rgba(233, 213, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  color: #e9d5ff;
  font-size: 1.25rem;
  font-weight: 500;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
}

.error-message {
  color: rgb(244, 67, 54);
  text-align: center;
  padding: 2rem;
}

.add-team-btn {
  background: linear-gradient(135deg, #9333ea, #7928ca) !important;
  transition: opacity 0.2s ease;
}

.add-team-btn:hover {
  opacity: 0.9;
}

.team-details-column {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  margin-top: 8px;
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

.conference-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.division-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.875rem;
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.standings-section {
  margin-top: 2rem;
}

.standings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.standings-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.standings-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #9333ea;
  display: block;
  margin-bottom: 0.25rem;
}

.standings-item .label {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
}

.details-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.team-card-skeleton {
  aspect-ratio: 1;
  border-radius: 8px;
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
}

:deep(.v-skeleton-loader__card) {
  height: 100% !important;
  width: 100% !important;
}

.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  opacity: 0;
  transition: all 0.2s ease;
}

/* Show favorite button on hover for non-favorited items */
.team-card:hover .favorite-btn:not([color="#e9d5ff"]) {
  opacity: 1;
}

/* Always show favorite button for favorited items */
.favorite-btn[color="#e9d5ff"] {
  opacity: 1;
}

/* Remove the background from the button */
:deep(.v-btn) {
  background: none !important;
}

:deep(.v-btn:hover) {
  background: none !important;
}

.skeleton-card {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 1rem;
  animation: pulse 1.5s infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  width: 100%;
}

.skeleton-abbr {
  height: 24px;
  width: 40px;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-name {
  height: 20px;
  width: 80%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-division {
  height: 16px;
  width: 60%;
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

/* Skeleton Loading Styles */
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

.skeleton-stats-title {
  height: 24px;
  width: 40%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 1rem;
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

.team-details-modal {
  background: #1a1a1a;
  color: #e9d5ff;
  border-radius: 16px;
  overflow: hidden;
}

.team-details-modal :deep(.v-card-title) {
  border-bottom: 1px solid rgba(147, 51, 234, 0.2);
}

.detailed-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.skeleton-stat-item {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.skeleton-value {
  height: 32px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-label {
  height: 16px;
  width: 80%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.details-btn {
  height: 44px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  background-color: rgba(147, 51, 234) !important;
}

.details-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  background-color: rgba(147, 51, 234, 0.9) !important;
}

.season-selector {
  max-width: 300px;
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