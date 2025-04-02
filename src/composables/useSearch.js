import { ref } from 'vue'
import API_CONFIG from '@/api/config'

export function useSearch() {
  const searchResults = ref({
    teams: [],
    players: [],
    games: []
  })
  
  const isLoading = ref(false)
  const searchTimeout = ref(null)
  const lastSearchTime = ref(0)
  const MIN_TIME_BETWEEN_SEARCHES = 1000 // Minimum 1 second between API calls
  const DEBOUNCE_DELAY = 500 // Wait 500ms after user stops typing
  
  const clearResults = () => {
    searchResults.value = {
      teams: [],
      players: [],
      games: []
    }
  }
  
  const searchTeams = async (query, conference = '') => {
    try {
      console.log('Searching teams with query:', query)
      const params = new URLSearchParams({
        'team-search': query || '',
        'conference': conference || '' // Add conference filter
      })
      
      const url = `${API_CONFIG.BASE_URL}/teams?${params}`
      console.log('Making request to:', url)
      
      const response = await fetch(url, API_CONFIG.DEFAULT_OPTIONS)
      console.log('Teams API response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const json = await response.json()
      console.log('Teams API response:', json)
      
      const { data } = json || {}
      const mappedData = data?.map(team => ({
        id: team.id,
        name: team.full_name,
        abbreviation: team.abbreviation,
        conference: team.conference,
        division: team.division,
        city: team.city
      })) || []
      
      console.log('Processed team results:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Error searching teams:', error)
      return []
    }
  }
  
  const searchPlayers = async (query, filters = {}) => {
    try {
      console.log('Searching players with query:', query)
      const params = new URLSearchParams({
        'player-search': query || '',
        'team_id': filters.team || '',
        'position': filters.position || ''
      })
      
      const url = `${API_CONFIG.BASE_URL}/players?${params}`
      console.log('Making request to:', url)
      
      const response = await fetch(url, API_CONFIG.DEFAULT_OPTIONS)
      console.log('Players API response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const json = await response.json()
      console.log('Players API response:', json)
      
      const { data } = json || {}
      const mappedData = data?.map(player => ({
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        position: player.position,
        team: player.team,
        jersey_number: player.jersey_number
      })) || []
      
      console.log('Processed player results:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Error searching players:', error)
      return []
    }
  }
  
  const searchGames = async (query, filters = {}) => {
    try {
      console.log('Searching games with query:', query)
      const params = new URLSearchParams({
        'game-search': query || '',
        'start_date': filters.startDate || '',
        'end_date': filters.endDate || '',
        'team_ids': filters.teams?.join(',') || ''
      })
      
      const url = `${API_CONFIG.BASE_URL}/games?${params}`
      console.log('Making request to:', url)
      
      const response = await fetch(url, API_CONFIG.DEFAULT_OPTIONS)
      console.log('Games API response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const json = await response.json()
      console.log('Games API response:', json)
      
      const { data } = json || {}
      const mappedData = data?.map(game => ({
        id: game.id,
        date: game.date,
        home_team: game.home_team,
        visitor_team: game.visitor_team,
        home_team_score: game.home_team_score,
        visitor_team_score: game.visitor_team_score,
        status: game.status,
        venue: game.venue
      })) || []
      
      console.log('Processed game results:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Error searching games:', error)
      return []
    }
  }
  
  const performSearch = async (query, type, conference = '', filters = {}) => {
    console.log('Performing search:', { type, query, conference, filters })
    
    // Check if enough time has passed since the last search
    const now = Date.now()
    const timeSinceLastSearch = now - lastSearchTime.value
    
    if (timeSinceLastSearch < MIN_TIME_BETWEEN_SEARCHES) {
      console.log('Throttling search, scheduling for later...')
      setTimeout(() => {
        performSearch(query, type, conference, filters)
      }, MIN_TIME_BETWEEN_SEARCHES - timeSinceLastSearch)
      return
    }
    
    if (!query?.trim() && type !== 'Games') {
      console.log('Empty query, clearing results')
      clearResults()
      return
    }
    
    isLoading.value = true
    lastSearchTime.value = now
    
    try {
      switch (type) {
        case 'Teams':
          searchResults.value = {
            teams: await searchTeams(query, conference),
            players: [],
            games: []
          }
          break
        case 'Players':
          searchResults.value = {
            teams: [],
            players: await searchPlayers(query, filters),
            games: []
          }
          break
        case 'Games':
          searchResults.value = {
            teams: [],
            players: [],
            games: await searchGames(query, filters)
          }
          break
      }
      console.log('Search completed, current results:', searchResults.value)
    } finally {
      isLoading.value = false
    }
  }
  
  const debouncedSearch = (query, type, delay = DEBOUNCE_DELAY, conference = '', filters = {}) => {
    console.log('Debouncing search:', { type, query, delay, conference, filters })
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    
    searchTimeout.value = setTimeout(() => {
      performSearch(query, type, conference, filters)
    }, delay)
  }
  
  // Initialize with empty results
  clearResults()
  
  return {
    searchResults,
    isLoading,
    debouncedSearch
  }
} 