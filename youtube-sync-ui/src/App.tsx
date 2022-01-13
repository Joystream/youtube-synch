import { useEffect, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import  GoogleLogin, {GoogleLoginResponse, GoogleLoginResponseOffline, GoogleLogout} from 'react-google-login'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import axios from 'axios'
interface User{
  name: string,
  email: string,
  displayName: string,
  accessToken: string,
  refreshToken: string
}
function App() {
  const [count, setCount] = useState(0)
  const [token, setToken] = useState('')
  const [profile, setProfile] = useState<GoogleLoginResponse>()

  const successAuth = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    setToken(response.code!)
  }
  const failedAuth = (response:any) => {
    console.log(JSON.stringify(response))
  }
  useEffect(() => {
    axios.post<User>('http://localhost:3001', {
      authorizationCode: token
    }).then(user => console.log(user))
  }, [profile]);
  return (
    <div className='mx-auto my-auto h-screen flex items-center justify-center'>
      <div className='flex items-center justify-center px-4 py-4'>
        {token 
          ?  <>
              <span className=''>Your token: {token}</span>
              <CopyToClipboard text={token}>
                <button className='btn btn-square btn-md'>
                  Copy
                </button>
              </CopyToClipboard>
              <GoogleLogout 
                clientId='79131856482-fo4akvhmeokn24dvfo83v61g03c6k7o0.apps.googleusercontent.com'
                onLogoutSuccess={() => setToken('')}></GoogleLogout>
             </>
          : <GoogleLogin 
          clientId='79131856482-fo4akvhmeokn24dvfo83v61g03c6k7o0.apps.googleusercontent.com'
          onSuccess={successAuth}
          accessType='offline'
          responseType='code'
          onFailure={failedAuth}
          cookiePolicy='single_host_origin'
          scope='https://www.googleapis.com/auth/youtube.readonly'/>
          }
        
      </div>
    </div>
  )
}

export default App
