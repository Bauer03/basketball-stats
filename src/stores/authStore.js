import { defineStore } from 'pinia'
import api from '@/api/axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  actions: {
    setAuth(data) {
      this.user = data.user
      this.token = data.token
      localStorage.setItem('token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    },

    clearAuth() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/user', userData)
        this.setAuth(response.data)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to register'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/user/login', credentials)
        this.setAuth(response.data)
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to login'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteAccount() {
      this.loading = true
      this.error = null
      try {
        await api.delete('/user/me')
        this.clearAuth()
        router.push('/login')
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete account'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.clearAuth()
      router.push('/login')
    },

    clearError() {
      this.error = null
    },

    initializeAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    hasError: (state) => !!state.error
  }
}) 