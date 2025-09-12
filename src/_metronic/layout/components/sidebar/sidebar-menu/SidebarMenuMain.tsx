/* eslint-disable react/jsx-no-target-blank */
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { toAbsoluteUrl } from "../../../../helpers";
import { useAppDispatch } from "../../../../../store";
import { fetchUserRolesAccessAsync } from "../../../../../app/modules/services/globalSlice";
import RolesConstant from "../../../../../app/helper/_constant/roles.constant";
import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";

// ADD MENU TO THE SIDE BAR HERE
const SidebarMenuMain = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [fmsAdmin, setFmsAdmin] = useState(false);
  const [unitAdmin, setUnitAdmin] = useState(false);
  const [requestingUnit, setRequestingUnit] = useState(false);
  const [fulfillmentUnit, setFulfillmentUnit] = useState(false);
  const [securityUnit, setSecurityUnit] = useState(false);
  const [delegationUnit, setDelegationUnit] = useState(false);
  const [supportingUnit, setSupportingUnit] = useState(false);

  useEffect(() => {
    dispatch(fetchUserRolesAccessAsync()).then((response) => {
      setFmsAdmin(
        response.payload.data &&
          response.payload.data.filter((item) => {
            return item.roleName.trim() == RolesConstant.FMSADMIN;
          }).length > 0
          ? true
          : false
      );

      setUnitAdmin(
        response.payload.data &&
          response.payload.data.filter((item) => {
            return item.roleName.trim() == RolesConstant.UNITADMIN;
          }).length > 0
          ? true
          : false
      );

      setRequestingUnit(
        response.payload.data &&
          response.payload.data.filter((item) => {
            return item.roleName.trim() == RolesConstant.REQUESTINGUNIT;
          }).length > 0
          ? true
          : false
      );

      setFulfillmentUnit(
        response.payload.data &&
          response.payload.data.filter((item) => {
            return item.roleName.trim() == RolesConstant.FULFILLMENTUNIT;
          }).length > 0
          ? true
          : false
      );

      setSecurityUnit(
        response.payload.data &&
          response.payload.data.filter((item) => {
            return item.roleName.trim() == RolesConstant.SECURITYUNIT;
          }).length > 0
          ? true
          : false
      );

      setSupportingUnit(
        response.payload.data &&
          response.payload.data.filter((item) => {
            return item.roleName.trim() == RolesConstant.SUPPORTINGUNIT;
          }).length > 0
          ? true
          : false
      );

      setDelegationUnit(
        response.payload.data &&
          response.payload.data.filter((item) => {
            return item.roleName.trim() == RolesConstant.DELEGATIONUNIT;
          }).length > 0
          ? true
          : false
      );
    });
  }, []);

  return (
    <>
      <SidebarMenuItem
        to="/fms-dashboard"
        title={intl.formatMessage({ id: "MENU.HEADER.FMSDASHBOARD" })}
        fontIcon="fa fa-gauge fa-lg pe-3"
      />

      <div className="my-05"></div>

      {fmsAdmin && (
        <>
          <SidebarMenuItem
            to="/admin-dashboard"
            title={intl.formatMessage({
              id: "MENU.HEADER.LABEL.SIDEBAR.MENU.ADMIN.DASHBOARD",
            })}
            fontIcon="fa fa-regular fa-files fa-lg pe-3"
          />
          <SidebarMenuItemWithSub
            to="#"
            title={intl.formatMessage({
              id: "LABEL.SIDEBAR.MENU.ADMIN.SETTINGS",
            })}
            fontIcon="fa fa-regular fa-gear fa-lg pe-3"
          >
            <SidebarMenuItem
              to={"/setting-managecategory"}
              title={intl.formatMessage({
                id: "LABEL.SIDEBAR.MENU.SETTINGS.MANAGECATEGORY",
              })}
              fontIcon="fa fa-light fa-list fa-sm pe-2"
            />
            <SidebarMenuItem
              to={"/setting-managefields"}
              title={intl.formatMessage({
                id: "LABEL.SIDEBAR.MENU.SETTINGS.MANAGEFIELDS",
              })}
              fontIcon="fa fa-light fa-pen-field fa-sm pe-2"
            />
          </SidebarMenuItemWithSub>
        </>
      )}

      {(unitAdmin ||
        requestingUnit ||
        fulfillmentUnit ||
        securityUnit ||
        delegationUnit ||
        supportingUnit) && (
        <>
          <SidebarMenuItem
            to="/service-request-dashboard"
            icon={toAbsoluteUrl(
              "/media/svg/mod-specific/icon-strok-calendar-home.svg"
            )}
            title={intl.formatMessage({
              id: "MENU.HEADER.SERVICEREQUEST-DASHBOARD",
            })}
            fontIcon="fa fa-regular fa-files fa-lg pe-3"
          />

          <div className="my-05"></div>
          <SidebarMenuItem
            to="end-user/service-request-list"
            icon={toAbsoluteUrl(
              "/media/svg/mod-specific/icon-strok-calendar-home.svg"
            )}
            title={intl.formatMessage({
              id: "LABEL.SIDEBAR.MENU.SERVICEREQUESTLIST",
            })}
            fontIcon="fa fa-light fa-folder-open fa-lg pe-3"
          />
        </>
      )}
      {fulfillmentUnit && (
        <>
          <SidebarMenuItemWithSub
            to="#"
            title={intl.formatMessage({
              id: "LABEL.SIDEBAR.MENU.ADMIN.SETTINGS",
            })}
            fontIcon="fa fa-regular fa-gear fa-lg pe-3"
          >
            <SidebarMenuItem
              to={"/room-management"}
              title={intl.formatMessage({
                id: "LABEL.SIDEBAR.MENU.SETTINGS.ROOMMANAGEMENT",
              })}
              fontIcon="fa fa-light fa-people-roof fa-sm pe-2"
            />
          </SidebarMenuItemWithSub>
        </>
      )}
    </>
  );
};

export { SidebarMenuMain };
