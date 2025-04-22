import api from '@/api/axios'

export const betsApi = {
  /**
   * Get user's bets with optional pagination
   * @param {Object} params
   * @param {number} params.limit - Number of bets to return
   * @param {number} params.offset - Number of bets to skip
   * @returns {Promise<Array>} Array of bets
   */
  async getUserBets(params = {}) {
    const response = await api.get('/bets', { params })
    return response.data
  },

  /**
   * Create a new bet
   * @param {Object} betData
   * @param {number} betData.gameId - ID of the game
   * @param {number} betData.playerId - ID of the player
   * @param {Object} betData.predictions - Prediction stats
   * @param {number} betData.predictions.points - Predicted points
   * @param {number} betData.predictions.assists - Predicted assists
   * @param {number} betData.predictions.rebounds - Predicted rebounds
   * @param {number} betData.predictions.threes - Predicted three-pointers
   * @param {number} betData.predictions.steals - Predicted steals
   * @returns {Promise<Object>} Created bet
   */
  async createBet(betData) {
    const response = await api.post('/bets', betData)
    return response.data
  }
} 