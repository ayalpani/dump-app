import type {$Todo, $TodoInput, $TodoUpdate} from '@/types/todo'
import type {$DeviceData, $DataUsage} from '@/types/device'
import type {$UserSettings} from '@/types/settings'

// Always use relative paths for Netlify functions
const API_BASE = '/.netlify/functions'

export const api = {
  // Device data operations
  async getDeviceData(deviceId: string): Promise<$DeviceData | null> {
    try {
      const response = await fetch(`${ API_BASE }/get-device-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({deviceId}),
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${ response.status }`)
      }

      const data = await response.json()
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        lastAccessed: new Date(data.lastAccessed),
        todos: data.todos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        })),
      }
    } catch (error) {
      console.error('Error fetching device data:', error)
      throw error
    }
  },

  async updateDeviceData(deviceId: string, todos: $Todo[], settings: $UserSettings): Promise<void> {
    try {
      const response = await fetch(`${ API_BASE }/update-device-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          todos,
          settings,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${ response.status }`)
      }
    } catch (error) {
      console.error('Error updating device data:', error)
      throw error
    }
  },

  async deleteDeviceData(deviceId: string): Promise<void> {
    try {
      const response = await fetch(`${ API_BASE }/delete-device-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({deviceId}),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${ response.status }`)
      }
    } catch (error) {
      console.error('Error deleting device data:', error)
      throw error
    }
  },

  async exportDeviceData(deviceId: string): Promise<Blob> {
    try {
      const response = await fetch(`${ API_BASE }/export-device-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({deviceId}),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${ response.status }`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Error exporting device data:', error)
      throw error
    }
  },

  // Voice transcription
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch(`${ API_BASE }/transcribe-audio`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${ response.status }`)
      }

      const data = await response.json()
      return data.text || data.fallbackText || `Voice note recorded at ${ new Date().toLocaleTimeString() }`
    } catch (error) {
      console.error('Error transcribing audio:', error)
      throw error
    }
  },

  // Media upload
  async uploadMedia(file: File, deviceId: string): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('deviceId', deviceId)

      const response = await fetch(`${ API_BASE }/upload-media`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${ response.status }`)
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Error uploading media:', error)
      throw error
    }
  },

  // Data usage
  async getDataUsage(deviceId: string): Promise<$DataUsage> {
    try {
      const response = await fetch(`${ API_BASE }/get-data-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({deviceId}),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${ response.status }`)
      }

      const data = await response.json()
      return {
        ...data,
        lastSync: new Date(data.lastSync),
      }
    } catch (error) {
      console.error('Error fetching data usage:', error)
      throw error
    }
  },
}
