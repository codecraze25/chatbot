import { Box, Paper, Typography } from '@mui/material'
import type { MessageRole } from '../../types'

interface MessageBubbleProps {
  role: MessageRole
  content: string
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          maxWidth: '75%',
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <Typography variant="body1" component="div">
          {content}
        </Typography>
      </Paper>
    </Box>
  )
}
