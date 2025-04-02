<template>
  <base-search
    title="NBA Teams"
    :loading="loading"
    :error="error"
    :results="teams"
  >
    <template #filters>
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search teams..."
          @input="handleSearch"
          :disabled="loading"
        >
      </div>
    </template>

    <template #results>
      <div v-if="selectedTeam" class="team-details">
        <button @click="closeTeamDetails" class="back-btn">
          ← Back to Teams
        </button>
        
        <div class="team-header">
          <h2>{{ selectedTeam.full_name }}</h2>
          <div class="team-meta">
            <span>{{ selectedTeam.conference }} Conference</span>
            <span>•</span>
            <span>{{ selectedTeam.division }} Division</span>
          </div>
        </div>

        <div class="standings-grid">
          <div class="stat-card">
            <div class="stat-value">{{ selectedTeamStandings.wins }}-{{ selectedTeamStandings.losses }}</div>
            <div class="stat-label">Overall Record</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ selectedTeamStandings.conference_rank }}</div>
            <div class="stat-label">Conference Rank</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ selectedTeamStandings.conference_record }}</div>
            <div class="stat-label">Conference Record</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ selectedTeamStandings.division_rank }}</div>
            <div class="stat-label">Division Rank</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ selectedTeamStandings.division_record }}</div>
            <div class="stat-label">Division Record</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ selectedTeamStandings.home_record }}</div>
            <div class="stat-label">Home Record</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ selectedTeamStandings.road_record }}</div>
            <div class="stat-label">Road Record</div>
          </div>
        </div>
      </div>
      
      <div v-else class="teams-grid">
        <div 
          v-for="team in teams" 
          :key="team.id" 
          class="team-card"
          @click="viewTeamDetails(team.id)"
        >
          <div class="team-info">
            <h3>{{ team.full_name }}</h3>
            <div class="team-meta">
              <span>{{ team.conference }}</span>
              <span>•</span>
              <span>{{ team.division }}</span>
            </div>
          </div>
          <div class="team-abbr">{{ team.abbreviation }}</div>
        </div>
      </div>
    </template>
  </base-search>
</template>

<script>
import { ref, computed } from 'vue'
import { useTeamsStore } from '../../stores/teams'
import BaseSearch from './BaseSearch.vue'

export default {
  name: 'TeamSearch',
  components: {
    BaseSearch
  },
  setup() {
    const teamsStore = useTeamsStore()
    const searchQuery = ref('')
    const searchTimeout = ref(null)

    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }

      searchTimeout.value = setTimeout(async () => {
        await teamsStore.searchTeams(searchQuery.value)
      }, 300)
    }

    const viewTeamDetails = async (teamId) => {
      await teamsStore.fetchTeamById(teamId)
    }

    const closeTeamDetails = () => {
      teamsStore.clearCurrentTeam()
    }

    // Load all teams on component mount
    teamsStore.searchTeams()

    return {
      teams: computed(() => teamsStore.teams),
      selectedTeam: computed(() => teamsStore.currentTeam),
      selectedTeamStandings: computed(() => teamsStore.currentTeamStandings),
      loading: computed(() => teamsStore.loading),
      error: computed(() => teamsStore.error),
      searchQuery,
      handleSearch,
      viewTeamDetails,
      closeTeamDetails
    }
  }
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 2rem;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--primary);
}

.search-bar input:disabled {
  background-color: var(--background);
  cursor: not-allowed;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.team-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.team-info h3 {
  margin: 0;
  color: var(--text);
  font-size: 1.25rem;
}

.team-meta {
  margin-top: 0.5rem;
  color: var(--text);
  opacity: 0.7;
  font-size: 0.9rem;
  display: flex;
  gap: 0.5rem;
}

.team-abbr {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.team-details {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  text-decoration: underline;
}

.team-header {
  margin-bottom: 2rem;
  text-align: center;
}

.team-header h2 {
  margin: 0;
  color: var(--text);
  font-size: 2rem;
}

.standings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--background);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text);
  font-size: 0.9rem;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .standings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .standings-grid {
    grid-template-columns: 1fr;
  }
}
</style> 