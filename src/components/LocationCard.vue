<template>
  <div class="LocationCard">
    <!-- Simple map container -->
    <div class="w-full">
      <LocationMap :location="location" />
    </div>
    
    <!-- Open in Maps button -->
    <div class="mt-2">
      <Button
        @click="handleOpenInMaps"
        @keydown="handleKeyDown"
        variant="secondary"
        size="sm"
        class="w-full"
        tabindex="0"
        aria-label="Open location in maps"
      >
        Open in Maps
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LocationMap from '@/components/LocationMap.vue'
import Button from '@/components/ui/Button.vue'
import type { $Location } from '@/types/todo'

type $Props = {
  location: $Location
}

const props = defineProps<$Props>()

const handleOpenInMaps = (): void => {
  const { latitude, longitude } = props.location
  const mapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`
  
  // Try to open in native maps app first, fallback to web
  if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
    window.open(`maps://maps.google.com/maps?q=${latitude},${longitude}`, '_system')
  } else if (navigator.userAgent.includes('Android')) {
    window.open(`geo:${latitude},${longitude}`, '_system')
  } else {
    window.open(mapsUrl, '_blank')
  }
}

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleOpenInMaps()
  }
}
</script>
