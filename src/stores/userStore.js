import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: false,
    isLoading: false,
    error: null
  }),

  actions: {
    async logout() {
      this.isLoading = true
      this.error = null
      
      try {
        await api.post('/user/logout')
        this.isAuthenticated = false
        // Clear any stored auth tokens or user data
        localStorage.removeItem('isLoggedIn')
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to logout'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
}) 