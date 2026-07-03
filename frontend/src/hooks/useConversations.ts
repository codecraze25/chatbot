import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createConversation,
  deleteConversation,
  listConversations,
  updateConversationTitle,
} from '../api/conversations'

export function useConversations() {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: listConversations,
  })

  const createMutation = useMutation({
    mutationFn: () => createConversation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateConversationTitle(id, title),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    },
  })

  return {
    conversations: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    createConversation: createMutation.mutateAsync,
    deleteConversation: deleteMutation.mutateAsync,
    renameConversation: renameMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
