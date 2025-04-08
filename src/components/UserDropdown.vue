<template>
  <div class="user-dropdown">
    <v-menu
      :close-on-content-click="true"
      location="bottom end"
      transition="scale-transition"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
          size="large"
          class="user-btn"
          color="#9333ea"
        >
          <v-icon size="28">mdi-account-circle</v-icon>
        </v-btn>
      </template>

      <v-list class="dropdown-list" bg-color="#1e1e1e">
        <v-list-item
          to="/profile"
          prepend-icon="mdi-account"
          class="dropdown-item"
          active-color="#9333ea"
        >
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          @click="handleLogout"
          prepend-icon="mdi-logout"
          class="dropdown-item"
          active-color="#9333ea"
          :loading="authStore.isLoading"
        >
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

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
.user-dropdown {
  margin-left: auto;
}

.user-btn {
  transition: all 0.2s ease;
}

.user-btn:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

:deep(.dropdown-list) {
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 8px;
  overflow: hidden;
  min-width: 200px;
  padding: 4px;
}

:deep(.dropdown-item) {
  border-radius: 6px;
  margin: 2px 0;
  transition: all 0.2s ease;
}

:deep(.dropdown-item:hover) {
  background-color: rgba(147, 51, 234, 0.1) !important;
}

:deep(.dropdown-item .v-list-item-title) {
  color: #e9d5ff;
  font-size: 0.95rem;
}

:deep(.dropdown-item .v-icon) {
  color: rgba(233, 213, 255, 0.7);
}

:deep(.dropdown-item:hover .v-icon) {
  color: #9333ea;
}
</style> 