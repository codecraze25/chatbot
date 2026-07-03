import AddIcon from '@mui/icons-material/Add'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  Toolbar,
  Typography,
} from '@mui/material'

const DRAWER_WIDTH = 240

interface AppLayoutProps {
  provider?: string
  model?: string
  onNewChat?: () => void
  children: React.ReactNode
}

export default function AppLayout({
  provider,
  model,
  onNewChat,
  children,
}: AppLayoutProps) {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chatbot
          </Typography>
          {provider && (
            <Chip
              label={`${provider} / ${model}`}
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              variant="outlined"
            />
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: 8,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={onNewChat}
          >
            New chat
          </Button>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
