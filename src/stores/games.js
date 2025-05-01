import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import { handleApiResponse } from '../utils/api-errors'

const API_BASE_URL = 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net'

export const useGamesStore = defineStore('games', {
  state: () => ({
    games: [],
    currentGame: null,
    loading: false,
    error: null,
    cursorStack: [], // Stack to store previous cursors
    currentCursor: null,
    nextCursor: null,
    perPage: 25,
    dateRange: {
      startDate: null,
      endDate: null
    }
  }),

  getters: {
    canGoBack: (state) => state.cursorStack.length > 0,
    canGoForward: (state) => !!state.nextCursor,
    hasGames: (state) => state.games.length > 0,
    hasCurrentGame: (state) => !!state.currentGame
  },

  actions: {
    async fetchGames(startDate, endDate, cursor = null, pushToCursorStack = true, options = {}) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const queryParams = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          per_page: this.perPage
        })

        if (cursor) {
          queryParams.append('cursor', cursor)
        }

        // Add optional parameters
        if (options.seasons) {
          options.seasons.forEach(season => {
            queryParams.append('seasons[]', season)
          })
        }
        if (options.teamIds) {
          options.teamIds.forEach(teamId => {
            queryParams.append('team_ids[]', teamId)
          })
        }
        if (options.playerIds) {
          options.playerIds.forEach(playerId => {
            queryParams.append('player_ids[]', playerId)
          })
        }

        const url = `${API_BASE_URL}/games?${queryParams}`
        console.log('Fetching games from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        
        // Update state
        this.games = pushToCursorStack ? data.data : [...this.games, ...data.data]
        this.nextCursor = data.meta.next_cursor
        
        // Update cursor stack
        if (pushToCursorStack && this.currentCursor) {
          this.cursorStack.push(this.currentCursor)
        }
        this.currentCursor = cursor

        // Update date range
        this.dateRange = {
          startDate,
          endDate
        }

        return data
      } catch (err) {
        console.error('Error in fetchGames:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response,
          startDate,
          endDate,
          cursor,
          options
        })
        this.error = err.message
        if (err.status === 500) {
          this.error = 'Unable to fetch games at this time. Please try again later.'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchGameById(gameId) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const url = `${API_BASE_URL}/games/${gameId}`
        console.log('🎮 Fetching game details:', {
          gameId,
          url,
          timestamp: new Date().toISOString()
        })

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        console.log('🎮 Game details fetched successfully:', {
          gameId,
          status: response.status,
          timestamp: new Date().toISOString()
        })
        
        this.currentGame = data.game
        return data
      } catch (err) {
        console.error('🎮 Error fetching game details:', {
          gameId,
          message: err.message,
          status: err.status,
          timestamp: new Date().toISOString()
        })
        this.error = err.message
        if (err.status === 404) {
          this.error = 'Game not found'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchGameStats(gameId) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const url = `${API_BASE_URL}/games/${gameId}/stats`
        console.log('Fetching game stats from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        return data
      } catch (err) {
        console.error('Error in fetchGameStats:', {
          message: err.message,
          status: err.status,
          stack: err.stack,
          response: err.response,
          gameId
        })
        this.error = err.message
        if (err.status === 404) {
          this.error = 'Game stats not found'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchGamesByPlayer(playerId, startDate, endDate, cursor = null) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const queryParams = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
          per_page: this.perPage
        })

        if (cursor) {
          queryParams.append('cursor', cursor)
        }

        const url = `${API_BASE_URL}/players/${playerId}/games${queryParams.toString() ? '?' + queryParams : ''}`
        console.log('Fetching player games from:', url)

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        const data = await handleApiResponse(response)
        return data
      } catch (err) {
        console.error('Error in fetchGamesByPlayer:', {
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
          this.error = 'No games found for this player in the specified date range'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async goToNextPage() {
      if (!this.nextCursor) return

      await this.fetchGames(
        this.dateRange.startDate,
        this.dateRange.endDate,
        this.nextCursor,
        true
      )
    },

    async goToPreviousPage() {
      if (this.cursorStack.length === 0) return

      const previousCursor = this.cursorStack.pop()
      await this.fetchGames(
        this.dateRange.startDate,
        this.dateRange.endDate,
        previousCursor,
        false
      )
    },

    resetPagination() {
      this.cursorStack = []
      this.currentCursor = null
      this.nextCursor = null
    },

    clearCurrentGame() {
      this.currentGame = null
    }
  }
}) 