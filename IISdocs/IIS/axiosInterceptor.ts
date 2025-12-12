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

// Cache for storing detected client IP
let clientIPCache: string | null = null;

// Cache for storing client IP from IIS headers
let iisClientIPCache: string | null = null;

// Function to get client IP from various sources (offline-compatible)
function getClientIP(): string {
  // Return cached IP if available
  if (clientIPCache) {
    return clientIPCache;
  }

  // Method 1: Try to get IP from browser's navigator information
  try {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      clientIPCache = `connection-${connection.effectiveType || 'detected'}`;
      return clientIPCache;
    }
  } catch (error) {
    console.warn('Browser connection detection failed:', error);
  }

  // Method 2: Try WebRTC with local-only configuration (works offline)
  try {
    const rtc = new RTCPeerConnection({
      iceServers: [] // Empty array for local-only operation (no internet required)
    });
    
    rtc.createDataChannel('local');
    
    rtc.createOffer().then(offer => {
      rtc.setLocalDescription(offer);
    }).catch(e => console.warn('Local WebRTC offer failed:', e));
    
    rtc.onicecandidate = (ice) => {
      if (ice.candidate) {
        const candidate = ice.candidate.candidate;
        
        // Look for local IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const localIPMatch = candidate.match(/(?:192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.)(?:\d{1,3}\.){1}\d{1,3}/);
        if (localIPMatch) {
          clientIPCache = localIPMatch[0];
          console.log('Detected local IP:', clientIPCache);
          rtc.close();
          return;
        }
        
        // Fallback: any IPv4 address that's not localhost
        const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (ipMatch && ipMatch[1] && !ipMatch[1].startsWith('127.')) {
          clientIPCache = ipMatch[1];
          console.log('Detected client IP:', clientIPCache);
          rtc.close();
        }
      }
    };

    // Close connection after a short delay if no IP found
    setTimeout(() => {
      if (rtc.connectionState !== 'closed') {
        rtc.close();
      }
    }, 1000); // Reduced timeout for offline operation

  } catch (error) {
    console.warn('WebRTC IP detection failed:', error);
  }

  // Method 3: Generate a unique browser identifier as fallback
  if (!clientIPCache) {
    try {
      // Create a consistent identifier based on browser characteristics
      const userAgent = navigator.userAgent;
      const screen = `${window.screen.width}x${window.screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      
      // Simple hash of browser characteristics
      const browserFingerprint = btoa(`${userAgent}-${screen}-${timezone}-${language}`).substring(0, 12);
      clientIPCache = `browser-${browserFingerprint}`;
      
      console.log('Using browser fingerprint as client identifier:', clientIPCache);
    } catch (error) {
      console.warn('Browser fingerprinting failed:', error);
      clientIPCache = `offline-${Date.now().toString(36)}`;
    }
  }
  
  return clientIPCache || 'offline-unknown';
}

// Initialize IP detection on module load
(function initializeIPDetection() {
  try {
    getClientIP();
  } catch (error) {
    console.warn('Failed to initialize IP detection:', error);
    clientIPCache = 'initialization-failed';
  }
})();

// Function to get client IP from IIS-provided headers (preferred method)
function getClientIPFromIIS(): string | null {
  // Return cached IIS client IP if available
  if (iisClientIPCache) {
    return iisClientIPCache;
  }

  // Check if we have any IIS-provided client IP in sessionStorage from previous responses
  try {
    const storedClientIP = sessionStorage.getItem('iisClientIP');
    if (storedClientIP) {
      iisClientIPCache = storedClientIP;
      return iisClientIPCache;
    }
  } catch (error) {
    console.warn('Failed to retrieve IIS client IP from session storage:', error);
  }

  return null;
}

// Function to extract server information from response headers
function extractServerInfo(response: AxiosResponse): { serverIP?: string; serverName?: string; iisVersion?: string; clientIP?: string } {
  const serverInfo: { serverIP?: string; serverName?: string; iisVersion?: string; clientIP?: string } = {};
  
  // Extract server information from response headers
  const headers = response.headers;
  
  if (headers['server']) {
    const serverHeader = headers['server'];
    if (serverHeader.includes('IIS')) {
      serverInfo.iisVersion = serverHeader;
    }
    serverInfo.serverName = serverHeader;
  }
  
  // Look for server IP headers that IIS might send
  if (headers['x-server-ip']) {
    serverInfo.serverIP = headers['x-server-ip'];
  }
  
  // Extract client IP from IIS-provided headers (multiple possible header names)
  let detectedClientIP: string | null = null;
  
  // Priority order for client IP headers (most reliable first)
  const clientIPHeaders = [
    'x-forwarded-for',     // Standard proxy header
    'x-real-ip',           // Nginx/IIS real IP
    'x-client-ip',         // Custom client IP header
    'cf-connecting-ip',    // Cloudflare
    'x-original-forwarded-for',  // Original client IP
    'x-remote-addr'        // Remote address
  ];
  
  for (const headerName of clientIPHeaders) {
    const headerValue = headers[headerName];
    if (headerValue) {
      // Handle comma-separated IPs (X-Forwarded-For can have multiple IPs)
      const ips = headerValue.split(',').map((ip: string) => ip.trim());
      detectedClientIP = ips[0]; // Take the first (original client) IP
      break;
    }
  }
  
  // If client IP detected from IIS headers, cache it
  if (detectedClientIP && !iisClientIPCache) {
    iisClientIPCache = detectedClientIP;
    serverInfo.clientIP = detectedClientIP;
    
    // Store in sessionStorage for future requests
    try {
      sessionStorage.setItem('iisClientIP', detectedClientIP);
      console.log('Client IP detected from IIS headers:', detectedClientIP);
    } catch (error) {
      console.warn('Failed to store IIS client IP in session storage:', error);
    }
  } else if (detectedClientIP) {
    serverInfo.clientIP = detectedClientIP;
  }
  
  // Check for IIS specific headers
  if (headers['x-aspnet-version']) {
    serverInfo.iisVersion = (serverInfo.iisVersion || '') + ` ASP.NET ${headers['x-aspnet-version']}`;
  }
  
  return serverInfo;
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
          
          // Get client IP - prefer IIS-provided IP, fallback to browser detection
          let clientIP = getClientIPFromIIS();
          if (!clientIP) {
            clientIP = getClientIP(); // Fallback to browser detection
            console.log('Using browser-detected client IP (IIS IP not available):', clientIP);
          } else {
            console.log('Using IIS-provided client IP:', clientIP);
          }
          
          config.headers["X-Client-IP"] = clientIP; // Client IP address
          config.headers["X-Request-Server-Info"] = "true"; // Request server to include server info
          config.headers["X-Request-Client-IP"] = "true"; // Request server to include client IP in response
          
          // Debug logging for client IP (remove in production)
          if (config.url?.includes('/Account/Authenticate')) {
            console.log('Authentication request - Client IP:', clientIP);
            console.log('Request headers:', config.headers);
          }
        }
      }

      return config;
    },
    (err: any) => Promise.reject(err) // Handle request errors
  );

  // Response Interceptor: Handle response or errors after receiving the response
  axios.interceptors.response.use(
    (res) => {
      // Extract and log server information
      const serverInfo = extractServerInfo(res);
      if (Object.keys(serverInfo).length > 0) {
        console.log('IIS Server Info:', serverInfo);
        // Optionally store server info in sessionStorage for later use
        sessionStorage.setItem('serverInfo', JSON.stringify(serverInfo));
      }
      
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

// Utility function to get stored server information
export function getServerInfo(): { serverIP?: string; serverName?: string; iisVersion?: string; clientIP?: string } | null {
  try {
    const storedInfo = sessionStorage.getItem('serverInfo');
    return storedInfo ? JSON.parse(storedInfo) : null;
  } catch (error) {
    console.error('Error retrieving server info:', error);
    return null;
  }
}

// Utility function to get client IP (for external use)
export function getCurrentClientIP(): string {
  // Prefer IIS-provided IP, fallback to browser detection
  const iisIP = getClientIPFromIIS();
  return iisIP || getClientIP();
}

// Utility function to get IIS-provided client IP specifically
export function getIISClientIP(): string | null {
  return getClientIPFromIIS();
}

export default agent;
