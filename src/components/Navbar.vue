<template>
  <v-app-bar color="#121212" theme="dark" elevation="4" class="navbar">
    <v-app-bar-title class="d-flex align-center">
      <router-link :to="authStore.isAuthenticated ? '/teams' : '/'" class="text-decoration-none">
        <span class="text-h6 font-weight-bold" style="color: #e9d5ff">NBA Stats</span>
      </router-link>
    </v-app-bar-title>
    
    <template v-if="authStore.isAuthenticated">
      <div class="search-container">
        <SearchBar ref="searchBar" :show-by-default="shouldShowSearch" />
      </div>
      <div class="d-flex align-center gap-4">
        <v-btn
          class="bet-button"
          @click="handleBetClick"
        >
          Bet
        </v-btn>
        <UserDropdown />
      </div>
    </template>

    <template v-else>
      <v-btn
        color="#9333ea"
        variant="text"
        class="mx-2"
        to="/login"
      >
        Login
      </v-btn>
      <v-btn
        color="#9333ea"
        variant="outlined"
        to="/register"
      >
        Register
      </v-btn>
    </template>

    <!-- Mobile Hamburger Menu -->
    <div class="mobile-menu">
      <v-menu
        :close-on-content-click="true"
        location="bottom end"
        transition="scale-transition"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            size="medium"
            class="hamburger-btn"
            color="white"
            variant="text"
          >
            <v-icon size="30">mdi-menu</v-icon>
          </v-btn>
        </template>

        <v-list 
          class="mobile-dropdown-list" 
          bg-color="rgba(147, 51, 234, 0.1)"
          elevation="0"
        >
          <v-list-item
            to="/profile"
            prepend-icon="mdi-account"
            class="dropdown-item"
            color="#9333ea"
            rounded="lg"
          >
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          
          <v-list-item
            @click="handleLogout"
            prepend-icon="mdi-logout"
            class="dropdown-item"
            color="#9333ea"
            rounded="lg"
            :loading="authStore.isLoading"
          >
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import SearchBar from './search/SearchBar.vue'
import UserDropdown from './UserDropdown.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const searchBar = ref(null)

const shouldShowSearch = computed(() => {
  // Don't show search results by default in profile, login, register, or bet pages
  const noSearchRoutes = ['/profile', '/login', '/register', '/bet']
  return !noSearchRoutes.some(noSearchRoute => route.path.startsWith(noSearchRoute))
})

const handleBetClick = () => {
  // Close search results if they're open
  if (searchBar.value) {
    searchBar.value.showResults = false
  }
  // Navigate to bet page
  router.push('/bet')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handleProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
.gap-1 {
  gap: 1rem;
}

.gap-4 {
  gap: 1.5rem;
}

.navbar {
  padding: 0.5rem 2rem !important;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 1000px;
  max-width: calc(100% - 300px);
  z-index: 9999;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* Add media query for mobile responsiveness */
@media (max-width: 1200px) {
  .search-container {
    max-width: calc(100% - 32px);
    position: relative;
    margin: 0 16px;
    transform: none;
    left: auto;
    top: auto;
  }
}

/* App bar styles */
:deep(.v-app-bar) {
  border-bottom: 1px solid var(--color-border-light);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  overflow: visible;
  height: 64px !important;
}

:deep(.v-app-bar__content) {
  overflow: visible;
  position: relative;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100% !important;
}

:deep(.v-app-bar__prepend),
:deep(.v-app-bar__append) {
  overflow: visible;
  position: relative;
  z-index: 9999;
  flex: 0 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
}

/* Button styles */
.v-btn {
  transition: all 0.2s ease;
  user-select: none;
  background-color: var(--color-button-bg) !important;
  color: var(--color-button-text) !important;
  border-radius: var(--radius-md) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 100px !important;
  padding: 0 16px !important;
}

.v-btn:hover {
  background-color: var(--color-button-bg-hover) !important;
  color: var(--color-button-text-hover) !important;
}

:deep(.v-btn--variant-text) {
  color: var(--color-button-text) !important;
  background-color: var(--color-button-bg) !important;
}

:deep(.v-btn--variant-text:hover) {
  color: var(--color-button-text-hover) !important;
  background-color: var(--color-button-bg-hover) !important;
}

:deep(.v-btn--variant-outlined) {
  border-color: var(--color-button-text) !important;
  color: var(--color-button-text) !important;
  background-color: var(--color-button-bg) !important;
}

:deep(.v-btn--variant-outlined:hover) {
  border-color: var(--color-button-text-hover) !important;
  color: var(--color-button-text-hover) !important;
  background-color: var(--color-button-bg-hover) !important;
}

:deep(.v-btn__content) {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.v-btn__loader) {
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.desktop-menu {
  display: block;
}

.mobile-menu {
  display: none;
}

.hamburger-btn {
  transition: all 0.2s ease;
  background: none !important;
}

.hamburger-btn:hover {
  opacity: 0.8;
  transform: scale(1.05);
  background: none !important;
}

:deep(.mobile-dropdown-list) {
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  min-width: 200px;
  padding: 4px;
  margin-top: 4px;
  background: rgba(147, 51, 234, 0.1) !important;
}

@media (max-width: 600px) {
  .desktop-menu {
    display: none;
  }
  
  .mobile-menu {
    display: block;
  }
}

.bet-button {
  min-width: 80px !important;
  font-weight: 600;
  background-color: rgba(255, 165, 0, 0.2) !important;
  color: #FFA500 !important;
  border: 1px solid rgba(255, 165, 0, 0.3) !important;
}

.bet-button:hover {
  background-color: rgba(255, 165, 0, 0.3) !important;
  color: #FFB52E !important;
  border-color: rgba(255, 165, 0, 0.4) !important;
}
</style> 