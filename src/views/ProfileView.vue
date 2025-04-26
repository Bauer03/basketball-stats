<template>
  <div class="profile-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="profile-card">
            <div class="profile-header">
              <h1 class="text-h4 font-weight-bold">Profile</h1>
              <v-icon size="64" color="#9333ea" class="profile-icon">mdi-account-circle</v-icon>
            </div>
            
            <v-divider class="my-6" color="rgba(147, 51, 234, 0.2)"></v-divider>
            
            <v-form @submit.prevent="handleSubmit" class="profile-form">
              <v-text-field
                v-model="form.username"
                label="Username"
                variant="outlined"
                class="mb-4 profile-field"
                bg-color="rgba(147, 51, 234, 0.05)"
                color="#9333ea"
                :loading="loading"
              ></v-text-field>

              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                variant="outlined"
                class="mb-4 profile-field"
                bg-color="rgba(147, 51, 234, 0.05)"
                color="#9333ea"
                :loading="loading"
              ></v-text-field>

              <v-text-field
                v-model="form.password"
                label="New Password (optional)"
                type="password"
                variant="outlined"
                class="mb-6 profile-field"
                placeholder="Leave blank to keep current password"
                bg-color="rgba(147, 51, 234, 0.05)"
                color="#9333ea"
                :loading="loading"
              ></v-text-field>

              <v-btn
                color="#9333ea"
                type="submit"
                :loading="loading"
                block
                size="large"
                class="save-btn"
              >
                Save Changes
              </v-btn>
            </v-form>

            <v-divider class="my-6" color="rgba(147, 51, 234, 0.2)"></v-divider>
            
            <div class="danger-zone">
              <h3 class="text-h6 font-weight-bold mb-4">Danger Zone</h3>
              <v-btn
                color="error"
                variant="outlined"
                :loading="deleteLoading"
                @click="confirmDeleteDialog = true"
                class="delete-btn"
              >
                Delete Account
              </v-btn>
            </div>

            <v-dialog v-model="confirmDeleteDialog" max-width="500">
              <v-card class="delete-dialog">
                <v-card-title class="text-h5">Delete Account</v-card-title>
                <v-card-text>
                  Are you sure you want to delete your account? This action cannot be undone.
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="grey"
                    variant="text"
                    @click="confirmDeleteDialog = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="error"
                    variant="text"
                    :loading="deleteLoading"
                    @click="handleDeleteAccount"
                  >
                    Delete
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-snackbar
              v-model="snackbar.show"
              :color="snackbar.color"
              timeout="3000"
              location="top"
            >
              {{ snackbar.text }}
            </v-snackbar>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  username: '',
  email: '',
  password: ''
})

const loading = ref(false)
const deleteLoading = ref(false)
const confirmDeleteDialog = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const fetchProfile = async () => {
  try {
    loading.value = true
    const response = await api.get('/user/me')
    
    // Initialize form with user data from auth store or API response
    const userData = authStore.user || response.data
    if (userData) {
      form.value = {
        username: userData.username || '',
        email: userData.email || '',
        password: '' // Don't populate password
      }
    } else {
      showError('Failed to load profile data')
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    showError('Failed to load profile')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Only include fields that have values
    const updateData = {}
    if (form.value.username) updateData.username = form.value.username
    if (form.value.email) updateData.email = form.value.email
    if (form.value.password) updateData.password = form.value.password

    const response = await api.patch('/user/me', updateData)
    
    // Update auth store with new user data
    if (response.data) {
      authStore.user = response.data
    }
    
    showSuccess('Profile updated successfully')
    form.value.password = '' // Clear password field after successful update
  } catch (error) {
    console.error('Failed to update profile:', error)
    showError(error.response?.data?.message || 'Failed to update profile')
  } finally {
    loading.value = false
  }
}

const showSuccess = (text) => {
  snackbar.value = {
    show: true,
    text,
    color: 'success'
  }
}

const showError = (text) => {
  snackbar.value = {
    show: true,
    text,
    color: 'error'
  }
}

const handleDeleteAccount = async () => {
  try {
    deleteLoading.value = true
    await authStore.deleteAccount()
    showSuccess('Account deleted successfully')
    router.push('/login')
  } catch (error) {
    console.error('Failed to delete account:', error)
    showError(error.response?.data?.message || 'Failed to delete account')
  } finally {
    deleteLoading.value = false
    confirmDeleteDialog.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  min-height: 100vh;
  background-color: var(--background-dark);
}

.profile-card {
  background: #1e1e1e !important;
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 12px;
  padding: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-icon {
  opacity: 0.8;
}

.profile-form {
  max-width: 100%;
}

:deep(.profile-field) {
  border-radius: 8px;
}

:deep(.profile-field .v-field__outline) {
  border-color: rgba(147, 51, 234, 0.3) !important;
}

:deep(.profile-field:hover .v-field__outline) {
  border-color: rgba(147, 51, 234, 0.5) !important;
}

:deep(.profile-field.v-field--focused .v-field__outline) {
  border-color: #9333ea !important;
}

:deep(.profile-field .v-label) {
  color: rgba(233, 213, 255, 0.7) !important;
}

:deep(.profile-field input) {
  color: #e9d5ff !important;
}

.save-btn {
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.2s ease;
}

.save-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.danger-zone {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.delete-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
}

:deep(.delete-dialog) {
  background: #1e1e1e !important;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 12px;
}

:deep(.delete-dialog .v-card-title) {
  color: #e9d5ff;
}

:deep(.delete-dialog .v-card-text) {
  color: rgba(233, 213, 255, 0.7);
}
</style> 