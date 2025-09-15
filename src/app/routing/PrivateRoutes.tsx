import { lazy, FC, Suspense, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { MasterLayout } from "../../_metronic/layout/MasterLayout";
import TopBarProgress from "react-topbar-progress-indicator";
import { getCSSVariableValue } from "../../_metronic/assets/ts/_utils";
import { WithChildren } from "../../_metronic/helpers";
import { AnimatePresence } from "framer-motion";
import { useAppDispatch } from "../../store";
import { IPageLog } from "../models/global/globalGeneric";
import { insertPageLog } from "../modules/services/globalSlice";
import { writeToBrowserConsole } from "../modules/utils/common";
import { getUserToken } from "../modules/auth/core/_requests";
import { ServiceRequestForm } from "../pages/admin/new-services/service-components/ServiceRequestForm";
import { ManageFields } from "../pages/admin/new-fields/ManageFields";
import { ManageWorkflow } from "../pages/admin/workflowSetting/ManageWorkflow";
import EndUserServiceDashboard from "../pages/end-user-services/EndUserServiceDashboard";
import { EditServices } from "../pages/admin/new-services/EditServices";
import { NewServices } from "../pages/admin/new-services/NewServices";
import AdminServiceDashboard from "../pages/admin/AdminServiceDashboard";
import { ServiceRequestEndUserForm } from "../pages/end-user-services/forms/ServiceRequestEndUserForm";
import ServiceRequestList from "../pages/end-user-services/ServiceRequestList";
import Dashboard from "../modules/components/Dashboard";
import ArticlePage from "../observation/pages/ObservationPage";
import ObservationPage from "../observation/pages/ObservationPage";
import ObservationList from "../observation/pages/ObservationList";

const PrivateRoutes = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Function to be executed
    async function fetchData() {
      try {
        const { data: authTkn } = await getUserToken();
        // Assuming DDD contains the token directly or you extract it from DDD
        if (authTkn.statusCode === 200) {
          localStorage.setItem("oidc:tkn", authTkn.message); // Set the token to localStorage
        } else {
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        // Handle errors here
      }
    }

    // Call the function initially when the component mounts
    fetchData();

    // Set up an interval to call the function every 45 minutes
    const intervalId = setInterval(fetchData, 45 * 60 * 1000); // 45 minutes

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array, only runs once when component mounts

  const FmsLandingDashboard = lazy(() =>
    import("../pages/dashboard/DashboardPage").then((module) => {
      return { default: module.DashboardPage };
    })
  );

  const ChartDrillDownPage = lazy(() =>
    import("../pages/dashboard/ChartDrillDownPage").then((module) => {
      return { default: module.default };
    })
  );

  const Sample = lazy(() =>
    import("../pages/admin/new-services/NewServices").then((module) => {
      return { default: module.NewServices };
    })
  );

  const ServiceCategoryDashboard = lazy(() =>
    import(
      "../pages/end-user-services/serviceCategory/ServiceCategoryDashboard"
    ).then((module) => {
      return { default: module.ServiceCategoryDashboard };
    })
  );

  const ServiceCategoryList = lazy(() =>
    import("../pages/end-user-services/serviceCategory/ServiceList").then(
      (module) => {
        return { default: module.ServiceList };
      }
    )
  );

  const ManageCategory = lazy(() =>
    import("../pages/admin/settings/manageCatgory/ManageCategory").then(
      (module) => {
        return { default: module.ManageCategory };
      }
    )
  );
  const ManageCustomFields = lazy(() =>
    import("../pages/admin/settings/manageFields/ManageCustomFields").then(
      (module) => {
        return { default: module.ManageCustomFields };
      }
    )
  );
  const RoomManagementPage = lazy(() =>
    import("../pages/room-management/RoomManagementPage").then((module) => {
      return { default: module.default };
    })
  );
  const NotificationListPage = lazy(() =>
    import("../modules/components/notification/NotificationListPage").then(
      (module) => {
        return { default: module.default };
      }
    )
  );

  const Error404 = lazy(() =>
    import("../modules/errors/components/Error404").then((module) => {
      return { default: module.Error404 };
    })
  );

  const location = useLocation();

  useEffect(() => {
    let formDataObject: IPageLog;
    formDataObject = {
      pageName: location.pathname,
      username: "",
    };
    dispatch(insertPageLog({ formDataObject }));
    writeToBrowserConsole("Location changed! " + location.pathname);
  }, [location, dispatch]);

  return (
    <>
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          <Route path="auth/*" element={<Navigate to="/dashboard" />} />
          <Route
            path="dashboard"
            element={
              <SuspensedView>
                <Dashboard />
              </SuspensedView>
            }
          />
          <Route element={<MasterLayout />}>
            <Route
              path="dashboard"
              element={
                <SuspensedView>
                  <Dashboard />
                </SuspensedView>
              }
            />
            <Route
              path="fms-dashboard"
              element={
                <SuspensedView>
                  <FmsLandingDashboard />
                </SuspensedView>
              }
            />

            <Route
              path="notifications"
              element={
                <SuspensedView>
                  <NotificationListPage />
                </SuspensedView>
              }
            />
            <Route
              path="observation/new"
              element={
                <SuspensedView>
                  <ObservationPage />
                </SuspensedView>
              }
            />
            <Route
              path="/observation/observation-list"
              element={
                <SuspensedView>
                  <ObservationList />
                </SuspensedView>
              }
            />
            <Route
              path="*"
              element={
                <SuspensedView>
                  <Error404 />
                </SuspensedView>
              }
            />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
};

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue("--primary-3");
  TopBarProgress.config({
    barColors: {
      "0": baseColor,
    },
    barThickness: 2,
    shadowBlur: 5,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { PrivateRoutes };
