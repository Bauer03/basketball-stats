// API Configuration
const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net',
  
  // Default request options
  DEFAULT_OPTIONS: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // Pagination defaults
  PAGINATION: {
    PER_PAGE: 10
  }
}

export default API_CONFIG 