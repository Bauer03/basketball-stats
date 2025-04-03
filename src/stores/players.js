import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { handleApiResponse } from '../utils/api-errors';

const API_BASE_URL = 'https://csci-430-server-dubbabadgmf8hpfk.eastus2-01.azurewebsites.net';

export const usePlayersStore = defineStore('players', {
  state: () => ({
    players: [], // Holds the list of players from search/list view
    currentPlayer: null, // Holds details of the currently viewed player
    currentPlayerStats: null, // Holds stats for the currently viewed player (for a specific season)
    loading: false,
    error: null,
    perPage: 25, // Default items per page for pagination
    cursor: null, // Current cursor for player list pagination
    nextCursor: null // Next cursor for player list pagination
  }),

  getters: {
    // Check if there are any players loaded in the list
    hasPlayers: (state) => state.players.length > 0,
    // Check if there is a player loaded in the detail view
    hasCurrentPlayer: (state) => !!state.currentPlayer,
    // Check if more players can be loaded via pagination
    canLoadMore: (state) => !!state.nextCursor
  },

  actions: {
    /**
     * Searches for players based on query and options.
     * Uses cursor pagination.
     * Corresponds to GET /players endpoint.
     * @param {string} query - Search term for player name.
     * @param {object} options - Options like cursor.
     */
    async searchPlayers(query = '', options = {}) {
      this.loading = true;
      this.error = null;

      try {
        const userStore = useUserStore();
        const queryParams = new URLSearchParams({
          per_page: this.perPage // Use state's perPage setting
        });

        // Use 'name-search' as specified in documentation
        if (query) {
          queryParams.append('name-search', query);
        }
        // Append cursor if provided for pagination
        if (options.cursor) {
          queryParams.append('cursor', options.cursor);
        }
        // Note: team_ids[], season, position are NOT supported by GET /players according to docs

        const url = `${API_BASE_URL}/players?${queryParams.toString()}`;
        console.log('Fetching players from:', url);

        const response = await fetch(url, {
          headers: {
            // Send auth token even if docs say not required, API might expect it
            'Authorization': `Bearer ${userStore.token}`
          }
        });

        const data = await handleApiResponse(response); 

        if (options.cursor) {
          this.players = [...this.players, ...data.data]; 
        } else {
          this.players = data.data; 
        }

        this.cursor = options.cursor || null; 
        this.nextCursor = data.meta?.next_cursor || null; 

        return data; 
      } catch (err) {
        console.error('Error in searchPlayers:', {
          message: err.message, status: err.status, query, options
        });
        this.error = err.message || 'Failed to search players';
        this.players = []; // resetting players on error, not sure if this is good but...
        this.nextCursor = null;
        throw err; 
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetches detailed information and stats for a specific player by their ID.
     * Corresponds to GET /players/:id endpoint.
     * @param {number|string} playerId - The ID of the player to fetch.
     * @param {number} season - The season year to fetch stats for (optional).
     */
    async fetchPlayerById(playerId, season = null) { // Use null or a recent default year
      this.loading = true;
      this.error = null;
      this.currentPlayer = null; // Clear previous player data
      this.currentPlayerStats = null;

      if (!playerId) {
          this.error = "Player ID is required.";
          this.loading = false;
          return; // Or throw error
      }

      try {
        const userStore = useUserStore();
        const queryParams = new URLSearchParams();
        // Add season parameter if provided, to filter stats
        if (season) {
          queryParams.append('season', season);
        }

        // Construct URL according to documentation & example response
        const url = `${API_BASE_URL}/players/${playerId}${queryParams.toString() ? '?' + queryParams : ''}`;
        console.log('Fetching player details & stats from:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        });

        const data = await handleApiResponse(response); // Expects { player: { data: {...} }, stats: { data: [{...}] } }
        // Update state based on the actual response structure provided
        this.currentPlayer = data.player?.data || null;
        // Stats are nested in data array, take the first element if it exists
        this.currentPlayerStats = data.stats?.data?.[0] || data.stats || null;

        // Return the structured data
        return {
          player: this.currentPlayer,
          stats: this.currentPlayerStats
        };

      } catch (err) {
        console.error('Error in fetchPlayerById:', {
          message: err.message, status: err.status, playerId, season
        });
        this.error = err.status === 404 ? 'Player not found' : (err.message || 'Failed to fetch player details');
        throw err; // Re-throw for component handling
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetches the game log for a specific player between two dates.
     * Uses cursor pagination.
     * Corresponds to GET /games/:player_id/:start_date/:end_date endpoint.
     * @param {number|string} playerId 
     * @param {string} startDate 
     * @param {string} endDate
     * @param {string|null} cursor
     */
    async fetchPlayerGameLog(playerId, startDate, endDate, cursor = null) {
      this.loading = true;
      this.error = null;

      if (!playerId || !startDate || !endDate) {
        this.error = "Player ID, start date, and end date are required.";
        this.loading = false;
        return;
      }

      try {
        const userStore = useUserStore();
        const queryParams = new URLSearchParams({
          per_page: this.perPage
        });

        if (cursor) {
          queryParams.append('cursor', cursor);
        }

        const url = `${API_BASE_URL}/games/${playerId}/${startDate}/${endDate}?${queryParams.toString()}`;
        console.log('Fetching player game log from:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        });

        const data = await handleApiResponse(response); 
        return data;

      } catch (err) {
        console.error('Error in fetchPlayerGameLog:', {
          message: err.message, status: err.status, playerId, startDate, endDate, cursor
        });
        this.error = err.status === 404 ? 'No game log found for this player/date range' : (err.message || 'Failed to fetch player game log');
        console.log("There's been an error:",await response.json());
        throw err; // Re-throw for component handling
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clears the currently selected player details and stats from the state.
     */
    clearCurrentPlayer() {
      this.currentPlayer = null;
      this.currentPlayerStats = null;
    },

    /**
     * Resets the player list and pagination cursors.
     * Useful before performing a new search.
     */
    resetPagination() {
      this.players = [];
      this.cursor = null;
      this.nextCursor = null;
    }
  }
});