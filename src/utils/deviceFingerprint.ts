import type {$DeviceInfo} from '@/types/device'

export const generateDeviceInfo = (): $DeviceInfo => {
  const deviceInfo: $DeviceInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${ screen.width }x${ screen.height }`,
    pixelRatio: window.devicePixelRatio,
    touchPoints: navigator.maxTouchPoints,
    platform: navigator.platform,
  }

  // Add mobile-specific identifiers
  if (screen.orientation) {
    deviceInfo.orientation = screen.orientation.type
  }

  // Add connection info if available
  const connection = (navigator as any).connection
  if (connection) {
    deviceInfo.connection = connection.effectiveType
  }

  return deviceInfo
}

export const generateDeviceId = async (): Promise<string> => {
  const deviceInfo = generateDeviceInfo()
  const deviceString = JSON.stringify(deviceInfo)

  const encoder = new TextEncoder()
  const data = encoder.encode(deviceString)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

export const getStoredDeviceId = (): string | null => {
  return localStorage.getItem('deviceId')
}

export const storeDeviceId = (deviceId: string): void => {
  localStorage.setItem('deviceId', deviceId)
}

export const getOrCreateDeviceId = async (): Promise<string> => {
  let deviceId = getStoredDeviceId()

  if (!deviceId) {
    deviceId = await generateDeviceId()
    storeDeviceId(deviceId)
  }

  return deviceId
}
