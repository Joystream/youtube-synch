import styled from '@emotion/styled'
import { Box, ThemeProvider, AppBar, Typography, createTheme, Toolbar, Grid, Button } from '@mui/material'
import { UsersList, User } from './usersList'
import { ChannelsList } from './channelsList'
import { useState } from 'react'
import { Videos } from './videos'
import { useGoogleLogin } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from 'react-query'
import axios from 'axios'

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
export type VideoState = 'new' | 'uploadToJoystreamStarted' | 'uploadToJoystreamFailed' | 'uploadToJoystreamSucceded'

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
  const [selectedUser, setSelectedUser] = useState<User>()
  const [selectedChannel, setSelectedChannel] = useState<Channel>()

  const googleLogin = useGoogleLogin({
    onSuccess: ({ code, scope }) => {
      axios.post(`http://localhost:3001/users`, {
        authorizationCode: code,
      })
    },
    flow: 'auth-code',
    //
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
            <Grid container direction={'row'} spacing={2} height={'100%'} sx={{ marginTop: 0 }}>
              <Grid item xs={2}>
                <UsersList onSelect={setSelectedUser} />
              </Grid>
              <Grid item xs={2}>
                {selectedUser ? (
                  <ChannelsList user={selectedUser} onSelect={setSelectedChannel}></ChannelsList>
                ) : (
                  <>Select user</>
                )}
              </Grid>
              <Grid item xs={8} overflow={'hidden'} maxHeight={'100%'}>
                {selectedChannel ? (
                  <Videos user={selectedUser!} channel={selectedChannel}></Videos>
                ) : (
                  'Select User and Channel'
                )}
              </Grid>
            </Grid>
          </Box>
        </ThemeProvider>
      </StyledApp>
    </QueryClientProvider>
  )
}

export default App
