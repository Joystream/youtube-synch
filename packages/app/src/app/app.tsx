import styled from '@emotion/styled';
import {Box, ThemeProvider, AppBar, IconButton, Typography, createTheme, Toolbar, Container, Grid} from '@mui/material'
import {Add} from '@mui/icons-material'
import { UsersList, User } from './usersList';
import { ChannelsList } from './channelsList';
import { useState } from 'react';
import { Videos } from './videos';
import {GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline} from 'react-google-login'
import {QueryClient, QueryClientProvider} from 'react-query'
import axios from 'axios';

const StyledApp = styled.div`
`;
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});
export interface Channel{
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: string;
  };
  statistics: {
    viewCount: number;
    commentCount: number;
    subscriberCount: number;
    videoCount: number;
  }
}
export type VideoState = | 'new'
| 'uploadToJoystreamStarted'
| 'uploadToJoystreamFailed'
| 'uploadToJoystreamSucceded'

export interface Video{
  url: string;
  title: string;
  description: string;
  id: string;
  thumbnails: {
    default: string;
  };
  state: VideoState;
}

const queryClient = new QueryClient();
export function App() {
  const [selectedUser, setSelectedUser] = useState<User>()
  const [selectedChannel, setSelectedChannel] = useState<Channel>()
  const successAuth = (
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ) => {
    if(!response.code)
      return;
    axios.post(`http://localhost:3001/users`, {authorizationCode: response.code})
    return console.log(response);
  };
  const failedAuth = (response: any) => {
    console.log(JSON.stringify(response));
  };
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
                  <Typography variant='h6' component="div" sx={{flexGrow:1}}>
                    Youtube Sync
                  </Typography>
                  <GoogleLogin
                    clientId={process.env['YOUTUBE_CLIENT_ID']!}
                    onSuccess={successAuth}
                    accessType="offline"
                    responseType="code"
                    onFailure={failedAuth}
                    isSignedIn={true}
                    cookiePolicy="single_host_origin"
                    prompt='consent'
                    scope="https://www.googleapis.com/auth/youtube.readonly"
                    render={props => <IconButton onClick={props.onClick} disabled={props.disabled}>
                      <Add/>
                    </IconButton>}
                  />
                  
                </Toolbar>
              </AppBar>
              <Grid container direction={'row'} spacing={2} height={'100%'} sx={{marginTop:0}}>
                  <Grid item xs={2}>
                    <UsersList onSelect={setSelectedUser}/>
                  </Grid>
                  <Grid item xs={2}>
                    {selectedUser ? <ChannelsList 
                      user={selectedUser} 
                      onSelect={setSelectedChannel}></ChannelsList>  : <>Select user</>}
                  </Grid>
                  <Grid item xs={8} overflow={'hidden'} maxHeight={'100%'}>
                    {selectedChannel? <Videos user={selectedUser!} channel={selectedChannel}></Videos>
                    : "Select User and Channel"}
                  </Grid>
                </Grid>
              </Box>
              </ThemeProvider>
      </StyledApp>
    </QueryClientProvider>
  );
}

export default App;
