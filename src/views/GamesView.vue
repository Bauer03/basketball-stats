<template>
  <div class="view-container">
    <nav class="view-navigation">
      <router-link 
        to="/teams" 
        class="nav-link"
        :class="{ active: $route.path === '/teams' }"
        @click="updateSearchType('teams')"
      >
        Teams
      </router-link>
      <router-link 
        to="/players" 
        class="nav-link"
        :class="{ active: $route.path === '/players' }"
        @click="updateSearchType('players')"
      >
        Players
      </router-link>
      <router-link 
        to="/games" 
        class="nav-link"
        :class="{ active: $route.path === '/games' }"
        @click="updateSearchType('games')"
      >
        Games
      </router-link>
    </nav>

    <div class="games-container">
      <div class="games-header">
        <h1 class="text-h4 font-weight-bold mb-6">Games</h1>
      </div>
      <Games ref="gamesComponent" @search-select="handleSearchSelection" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Games from '@/components/Games.vue'

const gamesComponent = ref(null)

const handleSearchSelection = (selection) => {
  // Forward the search selection event to the Games component
  gamesComponent.value?.handleSearchSelection(selection)
}

const updateSearchType = (type) => {
  // Dispatch a custom event to update the search type
  window.dispatchEvent(new CustomEvent('stats-view-changed', { 
    detail: type 
  }))
}

onMounted(() => {
  // Set the search type to 'games' when the component is mounted
  updateSearchType('games')
})
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

.games-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.games-header {
  margin-bottom: 2rem;
}
</style> 