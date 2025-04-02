import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  }),

  actions: {
    setAuth(data) {
      this.user = data.user
      this.token = data.token
      this.isAuthenticated = true
      localStorage.setItem('token', data.token)
      // Update axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    },

    async register(username, email, password) {
      this.isLoading = true
      try {
        const response = await api.post('/user', {
          username,
          email,
          password
        })
        this.setAuth(response.data)
        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed'
        throw new Error(message)
      } finally {
        this.isLoading = false
      }
    },

    async login(email, password) {
      this.isLoading = true
      try {
        const response = await api.post('/user/login', {
          email,
          password
        })
        this.setAuth(response.data)
        return response.data
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed'
        throw new Error(message)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      try {
        await api.post('/user/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuth()
        this.isLoading = false
      }
    },

    // Initialize auth state from localStorage
    initializeAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        this.isAuthenticated = true
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }
  }
}) 