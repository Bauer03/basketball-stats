<template>
  <base-search
    title="NBA Games"
    :loading="loading"
    :error="error"
    :results="games"
    :has-more="canGoForward"
    @load-more="goToNextPage"
  >
    <template #filters>
      <div class="filters">
        <div class="date-range">
          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              v-model="startDate"
              :max="endDate"
              :disabled="loading"
            >
          </div>
          <div class="form-group">
            <label for="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              v-model="endDate"
              :min="startDate"
              :disabled="loading"
            >
          </div>
          <button 
            @click="handleSearch" 
            class="search-btn"
            :disabled="loading || !isDateRangeValid"
          >
            Search
          </button>
        </div>
        
        <div class="pagination"> <!-- buttons to switch back and forth between result pages, but might not work right now. -->
          <button 
            @click="goToPreviousPage" 
            :disabled="!canGoBack || loading"
            class="nav-btn"
          >
            Previous
          </button>
          <button 
            @click="goToNextPage" 
            :disabled="!canGoForward || loading"
            class="nav-btn"
          >
            Next
          </button>
        </div>
      </div>
    </template>

    <template #results>
      <div v-for="game in games" :key="game._id" class="game-card">
        <div class="game-header">
          <span class="game-date">{{ formatDate(game.date) }}</span>
        </div>
        <div class="game-teams">
          <div class="team home">
            <img :src="game.homeTeam.logo" :alt="game.homeTeam.name" class="team-logo">
            <div class="team-info">
              <span class="team-name">{{ game.homeTeam.name }}</span>
              <span class="team-score">{{ game.homeTeamScore }}</span>
            </div>
          </div>
          <div class="vs">VS</div>
          <div class="team away">
            <img :src="game.awayTeam.logo" :alt="game.awayTeam.name" class="team-logo">
            <div class="team-info">
              <span class="team-name">{{ game.awayTeam.name }}</span>
              <span class="team-score">{{ game.awayTeamScore }}</span>
            </div>
          </div>
        </div>
        <button @click="viewGameDetails(game._id)" class="view-btn">
          View Details
        </button>
      </div>
    </template>
  </base-search>
</template>

<script>
import { ref, computed } from 'vue'
import { useGamesStore } from '../../stores/games'
import { useRouter } from 'vue-router'
import BaseSearch from './BaseSearch.vue'

export default {
  name: 'GameSearch',
  components: {
    BaseSearch
  },
  setup() {
    const gamesStore = useGamesStore()
    const router = useRouter()

    // Date range inputs
    const startDate = ref('')
    const endDate = ref('')

    // Computed properties
    const isDateRangeValid = computed(() => {
      return startDate.value && endDate.value && 
             new Date(startDate.value) <= new Date(endDate.value)
    })

    // Methods
    const handleSearch = async () => {
      if (!isDateRangeValid.value) return

      gamesStore.resetPagination()
      await gamesStore.fetchGames(startDate.value, endDate.value)
      
      // Emit a search-grid-update event to update the games grid
      const updateData = {
        type: 'Games',
        results: gamesStore.games,
        query: 'date-range-search'
      }
      
      // Dispatch the event globally
      window.dispatchEvent(new CustomEvent('search-grid-update', { 
        detail: updateData
      }))
    }

    const goToNextPage = () => {
      gamesStore.goToNextPage()
    }

    const goToPreviousPage = () => {
      gamesStore.goToPreviousPage()
    }

    const viewGameDetails = (gameId) => {
      router.push(`/games/${gameId}`)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    return {
      // State
      games: computed(() => gamesStore.games),
      loading: computed(() => gamesStore.loading),
      error: computed(() => gamesStore.error),
      canGoBack: computed(() => gamesStore.canGoBack),
      canGoForward: computed(() => gamesStore.canGoForward),
      startDate,
      endDate,
      isDateRangeValid,

      // Methods
      handleSearch,
      goToNextPage,
      goToPreviousPage,
      viewGameDetails,
      formatDate
    }
  }
}
</script>

<style scoped>
#startDate, #endDate {
  padding-right: 0px !important;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.date-range {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: var(--text);
}

input[type="date"] {
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
}

input[type="date"]:disabled {
  background-color: var(--background);
  cursor: not-allowed;
}

.search-btn, .nav-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn {
  background-color: var(--primary);
  color: white;
}

.search-btn:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.nav-btn {
  background-color: var(--background);
  color: var(--text);
}

.nav-btn:hover:not(:disabled) {
  background-color: var(--border);
}

.search-btn:disabled, .nav-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.game-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.game-header {
  margin-bottom: 1rem;
  text-align: center;
}

.game-date {
  color: var(--text);
  font-weight: 500;
}

.game-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.team {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.team.away {
  flex-direction: row-reverse;
  text-align: right;
}

.team-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.team-name {
  font-weight: 500;
  color: var(--text);
}

.team-score {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
}

.vs {
  padding: 0 1rem;
  color: var(--text);
  font-weight: 500;
}

.view-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.view-btn:hover {
  background-color: var(--primary-dark);
}

@media (max-width: 768px) {
  .date-range {
    flex-direction: column;
  }

  .game-teams {
    flex-direction: column;
    gap: 1rem;
  }

  .team.away {
    flex-direction: row;
    text-align: left;
  }

  .vs {
    padding: 0.5rem 0;
  }
}
</style> 