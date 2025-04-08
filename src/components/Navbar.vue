<template>
  <v-app-bar color="#121212" theme="dark" elevation="4" class="navbar">
    <v-app-bar-title class="d-flex align-center">
      <router-link :to="authStore.isAuthenticated ? '/teams' : '/'" class="text-decoration-none">
        <span class="text-h6 font-weight-bold" style="color: #e9d5ff">NBA Stats</span>
      </router-link>
    </v-app-bar-title>

    <template v-if="authStore.isAuthenticated">
      <div class="search-container">
        <SearchBar :show-by-default="shouldShowSearch" />
      </div>
      <UserDropdown />
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
  </v-app-bar>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import SearchBar from './search/SearchBar.vue'
import UserDropdown from './UserDropdown.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const shouldShowSearch = computed(() => {
  // Don't show search results by default in profile, login, or register pages
  const noSearchRoutes = ['/profile', '/login', '/register']
  return !noSearchRoutes.includes(route.path)
})

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
  width: 600px;
  z-index: 9999;
  top: 50%;
  transform: translate(-50%, -50%);
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
</style> 