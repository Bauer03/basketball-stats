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

    <div class="teams-container">
      <div class="teams-header">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4 font-weight-bold">Teams</h1>
          <v-btn
            color="#e9d5ff"
            variant="outlined"
            @click="loadFavoriteTeams"
            :loading="loading"
          >
            Favorite Teams
          </v-btn>
        </div>
      </div>
      <Teams 
        ref="teamsComponent" 
        @search-select="handleSearchSelection" 
        @update-grid="handleSearchGridUpdate" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Teams from '@/components/Teams.vue'
import api from '@/api/axios'

const teamsComponent = ref(null)
const loading = ref(false)

// Define handlers
const handleSearchSelection = (data) => {
  console.log('TeamsView received search selection:', data)
  if (teamsComponent.value) {
    teamsComponent.value.handleSearchSelection(data)
  }
}

const handleSearchGridUpdate = (data) => {
  console.log('TeamsView received grid update:', data)
  if (teamsComponent.value) {
    teamsComponent.value.handleSearchGridUpdate(data)
  }
}

// Event listeners setup and cleanup
const setupEventListeners = () => {
  window.addEventListener('search-grid-update', (event) => {
    console.log('Received search-grid-update event:', event.detail)
    handleSearchGridUpdate(event.detail)
  })

  window.addEventListener('search-selection', (event) => {
    console.log('Received search-selection event:', event.detail)
    handleSearchSelection(event.detail)
  })
}

const cleanupEventListeners = () => {
  window.removeEventListener('search-grid-update', handleSearchGridUpdate)
  window.removeEventListener('search-selection', handleSearchSelection)
}

onMounted(() => {
  // Only set the search type, initialization is handled by Teams component
  updateSearchType('teams')
  setupEventListeners()
})

onUnmounted(() => {
  cleanupEventListeners()
})

const loadFavoriteTeams = async () => {
  // Only proceed if we're not already loading
  if (loading.value) {
    console.log('Already loading favorite teams, skipping')
    return
  }
  
  loading.value = true
  try {
    console.log('Fetching favorite teams...')
    const response = await api.getFavoriteTeams()
    console.log('Favorite teams API response:', response)
    
    let favoriteTeamIds
    if (response.data && Array.isArray(response.data.favoriteTeams)) {
      favoriteTeamIds = response.data.favoriteTeams
    } else if (Array.isArray(response.data)) {
      favoriteTeamIds = response.data
    } else {
      console.error('Unexpected response data format:', response.data)
      favoriteTeamIds = []
    }
    
    console.log('Extracted favorite team IDs:', favoriteTeamIds)
    
    // Fetch details for each favorite team
    const teamsPromises = favoriteTeamIds.map(async (teamId) => {
      try {
        console.log(`Fetching details for team ID ${teamId}...`)
        const response = await api.get(`/teams/${teamId}`)
        console.log(`Raw team details response for ID ${teamId}:`, response)
        
        // Check the response structure
        if (!response.data) {
          console.error(`No data in response for team ${teamId}`)
          return null
        }

        // The team data might be in response.data.team or directly in response.data
        const teamData = response.data.team || response.data
        console.log(`Extracted team data for ID ${teamId}:`, teamData)

        if (!teamData || !teamData.id) {
          console.error(`Invalid team data for ID ${teamId}:`, teamData)
          return null
        }

        // Map to consistent team structure
        const mappedTeam = {
          id: teamData.id,
          full_name: teamData.full_name || `${teamData.city} ${teamData.name}`,
          name: teamData.name,
          abbreviation: teamData.abbreviation,
          city: teamData.city,
          conference: teamData.conference,
          division: teamData.division
        }
        
        console.log(`Mapped team data for ID ${teamId}:`, mappedTeam)
        return mappedTeam
      } catch (error) {
        console.error(`Failed to fetch details for team ${teamId}:`, error)
        return null
      }
    })
    
    const teamsResponses = await Promise.all(teamsPromises)
    console.log('All team details responses:', teamsResponses)
    
    // Filter out null responses and ensure all required fields are present
    const favoriteTeams = teamsResponses
      .filter(team => team !== null && team.id && team.full_name && team.conference)
    
    console.log('Final processed favorite teams:', favoriteTeams)
    
    if (favoriteTeams.length === 0) {
      console.warn('No valid favorite teams data after processing')
    }
    
    // Update the teams component with the favorite teams
    teamsComponent.value?.updateTeams(favoriteTeams)
  } catch (error) {
    console.error('Failed to load favorite teams:', error)
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
  window.dispatchEvent(new CustomEvent('stats-view-changed', { 
    detail: type 
  }))
}
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

.teams-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.teams-header {
  margin-bottom: 2rem;
}
</style> 