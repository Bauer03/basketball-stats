import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { handleApiResponse } from '../utils/api-errors'

const API_BASE_URL = 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net'

export const usePlayersStore = defineStore('players', {
  state: () => ({
    players: [],
    currentPlayer: null,
    currentPlayerStats: null,
    loading: false,
    error: null,
    perPage: 25,
    cursor: null,
    nextCursor: null
  }),

  getters: {
    hasPlayers: (state) => state.players.length > 0,
    hasCurrentPlayer: (state) => !!state.currentPlayer,
    canLoadMore: (state) => !!state.nextCursor
  },

  actions: {
    async searchPlayers(query = '', options = {}) {
      this.loading = true
      this.error = null
      
      try {
        const userStore = useUserStore()
        const queryParams = new URLSearchParams({
          per_page: this.perPage
        })
        
        if (query) {
          queryParams.append('player-search', query)
        }
        if (options.cursor) {
          queryParams.append('cursor', options.cursor)
        }
        if (options.teamId) {
          queryParams.append('team_id', options.teamId)
        }
        if (options.season) {
          queryParams.append('season', options.season)
        }
        if (options.position) {
          queryParams.append('position', options.position)
        }

        const url = `${API_BASE_URL}/players${queryParams.toString() ? '?' + queryParams : ''}`
        console.log('Fetching players from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        
        // Update state
        this.players = options.cursor ? [...this.players, ...data.data] : data.data
        this.cursor = options.cursor
        this.nextCursor = data.meta.next_cursor
        
        return data
      } catch (err) {
        console.error('Error in searchPlayers:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response,
          query,
          options
        })
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPlayerById(playerId, season = null) {
      this.loading = true
      this.error = null
      
      try {
        const userStore = useUserStore()
        const queryParams = new URLSearchParams()
        if (season) {
          queryParams.append('season', season)
        }

        const url = `${API_BASE_URL}/players/${playerId}${queryParams.toString() ? '?' + queryParams : ''}`
        console.log('Fetching player details from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        this.currentPlayer = data.player
        this.currentPlayerStats = data.stats
        return data
      } catch (err) {
        console.error('Error in fetchPlayerById:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response,
          playerId,
          season
        })
        this.error = err.message
        if (err.status === 404) {
          this.error = 'Player not found'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPlayerStats(playerId, season = null) {
      this.loading = true
      this.error = null
      
      try {
        const userStore = useUserStore()
        const queryParams = new URLSearchParams()
        if (season) {
          queryParams.append('season', season)
        }

        const url = `${API_BASE_URL}/players/${playerId}/stats${queryParams.toString() ? '?' + queryParams : ''}`
        console.log('Fetching player stats from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        return data
      } catch (err) {
        console.error('Error in fetchPlayerStats:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response,
          playerId,
          season
        })
        this.error = err.message
        if (err.status === 404) {
          this.error = 'Player stats not found'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPlayerGameLog(playerId, startDate, endDate, cursor = null) {
      this.loading = true
      this.error = null
      
      try {
        const userStore = useUserStore()
        const queryParams = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          per_page: this.perPage
        })

        if (cursor) {
          queryParams.append('cursor', cursor)
        }

        const url = `${API_BASE_URL}/players/${playerId}/games${queryParams.toString() ? '?' + queryParams : ''}`
        console.log('Fetching player game log from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        return data
      } catch (err) {
        console.error('Error in fetchPlayerGameLog:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response,
          playerId,
          startDate,
          endDate,
          cursor
        })
        this.error = err.message
        if (err.status === 404) {
          this.error = 'No game log found for this player'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    clearCurrentPlayer() {
      this.currentPlayer = null
      this.currentPlayerStats = null
    },

    resetPagination() {
      this.cursor = null
      this.nextCursor = null
      this.players = []
    }
  }
}) 