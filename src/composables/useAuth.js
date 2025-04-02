import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

export function useAuth() {
  const isLoggedIn = ref(false)

  const login = () => {
    isLoggedIn.value = true
    // In a real app, you would also store a token or session
    localStorage.setItem('isLoggedIn', 'true')
  }

  const logout = () => {
    isLoggedIn.value = false
    localStorage.removeItem('isLoggedIn')
  }

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    const storedAuth = localStorage.getItem('isLoggedIn')
    if (storedAuth === 'true') {
      isLoggedIn.value = true
    }
  }

  // Initialize auth state when the composable is created
  initializeAuth()

  return {
    isLoggedIn,
    login,
    logout,
    initializeAuth
  }
}

// In your component setup
const { currentTheme, applyTheme, toggleTheme } = useTheme()

// To change theme
applyTheme('light') // or 'dark'

// To toggle between themes
toggleTheme()

// To check current theme
console.log(currentTheme.value) // 'dark' or 'light' 