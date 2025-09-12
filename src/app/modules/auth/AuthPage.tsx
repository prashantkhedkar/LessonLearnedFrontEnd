import { Route, Routes } from 'react-router-dom'
import { Login } from './components/Login'
import { AuthLayout } from './AuthLayout'
import { LoginAdfs } from './components/LoginAdfs';

const AuthPage = () => (
  <>
    <Routes>
      <Route element={<AuthLayout />}>
        {
          // For Local development with Login Page 
          process.env.REACT_APP_IS_ADFS_ENABLED === '0' && (
            <>
              <Route path='login' element={<Login />} />
              <Route index element={<Login />} />
            </>
          )
        }

        {/* {
          // If ADFS is enabled then use OIDC Provider for authentication 
          process.env.REACT_APP_IS_ADFS_ENABLED === '1' && (
            <>
              <Route path='/*' element={<LoginAdfs />} />
              <Route index element={<LoginAdfs />} />
            </>
          )
        } */}
      </Route>
    </Routes>
  </>
)

export { AuthPage }
