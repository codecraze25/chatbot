import { useEffect, useRef } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import type { Message } from '../../types'
import MessageBubble from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  streamingContent: string
}

export default function MessageList({
  messages,
  isStreaming,
  streamingContent,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent, isStreaming])

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        py: 2,
      }}
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}

      {isStreaming && streamingContent && (
        <MessageBubble role="assistant" content={streamingContent} />
      )}

      {isStreaming && !streamingContent && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, mb: 2 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Thinking…
          </Typography>
        </Box>
      )}

      <div ref={bottomRef} />
    </Box>
  )
}
