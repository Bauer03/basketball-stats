import axios from 'axios'

const BASE_URL = '/api'

export const teamsApi = {
  /**
   * Get all teams
   * @returns {Promise<Array>} Array of teams
   */
  async getTeams() {
    const { data } = await axios.get(`${BASE_URL}/teams`)
    return data
  },

  /**
   * Get team by ID
   * @param {number} teamId - ID of the team
   * @returns {Promise<Object>} Team details
   */
  async getTeamById(teamId) {
    const { data } = await axios.get(`${BASE_URL}/teams/${teamId}`)
    return data
  }
} 