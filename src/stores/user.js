import { defineStore } from 'pinia'
import { handleApiResponse } from '../utils/api-errors'

const API_BASE_URL = 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net'
const STORAGE_KEY_PREFIX = 'nba_stats_app_'
const TOKEN_STORAGE_KEY = `${STORAGE_KEY_PREFIX}token`
const USER_STORAGE_KEY = `${STORAGE_KEY_PREFIX}user`

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || null,
    token: localStorage.getItem(TOKEN_STORAGE_KEY) || null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
    hasError: (state) => state.error !== null
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const data = { email, password }
        const url = `${API_BASE_URL}/user/login`
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
        console.log('Making login request to:', url)
        console.log('Request body:', data)
        console.log('Request options:', options)
        
        let response
        try {
          response = await fetch(url, options)
          console.log('Login response received:', response)
          console.log('Login response status:', response.status)
          console.log('Login response headers:', Object.fromEntries(response.headers.entries()))
        } catch (fetchError) {
          console.error('Network error during login:', fetchError)
          throw new Error('Failed to connect to server. Please check your internet connection.')
        }
        
        const responseData = await handleApiResponse(response)
        console.log('Login response data:', responseData)
        
        this.user = responseData.user
        this.token = responseData.token
        
        // Store in localStorage
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(responseData.user))
        localStorage.setItem(TOKEN_STORAGE_KEY, responseData.token)
        
        return responseData
      } catch (err) {
        console.error('Login error in store:', err)
        this.error = err.message
        if (err.status === 400) {
          this.error = 'Invalid email or password'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(username, email, password) {
      console.log('User store: Starting register method')
      console.log('User store: Received parameters:', { username, email, password })
      
      this.loading = true
      this.error = null
      
      try {
        const data = { username, email, password }
        const url = `${API_BASE_URL}/user`
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
        
        console.log('User store: Making registration request to:', url)
        console.log('User store: Request body:', data)
        console.log('User store: Request options:', options)
        
        let response
        try {
          response = await fetch(url, options)
          console.log('Registration response received:', response)
          console.log('Registration response status:', response.status)
          console.log('Registration response headers:', Object.fromEntries(response.headers.entries()))
        } catch (fetchError) {
          console.error('Network error during registration:', fetchError)
          throw new Error('Failed to connect to server. Please check your internet connection.')
        }
        
        const responseData = await handleApiResponse(response)
        console.log('Registration response data:', responseData)
        
        // After successful registration, automatically log in
        await this.login(email, password)
        
        return responseData
      } catch (err) {
        console.error('Registration error in store:', err)
        this.error = err.message
        if (err.status === 400) {
          this.error = 'Invalid registration details. Please check your input.'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${API_BASE_URL}/user/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        await handleApiResponse(response)
      } catch (err) {
        console.error('Logout error:', err)
        // Continue with logout even if the server request fails
      } finally {
        // Clear state and storage
        this.user = null
        this.token = null
        localStorage.removeItem(USER_STORAGE_KEY)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        this.loading = false
      }
    },

    async deleteAccount() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        await handleApiResponse(response)
        
        // Clear state and storage after successful deletion
        this.user = null
        this.token = null
        localStorage.removeItem(USER_STORAGE_KEY)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        
        return true
      } catch (err) {
        console.error('Delete account error:', err)
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    }
  }
}) 