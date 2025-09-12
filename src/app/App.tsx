import 'core-js'
import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { I18nProvider } from '../_metronic/i18n/i18nProvider'
import { LayoutProvider, LayoutSplashScreen } from '../_metronic/layout/core'
import { MasterInit } from '../_metronic/layout/MasterInit'
import { ThemeModeProvider } from '../_metronic/partials'
import { AuthInit } from './modules/auth'
import { Slide, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useLang } from '../_metronic/i18n/Metronici18n'
import { AnimatePresence } from "framer-motion";
import CacheBuster from "react-cache-buster";
import packageFile from "../../package.json";

const App = () => {
  const lang = useLang();
  console.log("PACKAGE VERSION");
  const { version } = packageFile;
  console.log(version);

  // For Local development with Login Page  
  if (process.env.REACT_APP_IS_ADFS_ENABLED === '0') {
    return (
      <CacheBuster
        currentVersion={version}
        isEnabled={true}
        isVerboseMode={false}
        loadingComponent={<LayoutSplashScreen />}
        metaFileDirectory={'.'}
      >
          <Suspense fallback={<LayoutSplashScreen />}>
            <I18nProvider>
              <LayoutProvider>
                <ThemeModeProvider>
                  <ToastContainer
                    position={lang === "ar" ? "top-left" : "top-right"}
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={lang === "ar" ? true : false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                    transition={Slide}
                  />
                  <AuthInit>
                    <AnimatePresence>
                      <Outlet />
                    </AnimatePresence>
                    <MasterInit />
                  </AuthInit>
                </ThemeModeProvider>
              </LayoutProvider>
            </I18nProvider>
          </Suspense>
      </CacheBuster>
    );
  } else {
    // If ADFS is enabled then use OIDC Provider for authentication 
    return (
      <CacheBuster
        currentVersion={version}
        isEnabled={true}
        isVerboseMode={false}
        loadingComponent={<LayoutSplashScreen />}
        metaFileDirectory={'.'}
      >
          <Suspense fallback={<LayoutSplashScreen />}>
            <I18nProvider>
              <LayoutProvider>
                <ThemeModeProvider>
                  <ToastContainer
                    position={lang === "ar" ? "top-left" : "top-right"}
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={lang === "ar" ? true : false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                    transition={Slide}
                  />
                  <AnimatePresence>
                    <Outlet />
                  </AnimatePresence>
                  <MasterInit />
                </ThemeModeProvider>
              </LayoutProvider>
            </I18nProvider>
          </Suspense>
      </CacheBuster>
    );
  }
}

export { App }