<template>
  <v-app theme="dark">
    <Navbar />
    <v-main class="main-content">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style>
:root {
  --primary: #1a1a2e;
  --text-light: #e9d5ff;
  --text-secondary: #9ca3af;
  --background-dark: #121212;
  --surface-dark: #1e1e1e;
  --border-dark: #2f2f2f;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  background-color: var(--background-dark);
  color: var(--text-light);
}

.main-content {
  min-height: calc(100vh - 64px);
  background-color: var(--background-dark);
  position: relative;
  z-index: 1;
}

:deep(.v-application) {
  position: relative;
  z-index: 1;
}

:deep(.v-main) {
  position: relative;
  z-index: 1;
}

/* Select styles */
:deep(.v-select) {
  color: #e9d5ff !important;
}

:deep(.v-select .v-field__input) {
  color: #e9d5ff !important;
}

:deep(.v-select .v-label) {
  color: rgba(233, 213, 255, 0.7) !important;
}

:deep(.v-select .v-field) {
  border-color: rgba(147, 51, 234, 0.3) !important;
  background-color: rgba(147, 51, 234, 0.1) !important;
}

:deep(.v-select .v-field--variant-outlined:hover) {
  border-color: rgba(147, 51, 234, 0.5) !important;
}

:deep(.v-select .v-field--focused) {
  border-color: #9333ea !important;
}

:deep(.v-select .v-menu) {
  background-color: var(--surface-dark) !important;
  border: 1px solid rgba(147, 51, 234, 0.2) !important;
}

:deep(.v-select .v-list-item) {
  color: #e9d5ff !important;
}

:deep(.v-select .v-list-item:hover) {
  background-color: rgba(147, 51, 234, 0.1) !important;
}

:deep(.v-select .v-list-item--active) {
  background-color: rgba(147, 51, 234, 0.2) !important;
  color: #9333ea !important;
}
</style> 