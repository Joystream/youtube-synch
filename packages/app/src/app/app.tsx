import styled from '@emotion/styled'
import { Box, ThemeProvider, AppBar, Typography, createTheme, Toolbar, Button } from '@mui/material'
import { useGoogleLogin } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from 'react-query'
import axios, { AxiosError } from 'axios'

const StyledApp = styled.div``
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})
export interface Channel {
  id: string
  title: string
  description: string
  thumbnails: {
    default: string
  }
  statistics: {
    viewCount: number
    commentCount: number
    subscriberCount: number
    videoCount: number
  }
}

export type VideoState = 'new' | 'uploadToJoystreamStarted' | 'uploadToJoystreamFailed' | 'uploadToJoystreamSucceeded'

export interface Video {
  url: string
  title: string
  description: string
  id: string
  thumbnails: {
    default: string
  }
  state: VideoState
}

const queryClient = new QueryClient()

export function App() {
  const googleLogin = useGoogleLogin({
    onSuccess: async ({ code, scope }) => {
      try {
        const res = await axios.post(`http://localhost:3001/users/verify`, {
          authorizationCode: code,
        })

        console.log('success: ', res.data)
      } catch (error) {
        console.log('error: ', (error as AxiosError).response)
      }
    },
    flow: 'auth-code',

    // list of scopes to get access for
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  })

  return (
    <QueryClientProvider client={queryClient}>
      <StyledApp>
        <ThemeProvider theme={theme}>
          <Box
            sx={{ bgcolor: 'background.default', color: 'text.primary' }}
            height={'100vh'}
            display={'flex'}
            flexDirection="column"
            overflow={'hidden'}
          >
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Youtube Sync
                </Typography>
                <Button onClick={() => googleLogin()}>Verify your Youtube Channel</Button>
              </Toolbar>
            </AppBar>
          </Box>
        </ThemeProvider>
      </StyledApp>
    </QueryClientProvider>
  )
}

export default App
