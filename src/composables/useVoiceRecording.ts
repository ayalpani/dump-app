import {ref, readonly} from 'vue'
import {api} from '@/utils/api'

export const useVoiceRecording = () => {
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const audioChunks = ref<Blob[]>([])
  const isRecording = ref(false)

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true})
      mediaRecorder.value = new MediaRecorder(stream)
      audioChunks.value = []
      isRecording.value = true

      mediaRecorder.value.ondataavailable = (event) => {
        audioChunks.value.push(event.data)
      }

      mediaRecorder.value.start()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      isRecording.value = false
      throw new Error('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = (): Promise<{audioBlob: Blob; audioDataUrl: string; transcribedText: string}> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder.value || !isRecording.value) {
        reject(new Error('No active recording'))
        return
      }

      mediaRecorder.value.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks.value, {type: 'audio/webm'})

          // Stop all tracks
          const stream = mediaRecorder.value?.stream
          if (stream) {
            stream.getTracks().forEach(track => track.stop())
          }

          // Convert audio blob to data URL for storage
          const audioDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(audioBlob)
          })

          // Try to transcribe with OpenAI Whisper
          let transcribedText = `Voice note recorded at ${ new Date().toLocaleTimeString() }`

          try {
            const transcriptionResult = await api.transcribeAudio(audioBlob)

            if (transcriptionResult && transcriptionResult.trim()) {
              transcribedText = transcriptionResult.trim()
            }
          } catch (transcriptionError) {
            console.warn('Transcription failed, using fallback:', transcriptionError)
          }

          isRecording.value = false
          resolve({audioBlob, audioDataUrl, transcribedText})
        } catch (error) {
          isRecording.value = false
          reject(error)
        }
      }

      mediaRecorder.value.stop()
    })
  }

  const cancelRecording = (): void => {
    if (mediaRecorder.value && isRecording.value) {
      const stream = mediaRecorder.value.stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorder.value = null
      isRecording.value = false
    }
  }

  return {
    isRecording: readonly(isRecording),
    startRecording,
    stopRecording,
    cancelRecording
  }
}
