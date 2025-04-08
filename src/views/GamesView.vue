<template>
  <div class="view-container">
    <nav class="view-navigation">
      <router-link 
        to="/teams" 
        class="nav-link"
        :class="{ active: $route.path === '/teams' }"
      >
        Teams
      </router-link>
      <router-link 
        to="/players" 
        class="nav-link"
        :class="{ active: $route.path === '/players' }"
      >
        Players
      </router-link>
      <router-link 
        to="/games" 
        class="nav-link"
        :class="{ active: $route.path === '/games' }"
      >
        Games
      </router-link>
    </nav>

    <Games ref="gamesComponent" @search-select="handleSearchSelection" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Games from '@/components/Games.vue'

const gamesComponent = ref(null)

const handleSearchSelection = (selection) => {
  // Forward the search selection event to the Games component
  gamesComponent.value?.handleSearchSelection(selection)
}
</script>

<style scoped>
.view-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.view-navigation {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(147, 51, 234, 0.2);
}

.nav-link {
  color: rgba(233, 213, 255, 0.7);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #e9d5ff;
  background: rgba(147, 51, 234, 0.1);
}

.nav-link.active {
  color: #e9d5ff;
  background: rgba(147, 51, 234, 0.2);
}
</style> 