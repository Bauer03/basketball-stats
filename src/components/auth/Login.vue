<template>
  <div class="login-container">
    <v-card class="login-card" elevation="8" theme="dark">
      <h2>Login</h2>
      <v-form @submit.prevent="handleLogin" ref="form">
        <div class="form-group">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="[
              v => !!v || 'Email is required',
              v => /.+@.+\..+/.test(v) || 'Email must be valid'
            ]"
            required
            :disabled="isLoading"
            variant="outlined"
            color="#9333ea"
            bg-color="rgba(147, 51, 234, 0.1)"
            class="purple-input"
          ></v-text-field>
        </div>

        <div class="form-group">
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[v => !!v || 'Password is required']"
            required
            :disabled="isLoading"
            variant="outlined"
            color="#9333ea"
            bg-color="rgba(147, 51, 234, 0.1)"
            class="purple-input"
          ></v-text-field>
        </div>

        <v-btn
          type="submit"
          :loading="isLoading"
          :disabled="isLoading"
          class="mt-4 login-btn"
          size="large"
          block
          style="background-color: #9333ea"
        >
          Login
        </v-btn>

        <div v-if="error" class="error-message mt-4">
          {{ error }}
        </div>

        <div class="auth-links">
          Don't have an account?
          <router-link to="/register">Register here</router-link>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const form = ref(null)

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!form.value.validate()) return

  isLoading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    router.push('/teams')
  } catch (err) {
    error.value = err.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: var(--spacing-xl);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: rgba(147, 51, 234, 0.05) !important;
  border: 1px solid rgba(147, 51, 234, 0.2);
}

h2 {
  color: #e9d5ff;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.75rem;
}

.form-group {
  margin-bottom: 1rem;
}

.error-message {
  color: rgb(244, 67, 54);
  text-align: center;
}

.auth-links {
  margin-top: 2rem;
  text-align: center;
  color: #e9d5ff;
}

.auth-links a {
  color: #9333ea;
  text-decoration: none;
  margin-left: 0.5rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.auth-links a:hover {
  color: #a855f7;
  text-decoration: underline;
}

:deep(.v-field__input) {
  color: #e9d5ff !important;
}

:deep(.v-label) {
  color: rgba(233, 213, 255, 0.7) !important;
}

:deep(.v-field) {
  border-color: rgba(147, 51, 234, 0.3) !important;
}

:deep(.v-field--variant-outlined) {
  transition: border-color 0.2s ease;
}

:deep(.v-field--variant-outlined:hover) {
  border-color: rgba(147, 51, 234, 0.5) !important;
}

:deep(.v-field--focused) {
  border-color: #9333ea !important;
}

:deep(.purple-input .v-field.v-field--focused) {
  border-color: #9333ea !important;
}

:deep(.login-btn) {
  background: linear-gradient(135deg, #9333ea, #7928ca) !important;
  transition: opacity 0.2s ease;
}

:deep(.login-btn:hover) {
  opacity: 0.9;
}
</style> 