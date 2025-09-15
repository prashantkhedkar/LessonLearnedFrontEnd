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
    });     
  }, []);

  return (
    <>
 <SidebarMenuItem
            to="/dashboard"
            title={intl.formatMessage({
              id: "LABEL.DASHBOARD",
            })}
            fontIcon="fa fa-regular fa-files fa-lg pe-3"
          />

      {/* <div className="my-05"></div> */}

      <SidebarMenuItem
            to="/observation/observation-list"
            title={intl.formatMessage({
              id: "LABEL.MANAGE.OBSERVATIONS",
            })}
            fontIcon="fa fa-regular fa-files fa-lg pe-3"
          />

      
    </>
  );
};

export { SidebarMenuMain };
