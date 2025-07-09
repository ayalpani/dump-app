<template>
  <Card class="TodoItem p-4">
    <div class="flex items-start space-x-3">
      <!-- Completion Checkbox -->
      <button
        class="mt-1 w-10 h-10 rounded border-2 border-border flex items-center justify-center touch-target"
        :class="{
          'bg-primary border-primary': todo.completed,
          'hover:border-primary': !todo.completed
        }"
        @click="handleToggle"
        @keydown="handleKeyDown"
        aria-label="Toggle todo completion"
        tabindex="0"
      >
        <svg
          v-if="todo.completed"
          class="w-6 h-6 text-primary-foreground"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Todo Content -->
      <div class="flex-1 min-w-0">
        <p
          class="text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
          :class="{
            'line-through text-muted-foreground': todo.completed,
            'text-foreground': !todo.completed
          }"
          @click="handleCopyText"
          @keydown="handleCopyTextKeyDown"
          aria-label="Click to copy text to clipboard"
          tabindex="0"
          role="button"
        >
          {{ todo.text }}
        </p>
        
        <!-- Image if present -->
        <div v-if="todo.imageUrl" class="mt-2 relative group">
          <img
            :src="todo.imageUrl"
            alt="Todo image"
            class="max-w-full h-32 object-cover rounded"
          />
          <!-- Download button overlay -->
          <button
            @click="handleDownloadImage"
            @keydown="handleDownloadKeyDown"
            class="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity touch-target"
            aria-label="Download image"
            tabindex="0"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        
        <!-- Audio player if present -->
        <AudioPlayer
          v-if="todo.audioUrl"
          :audioUrl="todo.audioUrl"
          :audioDuration="todo.audioDuration"
        />
        
        <!-- Location card if present -->
        <div v-if="todo.location" class="mt-2">
          <LocationCard :location="todo.location" />
        </div>
        
        <!-- Metadata -->
        <div class="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
          <span class="capitalize font-bold">{{ todo.createdVia }}</span>
          <span>•</span>
          <span>{{ formatDate(todo.createdAt instanceof Date ? todo.createdAt : new Date(todo.createdAt)) }}</span>
        </div>
      </div>

      <!-- Delete Button -->
      <button
        class="text-muted-foreground hover:text-destructive touch-target"
        @click="handleDelete"
        @keydown="handleDeleteKeyDown"
        aria-label="Delete todo"
        tabindex="0"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { formatDate } from '@/lib/utils'
import { useTodoStore } from '@/stores/todoStore'
import Card from '@/components/ui/Card.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import LocationCard from '@/components/LocationCard.vue'
import type { $Todo } from '@/types/todo'

type $Props = {
  todo: $Todo
}

const props = defineProps<$Props>()
const todoStore = useTodoStore()

const handleToggle = async (): Promise<void> => {
  try {
    await todoStore.toggleTodo(props.todo.id)
  } catch (error) {
    console.error('Failed to toggle todo:', error)
  }
}

const handleDelete = async (): Promise<void> => {
  try {
    await todoStore.deleteTodo(props.todo.id)
  } catch (error) {
    console.error('Failed to delete todo:', error)
  }
}

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleToggle()
  }
}

const handleDeleteKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleDelete()
  }
}

const handleCopyText = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(props.todo.text)
    // You could add a toast notification here if you have one
    console.log('Text copied to clipboard')
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = props.todo.text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      console.log('Text copied to clipboard (fallback)')
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
    }
  }
}

const handleCopyTextKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleCopyText()
  }
}

const handleDownloadImage = async (): Promise<void> => {
  if (!props.todo.imageUrl) return

  try {
    const response = await fetch(props.todo.imageUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `todo-image-${props.todo.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(url)
    console.log('Image downloaded')
  } catch (error) {
    console.error('Failed to download image:', error)
  }
}

const handleDownloadKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleDownloadImage()
  }
}
</script>
