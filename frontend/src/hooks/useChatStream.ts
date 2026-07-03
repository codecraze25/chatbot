import { useCallback, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { streamChat } from '../api/chat'

export function useChatStream(conversationId: string | null) {
  const queryClient = useQueryClient()
  const abortRef = useRef<AbortController | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (message: string) => {
      if (!conversationId || !message.trim() || isStreaming) return

      setError(null)
      setStreamingContent('')
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        await streamChat(
          conversationId,
          message.trim(),
          (event) => {
            if (event.type === 'token') {
              setStreamingContent((prev) => prev + event.data.content)
            } else if (event.type === 'done') {
              queryClient.invalidateQueries({
                queryKey: ['conversation', conversationId],
              })
              queryClient.invalidateQueries({ queryKey: ['conversations'] })
            } else if (event.type === 'error') {
              setError(event.data.detail)
            }
          },
          controller.signal,
        )
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message)
        }
      } finally {
        setIsStreaming(false)
        setStreamingContent('')
        abortRef.current = null
      }
    },
    [conversationId, isStreaming, queryClient],
  )

  const cancelStream = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { sendMessage, cancelStream, isStreaming, streamingContent, error, setError }
}
