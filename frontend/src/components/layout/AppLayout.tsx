import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import { useColorMode } from '../../theme/ColorModeContext'

const DRAWER_WIDTH = 260

interface AppLayoutProps {
  provider?: string
  model?: string
  sidebar: React.ReactNode
  children: React.ReactNode
}

export default function AppLayout({
  provider,
  model,
  sidebar,
  children,
}: AppLayoutProps) {
  const { mode, toggleColorMode } = useColorMode()

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
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', mr: 1 }}
              variant="outlined"
            />
          )}
          <IconButton color="inherit" onClick={toggleColorMode} aria-label="Toggle theme">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
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
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {sidebar}
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
