import { CssBaseline } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ColorModeContext } from './theme/ColorModeContext'

const queryClient = new QueryClient()

function Root() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('colorMode')
    return saved === 'dark' ? 'dark' : 'light'
  })

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light'
          localStorage.setItem('colorMode', next)
          return next
        })
      },
      mode,
    }),
    [mode],
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#1976d2' },
        },
      }),
    [mode],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
