export type $UserSettings = {
  theme: 'light' | 'dark' | 'system'
  voiceEnabled: boolean
  imageEnabled: boolean
  hapticFeedback: boolean
  autoSync: boolean
  dataRetention: '30days' | '90days' | 'forever'
}

export type $DefaultSettings = $UserSettings
