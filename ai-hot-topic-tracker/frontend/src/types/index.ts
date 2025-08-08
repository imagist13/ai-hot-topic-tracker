export interface Task {
  id: number
  name: string
  keywords: string
  sources: string[]
  analysis_type: string
  schedule_interval: number
  created_at: string
  is_active: boolean
}

export interface TaskResult {
  id: number
  task_id: number
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  sentiment_emoji: string
  data_count: number
  created_at: string
  key_points: string[]
}

export interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export interface WebSocketMessage {
  type: 'chat_message' | 'response' | 'task_result'
  message?: string
  data?: any
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'
