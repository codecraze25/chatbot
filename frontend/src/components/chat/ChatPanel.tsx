import { Alert, Snackbar } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getConversation } from '../../api/conversations'
import { useChatStream } from '../../hooks/useChatStream'
import type { Message } from '../../types'
import ChatInput from './ChatInput'
import EmptyState from './EmptyState'
import MessageList from './MessageList'

interface ChatPanelProps {
  conversationId: string | null
  initialMessage?: string | null
  onInitialMessageSent?: () => void
}

export default function ChatPanel({
  conversationId,
  initialMessage,
  onInitialMessageSent,
}: ChatPanelProps) {
  const [optimisticMessage, setOptimisticMessage] = useState<Message | null>(null)

  const {
    data: conversation,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId!),
    enabled: !!conversationId,
  })

  const {
    sendMessage,
    cancelStream,
    isStreaming,
    streamingContent,
    error: streamError,
    setError,
  } = useChatStream(conversationId)

  const handleSend = async (message: string) => {
    setOptimisticMessage({
      id: 'optimistic',
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    })
    await sendMessage(message)
  }

  useEffect(() => {
    if (!optimisticMessage) return
    const synced = conversation?.messages.some(
      (m) => m.role === 'user' && m.content === optimisticMessage.content,
    )
    if (synced || (!isStreaming && streamError)) {
      setOptimisticMessage(null)
    }
  }, [conversation?.messages, isStreaming, optimisticMessage, streamError])

  useEffect(() => {
    if (!initialMessage || !conversationId || isStreaming) return
    onInitialMessageSent?.()
    void handleSend(initialMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, conversationId])

  const serverMessages =
    conversation?.messages.filter((m) => m.role !== 'system') ?? []

  const messages = optimisticMessage
    ? [...serverMessages, optimisticMessage]
    : serverMessages

  const showEmpty =
    !!conversationId && !isLoading && messages.length === 0 && !isStreaming

  return (
    <>
      {loadError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to load conversation
        </Alert>
      )}

      {!conversationId ? (
        <EmptyState onSelectPrompt={() => {}} />
      ) : showEmpty ? (
        <EmptyState onSelectPrompt={handleSend} />
      ) : (
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />
      )}

      <ChatInput
        disabled={!conversationId || isLoading}
        isStreaming={isStreaming}
        onSend={handleSend}
        onCancel={cancelStream}
      />

      <Snackbar
        open={!!streamError}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {streamError}
        </Alert>
      </Snackbar>
    </>
  )
}
