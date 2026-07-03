import type { ConversationDetail, ConversationSummary } from '../types'
import { apiFetch } from './client'

export function listConversations() {
  return apiFetch<ConversationSummary[]>('/api/conversations')
}

export function createConversation(title = 'New chat') {
  return apiFetch<ConversationSummary>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function getConversation(id: string) {
  return apiFetch<ConversationDetail>(`/api/conversations/${id}`)
}

export function deleteConversation(id: string) {
  return apiFetch<void>(`/api/conversations/${id}`, { method: 'DELETE' })
}

export function updateConversationTitle(id: string, title: string) {
  return apiFetch<ConversationSummary>(`/api/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}
