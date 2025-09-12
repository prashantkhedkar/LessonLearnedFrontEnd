import { useEffect } from 'react'
import { Navigate, Routes } from 'react-router-dom'
import { useAuth } from './core/Auth'
import { removeLocalStorage } from '../utils/common';

export function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    ;
    const I18N_CONFIG_KEY = process.env.REACT_APP_I18N_CONFIG_KEY || 'i18nConfig';
    removeLocalStorage(I18N_CONFIG_KEY);

    logout();
    document.location.reload();
  }, [logout]);

  return (
    <Routes>
      <Navigate to='/auth/login' />
    </Routes>
  )
}