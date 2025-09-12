/* THIS IS NOT A REACT RELATED FILE  */
/* Below script contains HTTP request & response configuration and serves as a Hub to connect react component via Redux-thunk with .netcore api  */
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  getAdfsToken,
  getAuth,
  isAdfsTokenExpired,
  removeAuth,
  setAuth,
  getAdfsTokenNew,
} from "../modules/auth/core/AuthHelpers";
import { Row } from "../models/row";
import { responseType } from "../models/global/responseResult";
import { writeToBrowserConsole } from "../modules/utils/common";

// Key for Internationalization configuration in localStorage
const I18N_CONFIG_KEY = process.env.REACT_APP_I18N_CONFIG_KEY || "i18nConfig";

// Simulate slowness on web browser (disabled for now)
// const sleep = () => new Promise(resolve => setTimeout(resolve, 500));

// Utility function to extract response body from Axios response
const responseBody = <T>(response: AxiosResponse<T>) => response.data;

// Default configuration for language
type Props = {
  selectedLang: "en" | "ar";
};

// Initial state for language settings
const initialState: Props = {
  selectedLang: "ar",
};

// Function to get the language configuration from localStorage
function getConfig(): Props {
  const ls = localStorage.getItem(I18N_CONFIG_KEY);
  if (ls) {
    try {
      return JSON.parse(ls) as Props;
    } catch (er) {
      console.error(er);
    }
  }
  return initialState; // Return default language if none is set in localStorage
}

// Flags to handle token refresh process
let isRefreshing = false; // Flag to track if refresh token request is in progress
let refreshTokenSubscribers: Array<(jwtToken: string) => void> = []; // Queue of subscribers waiting for new token

// Function to add a subscriber to the queue
function subscribeTokenRefresh(callback: (jwtToken: string) => void) {
  refreshTokenSubscribers.push(callback);
}

// Function to notify all subscribers with the new token once refreshed
function onTokenRefreshed(jwtToken: string) {
  refreshTokenSubscribers.forEach((callback) => callback(jwtToken));
  refreshTokenSubscribers = []; // Clear the queue after notifying all
}

// Main function to set up Axios configurations, including interceptors for request and response
export function setupAxios(axios: any) {
  axios.defaults.headers.Accept = "application/json"; // Set default headers
  axios.defaults.baseURL = process.env.REACT_APP_API_URL; // API base URL
  axios.defaults.withCredentials = true; // Allow cookie sharing across requests
  axios.defaults.maxContentLength = 1024 * 1024 * 500; // Max request content length (500MB)
  axios.defaults.maxBodyLength = 1024 * 1024 * 500; // Max body length (500MB)
  axios.default.timeout = 2000; // Request timeout (2 seconds)

  // Request Interceptor: Modify request before sending it
  axios.interceptors.request.use(
    (config) => {
      const parseConfig = JSON.parse(JSON.stringify(config));

      // If custom mediaCenterURL is set, no token required (for specific media center APIs)
      if (
        parseConfig.custom &&
        parseConfig.custom.mediaCenterURL &&
        parseConfig.custom.mediaCenterURL === true
      ) {
        // No Token Authentication for mediaCenterURL request
      } else {
        if (isAdfsTokenExpired() === 1) {
          writeToBrowserConsole("Token will be renewed"); // Log token renewal message
        }

        const auth = getAuth();
        const adfsTokenString: string = getAdfsToken();
        const adfsTokenStringNew: string = getAdfsTokenNew(); // getAdfsToken();

        // Set Authorization headers if JWT token exists in auth state
        if (auth && auth.jwtToken) {
          config.headers["Content-Type"] = "application/json";
          config.headers["Accept"] = "application/json";
          config.headers["Authorization"] = `Bearer ${auth.jwtToken}`;
          config.headers["ATKN"] =
            process.env.REACT_APP_IS_ADFS_ENABLED === "1"
              ? adfsTokenString
              : adfsTokenStringNew;
          config.headers["Username"] = auth.userName; // Username from auth state
          config.headers["Consumer"] = "FMS"; // Consumer identifier
          config.headers["Language"] = getConfig().selectedLang; // Language preference
        }
      }

      return config;
    },
    (err: any) => Promise.reject(err) // Handle request errors
  );

  // Response Interceptor: Handle response or errors after receiving the response
  axios.interceptors.response.use(
    (res) => {
      return res; // Return the response as is
    },
    async (error: AxiosError) => {
      const originalConfig = error.config;

      if (error.response) {
        const { data, status } = error.response as AxiosResponse;
        
        // Handle specific HTTP response codes
        switch (status) {
          case 400: {
            // Handle Bad Request: Collect and throw validation errors from the response
            if (data.errors) {
              const modelStateErrors: string[] = [];
              for (const key in data.errors) {
                if (data.errors[key]) {
                  modelStateErrors.push(data.errors[key]);
                }
              }
              throw modelStateErrors.flat();
            }
            break;
          }
          case 401: {
            // Handle Unauthorized: Token refresh flow if access token expires
            const auth = getAuth();
            if (auth && auth.refreshToken) {
              if (!isRefreshing) {
                // Set flag to indicate token refresh is in progress
                isRefreshing = true;

                try {
                  // Attempt to refresh the JWT token
                  const refreshResponse = await axios.post(
                    `${process.env.REACT_APP_API_URL}/Account/RefreshToken`,
                    {
                      refreshToken: auth.refreshToken,
                      accessToken: auth.jwtToken,
                    }
                  );

                  const { jwtToken, refreshToken } = refreshResponse.data;

                  // Update auth state with new tokens
                  setAuth({ ...auth, jwtToken, refreshToken });

                  // Notify subscribers with the new token
                  onTokenRefreshed(jwtToken);

                  // Retry the original request with the new token
                  return axios(originalConfig);
                } catch (refreshError) {
                  removeAuth(); // Remove auth state if refresh fails and reload page
                  document.location.reload();
                  return Promise.reject(refreshError);
                } finally {
                  // Reset the flag after the refresh request completes
                  isRefreshing = false;
                }
              } else {
                // If a refresh request is already in progress, queue the request
                return new Promise((resolve) => {
                  subscribeTokenRefresh((newJwtToken) => {
                    resolve(axios(originalConfig));
                  });
                });
              }
            } else {
              removeAuth(); // If no refresh token, remove auth and reload the page
              // document.location.reload();
            }
            break;
          }
          case 404:
            // Handle Not Found: log or handle errors for 404 status
            break;
          case 500:
            // Handle Internal Server Error: log or handle errors for 500 status
            break;
          default:
            // Handle any other errors
            break;
        }
      }

      return Promise.reject(error); // Reject if response has errors
    }
  );
}

// API request methods (GET, POST, PUT, DELETE)
export const requests = {
  get: <T>(url: string, params?: URLSearchParams) =>
    axios.get<T>(url, { params }).then(responseBody),
  post: <T>(url: string, body: {}, config?: {}) =>
    axios.post<T>(url, body, config).then(responseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => axios.delete<T>(url).then(responseBody),
  customGet: <T>(url: string, config?: {}) =>
    axios.get<T>(url, config).then(responseBody),
};

// Export API agent containing task management methods
const agent = {};

export default agent;
