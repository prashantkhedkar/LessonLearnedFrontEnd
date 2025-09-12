import clsx from "clsx";

import { useLayout } from "../../core";
import { useLang } from "../../../i18n/Metronici18n";
import Badge from "@mui/material/Badge";
import "../../../layout/components/notifications/notifications.css";
import { NotificationPopup } from "../notifications/notifications";
import { useRef, useState } from "react";
import { HelpModel } from "../help/HelpModel";
import { useAuth } from "../../../../app/modules/auth/core/Auth";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import UserGuide from "../../../../app/modules/components/userGuide/UserGuide";
import { globalActions } from "../../../../app/modules/services/globalSlice";
import { useAppDispatch } from "../../../../store";
import { HeaderUserMenu } from "../../../partials/layout/header-menus/HeaderUserMenu";
import GlobalSearch from "../../../partials/layout/search/GlobalSearch";
import { JPBadgeButton } from "../../../../app/modules/utils/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import NotificationBell from "../../../../app/modules/components/notification/NotificationBell";
import NotificationPanel from "../../../../app/modules/components/notification/NotificationPanel";

import { faBell, faGear, faSignOut } from "@fortawesome/free-solid-svg-icons";

const itemClass = "ms-1 ms-md-4";
const btnClass =
  "btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px";
const userAvatarClass = "symbol-25px";
const btnIconClass = "fs-2";

const Navbar = () => {
  const { config } = useLayout();
  const lang = useLang();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const notificationBellRef = useRef<HTMLDivElement>(null);

  const [sidebarModel, setSidebarModel] = useState({
    activeEle: "dashboard",
    showModal: false,
  });

  const [helpsidebarModel, setHelpSidebarModel] = useState({
    activeEle: "dashboard",
    showModal: false,
  });

  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const handleNotificationBellClick = () => {
    setNotificationPanelOpen(!notificationPanelOpen);
  };

  return (
    <div className="app-navbar d-flex gap-4 justify-content-between align-items-center">
      {/* <div className={clsx("app-navbar-item align-items-stretch mt-4")}>
        <GlobalSearch />
      </div> */}

      {process.env.REACT_APP_IS_LANGUAGE_TOGGLE_ENABLED === "1" && (
        <div className={clsx("app-navbar-item", itemClass)}>
          <div
            className={clsx("cursor-pointer symbol", userAvatarClass)}
            data-kt-menu-trigger="{default: 'click'}"
            data-kt-menu-attach="parent"
            data-kt-menu-placement="bottom-end"
          >
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle dropdown-multilang"
                type="button"
                style={{
                  font: ' var(--text-medium-2, 500 14px/24px "Roboto-Regular", sans-serif)',
                }}
              >
                {lang === "ar" ? "العربية" : "English"}
              </button>
            </div>
          </div>
          <HeaderUserMenu />
        </div>
      )}

      <div hidden className={clsx("app-navbar-item")}>
        {/* <Badge
          variant="dot"
          color="error"
          overlap="circular"
          className="notification_bell_box"
          onClick={(e) => {
            dispatch(globalActions.isSourceHeader(true));
            setSidebarModel({
              ...sidebarModel,
              activeEle: "noti",
              showModal: true,
            });
          }}
        >
          <img src={Bell_icon} alt="Banner" />
        </Badge> */}
      </div>
      {/* New Notification Bell */}
      <div className={clsx("app-navbar-item")} ref={notificationBellRef}>
        <NotificationBell
          onClick={handleNotificationBellClick}
          className="notification_bell_box"
        />
      </div>                                                    

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        anchorEl={notificationBellRef.current}
      />
      {sidebarModel.showModal && (
        <NotificationPopup
          sidebarModel={sidebarModel}
          setSidebarModel={setSidebarModel}
        />
      )}

      <div className={clsx("app-navbar-item")}>
        <JPBadgeButton
          linktext={""}
          customClassName={`notification_bell_box`}
          tooltiptext={intl.formatMessage({ id: "LABEL.LOGOUT" })}
          isDisabled={false}
          onClick={logout}
        >
          <FontAwesomeIcon icon={faSignOut} color="#9CA3AF" size="xl" />
        </JPBadgeButton>
      </div>
    </div>
  );
};

export { Navbar };
