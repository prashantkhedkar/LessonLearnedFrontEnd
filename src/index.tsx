import "core-js";
import { createRoot } from "react-dom/client";
// Axios
import axios from "axios";
import { Chart, registerables } from "chart.js";
import { QueryClient, QueryClientProvider } from "react-query";

// Apps
import { MetronicI18nProvider } from "./_metronic/i18n/Metronici18n";
import "./_metronic/assets/fonticon/fonticon.css";
import "./_metronic/assets/keenicons/duotone/style.css";
import "./_metronic/assets/keenicons/outline/style.css";
import "./_metronic/assets/keenicons/solid/style.css";

import "./index.css";

import { AppRoutes } from "./app/routing/AppRoutes";
import { AuthProvider } from "./app/modules/auth";
import { setupAxios } from "./app/helper/axiosInterceptor";
import { store } from "./store";
import { Provider } from "react-redux";
import {
  AuthProvider as AuthOidcProvider,
  AuthProviderProps,
} from "react-oidc-context";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";

setupAxios(axios);
Chart.register(...registerables);

const queryClient = new QueryClient();
const container = document.getElementById("root");

const oidcConfig: AuthProviderProps = {
  client_id: process.env.REACT_APP_CLIENTID!,
  client_secret: process.env.REACT_APP_CLIENT_SECRET,
  redirect_uri: window.location.origin + "/",
  response_type: process.env.REACT_APP_RESPONSETYPE!,
  authority: process.env.REACT_APP_AUTHORITY!,
  scope: process.env.REACT_APP_SCOPE!,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
};

const userManager = new UserManager(oidcConfig);

function onSigninCallback() {
  window.location.href = "/";
}

if (container) {
  // If ADFS is enabled then use OIDC Provider for authentication
  if (process.env.REACT_APP_IS_ADFS_ENABLED === "1") {
    createRoot(container).render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <MetronicI18nProvider>
            <AuthOidcProvider
              userManager={userManager}
              onSigninCallback={onSigninCallback}
            >
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </AuthOidcProvider>
          </MetronicI18nProvider>
        </Provider>
      </QueryClientProvider>
    );
  } else {
    // For Local development with Login Page
    createRoot(container).render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <MetronicI18nProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </MetronicI18nProvider>
        </Provider>
      </QueryClientProvider>
    );
  }
}
