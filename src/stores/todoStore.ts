import {defineStore} from 'pinia'
import {ref, computed, readonly} from 'vue'
import type {$Todo, $TodoInput, $TodoUpdate} from '@/types/todo'
import {api} from '@/utils/api'
import {useDeviceStore} from './deviceStore'
import {useSettingsStore} from './settingsStore'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<$Todo[]>([])
  const isLoading = ref(false)
  const isSyncing = ref(false)
  const lastSync = ref<Date | null>(null)

  const deviceStore = useDeviceStore()
  const settingsStore = useSettingsStore()

  const completedTodos = computed(() => todos.value.filter(todo => todo.completed))
  const activeTodos = computed(() => todos.value.filter(todo => !todo.completed))
  const totalTodos = computed(() => todos.value.length)
  const completedCount = computed(() => completedTodos.value.length)
  const activeCount = computed(() => activeTodos.value.length)

  const todosByCreatedVia = computed(() => {
    return {
      text: todos.value.filter(todo => todo.createdVia === 'text').length,
      voice: todos.value.filter(todo => todo.createdVia === 'voice').length,
      image: todos.value.filter(todo => todo.createdVia === 'image').length,
    }
  })

  const generateTodoId = (): string => {
    return `todo_${ Date.now() }_${ Math.random().toString(36).substr(2, 9) }`
  }

  const addTodo = async (input: $TodoInput): Promise<$Todo> => {
    const newTodo: $Todo = {
      id: generateTodoId(),
      text: input.text,
      completed: false,
      createdAt: new Date(),
      createdVia: input.createdVia,
      imageUrl: input.imageUrl,
      audioUrl: input.audioUrl,
      deviceId: deviceStore.deviceId,
    }

    todos.value.unshift(newTodo)

    // Trigger haptic feedback
    settingsStore.triggerHaptic('light')

    // Auto-sync if enabled (but don't block todo creation if sync fails)
    if (settingsStore.settings.autoSync) {
      try {
        await syncTodos()
      } catch (error) {
        console.warn('Sync failed, but todo was created locally:', error)
        // Don't throw the error - allow the todo to be created locally
      }
    }

    return newTodo
  }

  const updateTodo = async (update: $TodoUpdate): Promise<void> => {
    const todoIndex = todos.value.findIndex(todo => todo.id === update.id)
    if (todoIndex === -1) return

    const todo = todos.value[todoIndex]

    if (update.completed !== undefined) {
      todo.completed = update.completed
      // Trigger haptic feedback for completion
      if (update.completed) {
        settingsStore.triggerHaptic('medium')
      }
    }

    if (update.text !== undefined) {
      todo.text = update.text
    }

    // Auto-sync if enabled
    if (settingsStore.settings.autoSync) {
      await syncTodos()
    }
  }

  const deleteTodo = async (todoId: string): Promise<void> => {
    const todoIndex = todos.value.findIndex(todo => todo.id === todoId)
    if (todoIndex === -1) return

    todos.value.splice(todoIndex, 1)

    // Trigger haptic feedback
    settingsStore.triggerHaptic('heavy')

    // Auto-sync if enabled
    if (settingsStore.settings.autoSync) {
      await syncTodos()
    }
  }

  const toggleTodo = async (todoId: string): Promise<void> => {
    const todo = todos.value.find(todo => todo.id === todoId)
    if (!todo) return

    await updateTodo({id: todoId, completed: !todo.completed})
  }

  const clearCompleted = async (): Promise<void> => {
    const completedIds = completedTodos.value.map(todo => todo.id)

    for (const id of completedIds) {
      await deleteTodo(id)
    }
  }

  const loadTodos = async (): Promise<void> => {
    if (!deviceStore.deviceId) return

    isLoading.value = true
    try {
      const deviceData = await api.getDeviceData(deviceStore.deviceId)

      if (deviceData) {
        todos.value = deviceData.todos
        settingsStore.updateSettings(deviceData.settings)
        lastSync.value = new Date()
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      isLoading.value = false
    }
  }

  const syncTodos = async (): Promise<void> => {
    if (!deviceStore.deviceId || isSyncing.value) return

    isSyncing.value = true
    try {
      await api.updateDeviceData(
        deviceStore.deviceId,
        todos.value,
        settingsStore.settings
      )
      lastSync.value = new Date()
    } catch (error) {
      console.error('Failed to sync todos:', error)
      throw error
    } finally {
      isSyncing.value = false
    }
  }

  const resetAllData = async (): Promise<void> => {
    if (!deviceStore.deviceId) return

    try {
      await api.deleteDeviceData(deviceStore.deviceId)
      todos.value = []
      settingsStore.resetSettings()
      deviceStore.resetDevice()
      lastSync.value = null
    } catch (error) {
      console.error('Failed to reset data:', error)
      throw error
    }
  }

  const exportTodos = (): string => {
    return JSON.stringify({
      todos: todos.value,
      settings: settingsStore.settings,
      exportedAt: new Date().toISOString(),
      deviceId: deviceStore.deviceIdShort,
    }, null, 2)
  }

  const searchTodos = (query: string): $Todo[] => {
    if (!query.trim()) return todos.value

    const searchTerm = query.toLowerCase().trim()
    return todos.value.filter(todo =>
      todo.text.toLowerCase().includes(searchTerm)
    )
  }

  const getTodosByDateRange = (startDate: Date, endDate: Date): $Todo[] => {
    return todos.value.filter(todo => {
      const todoDate = new Date(todo.createdAt)
      return todoDate >= startDate && todoDate <= endDate
    })
  }

  return {
    // State
    todos: readonly(todos),
    isLoading: readonly(isLoading),
    isSyncing: readonly(isSyncing),
    lastSync: readonly(lastSync),

    // Getters
    completedTodos,
    activeTodos,
    totalTodos,
    completedCount,
    activeCount,
    todosByCreatedVia,

    // Actions
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    loadTodos,
    syncTodos,
    resetAllData,
    exportTodos,
    searchTodos,
    getTodosByDateRange,
  }
})
