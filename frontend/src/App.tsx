import { useQuery } from '@tanstack/react-query'
import { Box, CircularProgress, Typography } from '@mui/material'
import AppLayout from './components/layout/AppLayout'
import { getHealth } from './api/client'

function App() {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  })

  return (
    <AppLayout
      provider={health?.provider}
      model={health?.model}
      onNewChat={() => console.log('New chat — coming in Step 5')}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {isLoading && <CircularProgress />}
        {error && (
          <Typography color="error">
            Backend unavailable — start the API on port 8000
          </Typography>
        )}
        {health && (
          <Typography color="text.secondary">
            Connected to {health.provider} ({health.model})
          </Typography>
        )}
      </Box>
    </AppLayout>
  )
}

export default App
