import axios from 'axios'
import api from '@/api/axios'

export const gamesApi = {
  /**
   * Get games with optional filters
   * @param {Object} options - Query parameters
   * @param {string} [options.start_date] - Start date for filtering games
   * @param {string} [options.end_date] - End date for filtering games
   * @param {number[]} [options.seasons] - Array of season years
   * @param {number[]} [options.team_ids] - Array of team IDs
   * @param {string} [options.cursor] - Cursor for pagination
   * @param {number} [options.per_page] - Number of results per page
   * @returns {Promise<Object>} Games data with pagination metadata
   */
  async getGames(options = {}) {
    const params = new URLSearchParams()
    
    if (options.start_date) params.append('start_date', options.start_date)
    if (options.end_date) params.append('end_date', options.end_date)
    if (options.seasons?.length) {
      options.seasons.forEach(season => params.append('seasons[]', season.toString()))
    }
    if (options.team_ids?.length) {
      options.team_ids.forEach(id => params.append('team_ids[]', id.toString()))
    }
    if (options.cursor) params.append('cursor', options.cursor)
    if (options.per_page) params.append('per_page', options.per_page.toString())

    const response = await api.get(`/games?${params}`)
    return response.data
  },

  /**
   * Get game by ID
   * @param {number} gameId - ID of the game
   * @returns {Promise<Object>} Game details
   */
  async getGameById(gameId) {
    const response = await api.get(`/games/${gameId}`)
    return response.data
  },

  /**
   * Get games for a specific player within a date range
   * @param {number} playerId - ID of the player
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Games data
   */
  async getGamesByPlayer(playerId, startDate, endDate) {
    const response = await api.get(`/games/${playerId}/${startDate}/${endDate}`)
    return response.data
  }
} 