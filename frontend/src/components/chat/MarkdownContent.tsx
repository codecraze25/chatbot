import { Box, useTheme } from '@mui/material'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const theme = useTheme()
  const codeStyle = theme.palette.mode === 'dark' ? oneDark : oneLight

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? '')
      const code = String(children).replace(/\n$/, '')

      if (match) {
        return (
          <SyntaxHighlighter
            style={codeStyle}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, borderRadius: 8, fontSize: '0.85rem' }}
          >
            {code}
          </SyntaxHighlighter>
        )
      }

      return (
        <Box
          component="code"
          sx={{
            bgcolor: 'action.hover',
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontFamily: 'monospace',
            fontSize: '0.875em',
          }}
          {...props}
        >
          {children}
        </Box>
      )
    },
    pre({ children }) {
      return <Box sx={{ my: 1, overflow: 'auto' }}>{children}</Box>
    },
    p({ children }) {
      return (
        <Box component="p" sx={{ m: 0, mb: 1, '&:last-child': { mb: 0 } }}>
          {children}
        </Box>
      )
    },
    ul({ children }) {
      return (
        <Box component="ul" sx={{ m: 0, mb: 1, pl: 2.5 }}>
          {children}
        </Box>
      )
    },
    ol({ children }) {
      return (
        <Box component="ol" sx={{ m: 0, mb: 1, pl: 2.5 }}>
          {children}
        </Box>
      )
    },
  }

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
