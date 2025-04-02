<!-- Home.vue -->
<template>
  <div class="home">
    <h1>Welcome to Basketball Stats</h1>
    <p>Track and analyze your favorite basketball teams and players.</p>
    <div class="cta-buttons">
      <router-link to="/register" class="cta-button">Get Started</router-link>
      <router-link to="/login" class="cta-button secondary">Login</router-link>
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
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cta-button:first-child {
  background-color: #1a1a1a;
  color: white;
}

.cta-button.secondary {
  background-color: transparent;
  color: #1a1a1a;
  border: 2px solid #1a1a1a;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 