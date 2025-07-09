<template>
  <div class="TodoView">
    <MobileLayout>
      <!-- Todo List Content -->
      <div class="h-full flex flex-col">
        <!-- Empty State -->
        <EmptyState v-if="todoStore.totalTodos === 0 && !todoStore.isLoading" />

        <!-- Loading State -->
        <LoadingSpinner v-else-if="todoStore.isLoading" />

        <!-- Todo List -->
        <TodoList v-else :todos="todoStore.todos" />
      </div>
    </MobileLayout>
  </div>
</template>

<script setup lang="ts">
import { useTodoStore } from '@/stores/todoStore'

import MobileLayout from '@/components/MobileLayout.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import TodoList from '@/components/TodoList.vue'

const todoStore = useTodoStore()
</script>
