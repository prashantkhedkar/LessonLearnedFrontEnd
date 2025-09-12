import {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { LayoutSplashScreen } from "../../../../_metronic/layout/core";
import { AuthModel } from "./_models";
import * as authHelper from "./AuthHelpers";
import { WithChildren } from "../../../../_metronic/helpers";
import { useAuth as adfsUseAuth } from "react-oidc-context";
import { getUserByToken, login } from "./_requests";
import { getAdfsToken, isAdfsTokenExpired } from "./AuthHelpers";
import { useLocation } from "react-router-dom";
import {
  captureReturnPath,
  clearStore,
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "../../utils/common";

type AuthContextProps = {
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: AuthModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<AuthModel | undefined>>;
  logout: () => void;
  checkTokenExpiration: () => number;
};

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => {},
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
  checkTokenExpiration: () => 2,
};

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState);

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider: FC<WithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<AuthModel | undefined>();
  const adfsAuth = adfsUseAuth();

  captureReturnPath();
  clearStore();

  // useEffect(() => {
  //   return adfsAuth.events.addAccessTokenExpiring(() => {
  //     adfsAuth.revokeTokens();
  //   })
  // }, [adfsAuth.events]);

  // useEffect(() => {
  //   if (isAdfsTokenExpired() === 1) {
  //     adfsAuth.signinSilent();
  //   }
  // }, [adfsAuth]);

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
    //removeLocalStorage("ReturnURL");

    sessionStorage.clear(); // Clears all session storage data
    
    // if (adfsAuth) {
    //   adfsAuth.removeUser();
    //   adfsAuth.signoutRedirect();
    //   adfsAuth.signinRedirect();
    // }
    if (adfsAuth) {
      const idToken = adfsAuth.user?.id_token;
      adfsAuth.removeUser();
      adfsAuth.signoutRedirect({
        id_token_hint: idToken,
        post_logout_redirect_uri:
          process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI,
      });
      adfsAuth.signinRedirect();
    }
  };

  const checkTokenExpiration = () => {
    const output = isAdfsTokenExpired();

    //If adfs token is about to expire
    if (output === 1) {
      fetchData();
    }

    return output;
  };

  const fetchData = async () => {
    try {
      let upnEmailaddress: string = process.env.REACT_APP_TEST_USERNAME!;

      const output = JSON.parse(JSON.stringify(adfsAuth));
      if (adfsAuth.user && output.user.profile.upn) {
        upnEmailaddress = output.user.profile.upn.split("@")[0].toString();
      }
      const { data: auth } = await login(
        upnEmailaddress,
        "U00002",
      );

      // const { data: auth } = await login(upnEmailaddress, "U00002", getAdfsToken());
      if (auth && auth.userName) {
        saveAuth(auth);
        const { data: user } = await getUserByToken(
          auth.jwtToken,
          auth.userName
        );
        setCurrentUser(user);
      } else {
        saveAuth(undefined);
      }
    } catch (error) {
      saveAuth(undefined);
    }
  };

  return (
    <>
      <AuthContext.Provider
        value={{
          auth,
          saveAuth,
          currentUser,
          setCurrentUser,
          logout,
          checkTokenExpiration,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { auth, logout, setCurrentUser } = useAuth();
  const didRequest = useRef(false);
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  // We should request user by authToken (IN OUR EXAMPLE IT'S API_TOKEN) before rendering the application
  useEffect(() => {
    const requestUser = async (apiToken: string, email: string) => {
      try {
        if (!didRequest.current) {
          const { data } = await getUserByToken(apiToken, email);
          if (data) {
            setCurrentUser(data);
          }
        }
      } catch (error: any) {
        console.log(error);
        if (!didRequest.current) {
          logout();
        }
      } finally {
        setShowSplashScreen(false);
      }

      return () => (didRequest.current = true);
    };

    if (auth && auth.jwtToken) {
      requestUser(auth.jwtToken, auth.userName);
    } else {
      logout();
      setShowSplashScreen(false);
    }
    // eslint-disable-next-line
  }, []);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthProvider, AuthInit, useAuth };
