<template>
  <div class="EmptyState flex-1 flex items-center justify-center p-8 text-center">
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
</template>

<script setup lang="ts">
import PlusIcon from '@/components/icons/PlusIcon.vue'
</script>
