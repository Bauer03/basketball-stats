<template>
  <div class="user-dropdown">
    <v-menu
      :close-on-content-click="true"
      location="bottom end"
      transition="scale-transition"
      :close-delay="0"
      :open-delay="0"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
          size="large"
          class="user-btn"
          color="#9333ea"
          variant="text"
        >
          <v-icon size="28">mdi-account-circle</v-icon>
        </v-btn>
      </template>

      <v-list 
        class="dropdown-list" 
        bg-color="rgba(147, 51, 234, 0.1)"
        elevation="0"
      >
        <v-list-item
          to="/profile"
          prepend-icon="mdi-account"
          class="dropdown-item"
          active-color="#9333ea"
          rounded="lg"
        >
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        
        <v-list-item
          @click="handleLogout"
          prepend-icon="mdi-logout"
          class="dropdown-item"
          active-color="#9333ea"
          rounded="lg"
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
  background: none !important;
}

.user-btn:hover {
  opacity: 0.8;
  transform: scale(1.05);
  background: none !important;
}

:deep(.user-btn::before),
:deep(.user-btn::after) {
  display: none !important;
}

:deep(.dropdown-list) {
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  min-width: 200px;
  padding: 4px;
  margin-top: 4px;
  background: rgba(147, 51, 234, 0.1) !important;
}

:deep(.dropdown-item) {
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.2s ease;
  min-height: 36px !important;
  padding: 6px 12px !important;
}

:deep(.dropdown-item:hover) {
  background-color: rgba(147, 51, 234, 0.15) !important;
}

:deep(.dropdown-item .v-list-item-title) {
  color: #e9d5ff;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.dropdown-item .v-icon) {
  color: rgba(233, 213, 255, 0.7);
  margin-right: 8px;
  font-size: 20px !important;
}

:deep(.dropdown-item:hover .v-icon) {
  color: #9333ea;
}

:deep(.v-list-item--active) {
  background-color: rgba(147, 51, 234, 0.2) !important;
}

:deep(.v-list-item--active .v-list-item-title) {
  color: #9333ea !important;
}

:deep(.v-list-item--active .v-icon) {
  color: #9333ea !important;
}
</style> 