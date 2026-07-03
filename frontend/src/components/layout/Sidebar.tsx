import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
} from '@mui/material'
import { useState } from 'react'
import type { ConversationSummary } from '../../types'

interface SidebarProps {
  conversations: ConversationSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onDelete: (id: string) => Promise<void>
  onRename: (id: string, title: string) => Promise<void>
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onRename,
}: SidebarProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [renameTarget, setRenameTarget] = useState<ConversationSummary | null>(null)
  const [renameTitle, setRenameTitle] = useState('')

  const handleRenameOpen = (conv: ConversationSummary) => {
    setRenameTarget(conv)
    setRenameTitle(conv.title)
  }

  const handleRenameConfirm = async () => {
    if (!renameTarget || !renameTitle.trim()) return
    await onRename(renameTarget.id, renameTitle.trim())
    setRenameTarget(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    await onDelete(deleteId)
    setDeleteId(null)
  }

  return (
    <>
      <Box sx={{ p: 2, pb: 1 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onNewChat}
        >
          New chat
        </Button>
      </Box>

      <List dense sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {conversations.map((conv) => (
          <ListItem
            key={conv.id}
            disablePadding
            secondaryAction={
              <Box sx={{ display: 'flex' }}>
                <Tooltip title="Rename">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRenameOpen(conv)
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(conv.id)
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
            sx={{ mb: 0.5 }}
          >
            <ListItemButton
              selected={conv.id === activeId}
              onClick={() => onSelect(conv.id)}
              sx={{ borderRadius: 1, pr: 7 }}
            >
              <ListItemText
                primary={conv.title}
                primaryTypographyProps={{ noWrap: true, fontSize: '0.875rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete conversation?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the conversation and all its messages.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!renameTarget} onClose={() => setRenameTarget(null)}>
        <DialogTitle>Rename conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Title"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleRenameConfirm()
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameTarget(null)}>Cancel</Button>
          <Button onClick={handleRenameConfirm} disabled={!renameTitle.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
