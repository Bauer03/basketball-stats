import { ref } from 'vue'
import API_CONFIG from '@/api/config'

export function useSearch() {
  const searchResults = ref({
    teams: [],
    players: [],
    games: []
  })
  
  // Add debugging
  console.log('useSearch initial searchResults:', searchResults.value)
  
  const isLoading = ref(false)
  const searchTimeout = ref(null)
  const lastSearchTime = ref(0)
  const MIN_TIME_BETWEEN_SEARCHES = 2000 // Increase to 2 seconds between API calls
  const DEBOUNCE_DELAY = 1000 // Increase to 1 second after user stops typing
  
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
        name: team.full_name || team.name,
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
        'name-search': query || ''
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
  
  const searchGames = async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      
      // Add all possible parameters if they exist
      if (filters.startDate) params.append('start_date', filters.startDate)
      if (filters.endDate) params.append('end_date', filters.endDate)
      if (filters.seasons?.length) {
        filters.seasons.forEach(season => params.append('seasons[]', season))
      }
      if (filters.teams?.length) {
        filters.teams.forEach(teamId => params.append('team_ids[]', teamId))
      }
      if (filters.cursor) params.append('cursor', filters.cursor)
      if (filters.perPage) params.append('per_page', filters.perPage)
      
      const url = `${API_CONFIG.BASE_URL}/games?${params}`
      
      const response = await fetch(url, API_CONFIG.DEFAULT_OPTIONS)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const json = await response.json()
      const { data, meta } = json || {}
      const mappedData = data?.map(game => ({
        id: game.id,
        date: game.date,
        home_team: game.home_team,
        visitor_team: game.visitor_team,
        home_team_score: game.home_team_score,
        visitor_team_score: game.visitor_team_score,
        status: game.status,
        venue: game.venue,
        season: game.season
      })) || []
      
      return { games: mappedData, meta }
    } catch (error) {
      console.error('Error searching games:', error)
      return { games: [], meta: null }
    }
  }
  
  const performSearch = async (query, type, conference = '', filters = {}) => {
    // Check if enough time has passed since the last search
    const now = Date.now()
    const timeSinceLastSearch = now - lastSearchTime.value
    
    if (timeSinceLastSearch < MIN_TIME_BETWEEN_SEARCHES) {
      setTimeout(() => {
        performSearch(query, type, conference, filters)
      }, MIN_TIME_BETWEEN_SEARCHES - timeSinceLastSearch)
      return
    }
    
    // Only check for empty query for Teams and Players searches
    if (!query?.trim() && type !== 'Games') {
      clearResults()
      return
    }
    
    isLoading.value = true
    lastSearchTime.value = now
    
    try {
      switch (type) {
        case 'Teams':
          const teamsResults = await searchTeams(query, conference)
          searchResults.value = {
            teams: [...teamsResults],
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
          // For Games, ignore the query parameter and only use filters
          const { games, meta } = await searchGames(filters)
          searchResults.value = {
            teams: [],
            players: [],
            games,
            meta // Store the meta information for pagination
          }
          break
      }
    } finally {
      isLoading.value = false
    }
  }
  
  const debouncedSearch = (query, type, delay = DEBOUNCE_DELAY, conference = '', filters = {}) => {
    // Use a longer delay for games search since it depends on user selections
    const searchDelay = type === 'Games' ? 1000 : delay
    
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    
    searchTimeout.value = setTimeout(() => {
      performSearch(query, type, conference, filters)
    }, searchDelay)
  }
  
  // Initialize with empty results
  clearResults()
  
  return {
    searchResults,
    isLoading,
    debouncedSearch
  }
} 