<template>
  <div class="stats-navigation">
    <div class="nav-links">
      <button 
        class="nav-link" 
        :class="{ active: activeView === 'teams' }"
        @click="activeView = 'teams'"
      >
        <span class="text-subtitle-1">Teams</span>
      </button>
      <button 
        class="nav-link" 
        :class="{ active: activeView === 'games' }"
        @click="activeView = 'games'"
      >
        <span class="text-subtitle-1">Games</span>
      </button>
      <button 
        class="nav-link" 
        :class="{ active: activeView === 'players' }"
        @click="activeView = 'players'"
      >
        <span class="text-subtitle-1">Players</span>
      </button>
    </div>

    <div class="content-container">
      <Teams v-if="activeView === 'teams'" />
      <Games v-if="activeView === 'games'" />
      <div v-if="activeView === 'players'" class="coming-soon">
        <h2>Players View Coming Soon</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Teams from './Teams.vue'
import Games from './Games.vue'

const activeView = ref('teams')
</script>

<style scoped>
.stats-navigation {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-links {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(147, 51, 234, 0.2);
}

.nav-link {
  background: none;
  border: none;
  padding: 0.5rem 0;
  cursor: pointer;
  position: relative;
  color: #e9d5ff;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #9333ea;
  transition: width 0.2s ease;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.content-container {
  min-height: calc(100vh - 200px);
}

.coming-soon {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #e9d5ff;
  font-size: 1.5rem;
  opacity: 0.7;
}
</style> 