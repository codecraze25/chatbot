import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, Paper, Tooltip, Typography, useTheme } from '@mui/material'
import { useState } from 'react'
import type { MessageRole } from '../../types'
import MarkdownContent from './MarkdownContent'

interface MessageBubbleProps {
  role: MessageRole
  content: string
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'
  const theme = useTheme()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          position: 'relative',
          px: 2,
          py: 1.5,
          maxWidth: '75%',
          bgcolor: isUser
            ? 'primary.main'
            : theme.palette.mode === 'dark'
              ? 'grey.800'
              : 'grey.100',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          wordBreak: 'break-word',
          '&:hover .copy-btn': { opacity: 1 },
        }}
      >
        {!isUser && (
          <Tooltip title={copied ? 'Copied!' : 'Copy'}>
            <IconButton
              className="copy-btn"
              size="small"
              onClick={handleCopy}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
              aria-label="Copy message"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {isUser ? (
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </Typography>
        ) : (
          <Box sx={{ pr: 2.5, fontSize: '0.95rem', lineHeight: 1.6 }}>
            <MarkdownContent content={content} />
          </Box>
        )}
      </Paper>
    </Box>
  )
}
