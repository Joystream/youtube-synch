import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './app/app';

ReactDOM.render(
  <StrictMode>
    <GoogleOAuthProvider clientId="246331758613-rc1psegmsr9l4e33nqu8rre3gno5dsca.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
  document.getElementById('root')
);
