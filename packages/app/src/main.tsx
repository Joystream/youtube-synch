import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import App from './app/app'

ReactDOM.render(
  <StrictMode>
    <GoogleOAuthProvider clientId="863894568729-se5qsgtk16jinlluh73n10ko75h2jfbr.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
  document.getElementById('root')
)
