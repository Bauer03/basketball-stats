// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.VUE_APP_API_BASE_URL || '/api',
  
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