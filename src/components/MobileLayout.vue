<template>
  <div class="MobileLayout mobile-container">
    <!-- Header -->
    <header class="safe-top bg-background border-b border-border px-4 py-4 flex items-center justify-between shrink-0">
      <div class="flex items-center space-x-3">
        <h1 class="text-2xl font-bold text-foreground">Dump App</h1>
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
        <SettingsIcon :size="20" />
      </Button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>

    <!-- Bottom Action Bar -->
    <BottomActionBar
      :is-processing="isProcessing"
      @update:processing="isProcessing = $event"
      @update:processing-message="processingMessage = $event"
      @show-text-modal="showTextModal = true"
    />

    <!-- Text Input Modal -->
    <TextInputModal
      :is-visible="showTextModal"
      @submit="handleAddTextTodo"
      @cancel="handleCancelTextModal"
    />

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
import TextInputModal from '@/components/TextInputModal.vue'
import BottomActionBar from '@/components/BottomActionBar.vue'

// Icons
import SettingsIcon from '@/components/icons/SettingsIcon.vue'

const todoStore = useTodoStore()
const settingsStore = useSettingsStore()

const isProcessing = ref(false)
const processingMessage = ref('')
const showTextModal = ref(false)

const handleSettingsClick = (): void => {
  settingsStore.triggerHaptic('light')
  // TODO: Implement settings modal
  console.log('Settings clicked')
}

const handleAddTextTodo = async (text: string) => {
  try {
    await todoStore.addTodo({
      text,
      createdVia: 'text',
    })
    
    showTextModal.value = false
  } catch (error) {
    console.error('Failed to add todo:', error)
  }
}

const handleCancelTextModal = () => {
  showTextModal.value = false
}
</script>
