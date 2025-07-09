<template>
  <div class="audio-player bg-muted/50 rounded-lg p-3 mt-2">
    <div class="flex items-center space-x-3">
      <!-- Play/Pause Button -->
      <button
        @click="togglePlayback"
        class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors touch-target"
        :disabled="!audioUrl"
      >
        <svg
          v-if="!isPlaying"
          class="w-4 h-4 ml-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Progress Bar -->
      <div class="flex-1">
        <div
          class="w-full h-2 bg-border rounded-full cursor-pointer"
          @click="handleSeek"
          ref="progressBarRef"
        >
          <div
            class="h-full bg-primary rounded-full transition-all duration-100"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        
        <!-- Time Display -->
        <div class="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Volume/Info -->
      <div class="text-xs text-muted-foreground">
        🎤
      </div>
    </div>

    <!-- Hidden Audio Element -->
    <audio
      ref="audioRef"
      :src="audioUrl"
      @loadedmetadata="handleLoadedMetadata"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @error="handleError"
      preload="metadata"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

type $Props = {
  audioUrl: string
}

const props = defineProps<$Props>()

const audioRef = ref<HTMLAudioElement>()
const progressBarRef = ref<HTMLDivElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)

const togglePlayback = async () => {
  if (!audioRef.value) return

  try {
    if (isPlaying.value) {
      audioRef.value.pause()
      isPlaying.value = false
    } else {
      await audioRef.value.play()
      isPlaying.value = true
    }
  } catch (error) {
    console.error('Error playing audio:', error)
    isPlaying.value = false
  }
}

const handleSeek = (event: MouseEvent) => {
  if (!audioRef.value || !progressBarRef.value) return

  const rect = progressBarRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = percentage * duration.value

  audioRef.value.currentTime = newTime
  currentTime.value = newTime
  progress.value = percentage * 100
}

const handleLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}

const handleTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
    progress.value = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  }
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
  if (audioRef.value) {
    audioRef.value.currentTime = 0
  }
}

const handleError = (error: Event) => {
  console.error('Audio playback error:', error)
  isPlaying.value = false
}

const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Cleanup on unmount
onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
  }
})
</script>

<style scoped>
.audio-player {
  user-select: none;
}
</style>
