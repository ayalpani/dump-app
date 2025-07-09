<template>
  <div id="app" class="App">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import { useDeviceStore } from '@/stores/deviceStore'

const todoStore = useTodoStore()
const deviceStore = useDeviceStore()

// Initialize the app
onMounted(async () => {
  try {
    // Initialize device
    await deviceStore.initializeDevice()
    
    // Load todos
    await todoStore.loadTodos()
    
    // Load data usage
    await deviceStore.loadDataUsage()
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
