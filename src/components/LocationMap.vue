<template>
  <div class="LocationMap mt-2">
    <div 
      ref="mapContainer" 
      class="w-full h-32 rounded border border-border"
      :id="mapId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { $Location } from '@/types/todo'

// Import Leaflet dynamically to avoid SSR issues
let L: any = null

type $Props = {
  location: $Location
}

const props = defineProps<$Props>()

const mapContainer = ref<HTMLElement>()
const mapId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
let map: any = null

const initializeMap = async (): Promise<void> => {
  if (!mapContainer.value) return

  try {
    // Dynamically import Leaflet
    L = await import('leaflet')
    
    // Import Leaflet CSS
    const leafletCSS = document.createElement('link')
    leafletCSS.rel = 'stylesheet'
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    leafletCSS.crossOrigin = ''
    document.head.appendChild(leafletCSS)

    await nextTick()

    // Create the map
    map = L.map(mapContainer.value, {
      center: [props.location.latitude, props.location.longitude],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      attributionControl: true
    })

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    // Add simple marker
    const marker = L.marker([props.location.latitude, props.location.longitude]).addTo(map)

    // Add popup with coordinates
    const accuracyText = props.location.accuracy 
      ? ` (±${Math.round(props.location.accuracy)}m)` 
      : ''
    
    marker.bindPopup(`
      <div style="text-align: center; font-size: 12px;">
        <strong>Location</strong><br>
        ${props.location.latitude.toFixed(6)}, ${props.location.longitude.toFixed(6)}${accuracyText}
      </div>
    `)

    // Invalidate size after a short delay to ensure proper rendering
    setTimeout(() => {
      if (map) {
        map.invalidateSize()
      }
    }, 100)

  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

onMounted(async () => {
  await initializeMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style>
/* Ensure Leaflet controls are properly styled */
.leaflet-container {
  font-family: inherit;
}

.leaflet-popup-content-wrapper {
  border-radius: 4px;
}

.leaflet-popup-tip {
  background: white;
}
</style>
