export type $Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  createdVia: 'text' | 'voice' | 'image'
  imageUrl?: string
  audioUrl?: string
  deviceId: string
}

export type $TodoInput = {
  text: string
  createdVia: 'text' | 'voice' | 'image'
  imageUrl?: string
  audioUrl?: string
}

export type $TodoUpdate = {
  id: string
  completed?: boolean
  text?: string
}
