export type UserProfile = {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  createdAt: number
  lastActive: number
}

export type Room = {
  id: string
  name: string
  createdAt: number
  createdBy: string
}

export type Message = {
  id: string
  roomId: string
  userId: string
  text?: string
  imageUrl?: string
  createdAt: number
}

export type TypingState = {
  userId: string
  roomId: string
  isTyping: boolean
  updatedAt: number
}
