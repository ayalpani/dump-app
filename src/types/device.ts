export type $DeviceInfo = {
  userAgent: string
  language: string
  timezone: string
  screen: string
  pixelRatio: number
  touchPoints: number
  platform: string
  orientation?: string
  connection?: string
}

export type $DeviceData = {
  deviceId: string
  todos: import('./todo').$Todo[]
  settings: import('./settings').$UserSettings
  createdAt: Date
  lastAccessed: Date
}

export type $DataUsage = {
  totalTodos: number
  totalImages: number
  totalAudioFiles: number
  storageUsed: string
  lastSync: Date
}
