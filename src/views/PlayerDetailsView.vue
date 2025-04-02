<template>
  <div class="player-details-container">
    <div v-if="error" class="mt-4">
      <v-alert type="error" text="Failed to load player details. Please try again."></v-alert>
    </div>

    <div v-else-if="loading" class="d-flex justify-center my-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      ></v-progress-circular>
    </div>

    <div v-else-if="player" class="player-content">
      <div class="d-flex align-center mb-6">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          size="small"
          class="mr-4"
          @click="$router.back()"
        ></v-btn>
        <h1 class="text-h4 font-weight-bold">{{ player.name }}</h1>
      </div>

      <v-row>
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-item>
              <div class="d-flex align-center mb-4">
                <v-avatar
                  color="surface-variant"
                  size="64"
                  class="mr-4"
                >
                  <v-icon size="42" color="primary">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <v-card-title class="text-h5 pa-0">{{ player.name }}</v-card-title>
                  <v-card-subtitle class="pa-0">{{ player.team }}</v-card-subtitle>
                </div>
              </div>
              
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-basketball</v-icon>
                  </template>
                  <v-list-item-title>Position</v-list-item-title>
                  <v-list-item-subtitle>{{ player.position || 'N/A' }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-tshirt-crew</v-icon>
                  </template>
                  <v-list-item-title>Jersey Number</v-list-item-title>
                  <v-list-item-subtitle>#{{ player.jersey || 'N/A' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card>
            <v-card-item>
              <v-card-title class="text-h6 mb-4">Season Statistics</v-card-title>
              <div v-if="playerStats" class="stats-grid">
                <!-- Add player statistics here -->
                <div class="stat-item">
                  <div class="stat-value">{{ playerStats.gamesPlayed || 0 }}</div>
                  <div class="stat-label">Games Played</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ playerStats.pointsPerGame || '0.0' }}</div>
                  <div class="stat-label">Points Per Game</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ playerStats.assistsPerGame || '0.0' }}</div>
                  <div class="stat-label">Assists Per Game</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ playerStats.reboundsPerGame || '0.0' }}</div>
                  <div class="stat-label">Rebounds Per Game</div>
                </div>
              </div>
              <div v-else class="text-center pa-4">
                No statistics available for this player.
              </div>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="d-flex justify-center my-8">
      <v-alert type="info" text="Player not found."></v-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayersStore } from '@/stores/players'

const route = useRoute()
const playersStore = usePlayersStore()

const player = ref(null)
const playerStats = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchPlayerDetails = async () => {
  try {
    loading.value = true
    error.value = null
    
    const playerId = route.params.id
    const result = await playersStore.fetchPlayerById(playerId)
    player.value = result.player
    playerStats.value = result.stats
  } catch (err) {
    error.value = err.message
    console.error('Failed to fetch player details:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlayerDetails()
})
</script>

<style scoped>
.player-details-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--v-primary-base);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style> 