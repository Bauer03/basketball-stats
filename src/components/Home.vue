<!-- Home.vue -->
<template>
  <div class="home">
    <div class="home-content">
      <h1>Welcome to Basketball Stats</h1>
      <p>Track and analyze your favorite basketball teams and players.</p>
      <div class="cta-buttons">
        <v-btn
          to="/register"
          class="cta-button primary"
          size="large"
        >
          Get Started
        </v-btn>
        <v-btn
          to="/login"
          class="cta-button secondary"
          size="large"
          variant="outlined"
        >
          Login
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: var(--spacing-xl);
  background-color: var(--color-bg-primary);
}

.home-content {
  max-width: 800px;
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  box-shadow: 0 4px 6px var(--shadow-color);
}

h1 {
  font-size: 2.5rem;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

p {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.cta-button {
  min-width: 160px;
  font-weight: 500;
  text-transform: none;
}

.cta-button.primary {
  background-color: var(--color-button-bg) !important;
  color: var(--color-button-text) !important;
}

.cta-button.primary:hover {
  background-color: var(--color-button-bg-hover) !important;
  color: var(--color-button-text-hover) !important;
}

.cta-button.secondary {
  border-color: var(--color-button-text) !important;
  color: var(--color-button-text) !important;
  background-color: transparent !important;
}

.cta-button.secondary:hover {
  border-color: var(--color-button-text-hover) !important;
  color: var(--color-button-text-hover) !important;
  background-color: var(--color-button-bg) !important;
}

@media (max-width: 600px) {
  .home-content {
    padding: var(--spacing-lg);
  }

  h1 {
    font-size: 2rem;
  }

  p {
    font-size: 1rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .cta-button {
    width: 100%;
  }
}
</style> 