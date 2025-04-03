const API_BASE_URL = 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net'


async function searchPlayers(query = '', options = {}) {
  try {
    const queryParams = new URLSearchParams({
      per_page: 25 // default page size
    })
    if (query) {
      queryParams.append('player-search', query)
    }
    const url = `${API_BASE_URL}/players${queryParams.toString() ? '?' + queryParams : ''}`
    
    let token = localStorage.getItem('token')
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token // actual valid token needed
      }
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    console.log(data);
    return data
  } catch (error) {
    console.error('Error fetching stuff form the server:', error)
    throw error
  }
}

async function searchTeams(query = '', conference = '') {
  try {
    const queryParams = new URLSearchParams({
      team_search: query
    })
    if(conference) {
      queryParams.append('conference', conference)
    }
    const url = `${API_BASE_URL}/players${queryParams.toString() ? '?' + queryParams : ''}`
    
    let token = localStorage.getItem('token')
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    console.log(data);
    return data
  } catch (error) {
    console.error('Error fetching stuff form the server:', error)
    throw error
  }
}
