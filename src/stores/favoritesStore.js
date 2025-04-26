import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteTeamIds = ref(new Set())
  const favoritePlayerIds = ref(new Set())
  const isLoading = ref(false)
  const error = ref(null)

  const loadFavorites = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Load favorite teams
      const teamsResponse = await api.getFavoriteTeams()
      let teamIds
      if (teamsResponse.data && Array.isArray(teamsResponse.data.favoriteTeams)) {
        teamIds = teamsResponse.data.favoriteTeams
      } else if (Array.isArray(teamsResponse.data)) {
        teamIds = teamsResponse.data
      } else {
        console.error('Unexpected teams response format:', teamsResponse.data)
        teamIds = []
      }
      favoriteTeamIds.value = new Set(teamIds.map(id => id.toString()))

      // Load favorite players
      const playersResponse = await api.getFavoritePlayers()
      let playerIds
      if (playersResponse.data && Array.isArray(playersResponse.data.favoritePlayers)) {
        playerIds = playersResponse.data.favoritePlayers
      } else if (Array.isArray(playersResponse.data)) {
        playerIds = playersResponse.data
      } else {
        console.error('Unexpected players response format:', playersResponse.data)
        playerIds = []
      }
      favoritePlayerIds.value = new Set(playerIds.map(id => id.toString()))

      console.log('Loaded favorite teams:', Array.from(favoriteTeamIds.value))
      console.log('Loaded favorite players:', Array.from(favoritePlayerIds.value))
    } catch (err) {
      console.error('Failed to load favorites:', err)
      error.value = 'Failed to load favorites'
    } finally {
      isLoading.value = false
    }
  }

  const toggleFavoriteTeam = async (teamId) => {
    const id = teamId.toString()
    try {
      if (favoriteTeamIds.value.has(id)) {
        await api.unfavoriteTeam(id)
        favoriteTeamIds.value.delete(id)
      } else {
        await api.favoriteTeam(id)
        favoriteTeamIds.value.add(id)
      }
    } catch (err) {
      console.error('Failed to toggle favorite team:', err)
      // Revert the local state if the API call fails
      if (favoriteTeamIds.value.has(id)) {
        favoriteTeamIds.value.delete(id)
      } else {
        favoriteTeamIds.value.add(id)
      }
      throw err
    }
  }

  const toggleFavoritePlayer = async (playerId) => {
    const id = playerId.toString()
    try {
      if (favoritePlayerIds.value.has(id)) {
        await api.unfavoritePlayer(id)
        favoritePlayerIds.value.delete(id)
      } else {
        await api.favoritePlayer(id)
        favoritePlayerIds.value.add(id)
      }
    } catch (err) {
      console.error('Failed to toggle favorite player:', err)
      // Revert the local state if the API call fails
      if (favoritePlayerIds.value.has(id)) {
        favoritePlayerIds.value.delete(id)
      } else {
        favoritePlayerIds.value.add(id)
      }
      throw err
    }
  }

  const isTeamFavorited = (teamId) => {
    return favoriteTeamIds.value.has(teamId?.toString())
  }

  const isPlayerFavorited = (playerId) => {
    return favoritePlayerIds.value.has(playerId?.toString())
  }

  return {
    favoriteTeamIds,
    favoritePlayerIds,
    isLoading,
    error,
    loadFavorites,
    toggleFavoriteTeam,
    toggleFavoritePlayer,
    isTeamFavorited,
    isPlayerFavorited
  }
}) 