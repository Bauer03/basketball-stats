<template>
  <div class="view-container">
    <nav class="view-navigation">
      <router-link 
        to="/teams" 
        class="nav-link"
        :class="{ active: $route.path === '/teams' }"
        @click="updateSearchType('teams')"
      >
        Teams
      </router-link>
      <router-link 
        to="/players" 
        class="nav-link"
        :class="{ active: $route.path === '/players' }"
        @click="updateSearchType('players')"
      >
        Players
      </router-link>
      <router-link 
        to="/games" 
        class="nav-link"
        :class="{ active: $route.path === '/games' }"
        @click="updateSearchType('games')"
      >
        Games
      </router-link>
    </nav>

    <div class="players-container">
      <div class="players-header">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4 font-weight-bold">Players</h1>
          <v-btn
            color="#e9d5ff"
            variant="outlined"
            @click="loadFavoritePlayers"
            :loading="loading"
          >
            Favorite Players
          </v-btn>
        </div>
      </div>
      <Players ref="playersComponent" @search-select="handleSearchSelection" @update-grid="handleSearchGridUpdate" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Players from '@/components/Players.vue'
import api from '@/api/axios'

const playersComponent = ref(null)
const loading = ref(false)

const handleSearchSelection = (selection) => {
  // Forward the search selection event to the Players component
  playersComponent.value?.handleSearchSelection(selection)
}

const handleSearchGridUpdate = (data) => {
  // Forward the update-grid event to the Players component
  playersComponent.value?.handleSearchGridUpdate(data)
}

const loadFavoritePlayers = async () => {
  loading.value = true
  try {
    console.log('Fetching favorite players...')
    const response = await api.getFavoritePlayers()
    console.log('Favorite players API response:', response)
    console.log('Response data type:', typeof response.data)
    console.log('Response data:', response.data)
    
    // Extract favorite player IDs from the response
    let favoritePlayerIds
    if (response.data && Array.isArray(response.data.favoritePlayers)) {
      // The IDs come as strings, but we'll keep them as strings since that's what the API expects
      favoritePlayerIds = response.data.favoritePlayers
    } else if (Array.isArray(response.data)) {
      favoritePlayerIds = response.data
    } else {
      console.error('Unexpected response data format:', response.data)
      favoritePlayerIds = []
    }
    
    console.log('Extracted favorite player IDs:', favoritePlayerIds)
    
    // Load the full player details for each favorite player
    const playersPromises = favoritePlayerIds.map(id => {
      console.log('Fetching details for player ID:', id)
      return api.get(`/players/${id}`)
    })
    const playersResponses = await Promise.all(playersPromises)
    console.log('Player details responses:', playersResponses)
    
    // Extract the player data from the nested structure
    const favoritePlayers = playersResponses.map(response => {
      // The player data is nested inside player.data
      return response.data.player.data
    })
    console.log('Final favorite players data:', favoritePlayers)
    
    // Update the players component with the favorite players
    playersComponent.value?.updatePlayers(favoritePlayers)
  } catch (error) {
    console.error('Failed to load favorite players:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
  } finally {
    loading.value = false
  }
}

const updateSearchType = (type) => {
  // Dispatch a custom event to update the search type
  window.dispatchEvent(new CustomEvent('stats-view-changed', { 
    detail: type 
  }))
}

onMounted(() => {
  // Set the search type to 'players' when the component is mounted
  updateSearchType('players')
})
</script>

<style scoped>
.view-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.view-navigation {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(147, 51, 234, 0.2);
}

.nav-link {
  color: rgba(233, 213, 255, 0.7);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #e9d5ff;
  background: rgba(147, 51, 234, 0.1);
}

.nav-link.active {
  color: #e9d5ff;
  background: rgba(147, 51, 234, 0.2);
}

.players-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.players-header {
  margin-bottom: 2rem;
}

.players-layout {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 2rem;
}

.players-grid-column {
  overflow-y: auto;
  padding-right: 1rem;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-top: 4px;
}

.player-card {
  background-color: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  transition: all 0.2s ease;
  transform: translateY(0);
  will-change: transform;
}

.player-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
  border-color: rgba(147, 51, 234, 0.4);
}

.player-card.selected {
  background-color: rgba(147, 51, 234, 0.1);
  border-color: #9333ea;
}

.player-details-column {
  background: rgba(147, 51, 234, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
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

.jersey-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 0.875rem;
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.rank-badge {
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.player-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  padding: 0.75rem;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 6px;
}

.info-label {
  font-size: 0.875rem;
  color: rgba(233, 213, 255, 0.7);
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 500;
  color: #e9d5ff;
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

@media (max-width: 1200px) {
  .players-layout {
    grid-template-columns: 1fr;
  }

  .player-details-column {
    position: static;
  }
}

@media (max-width: 768px) {
  .players-grid {
    grid-template-columns: 1fr;
  }
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
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: pulse 1.5s infinite;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(147, 51, 234, 0.1);
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-name {
  height: 24px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.skeleton-team,
.skeleton-position {
  height: 16px;
  width: 40%;
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

.skeleton-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.skeleton-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-label {
  height: 16px;
  width: 40%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-value {
  height: 20px;
  width: 60%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
}

.skeleton-stats-title {
  height: 24px;
  width: 40%;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 4px;
  margin-bottom: 1.5rem;
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

.player-details-modal {
  background: #1a1a1a;
  color: #e9d5ff;
  border-radius: 16px;
  overflow: hidden;
}

.player-details-modal :deep(.v-card-title) {
  border-bottom: 1px solid rgba(147, 51, 234, 0.2);
}

.modal-section {
  margin-bottom: 2.5rem;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.player-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
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