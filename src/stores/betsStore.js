import { defineStore } from 'pinia'
import { betsApi } from '@/services/api/bets'

// Types for better code organization
const STATS = {
  points: 0,
  assists: 0,
  rebounds: 0,
  threes: 0,
  steals: 0
}

export const useBetsStore = defineStore('bets', {
  state: () => ({
    bets: [],
    isLoading: false,
    error: null,
    mockPlayers: {
      1: {
        id: 1,
        name: "LeBron James",
        team: "Los Angeles Lakers"
      }
    },
    mockGames: {
      1: {
        id: 1,
        homeTeam: "Los Angeles Lakers",
        awayTeam: "Golden State Warriors",
        date: "2025-04-15T20:00:00.000Z"
      }
    }
  }),

  getters: {
    getBetById: (state) => (id) => {
      return state.bets.find(bet => bet._id === id)
    },
    getPlayerById: (state) => (id) => {
      return state.mockPlayers[id] || {
        id: id,
        name: 'Butler Frank',
        team: 'LA Franks'
      }
    },
    getGameById: (state) => (id) => {
      return state.mockGames[id] || {
        id: id,
        homeTeam: 'LA Franks',
        awayTeam: 'LA Franks',
        date: new Date().toISOString()
      }
    },
    getBetsWithDetails: (state) => {
      if (!Array.isArray(state.bets)) {
        console.error('Bets is not an array:', state.bets)
        return []
      }
      return state.bets.map(bet => {
        // Safely get player and game data with fallbacks
        const player = state.mockPlayers[bet.playerId] || {
          id: bet.playerId,
          name: 'Butler Frank',
          team: 'LA Franks'
        }
        
        const game = state.mockGames[bet.gameId] || {
          id: bet.gameId,
          homeTeam: 'LA Franks',
          awayTeam: 'LA Franks',
          date: new Date().toISOString()
        }

        return {
          ...bet,
          player,
          game
        }
      })
    }
  },

  actions: {
    async fetchBets(params = {}) {
      try {
        this.isLoading = true
        this.error = null
        const response = await betsApi.getUserBets(params)
        // Ensure we always set an array
        this.bets = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error fetching bets:', error)
        this.error = error.message || 'Failed to fetch bets'
        this.bets = [] // Reset to empty array on error
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createBet(betData) {
      try {
        this.isLoading = true
        this.error = null
        const newBet = await betsApi.createBet(betData)
        // Ensure bets is an array before pushing
        if (!Array.isArray(this.bets)) {
          this.bets = []
        }
        this.bets.push(newBet)
        return newBet
      } catch (error) {
        console.error('Error creating bet:', error)
        this.error = error.message || 'Failed to create bet'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateBet(betId, updates) {
      try {
        // TODO: Replace with actual API call
        // const response = await api.put(`/bets/${betId}`, updates)
        const index = this.bets.findIndex(bet => bet._id === betId)
        if (index !== -1) {
          this.bets[index] = { ...this.bets[index], ...updates }
        }
        return this.bets[index]
      } catch (error) {
        console.error('Error updating bet:', error)
        throw error
      }
    },

    async deleteBet(betId) {
      try {
        // TODO: Replace with actual API call
        // await api.delete(`/bets/${betId}`)
        const index = this.bets.findIndex(bet => bet._id === betId)
        if (index !== -1) {
          this.bets.splice(index, 1)
        }
      } catch (error) {
        console.error('Error deleting bet:', error)
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  }
}) 