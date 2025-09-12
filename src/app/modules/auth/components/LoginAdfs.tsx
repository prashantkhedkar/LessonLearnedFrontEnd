/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from 'react';
import { getUserByToken, login } from '../core/_requests';
import { useAuth } from '../core/Auth';
import { useAppDispatch } from '../../../../store';
import { useNavigate } from 'react-router-dom';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import { HeaderLabels } from '../../components/common/formsLabels/detailLabels';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { useAuth as adfsUseAuth } from "react-oidc-context";
import { writeToBrowserConsole } from '../../utils/common';
import { getAdfsToken } from '../core/AuthHelpers';

export function LoginAdfs() {
  const lang = useLang();
  const [loading, setLoading] = useState(false)
  const { saveAuth, setCurrentUser, auth, checkTokenExpiration } = useAuth()
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [status, setStatus] = useState('')
  const [isValidLogin, setIsValidLogin] = useState(true);

  const adfsAuth = adfsUseAuth();

  useEffect(() => {
    if (adfsAuth.isAuthenticated === false && adfsAuth.isLoading === false) {
      adfsAuth.signinRedirect();
    }

    if (adfsAuth.isAuthenticated === true) {
      fetchData();
    }
  }, [adfsAuth.isAuthenticated, adfsAuth.isLoading]);

  const fetchData = async () => {
    try {
      let upnEmailaddress: string = process.env.REACT_APP_TEST_USERNAME!;

      const output = JSON.parse(JSON.stringify(adfsAuth));
      writeToBrowserConsole(JSON.stringify(output.user.access_token));
      if (adfsAuth.user && output.user.profile.upn) {
        upnEmailaddress = output.user.profile.upn.split('@')[0].toString();
      }
      const { data: auth } = await login(upnEmailaddress, output.user.access_token);

      // const { data: auth } = await login(upnEmailaddress, process.env.REACT_APP_TEST_PWD!, getAdfsToken());
      if (auth && auth.userName) {
        writeToBrowserConsole("fetchData from db");

        saveAuth(auth);
        const { data: user } = await getUserByToken(auth.jwtToken, auth.userName);
        setCurrentUser(user);
        setStatus('');
        setIsValidLogin(true);
      } else {
        adfsAuth.signoutSilent();
        saveAuth(undefined);
        setLoading(false);
        setIsValidLogin(false);
      }
    } catch (error) {
      adfsAuth.signoutSilent();
      saveAuth(undefined);
      setLoading(false);
      setIsValidLogin(false);
    }
  };

  return (
    <>
      <form
        className='form w-100'
        noValidate
        id='kt_login_signin_form'>
        <div className='text-center mb-8'>
          {
            lang === 'ar' ? (
              <img src={toAbsoluteUrl(`/media/logos/png/logo-ar.png`)} className={`login-logo`} />
            ) :
              (
                <img src={toAbsoluteUrl(`/media/logos/png/logo.png`)} className={`login-logo`} />
              )
          }
        </div>

        <div className='text-center mb-8'>
          {
            (adfsAuth.isLoading === true && adfsAuth.isAuthenticated === false && isValidLogin) &&
            <HeaderLabels isI18nKey={false} text={(lang === 'ar') ? 'المصادقة...' : 'Redirecting to Login...'} />
          }
          {
            isValidLogin && !adfsAuth.isLoading &&
            <HeaderLabels isI18nKey={false} text={(lang === 'ar') ? 'المصادقة...' : 'Authenticating...'} />
          }
          {
            !isValidLogin &&
            <HeaderLabels isI18nKey={false} text={(lang === 'ar') ? 'Please contact administrator as your account does not exist in Smart Tawasul' : 'Please contact administrator as your account does not exist in Smart Tawasul'} />
          }
        </div>
      </form>
    </>
  )
}