import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getHealth } from './api/client'
import ChatPanel from './components/chat/ChatPanel'
import AppLayout from './components/layout/AppLayout'
import Sidebar from './components/layout/Sidebar'
import { useConversations } from './hooks/useConversations'

function App() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const initialized = useRef(false)

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: 1,
  })

  const {
    conversations,
    createConversation,
    deleteConversation,
    renameConversation,
  } = useConversations()

  useEffect(() => {
    if (!initialized.current && conversations.length > 0 && !conversationId) {
      initialized.current = true
      setConversationId(conversations[0].id)
    }
  }, [conversations, conversationId])

  useEffect(() => {
    if (health && !initialized.current && conversations.length === 0) {
      initialized.current = true
      void createConversation().then((conv) => setConversationId(conv.id))
    }
  }, [health, conversations.length, createConversation])

  const handleNewChat = useCallback(async () => {
    const conv = await createConversation()
    setConversationId(conv.id)
  }, [createConversation])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConversation(id)
      if (conversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id)
        if (remaining.length > 0) {
          setConversationId(remaining[0].id)
        } else {
          const conv = await createConversation()
          setConversationId(conv.id)
        }
      }
    },
    [conversationId, conversations, createConversation, deleteConversation],
  )

  const handleRename = useCallback(
    async (id: string, title: string) => {
      await renameConversation({ id, title })
    },
    [renameConversation],
  )

  return (
    <AppLayout
      provider={health?.provider}
      model={health?.model}
      sidebar={
        <Sidebar
          conversations={conversations}
          activeId={conversationId}
          onSelect={setConversationId}
          onNewChat={handleNewChat}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      }
    >
      <ChatPanel conversationId={conversationId} />
    </AppLayout>
  )
}

export default App
