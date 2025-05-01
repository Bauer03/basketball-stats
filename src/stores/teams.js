import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { handleApiResponse } from '../utils/api-errors'

const API_BASE_URL = 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net'

export const useTeamsStore = defineStore('teams', {
  state: () => ({
    teams: [],
    currentTeam: null,
    currentTeamStandings: null,
    loading: false,
    error: null,
    perPage: 25,
    cursor: null,
    nextCursor: null
  }),

  getters: {
    hasTeams: (state) => state.teams.length > 0,
    hasCurrentTeam: (state) => !!state.currentTeam,
    canLoadMore: (state) => !!state.nextCursor
  },

  actions: {
    async searchTeams(query = '', conference = '', options = {}) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const queryParams = new URLSearchParams({
          per_page: this.perPage
        })
        
        if (query) {
          queryParams.append('team-search', query)
        }
        if (conference) {
          queryParams.append('conference', conference)
        }
        if (options.cursor) {
          queryParams.append('cursor', options.cursor)
        }
        if (options.season) {
          queryParams.append('season', options.season)
        }

        const url = `${API_BASE_URL}/teams${queryParams.toString() ? '?' + queryParams : ''}`
        console.log('Fetching teams from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        
        // Update state
        this.teams = options.cursor ? [...this.teams, ...data.data] : data.data
        this.cursor = options.cursor
        this.nextCursor = data.meta?.next_cursor || null
        
        return data
      } catch (err) {
        console.error('Error in searchTeams:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response
        })
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchTeamById(teamId, season = null) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const queryParams = new URLSearchParams()
        if (season) {
          queryParams.append('season', season)
        }

        const url = `${API_BASE_URL}/teams/${teamId}${queryParams.toString() ? '?' + queryParams : ''}`
        console.log('Fetching team details from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        this.currentTeam = data.team
        this.currentTeamStandings = data.standings
        return data
      } catch (err) {
        console.error('Error in fetchTeamById:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response,
          teamId,
          season
        })
        this.error = err.message
        if (err.status === 404) {
          this.error = 'Team not found'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchTeamStats(teamId, season = null) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const queryParams = new URLSearchParams()
        if (season) {
          queryParams.append('season', season)
        }

        const url = `${API_BASE_URL}/teams/${teamId}/stats${queryParams.toString() ? '?' + queryParams : ''}`
        console.log('Fetching team stats from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        return data
      } catch (err) {
        console.error('Error in fetchTeamStats:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response,
          teamId,
          season
        })
        this.error = err.message
        if (err.status === 404) {
          this.error = 'Team stats not found'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    clearCurrentTeam() {
      this.currentTeam = null
      this.currentTeamStandings = null
    },

    resetPagination() {
      this.cursor = null
      this.nextCursor = null
      this.teams = []
    },

    async fetchTeamGames(teamId, startDate, endDate) {
      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const response = await fetch(`${API_BASE_URL}/teams/${teamId}/games?start_date=${startDate}&end_date=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });

        const data = await handleApiResponse(response);
        return data;
      } catch (err) {
        this.error = err.message || 'Failed to fetch team games';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
}) 