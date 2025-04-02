<template>
  <v-app-bar color="#121212" theme="dark" elevation="4" class="navbar">
    <v-app-bar-title class="d-flex align-center">
      <router-link to="/" class="text-decoration-none">
        <span class="text-h6 font-weight-bold" style="color: #e9d5ff">NBA Stats</span>
      </router-link>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <template v-if="authStore.isAuthenticated">
      <div class="d-flex align-center justify-center search-container">
        <SearchBar />
      </div>
      <v-spacer></v-spacer>
      <v-btn
        color="#9333ea"
        variant="text"
        :loading="authStore.isLoading"
        :disabled="authStore.isLoading"
        @click="handleLogout"
      >
        Logout
      </v-btn>
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
import { useRouter } from 'vue-router'
import SearchBar from './search/SearchBar.vue'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.navbar {
  padding: 0.5rem 2rem !important;
}

.search-container {
  width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
}

.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  opacity: 0.9;
}

:deep(.v-btn--variant-text) {
  color: #9333ea !important;
}

:deep(.v-btn--variant-outlined) {
  border-color: #9333ea !important;
  color: #9333ea !important;
}

:deep(.v-btn--variant-outlined:hover) {
  background-color: rgba(147, 51, 234, 0.1) !important;
}

:deep(.v-app-bar) {
  border-bottom: 1px solid rgba(147, 51, 234, 0.2);
}
</style> 