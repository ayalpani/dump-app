<template>
  <div id="app">
    <MobileLayout
      ref="layoutRef"
      @settings-click="handleSettingsClick"
      @voice-click="handleVoiceClick"
      @image-click="handleImageClick"
      @text-click="handleTextClick"
    >
      <!-- Todo List Content -->
      <div class="h-full flex flex-col">
        <!-- Empty State -->
        <div
          v-if="todoStore.totalTodos === 0 && !todoStore.isLoading"
          class="flex-1 flex items-center justify-center p-8 text-center"
        >
          <div class="max-w-sm">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <PlusIcon class="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 class="text-xl font-semibold mb-3 text-foreground">No todos yet</h2>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              Choose how to add your first todo:
            </p>
            <div class="text-xs text-muted-foreground space-y-1">
              <p>🎤 <strong>Voice</strong> - Record audio notes</p>
              <p>📸 <strong>Image</strong> - Upload photos</p>
              <p>📝 <strong>Text</strong> - Type your todos</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-else-if="todoStore.isLoading"
          class="flex-1 flex items-center justify-center"
        >
          <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>

        <!-- Todo List -->
        <div v-else class="flex-1 overflow-y-auto scrollbar-hide">
          <div class="p-4 space-y-3">
            <Card
              v-for="todo in todoStore.todos"
              :key="todo.id"
              class="p-4"
            >
              <div class="flex items-start space-x-3">
                <!-- Completion Checkbox -->
                <button
                  class="mt-1 w-10 h-10 rounded border-2 border-border flex items-center justify-center touch-target"
                  :class="{
                    'bg-primary border-primary': todo.completed,
                    'hover:border-primary': !todo.completed
                  }"
                  @click="handleToggleTodo(todo.id)"
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
                    class="text-sm"
                    :class="{
                      'line-through text-muted-foreground': todo.completed,
                      'text-foreground': !todo.completed
                    }"
                  >
                    {{ todo.text }}
                  </p>
                  
                  <!-- Image if present -->
                  <img
                    v-if="todo.imageUrl"
                    :src="todo.imageUrl"
                    alt="Todo image"
                    class="mt-2 max-w-full h-32 object-cover rounded"
                  />
                  
                  <!-- Audio player if present -->
                  <AudioPlayer
                    v-if="todo.audioUrl"
                    :audioUrl="todo.audioUrl"
                  />
                  
                  <!-- Metadata -->
                  <div class="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                    <span class="capitalize">{{ todo.createdVia }}</span>
                    <span>•</span>
                    <span>{{ formatDate(todo.createdAt) }}</span>
                  </div>
                </div>

                <!-- Delete Button -->
                <button
                  class="text-muted-foreground hover:text-destructive touch-target"
                  @click="handleDeleteTodo(todo.id)"
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
          </div>
        </div>
      </div>
    </MobileLayout>

    <!-- Hidden file input for image upload -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="handleImageSelected"
    />

    <!-- Text Input Modal -->
    <div
      v-if="showTextModal"
      class="fixed inset-0 bg-black/50 flex items-end z-50"
      @click="showTextModal = false"
    >
      <Card class="w-full m-4 p-4" @click.stop>
        <h3 class="font-semibold mb-3">Add Todo</h3>
        <input
          ref="textInputRef"
          v-model="textInput"
          type="text"
          placeholder="Enter your todo..."
          class="w-full p-3 border border-input rounded-md bg-background"
          @keyup.enter="handleAddTextTodo"
        />
        <div class="flex space-x-2 mt-3">
          <Button @click="handleAddTextTodo" class="flex-1">Add</Button>
          <Button variant="outline" @click="showTextModal = false" class="flex-1">Cancel</Button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDeviceStore } from '@/stores/deviceStore'
import { formatDate } from '@/lib/utils'
import { api } from '@/utils/api'

import MobileLayout from '@/components/MobileLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import MicIcon from '@/components/icons/MicIcon.vue'
import PlusIcon from '@/components/icons/PlusIcon.vue'

const todoStore = useTodoStore()
const settingsStore = useSettingsStore()
const deviceStore = useDeviceStore()

const layoutRef = ref<InstanceType<typeof MobileLayout>>()
const showTextModal = ref(false)
const textInput = ref('')
const textInputRef = ref<HTMLInputElement>()

// Voice recording
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const isRecording = ref(false)

// Image upload
const fileInputRef = ref<HTMLInputElement>()

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

const handleSettingsClick = () => {
  // TODO: Implement settings modal
  console.log('Settings clicked')
}

const handleVoiceClick = async () => {
  if (!layoutRef.value) return

  try {
    if (mediaRecorder.value && isRecording.value) {
      // Stop recording
      mediaRecorder.value.stop()
      layoutRef.value.setRecording(false)
      isRecording.value = false
    } else {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.value = new MediaRecorder(stream)
      audioChunks.value = []

      mediaRecorder.value.ondataavailable = (event) => {
        audioChunks.value.push(event.data)
      }

      mediaRecorder.value.onstop = async () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        
        layoutRef.value?.setProcessing(true, 'Transcribing audio...')
        
        try {
          // Convert audio blob to data URL for storage
          const audioDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(audioBlob)
          })
          
          // Try to transcribe with OpenAI Whisper
          let transcribedText = `Voice note recorded at ${new Date().toLocaleTimeString()}`
          
          try {
            // Use the API utility for transcription
            const transcriptionResult = await api.transcribeAudio(audioBlob)
            
            if (transcriptionResult && transcriptionResult.trim()) {
              transcribedText = transcriptionResult.trim()
            }
          } catch (transcriptionError) {
            console.warn('Transcription failed, using fallback:', transcriptionError)
            // Keep the fallback text
          }
          
          // Create todo with both transcribed text and audio
          await todoStore.addTodo({
            text: transcribedText,
            createdVia: 'voice',
            audioUrl: audioDataUrl
          })
          
          layoutRef.value?.setProcessing(false)
        } catch (error) {
          console.error('Error processing voice recording:', error)
          layoutRef.value?.setProcessing(false)
          alert('Error processing voice recording. Please try again.')
        }
      }

      mediaRecorder.value.start()
      layoutRef.value.setRecording(true)
      isRecording.value = true
    }
  } catch (error) {
    console.error('Error accessing microphone:', error)
    alert('Could not access microphone. Please check permissions.')
    layoutRef.value?.setRecording(false)
    isRecording.value = false
  }
}

const handleImageClick = () => {
  if (!fileInputRef.value) return
  fileInputRef.value.click()
}

const handleImageSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    layoutRef.value?.setProcessing(true, 'Processing image...')
    
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
        
        layoutRef.value?.setProcessing(false)
      } catch (error) {
        console.error('Error adding todo with image:', error)
        layoutRef.value?.setProcessing(false)
        alert('Error adding todo with image. Please try again.')
      }
    }
    
    reader.onerror = () => {
      console.error('Error reading file')
      layoutRef.value?.setProcessing(false)
      alert('Error reading image file. Please try again.')
    }
    
    reader.readAsDataURL(file)
    
    // Reset the file input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (error) {
    console.error('Error processing image:', error)
    layoutRef.value?.setProcessing(false)
    alert('Error processing image. Please try again.')
  }
}

const handleTextClick = async () => {
  showTextModal.value = true
  await nextTick()
  textInputRef.value?.focus()
}

const handleAddTextTodo = async () => {
  if (!textInput.value.trim()) return

  try {
    await todoStore.addTodo({
      text: textInput.value.trim(),
      createdVia: 'text',
    })
    
    textInput.value = ''
    showTextModal.value = false
  } catch (error) {
    console.error('Failed to add todo:', error)
  }
}

const handleToggleTodo = async (todoId: string) => {
  try {
    await todoStore.toggleTodo(todoId)
  } catch (error) {
    console.error('Failed to toggle todo:', error)
  }
}

const handleDeleteTodo = async (todoId: string) => {
  try {
    await todoStore.deleteTodo(todoId)
  } catch (error) {
    console.error('Failed to delete todo:', error)
  }
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
