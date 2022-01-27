import React from 'react';
import { useEffect, useState } from 'react';
import './App.css';
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
  GoogleLogout,
} from 'react-google-login';
import axios from 'axios';
import {
  Container,
  createTheme,
  Stack,
  ThemeProvider,
  Box,
} from '@mui/material';
import Dashboard from './Dashboard';
import { User } from '../../ytube/src';
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});
function App() {
  const [count, setCount] = useState(0);
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User>();

  const successAuth = (
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ) => {
    setToken(response.code!);
  };
  const failedAuth = (response: any) => {
    console.log(JSON.stringify(response));
  };
  useEffect(() => {
    if (token)
      axios
        .post<User>('http://localhost:3001/users', {
          authorizationCode: token,
        })
        .then((user) => setUser(user.data));
  }, [token]);
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{ bgcolor: 'background.default', color: 'text.primary' }}
        height={'100vh'}
        display={'flex'}
        flexDirection="column"
      >
        <Stack
          py={2}
          direction={'row'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          {token ? (
            <GoogleLogout
              clientId="79131856482-fo4akvhmeokn24dvfo83v61g03c6k7o0.apps.googleusercontent.com"
              onLogoutSuccess={() => setToken('')}
            ></GoogleLogout>
          ) : (
            <GoogleLogin
              clientId="79131856482-fo4akvhmeokn24dvfo83v61g03c6k7o0.apps.googleusercontent.com"
              onSuccess={successAuth}
              accessType="offline"
              responseType="code"
              onFailure={failedAuth}
              isSignedIn={true}
              cookiePolicy="single_host_origin"
              scope="https://www.googleapis.com/auth/youtube.readonly"
            />
          )}
        </Stack>
        <Container>
          {user ? <Dashboard user={user}></Dashboard> : <></>}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
