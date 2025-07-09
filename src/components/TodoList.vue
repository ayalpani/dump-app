<template>
  <div class="TodoList flex-1 overflow-y-auto scrollbar-hide">
    <div class="p-4 space-y-3">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TodoItem from '@/components/TodoItem.vue'
import type { $Todo } from '@/types/todo'

type $Props = {
  todos: readonly $Todo[]
}

defineProps<$Props>()
</script>
