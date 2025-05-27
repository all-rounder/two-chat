// types/index.ts
export interface ChatMessage {
  content: string
  isUser: boolean
  timestamp: string
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date // To help with sorting/grouping by most recent activity
}
