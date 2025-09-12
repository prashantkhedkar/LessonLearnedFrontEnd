import { AuthModel } from "./_models";

const AUTH_LOCAL_STORAGE_KEY = "kt-auth-react-v";

export const getAuth = (): AuthModel | undefined => {
  if (!localStorage) {
    return;
  }

  const lsValue: string | null = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);
  if (!lsValue) {
    return;
  }

  try {
    const auth: AuthModel = JSON.parse(lsValue) as AuthModel;
    if (auth) {
      // You can easily check auth_token expiration also
      return auth;
    }
  } catch (error) {
    console.error("AUTH LOCAL STORAGE PARSE ERROR", error);
  }
};

export const setAuth = (auth: AuthModel) => {
  if (!localStorage) {
    return;
  }

  try {
    const lsValue = JSON.stringify(auth);
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, lsValue);
  } catch (error) {
    console.error("AUTH LOCAL STORAGE SAVE ERROR", error);
  }
};

export const removeAuth = () => {
  if (!localStorage) {
    return;
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("AUTH LOCAL STORAGE REMOVE ERROR", error);
  }
};

export const isAdfsTokenExpired = () => {
  if (!localStorage) {
    return 2;
  }

  const lsValue: string | null = localStorage.getItem(`oidc.user:${process.env.REACT_APP_AUTHORITY}:${process.env.REACT_APP_CLIENTID}`);
  if (!lsValue) {
    return 2;
  }

  const oidcStorage = JSON.parse(lsValue);
  const now = Math.floor(Date.now() / 1000);
  const expiration = oidcStorage.expires_at || 0;

  const expirationDate = new Date(expiration * 1000);

  if ((expiration - now) <= 10) {
    // Token will expire in less than 60 seconds, renew it
    //renewToken();
    //console.log("Token about to expire : Yes " + (expiration - now));
    return 1;
  } else {
    //console.log("Active Token : Yes " + expirationDate);
    return 0;
  }

  // return (!!oidcStorage && !!oidcStorage.expires_at);
};

export const getAdfsTokenNew = () => {
  if (!localStorage) {
    return "";
  }

 
  const lsValue: string | null = localStorage.getItem("oidc:tkn");
  if (lsValue) {
    //const output = JSON.parse(lsValue);
    //// Mod ADFS
    //return output.user.access_token;

    //Demo ADFS
    return lsValue;
  } else {
    return "";
  }
};

export const getAdfsToken = () => {
  if (!localStorage) {
    return "";
  }

 
  const lsValue: string | null = localStorage.getItem(`oidc.user:${process.env.REACT_APP_AUTHORITY}:${process.env.REACT_APP_CLIENTID}`);
  if (lsValue) {
    const output = JSON.parse(lsValue);
    //// Mod ADFS
    //return output.user.access_token;

    //Demo ADFS
    return output.access_token;
  } else {
    return "";
  }
};

export const getUserRole = () => {
  if (!localStorage) {
    return "";
  }

  const lsValue: string | null = localStorage.getItem(`oidc.user:${process.env.REACT_APP_AUTHORITY}:${process.env.REACT_APP_CLIENTID}`);
  if (lsValue) {
    const output = JSON.parse(lsValue);
    //// Mod ADFS
    //return output.user.access_token;

    //Demo ADFS
    return output.access_token;
  } else {
    return "";
  }
};