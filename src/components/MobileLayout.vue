<template>
  <div class="mobile-container">
    <!-- Header -->
    <header class="safe-top bg-background border-b border-border px-4 py-4 flex items-center justify-between shrink-0">
      <div class="flex items-center space-x-3">
        <h1 class="text-2xl font-bold text-foreground">Voice Todos</h1>
        <div v-if="todoStore.isSyncing" class="flex items-center text-sm text-muted-foreground">
          <div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
          Syncing...
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        @click="handleSettingsClick"
        aria-label="Settings"
        class="touch-target"
      >
        <SettingsIcon class="w-6 h-6" />
      </Button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>

    <!-- Bottom Action Bar -->
    <div class="thumb-zone">
      <div class="px-4 py-4 flex items-center justify-center gap-3">
        <!-- Voice Input Button -->
        <Button
          :variant="isRecording ? 'destructive' : 'outline'"
          size="touch"
          class="flex-1 max-w-28"
          :class="{ 'recording-pulse': isRecording }"
          @click="handleVoiceClick"
          :disabled="isProcessing"
        >
          <MicIcon class="w-5 h-5 mr-2" />
          {{ isRecording ? 'Stop' : 'Voice' }}
        </Button>

        <!-- Image Input Button -->
        <Button
          variant="outline"
          size="touch"
          class="flex-1 max-w-28"
          @click="handleImageClick"
          :disabled="isProcessing"
        >
          <CameraIcon class="w-5 h-5 mr-2" />
          Image
        </Button>

        <!-- Text Input Button (always available) -->
        <Button
          variant="default"
          size="touch"
          class="flex-1 max-w-28"
          @click="handleTextClick"
          :disabled="isProcessing"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          Text
        </Button>
      </div>
    </div>

    <!-- Processing Overlay -->
    <div
      v-if="isProcessing"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <Card class="p-6 m-4 text-center max-w-sm">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-sm text-muted-foreground">{{ processingMessage }}</p>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import { useSettingsStore } from '@/stores/settingsStore'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

// Icons (we'll use simple SVG icons for now)
import SettingsIcon from '@/components/icons/SettingsIcon.vue'
import MicIcon from '@/components/icons/MicIcon.vue'
import CameraIcon from '@/components/icons/CameraIcon.vue'
import PlusIcon from '@/components/icons/PlusIcon.vue'

const todoStore = useTodoStore()
const settingsStore = useSettingsStore()

const isRecording = ref(false)
const isProcessing = ref(false)
const processingMessage = ref('')

const emit = defineEmits<{
  settingsClick: []
  voiceClick: []
  imageClick: []
  textClick: []
}>()

const handleSettingsClick = () => {
  settingsStore.triggerHaptic('light')
  emit('settingsClick')
}

const handleVoiceClick = () => {
  settingsStore.triggerHaptic('medium')
  emit('voiceClick')
}

const handleImageClick = () => {
  settingsStore.triggerHaptic('light')
  emit('imageClick')
}

const handleTextClick = () => {
  settingsStore.triggerHaptic('light')
  emit('textClick')
}

// Expose methods for parent components
defineExpose({
  setRecording: (recording: boolean) => {
    isRecording.value = recording
  },
  setProcessing: (processing: boolean, message = '') => {
    isProcessing.value = processing
    processingMessage.value = message
  },
})
</script>
