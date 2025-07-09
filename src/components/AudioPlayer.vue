<template>
  <div class="AudioPlayer audio-player bg-muted/50 rounded-lg p-3 mt-2">
    <div class="flex items-center space-x-3">
      <!-- Play/Pause Button -->
      <button
        @click="togglePlayback"
        class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors touch-target"
        :disabled="!audioUrl"
      >
        <svg
          v-if="!isPlaying"
          class="w-12 h-12"
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
          class="w-12 h-12"
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
          class="w-full h-4 bg-border rounded-full cursor-pointer overflow-hidden"
          @click="handleSeek"
          ref="progressBarRef"
        >
          <div
            class="h-full bg-primary rounded-full"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        
        <!-- Time Display -->
        <div class="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <!-- Hidden Audio Element -->
    <audio
      ref="audioRef"
      :src="audioUrl"
      @loadedmetadata="handleLoadedMetadata"
      @loadeddata="handleLoadedData"
      @canplay="handleCanPlay"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @error="handleError"
      @play="handlePlay"
      @pause="handlePause"
      preload="metadata"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'

type $Props = {
  audioUrl: string
  audioDuration?: number // Duration in seconds from metadata
}

const props = defineProps<$Props>()

const audioRef = ref<HTMLAudioElement>()
const progressBarRef = ref<HTMLDivElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
let animationFrameId: number | null = null

// Watch for audioUrl changes to reset state
watch(() => props.audioUrl, () => {
  resetAudioState()
  if (props.audioUrl && audioRef.value) {
    // Force reload the audio
    audioRef.value.load()
  }
})

// Watch for audioDuration prop changes
watch(() => props.audioDuration, (newDuration) => {
  if (newDuration && newDuration > 0) {
    duration.value = newDuration
    console.log('Duration set from metadata:', newDuration)
  }
}, { immediate: true })

const resetAudioState = () => {
  isPlaying.value = false
  currentTime.value = 0
  // Only reset duration if we don't have metadata duration
  if (!props.audioDuration) {
    duration.value = 0
  }
  progress.value = 0
}

const togglePlayback = async () => {
  if (!audioRef.value || !props.audioUrl) return

  try {
    if (isPlaying.value) {
      audioRef.value.pause()
    } else {
      await audioRef.value.play()
    }
  } catch (error) {
    console.error('Error playing audio:', error)
    isPlaying.value = false
  }
}

const handleSeek = (event: MouseEvent) => {
  if (!audioRef.value || !progressBarRef.value || duration.value === 0) return

  const rect = progressBarRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, clickX / rect.width))
  const newTime = percentage * duration.value

  // Update progress immediately without animation
  const newProgress = percentage * 100
  progress.value = Math.max(0, Math.min(100, newProgress))
  currentTime.value = newTime

  // Set audio time
  audioRef.value.currentTime = newTime
}

const handleLoadedMetadata = () => {
  if (audioRef.value && isFinite(audioRef.value.duration) && audioRef.value.duration > 0) {
    duration.value = audioRef.value.duration
    console.log('Duration loaded:', duration.value)
  }
}

const handleLoadedData = () => {
  if (audioRef.value && isFinite(audioRef.value.duration) && audioRef.value.duration > 0) {
    duration.value = audioRef.value.duration
    console.log('Duration from loadeddata:', duration.value)
  }
}

const handleCanPlay = () => {
  if (audioRef.value && isFinite(audioRef.value.duration) && audioRef.value.duration > 0) {
    duration.value = audioRef.value.duration
    console.log('Duration from canplay:', duration.value)
  }
}

const handleTimeUpdate = () => {
  if (!audioRef.value) return
  
  const audio = audioRef.value
  
  // Try to get duration if we don't have it yet - this is crucial for WebM recordings
  // But only update if we don't already have a valid duration to prevent jumping
  if (duration.value === 0 && isFinite(audio.duration) && audio.duration > 0) {
    duration.value = audio.duration
    console.log('Duration from timeupdate:', duration.value)
  }
  
  // For WebM recordings that don't provide duration until playing, 
  // we can estimate based on buffered ranges - but only if we don't have duration yet
  if (duration.value === 0 && audio.buffered.length > 0) {
    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1)
    if (bufferedEnd > 0) {
      duration.value = bufferedEnd
      console.log('Duration estimated from buffered:', duration.value)
    }
  }
  
  // Only update progress here if we're not playing (to avoid conflicts with smooth animation)
  if (!isPlaying.value && isFinite(audio.currentTime)) {
    currentTime.value = audio.currentTime
    if (duration.value > 0) {
      const calculatedProgress = (currentTime.value / duration.value) * 100
      progress.value = Math.max(0, Math.min(100, calculatedProgress))
    }
  }
}

const updateProgressSmooth = () => {
  if (!audioRef.value || !isPlaying.value) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    return
  }

  const audio = audioRef.value
  
  // Update current time
  if (isFinite(audio.currentTime)) {
    currentTime.value = audio.currentTime
  }
  
  // Update progress with proper bounds checking
  if (duration.value > 0 && isFinite(currentTime.value)) {
    const calculatedProgress = (currentTime.value / duration.value) * 100
    // Clamp progress between 0 and 100 to prevent overflow
    progress.value = Math.max(0, Math.min(100, calculatedProgress))
  }

  // Continue animation loop
  animationFrameId = requestAnimationFrame(updateProgressSmooth)
}

const handlePlay = () => {
  isPlaying.value = true
  
  // Try to get duration when playing starts
  if (audioRef.value && duration.value === 0 && isFinite(audioRef.value.duration) && audioRef.value.duration > 0) {
    duration.value = audioRef.value.duration
    console.log('Duration from play event:', duration.value)
  }

  // Start smooth progress animation
  updateProgressSmooth()
}

const handlePause = () => {
  isPlaying.value = false
  
  // Stop smooth progress animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
  
  // Stop smooth progress animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  if (audioRef.value) {
    audioRef.value.currentTime = 0
  }
}

const handleError = (error: Event) => {
  console.error('Audio playback error:', error)
  isPlaying.value = false
}

const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds) || seconds < 0) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Cleanup on unmount
onUnmounted(() => {
  // Stop smooth progress animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
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

/* Ensure progress bar never overflows its container */
.audio-player .w-full.h-2.bg-border {
  overflow: hidden;
}

.audio-player .h-full.bg-primary {
  max-width: 100%;
  min-width: 0;
}
</style>
