import type {
  ChatStreamDone,
  ChatStreamError,
  ChatStreamToken,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export type ChatStreamEvent =
  | { type: 'token'; data: ChatStreamToken }
  | { type: 'done'; data: ChatStreamDone }
  | { type: 'error'; data: ChatStreamError }

function parseSseBlock(block: string): ChatStreamEvent | null {
  let event = 'message'
  let data = ''

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      data = line.slice(5).trim()
    }
  }

  if (!data) return null

  const parsed = JSON.parse(data) as ChatStreamToken | ChatStreamDone | ChatStreamError

  if (event === 'token') return { type: 'token', data: parsed as ChatStreamToken }
  if (event === 'done') return { type: 'done', data: parsed as ChatStreamDone }
  if (event === 'error') return { type: 'error', data: parsed as ChatStreamError }

  return null
}

export async function streamChat(
  conversationId: string,
  message: string,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal,
    },
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: response.statusText,
    }))
    throw new Error(
      typeof error.detail === 'string' ? error.detail : 'Chat request failed',
    )
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Streaming not supported')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      if (!block.trim()) continue
      const event = parseSseBlock(block)
      if (event) onEvent(event)
    }
  }

  if (buffer.trim()) {
    const event = parseSseBlock(buffer)
    if (event) onEvent(event)
  }
}
