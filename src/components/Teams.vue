<template>
  <div class="teams-container">
    <div class="teams-header">
      <h1 class="text-h4 font-weight-bold mb-6">Teams</h1>
      <v-row>
        <!-- Removed conference filter -->
      </v-row>
    </div>

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
                  {{ selectedTeam.conference }}
                </div>
                <div class="conference-badge rank-badge" v-if="teamDetails">
                  Conference Rank: #{{ teamDetails.standings.conference_rank }}
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

          <v-divider class="my-4"></v-divider>

          <div v-if="teamDetails" class="standings-grid">
            <div class="standings-item">
              <span class="label">Record</span>
              <span class="value">{{ teamDetails.standings.wins }}-{{ teamDetails.standings.losses }}</span>
            </div>
            <div class="standings-item">
              <span class="label">Division Rank</span>
              <span class="value">{{ teamDetails.standings.division }} #{{ teamDetails.standings.division_rank }}</span>
            </div>
            <div class="standings-item">
              <span class="label">Home Record</span>
              <span class="value">{{ teamDetails.standings.home_record }}</span>
            </div>
            <div class="standings-item">
              <span class="label">Road Record</span>
              <span class="value">{{ teamDetails.standings.road_record }}</span>
            </div>
            <div class="standings-item">
              <span class="label">Conference Record</span>
              <span class="value">{{ teamDetails.standings.conference_record }}</span>
            </div>
            <div class="standings-item">
              <span class="label">Division Record</span>
              <span class="value">{{ teamDetails.standings.division_record }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const teams = ref([])
const selectedTeam = ref(null)
const teamDetails = ref(null)
const isLoading = ref(true)
const isLoadingDetails = ref(false)
const error = ref(null)
const favoriteTeams = ref(new Set())

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
  try {
    const response = await api.get(`/teams/${teamId}`)
    teamDetails.value = response.data
  } catch (err) {
    console.error('Failed to load team details:', err)
  } finally {
    isLoadingDetails.value = false
  }
}

const selectTeam = async (team) => {
  selectedTeam.value = team
  await fetchTeamDetails(team.id)
}

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

.teams-header {
  margin-bottom: 2rem;
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
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  aspect-ratio: 1;
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
  font-size: 0.875rem;
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
  font-size: 1.75rem;
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

.rank-badge {
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.standings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.standings-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.standings-item .label {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
}

.standings-item .value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e9d5ff;
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
  padding: 1.5rem;
  animation: pulse 1.5s infinite;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.skeleton-abbr {
  height: 32px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 1rem;
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
  width: 40%;
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
</style> 