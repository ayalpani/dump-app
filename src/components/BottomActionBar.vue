<template>
  <div class="BottomActionBar thumb-zone">
    <div class="px-4 py-4 overflow-x-auto scrollbar-hide">
      <div class="flex items-center gap-3 min-w-max">
        <!-- Voice Input Button -->
        <UiButton
          :variant="isRecording ? 'destructive' : 'outline'"
          size="touch"
          class="flex-shrink-0 min-w-28"
          :class="{ 'recording-pulse': isRecording }"
          @click="handleVoiceClick"
          :disabled="isProcessing"
        >
          <MicIcon :size="20" class="mr-2" />
          {{ isRecording ? 'Stop' : 'Voice' }}
        </UiButton>

        <!-- Image Input Button -->
        <UiButton
          variant="outline"
          size="touch"
          class="flex-shrink-0 min-w-28"
          @click="handleImageClick"
          :disabled="isProcessing"
        >
          <CameraIcon :size="20" class="mr-2" />
          Image
        </UiButton>

        <!-- Location Button -->
        <UiButton
          variant="outline"
          size="touch"
          class="flex-shrink-0 min-w-28"
          @click="handleLocationClick"
          :disabled="isProcessing"
        >
          <LocationIcon :size="20" class="mr-2" />
          Location
        </UiButton>

        <!-- Text Input Button (always available) -->
        <UiButton
          variant="default"
          size="touch"
          class="flex-shrink-0 min-w-28"
          @click="handleTextClick"
          :disabled="isProcessing"
        >
          <PlusIcon :size="20" class="mr-2" />
          Text
        </UiButton>
      </div>
    </div>

    <!-- Hidden file input for image upload -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="handleImageSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useVoiceRecording } from '@/composables/useVoiceRecording'
import UiButton from '@/components/ui/UiButton.vue'

// Icons
import MicIcon from '@/components/icons/MicIcon.vue'
import CameraIcon from '@/components/icons/CameraIcon.vue'
import LocationIcon from '@/components/icons/LocationIcon.vue'
import PlusIcon from '@/components/icons/PlusIcon.vue'

type $Props = {
  isProcessing: boolean
}

type $Emits = {
  'update:processing': [value: boolean]
  'update:processing-message': [message: string]
  'show-text-modal': []
}

defineProps<$Props>()
const emit = defineEmits<$Emits>()

const todoStore = useTodoStore()
const settingsStore = useSettingsStore()
const { isRecording, startRecording, stopRecording } = useVoiceRecording()

const fileInputRef = ref<HTMLInputElement>()
const recordingStartTime = ref<number>(0)

const handleVoiceClick = async (): Promise<void> => {
  settingsStore.triggerHaptic('medium')
  
  try {
    if (isRecording.value) {
      // Stop recording
      emit('update:processing', true)
      emit('update:processing-message', 'Processing audio...')
      
      try {
        const { audioDataUrl, transcribedText } = await stopRecording()
        
        // Calculate audio duration from recording time
        const recordingEndTime = Date.now()
        const audioDuration = (recordingEndTime - recordingStartTime.value) / 1000
        
        // Create todo with transcribed text, audio, and duration
        await todoStore.addTodo({
          text: transcribedText,
          createdVia: 'voice',
          audioUrl: audioDataUrl,
          audioDuration: audioDuration
        })
        
        emit('update:processing', false)
      } catch (error) {
        console.error('Error processing voice recording:', error)
        emit('update:processing', false)
        alert('Error processing voice recording. Please try again.')
      }
    } else {
      // Start recording
      await startRecording()
      recordingStartTime.value = Date.now()
    }
  } catch (error) {
    console.error('Error with voice recording:', error)
    alert('Could not access microphone. Please check permissions.')
  }
}

const handleImageClick = (): void => {
  settingsStore.triggerHaptic('light')
  if (!fileInputRef.value) return
  fileInputRef.value.click()
}

const handleImageSelected = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    emit('update:processing', true)
    emit('update:processing-message', 'Processing image...')
    
    // Create a data URL for the image (local storage)
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const imageUrl = e.target?.result as string
        
        // Create todo with image
        const todoText = `Image uploaded: ${file.name}`
        
        await todoStore.addTodo({
          text: todoText,
          createdVia: 'image',
          imageUrl: imageUrl
        })
        
        emit('update:processing', false)
      } catch (error) {
        console.error('Error adding todo with image:', error)
        emit('update:processing', false)
        alert('Error adding todo with image. Please try again.')
      }
    }
    
    reader.onerror = () => {
      console.error('Error reading file')
      emit('update:processing', false)
      alert('Error reading image file. Please try again.')
    }
    
    reader.readAsDataURL(file)
    
    // Reset the file input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (error) {
    console.error('Error processing image:', error)
    emit('update:processing', false)
    alert('Error processing image. Please try again.')
  }
}

const handleLocationClick = async (): Promise<void> => {
  settingsStore.triggerHaptic('light')
  
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.')
    return
  }

  try {
    emit('update:processing', true)
    emit('update:processing-message', 'Getting location...')

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
    })

    const { latitude, longitude } = position.coords
    const locationText = `Current location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    
    await todoStore.addTodo({
      text: locationText,
      createdVia: 'location',
      location: {
        latitude,
        longitude,
        accuracy: position.coords.accuracy
      }
    })

    emit('update:processing', false)
  } catch (error) {
    console.error('Error getting location:', error)
    emit('update:processing', false)
    
    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert('Location access denied. Please enable location permissions.')
          break
        case error.POSITION_UNAVAILABLE:
          alert('Location information is unavailable.')
          break
        case error.TIMEOUT:
          alert('Location request timed out.')
          break
        default:
          alert('An unknown error occurred while getting location.')
          break
      }
    } else {
      alert('Error getting location. Please try again.')
    }
  }
}

const handleTextClick = (): void => {
  settingsStore.triggerHaptic('light')
  emit('show-text-modal')
}
</script>

<style scoped>
.scrollbar-hide {
  /* Hide scrollbar for Chrome, Safari and Opera */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* WebKit */
}
</style>
