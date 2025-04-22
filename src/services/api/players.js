import axios from 'axios'
import api from '@/api/axios'

const BASE_URL = '/api'

export const playersApi = {
  /**
   * Search players by name
   * @param {string} query - Player name to search for
   * @returns {Promise<Object>} Players data
   */
  async searchPlayers(query) {
    const params = new URLSearchParams({
      'name-search': query
    })
    const response = await api.get(`/players?${params}`)
    return response.data
  },

  /**
   * Get available players for a specific game
   * @param {number} gameId - ID of the game
   * @returns {Promise<Array>} Array of players available for betting
   */
  async getPlayersForGame(gameId) {
    const response = await api.get(`/games/${gameId}/players`)
    return response.data
  }
} 