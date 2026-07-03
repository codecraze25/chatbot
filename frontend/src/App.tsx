import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getHealth } from './api/client'
import { createConversation } from './api/conversations'
import ChatPanel from './components/chat/ChatPanel'
import AppLayout from './components/layout/AppLayout'

function App() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const initialized = useRef(false)

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: 1,
  })

  const createMutation = useMutation({
    mutationFn: () => createConversation(),
    onSuccess: (conv) => {
      setConversationId(conv.id)
    },
  })

  useEffect(() => {
    if (health && !initialized.current) {
      initialized.current = true
      createMutation.mutate()
    }
  }, [health, createMutation])

  const handleNewChat = useCallback(() => {
    setInitialMessage(null)
    createMutation.mutate()
  }, [createMutation])

  return (
    <AppLayout
      provider={health?.provider}
      model={health?.model}
      onNewChat={handleNewChat}
    >
      <ChatPanel
        conversationId={conversationId}
        initialMessage={initialMessage}
        onInitialMessageSent={() => setInitialMessage(null)}
      />
    </AppLayout>
  )
}

export default App
