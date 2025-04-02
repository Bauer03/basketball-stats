<template>
  <div class="search-container">
    <div class="search-wrapper">
      <div class="search-bar">
        <v-text-field
          v-model="displayQuery"
          :placeholder="placeholderText"
          variant="outlined"
          density="comfortable"
          hide-details
          class="search-input"
          @keydown.tab.prevent="cycleSearchType"
          @keydown.enter="handleSearch"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          ref="searchInput"
          :prepend-inner-icon="isSearching ? 'mdi-loading mdi-spin' : 'mdi-magnify'"
          bg-color="surface"
          rounded="xl"
          :style="{ '--v-theme-surface': 'rgba(147, 51, 234, 0.1)' }"
          :readonly="isSearching"
        >
        </v-text-field>
        <v-btn
          class="search-type-btn"
          :color="searchType.toLowerCase()"
          variant="text"
          @click="cycleSearchType"
          @mousedown.prevent
        >
          {{ searchType }}
        </v-btn>
      </div>

      <v-menu
        v-model="showResults"
        :close-on-content-click="false"
        location="bottom"
        offset="10"
        transition="scale-transition"
        min-width="100%"
        :z-index="9999"
      >
        <template v-slot:activator="{ props }">
          <div v-bind="props" style="width: 100%; height: 0;"></div>
        </template>

        <v-card class="search-results-card">
          <SearchResults
            :type="searchType"
            :is-loading="isSearching"
            :is-visible="true"
            :teams="searchResults?.teams || []"
            :players="searchResults?.players || []"
            :games="searchResults?.games || []"
            @select="handleSelect"
          />
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSearch } from '@/composables/useSearch'
import SearchResults from './SearchResults.vue'

const emit = defineEmits(['select'])

const searchTypes = ['Teams', 'Players', 'Games']
const currentTypeIndex = ref(0)
const searchQuery = ref('')
const displayQuery = ref('')
const searchInput = ref(null)
const showResults = ref(false)

const { searchResults, isLoading: isSearching, debouncedSearch } = useSearch()

const searchType = computed(() => searchTypes[currentTypeIndex.value])
const hasResults = computed(() => {
  if (!searchResults) return false
  
  switch (searchType.value) {
    case 'Teams':
      return searchResults.teams?.length > 0
    case 'Players':
      return searchResults.players?.length > 0
    case 'Games':
      return searchResults.games?.length > 0
    default:
      return false
  }
})

const placeholderText = computed(() => {
  switch (searchType.value) {
    case 'Teams':
      return 'Search for teams...'
    case 'Players':
      return 'Search for players...'
    case 'Games':
      return 'Search for games...'
    default:
      return 'Search...'
  }
})

const cycleSearchType = () => {
  currentTypeIndex.value = (currentTypeIndex.value + 1) % searchTypes.length
  if (displayQuery.value) {
    debouncedSearch(displayQuery.value, searchType.value)
  }
}

const handleInput = () => {
  showResults.value = true
  debouncedSearch(displayQuery.value, searchType.value)
}

const handleSearch = () => {
  if (!displayQuery.value.trim() || isSearching.value) return
  showResults.value = true
  debouncedSearch(displayQuery.value, searchType.value, 0)
}

const handleSelect = (item) => {
  emit('select', { type: searchType.value, item })
  showResults.value = false
  displayQuery.value = ''
}

const handleFocus = () => {
  showResults.value = true
}

const handleBlur = () => {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

// Remove debug watchers
watch(searchResults, () => {}, { deep: true })
watch(showResults, () => {})
watch(isSearching, () => {})

onMounted(() => {
  // Add a slight delay to ensure focus animation triggers
  setTimeout(() => {
    searchInput.value.$el.querySelector('input').focus()
  }, 100)
})

// Expose search functionality to parent components
defineExpose({
  searchQuery,
  searchType
})
</script>

<style scoped>
.search-container {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 9999;
}

.search-wrapper {
  position: relative;
  z-index: 9999;
  width: 100%;
}

.search-bar {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 9999;
}

.search-type-btn {
  position: absolute;
  right: 0.7rem;
  z-index: 1;
  font-weight: 500;
  text-transform: capitalize;
  background-color: var(--color-button-bg) !important;
  color: var(--color-button-text) !important;
  transition: all 0.2s ease;
  border-radius: var(--radius-full) !important;
  height: max-content;
}

.search-type-btn:hover {
  background-color: var(--color-button-bg-hover) !important;
  color: var(--color-button-text-hover) !important;
}

.search-results-card {
  background-color: var(--color-bg-elevated) !important;
  border: 1px solid var(--color-border-light) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: 0 4px 20px var(--shadow-color) !important;
}

:deep(.v-field) {
  border-radius: var(--radius-full) !important;
  background: var(--searchbar-bg) !important;
  padding-right: 100px !important;
  transition: all 0.2s ease !important;
  position: relative;
  z-index: 9999;
}

:deep(.v-field__input) {
  color: var(--color-text-primary) !important;
  padding: var(--spacing-md) var(--spacing-lg) !important;
  position: relative;
  z-index: 9999;
}

:deep(.v-field__prepend-inner) {
  padding-inline-start: var(--spacing-lg) !important;
  color: var(--color-interactive) !important;
  transition: all 0.2s ease;
  position: relative;
  z-index: 9999;
}

:deep(.mdi-spin) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(input::placeholder) {
  color: var(--color-text-muted) !important;
}

:deep(.v-progress-circular) {
  margin-right: var(--spacing-md);
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style> 