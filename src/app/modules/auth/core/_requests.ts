import axios from 'axios'
import { AuthModel } from './_models'
import { IRoleAcces } from '../../../models/global/globalGeneric'
import { responseType } from '../../../models/global/responseResult';

const API_URL = process.env.REACT_APP_API_URL;
const SSO_API_URL = process.env.REACT_APP_API_SSOURL;
export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/Account/VerifyToken`
export const LOGIN_URL_NEW = `${API_URL}/Account/AuthenticateTest`
export const LOGIN_URL = `${API_URL}/Account/Authenticate`
export const USER_ACCESS = `${API_URL}/Generic/GetUserRoles`
export const TOKEN_URL = `${API_URL}/Account/GetOIDCT`
export const SSOAPI_URL = `${SSO_API_URL}`

// Server should return AuthModel
export function login(username: string, token: string) {
  return axios.post<AuthModel>(LOGIN_URL, {
    username,
    token
  })
}

export function loginNew(userName: string, password: string, token: string) {
  return axios.post<AuthModel>(LOGIN_URL_NEW, {
    userName,
    password,
    token
  })
}

export function getUserByToken(token: string, userName: string) {
  return axios.post<AuthModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    token,
    userName
  })
}

export function getUserToken() {
  return axios.get<responseType>(TOKEN_URL, {
  })
}

export function getUserName() {
  return axios.get(SSOAPI_URL, {
  })
}

export function getUserAccessRoles(token: string) {
  const config = {
    headers: {
      authentication: token

    }
  };
  return axios.get<IRoleAcces>(USER_ACCESS, config)
}