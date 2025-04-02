<template>
  <div class="search-container">
    <div class="search-wrapper">
      <div class="search-type-indicator">
        Searching {{ searchType }}
      </div>
      <div class="search-bar">
        <v-text-field
          v-model="displayQuery"
          :placeholder="`'tab' to cycle | Search ${searchType.toLowerCase()}...`"
          variant="outlined"
          density="comfortable"
          hide-details
          class="search-input"
          @keydown.tab.prevent="cycleSearchType"
          @keydown.enter="handleSearch"
          ref="searchInput"
          prepend-inner-icon="mdi-magnify"
          bg-color="surface"
          rounded="xl"
          :style="{ '--v-theme-surface': 'rgba(147, 51, 234, 0.1)' }"
          :readonly="isSearching"
        >
        </v-text-field>
        <Transition name="fade">
          <v-progress-circular
            v-if="isSearching"
            indeterminate
            color="rgb(233, 213, 255)"
            size="24"
            width="2"
            class="search-loader"
          ></v-progress-circular>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const searchTypes = ['Teams', 'Players', 'Games']
const currentTypeIndex = ref(0)
const searchQuery = ref('')
const displayQuery = ref('')
const searchInput = ref(null)
const isSearching = ref(false)

const searchType = computed(() => searchTypes[currentTypeIndex.value])

const cycleSearchType = () => {
  currentTypeIndex.value = (currentTypeIndex.value + 1) % searchTypes.length
}

const handleSearch = async () => {
  if (!displayQuery.value.trim() || isSearching.value) return
  
  // Save the current query
  searchQuery.value = displayQuery.value
  isSearching.value = true
  
  try {
    // Simulate API call - replace this with your actual search logic
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // If search is successful, you can emit the results
    // emit('search-complete', results)
  } catch (error) {
    // Handle error case
    console.error('Search failed:', error)
  } finally {
    isSearching.value = false
    // Restore the query
    displayQuery.value = searchQuery.value
  }
}

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
  max-width: 600px;
  margin: 0 auto;
}

.search-wrapper {
  position: relative;
}

.search-type-indicator {
  position: absolute;
  top: calc(-1 * var(--spacing-xl));
  left: var(--spacing-md);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.search-bar {
  width: 100%;
  position: relative;
}

.search-loader {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

:deep(.v-field) {
  border-radius: var(--radius-full) !important;
  background: var(--searchbar-bg) !important;
  border: 1px solid var(--color-border-light) !important;
}

:deep(.v-field:hover) {
  background: var(--searchbar-bg-hover) !important;
  border-color: var(--color-border-medium) !important;
}

:deep(.v-field:focus-within) {
  background: var(--searchbar-bg-focus) !important;
}

:deep(.v-field__input) {
  color: var(--color-text-primary) !important;
  padding: var(--spacing-sm) var(--spacing-md) !important;
}

:deep(.v-field__prepend-inner) {
  padding-inline-start: var(--spacing-md) !important;
  color: var(--color-interactive) !important;
  opacity: v-bind(isSearching ? 0 : 1);
  transition: opacity 0.2s ease;
}

:deep(input::placeholder) {
  color: var(--color-text-muted) !important;
}

:deep(.v-progress-circular) {
  margin-right: var(--spacing-md);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 