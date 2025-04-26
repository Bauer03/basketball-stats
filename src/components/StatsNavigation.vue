<template>
  <div class="stats-navigation">
    <div class="nav-links">
      <button 
        class="nav-link" 
        :class="{ active: activeView === 'teams' }"
        @click="setActiveView('teams')"
      >
        <span class="text-subtitle-1">Teams</span>
      </button>
      <button 
        class="nav-link" 
        :class="{ active: activeView === 'players' }"
        @click="setActiveView('players')"
      >
        <span class="text-subtitle-1">Players</span>
      </button>
      <button 
        class="nav-link" 
        :class="{ active: activeView === 'games' }"
        @click="setActiveView('games')"
      >
        <span class="text-subtitle-1">Games</span>
      </button>
    </div>

    <div class="content-container">
      <Teams v-if="activeView === 'teams'" />
      <PlayersView v-if="activeView === 'players'" />
      <Games v-if="activeView === 'games'" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Teams from './Teams.vue'
import Games from './Games.vue'
import PlayersView from '@/views/PlayersView.vue'

const router = useRouter()
const activeView = ref('teams')

const setActiveView = (view) => {
  activeView.value = view
  router.push(`/${view}`)
  window.dispatchEvent(new CustomEvent('stats-view-changed', { detail: view }))
  window.dispatchEvent(new CustomEvent('search-type-changed', { detail: view }))
}

// Update the watch to also sync search type
watch(() => router.currentRoute.value.path, (path) => {
  let view = 'teams'
  if (path.includes('/teams')) {
    view = 'teams'
  } else if (path.includes('/games')) {
    view = 'games'
  } else if (path.includes('/players')) {
    view = 'players'
  }
  activeView.value = view
  window.dispatchEvent(new CustomEvent('search-type-changed', { detail: view }))
}, { immediate: true })
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
</style> 