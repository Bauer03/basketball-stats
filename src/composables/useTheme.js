import { ref } from 'vue'

// Theme configurations
export const themes = {
  dark: {
    name: 'dark',
    colors: {
      // Background colors
      'color-bg-primary': '#1a1a2e',
      'color-bg-secondary': '#1e1e35',
      'color-bg-tertiary': '#252542',
      'color-bg-elevated': '#2a2a4a',
      
      // Primary purple shades
      'color-primary-50': '#faf5ff',
      'color-primary-100': '#f3e8ff',
      'color-primary-200': '#e9d5ff',
      'color-primary-300': '#d8b4fe',
      'color-primary-400': '#c084fc',
      'color-primary-500': '#a855f7',
      'color-primary-600': '#9333ea',
      'color-primary-700': '#7e22ce',
      'color-primary-800': '#6b21a8',
      'color-primary-900': '#581869',
      
      // Text colors
      'color-text-primary': '#f3e8ff',  // primary-100
      'color-text-secondary': '#e9d5ff', // primary-200
      'color-text-muted': '#c084fc',     // primary-400
      
      // Interactive element colors
      'color-interactive': '#a855f7',    // primary-500
      'color-interactive-hover': '#c084fc', // primary-400
      'color-interactive-active': '#9333ea', // primary-600
      
      // Button colors
      'color-button-bg': 'rgba(147, 51, 234, 0.3)',
      'color-button-bg-hover': 'rgba(147, 51, 234, 0.4)',
      'color-button-text': '#e9d5ff',
      'color-button-text-hover': '#ffffff',
      
      // Border colors
      'color-border-light': 'rgba(147, 51, 234, 0.2)',
      'color-border-medium': 'rgba(147, 51, 234, 0.3)',
      
      // Component specific
      'navbar-bg': '#1a1a2e',
      'searchbar-bg': 'rgba(147, 51, 234, 0.1)',
      'searchbar-bg-hover': 'rgba(147, 51, 234, 0.15)',
      'searchbar-bg-focus': 'rgba(147, 51, 234, 0.2)',
      
      // Shadow
      'shadow-color': 'rgba(88, 24, 169, 0.3)'
    }
  },
  light: {
    name: 'light',
    colors: {
      // Background colors
      'color-bg-primary': '#ffffff',
      'color-bg-secondary': '#f8f5ff',
      'color-bg-tertiary': '#f3e8ff',
      'color-bg-elevated': '#ffffff',
      
      // Primary purple shades (same as dark theme for consistency)
      'color-primary-50': '#faf5ff',
      'color-primary-100': '#f3e8ff',
      'color-primary-200': '#e9d5ff',
      'color-primary-300': '#d8b4fe',
      'color-primary-400': '#c084fc',
      'color-primary-500': '#a855f7',
      'color-primary-600': '#9333ea',
      'color-primary-700': '#7e22ce',
      'color-primary-800': '#6b21a8',
      'color-primary-900': '#581869',
      
      // Text colors
      'color-text-primary': '#1a1a2e',
      'color-text-secondary': '#2d2d3f',
      'color-text-muted': '#4b4b63',
      
      // Interactive element colors
      'color-interactive': '#9333ea',     // primary-600
      'color-interactive-hover': '#7e22ce', // primary-700
      'color-interactive-active': '#6b21a8', // primary-800
      
      // Button colors
      'color-button-bg': 'rgba(147, 51, 234, 0.25)',
      'color-button-bg-hover': 'rgba(147, 51, 234, 0.35)',
      'color-button-text': '#9333ea',
      'color-button-text-hover': '#7e22ce',
      
      // Border colors
      'color-border-light': 'rgba(147, 51, 234, 0.1)',
      'color-border-medium': 'rgba(147, 51, 234, 0.2)',
      
      // Component specific
      'navbar-bg': '#ffffff',
      'searchbar-bg': 'rgba(147, 51, 234, 0.05)',
      'searchbar-bg-hover': 'rgba(147, 51, 234, 0.1)',
      'searchbar-bg-focus': 'rgba(147, 51, 234, 0.15)',
      
      // Shadow
      'shadow-color': 'rgba(88, 24, 169, 0.15)'
    }
  }
}

// Create a composable for theme management
export function useTheme() {
  const currentTheme = ref('dark')
  
  // Function to apply theme to document
  const applyTheme = (themeName) => {
    const theme = themes[themeName]
    if (!theme) {
      console.error(`Theme "${themeName}" not found`)
      return
    }
    
    // Apply each color variable to the document root
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value)
    })
    
    // Store the current theme name
    currentTheme.value = themeName
    
    // Save theme preference to localStorage
    localStorage.setItem('preferred-theme', themeName)
  }
  
  // Function to toggle between themes
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(newTheme)
  }
  
  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('preferred-theme')
    if (savedTheme && themes[savedTheme]) {
      applyTheme(savedTheme)
    } else {
      // Default to dark theme
      applyTheme('dark')
    }
  }
  
  return {
    currentTheme,
    applyTheme,
    toggleTheme,
    initializeTheme
  }
} 