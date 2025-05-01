import { defineStore } from 'pinia'

const API_BASE_URL = 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: null,
    token: null
  }),

  actions: {
    async login(email, password) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(`${API_BASE_URL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Login failed')
        }

        const data = await response.json()
        this.token = data.token
        this.user = data.user
        this.isAuthenticated = true
        
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async register(username, email, password) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await fetch(`${API_BASE_URL}/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Registration failed')
        }

        const data = await response.json()
        
        // After successful registration, login automatically
        await this.login(email, password)
        
        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      this.error = null
      
      try {
        if (this.token) {
          await fetch(`${API_BASE_URL}/user/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear state and storage regardless of server response
        this.token = null
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.isLoading = false
      }
    },

    // Initialize auth state from localStorage
    initAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
      }
    }
  }
}) 