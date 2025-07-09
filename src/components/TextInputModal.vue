<template>
  <div
    v-if="isVisible"
    class="TextInputModal fixed inset-0 bg-black/50 flex items-end z-50"
    @click="handleBackdropClick"
  >
    <Card class="w-full m-4 p-4" @click.stop>
      <h3 class="font-semibold mb-3">Add Todo</h3>
      <input
        ref="textInputRef"
        v-model="textInput"
        type="text"
        placeholder="Enter your todo..."
        class="w-full p-3 border border-input rounded-md bg-background"
        @keyup.enter="handleSubmit"
        @keydown="handleKeyDown"
      />
      <div class="flex space-x-2 mt-3">
        <Button @click="handleSubmit" class="flex-1">Add</Button>
        <Button variant="outline" @click="handleCancel" class="flex-1">Cancel</Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

type $Props = {
  isVisible: boolean
}

const props = defineProps<$Props>()

const emit = defineEmits<{
  submit: [text: string]
  cancel: []
}>()

const textInput = ref('')
const textInputRef = ref<HTMLInputElement>()

// Focus input when modal becomes visible
watch(() => props.isVisible, async (isVisible) => {
  if (isVisible) {
    await nextTick()
    textInputRef.value?.focus()
  }
})

const handleSubmit = (): void => {
  if (!textInput.value.trim()) return
  
  emit('submit', textInput.value.trim())
  textInput.value = ''
}

const handleCancel = (): void => {
  textInput.value = ''
  emit('cancel')
}

const handleBackdropClick = (): void => {
  handleCancel()
}

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    handleCancel()
  }
}
</script>
