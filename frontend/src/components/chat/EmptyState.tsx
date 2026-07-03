import { Box, Chip, Typography } from '@mui/material'

const SUGGESTIONS = [
  'Explain how async/await works in JavaScript',
  'Write a Python function to check if a string is a palindrome',
  'What are the pros and cons of SQLite vs PostgreSQL?',
]

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void
}

export default function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 4,
      }}
    >
      <Typography variant="h5" color="text.secondary">
        How can I help you today?
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {SUGGESTIONS.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            onClick={() => onSelectPrompt(prompt)}
            clickable
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  )
}
