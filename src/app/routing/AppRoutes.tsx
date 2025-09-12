import { FC } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { ErrorsPage } from "../modules/errors/ErrorsPage";
import { App } from "../App";
import { AuthPage, useAuth } from "../modules/auth";
import { LogoutRedirection } from "../modules/auth/LogoutRedirection";
const { PUBLIC_URL } = process.env;

const AppRoutes: FC = () => {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path="error/*" element={<ErrorsPage />} />
          {(currentUser && process.env.REACT_APP_IS_ADFS_ENABLED === "1") ||
          (currentUser && process.env.REACT_APP_IS_ADFS_ENABLED === "0") ? (
            <>
              <Route path="logoutFMS" element={<LogoutRedirection />} />
              <Route path="/*" element={<PrivateRoutes />} />
              <Route index element={<Navigate to="/dashboard" />} />
            </>
          ) : (
            <>
              {process.env.REACT_APP_IS_ADFS_ENABLED === "1" && (
                <>
                  <Route path="logoutFMS" element={<LogoutRedirection />} />
                  <Route path="/*" element={<AuthPage />} />
                  <Route path="*" element={<Navigate to="/auth" />} />
                </>
              )}

              {process.env.REACT_APP_IS_ADFS_ENABLED === "0" && (
                <>
                  <Route path="auth/*" element={<AuthPage />} />
                  <Route path="*" element={<Navigate to="/auth" />} />
                </>
              )}
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };
