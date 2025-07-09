import {defineStore} from 'pinia'
import {ref, computed, readonly} from 'vue'
import type {$UserSettings} from '@/types/settings'

const defaultSettings: $UserSettings = {
  theme: 'system',
  voiceEnabled: true,
  imageEnabled: true,
  hapticFeedback: true,
  autoSync: true,
  dataRetention: 'forever',
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<$UserSettings>({...defaultSettings})
  const isLoading = ref(false)

  const isDarkMode = computed(() => {
    if (settings.value.theme === 'dark') return true
    if (settings.value.theme === 'light') return false

    // System preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const canUseVoice = computed(() => {
    return settings.value.voiceEnabled && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  })

  const canUseCamera = computed(() => {
    return settings.value.imageEnabled && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  })

  const canUseHaptics = computed(() => {
    return settings.value.hapticFeedback && 'vibrate' in navigator
  })

  const updateSetting = <K extends keyof $UserSettings>(key: K, value: $UserSettings[K]) => {
    settings.value[key] = value

    // Apply theme immediately
    if (key === 'theme') {
      applyTheme()
    }
  }

  const updateSettings = (newSettings: Partial<$UserSettings>) => {
    settings.value = {...settings.value, ...newSettings}
    applyTheme()
  }

  const resetSettings = () => {
    settings.value = {...defaultSettings}
    applyTheme()
  }

  const applyTheme = () => {
    const root = document.documentElement

    if (isDarkMode.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!canUseHaptics.value) return

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50],
    }

    navigator.vibrate(patterns[type])
  }

  const exportSettings = (): string => {
    return JSON.stringify(settings.value, null, 2)
  }

  const importSettings = (settingsJson: string): boolean => {
    try {
      const importedSettings = JSON.parse(settingsJson) as $UserSettings

      // Validate imported settings
      const validKeys = Object.keys(defaultSettings) as (keyof $UserSettings)[]
      const isValid = validKeys.every(key => key in importedSettings)

      if (isValid) {
        updateSettings(importedSettings)
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to import settings:', error)
      return false
    }
  }

  // Initialize theme on store creation
  applyTheme()

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (settings.value.theme === 'system') {
        applyTheme()
      }
    })
  }

  return {
    // State
    settings: readonly(settings),
    isLoading: readonly(isLoading),

    // Getters
    isDarkMode,
    canUseVoice,
    canUseCamera,
    canUseHaptics,

    // Actions
    updateSetting,
    updateSettings,
    resetSettings,
    applyTheme,
    triggerHaptic,
    exportSettings,
    importSettings,
  }
})
