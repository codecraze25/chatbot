import SendIcon from '@mui/icons-material/Send'
import StopIcon from '@mui/icons-material/Stop'
import { Box, IconButton, TextField } from '@mui/material'
import { useState, type KeyboardEvent } from 'react'

interface ChatInputProps {
  disabled: boolean
  isStreaming: boolean
  onSend: (message: string) => void
  onCancel: () => void
}

export default function ChatInput({
  disabled,
  isStreaming,
  onSend,
  onCancel,
}: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    if (!value.trim() || disabled) return
    onSend(value)
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        alignItems: 'flex-end',
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={6}
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isStreaming}
        size="small"
      />
      {isStreaming ? (
        <IconButton color="error" onClick={onCancel} aria-label="Stop">
          <StopIcon />
        </IconButton>
      ) : (
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send"
        >
          <SendIcon />
        </IconButton>
      )}
    </Box>
  )
}
