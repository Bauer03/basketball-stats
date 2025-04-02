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
  
  const searchTeams = async (query) => {
    try {
      console.log('Searching teams with query:', query)
      const params = new URLSearchParams({
        'team-search': query || '',
        'conference': '' // Optional conference filter
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
  
  const searchPlayers = async (query) => {
    try {
      console.log('Searching players with query:', query)
      const params = new URLSearchParams({
        'name-search': query || '',
        'cursor': '',
        'per_page': API_CONFIG.PAGINATION.PER_PAGE.toString()
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
        name: `${player.first_name} ${player.last_name}`,
        position: player.position,
        team: player.team?.full_name || 'N/A',
        jersey: player.jersey_number,
        teamId: player.team?.id
      })) || []
      
      console.log('Processed player results:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Error searching players:', error)
      return []
    }
  }
  
  const searchGames = async (query) => {
    try {
      console.log('Searching games with query:', query)
      const currentYear = new Date().getFullYear()
      const params = new URLSearchParams({
        'start_date': `${currentYear}-01-01`,
        'end_date': `${currentYear}-12-31`,
        'cursor': '',
        'per_page': API_CONFIG.PAGINATION.PER_PAGE.toString()
      })
      
      params.append('seasons[]', currentYear.toString())
      
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
        date: new Date(game.date).toLocaleDateString(),
        status: game.status,
        homeTeam: game.home_team?.full_name || game.home_team,
        visitorTeam: game.visitor_team?.full_name || game.visitor_team,
        homeTeamScore: game.home_team_score,
        visitorTeamScore: game.visitor_team_score,
        homeTeamId: game.home_team?.id,
        visitorTeamId: game.visitor_team?.id
      })) || []
      
      console.log('Processed game results:', mappedData)
      return mappedData
    } catch (error) {
      console.error('Error searching games:', error)
      return []
    }
  }
  
  const performSearch = async (query, type) => {
    console.log('Performing search:', { type, query })
    
    // Check if enough time has passed since the last search
    const now = Date.now()
    const timeSinceLastSearch = now - lastSearchTime.value
    
    if (timeSinceLastSearch < MIN_TIME_BETWEEN_SEARCHES) {
      console.log('Throttling search, scheduling for later...')
      setTimeout(() => {
        performSearch(query, type)
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
            teams: await searchTeams(query),
            players: [],
            games: []
          }
          break
        case 'Players':
          searchResults.value = {
            teams: [],
            players: await searchPlayers(query),
            games: []
          }
          break
        case 'Games':
          searchResults.value = {
            teams: [],
            players: [],
            games: await searchGames(query)
          }
          break
      }
      console.log('Search completed, current results:', searchResults.value)
    } finally {
      isLoading.value = false
    }
  }
  
  const debouncedSearch = (query, type, delay = DEBOUNCE_DELAY) => {
    console.log('Debouncing search:', { type, query, delay })
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    
    searchTimeout.value = setTimeout(() => {
      performSearch(query, type)
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