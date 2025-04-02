<div class="details-header d-flex flex-column gap-4">
  <div class="header-left">
    <h2 class="text-h4">{{ selectedPlayer.first_name }} {{ selectedPlayer.last_name }}</h2>
    <div class="player-info">
      <div class="conference-badge" :class="selectedPlayer.team.conference.toLowerCase()">
        {{ selectedPlayer.team.conference }}
      </div>
      <div class="jersey-number">
        #{{ selectedPlayer.jersey_number }}
      </div>
    </div>
  </div>
  <v-btn color="primary" variant="outlined" @click="showPlayerDetails = true" class="mt-4">
    View Full Details
  </v-btn>
</div>

<style scoped>
.player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style> 