export type $Location = {
  latitude: number
  longitude: number
  accuracy?: number
}

export type $Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  createdVia: 'text' | 'voice' | 'image' | 'location'
  imageUrl?: string
  audioUrl?: string
  audioDuration?: number // Duration in seconds
  location?: $Location
  deviceId: string
}

export type $TodoInput = {
  text: string
  createdVia: 'text' | 'voice' | 'image' | 'location'
  imageUrl?: string
  audioUrl?: string
  audioDuration?: number // Duration in seconds
  location?: $Location
}

export type $TodoUpdate = {
  id: string
  completed?: boolean
  text?: string
}
