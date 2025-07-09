import {defineStore} from 'pinia'
import {ref, computed, readonly} from 'vue'
import {getOrCreateDeviceId, generateDeviceId, storeDeviceId} from '@/utils/deviceFingerprint'
import type {$DataUsage} from '@/types/device'
import {api} from '@/utils/api'

export const useDeviceStore = defineStore('device', () => {
  const deviceId = ref<string>('')
  const isInitialized = ref(false)
  const dataUsage = ref<$DataUsage | null>(null)

  const deviceIdShort = computed(() => {
    return deviceId.value ? deviceId.value.substring(0, 8) + '...' : ''
  })

  const initializeDevice = async () => {
    try {
      deviceId.value = await getOrCreateDeviceId()
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize device:', error)
      throw error
    }
  }

  const generateNewDeviceId = async () => {
    try {
      const newDeviceId = await generateDeviceId()
      deviceId.value = newDeviceId
      storeDeviceId(newDeviceId)
    } catch (error) {
      console.error('Failed to generate new device ID:', error)
      throw error
    }
  }

  const loadDataUsage = async () => {
    if (!deviceId.value) return

    try {
      dataUsage.value = await api.getDataUsage(deviceId.value)
    } catch (error) {
      console.error('Failed to load data usage:', error)
      // Set default values on error
      dataUsage.value = {
        totalTodos: 0,
        totalImages: 0,
        totalAudioFiles: 0,
        storageUsed: '0 KB',
        lastSync: new Date(),
      }
    }
  }

  const copyDeviceId = async () => {
    if (!deviceId.value) return false

    try {
      await navigator.clipboard.writeText(deviceId.value)
      return true
    } catch (error) {
      console.error('Failed to copy device ID:', error)
      return false
    }
  }

  const resetDevice = () => {
    deviceId.value = ''
    isInitialized.value = false
    dataUsage.value = null
    localStorage.removeItem('deviceId')
  }

  return {
    // State
    deviceId: readonly(deviceId),
    isInitialized: readonly(isInitialized),
    dataUsage: readonly(dataUsage),

    // Getters
    deviceIdShort,

    // Actions
    initializeDevice,
    generateNewDeviceId,
    loadDataUsage,
    copyDeviceId,
    resetDevice,
  }
})
