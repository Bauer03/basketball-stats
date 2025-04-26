import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net'
})

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Favorite Teams
api.favoriteTeam = async (teamId) => {
  return await api.post('/favorite-teams', { team_id: teamId })
}

api.unfavoriteTeam = async (teamId) => {
  return await api.delete(`/favorite-teams/${teamId}`)
}

api.getFavoriteTeams = async () => {
  return await api.get('/favorite-teams')
}

// Favorite Players
api.favoritePlayer = async (playerId) => {
  return await api.post('/favorite-players', { player_id: playerId })
}

api.unfavoritePlayer = async (playerId) => {
  return await api.delete(`/favorite-players/${playerId}`)
}

api.getFavoritePlayers = async () => {
  return await api.get('/favorite-players')
}

// User Account Management
api.deleteAccount = async () => {
  return await api.delete('/user/me')
}

export default api 