export interface HealthResponse {
  status: string
  provider: string
  model: string
}

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  created_at: string
}

export interface ConversationSummary {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ConversationDetail extends ConversationSummary {
  messages: Message[]
}

export interface ChatStreamToken {
  content: string
}

export interface ChatStreamDone {
  message_id: string
}

export interface ChatStreamError {
  detail: string
}
