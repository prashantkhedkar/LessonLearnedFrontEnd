import { Link } from "react-router-dom";
import clsx from "clsx";
import { KTIcon, toAbsoluteUrl } from "../../../helpers";
import { useLayout } from "../../core";
import { MutableRefObject, useEffect, useRef } from "react";
import { ToggleComponent } from "../../../assets/ts/components";
import { useLang } from "../../../i18n/Metronici18n";
import { SidebarUserProfile } from "./sidebar-menu/SidebarUserProfile";
type PropsType = {
  sidebarRef: MutableRefObject<HTMLDivElement | null>;
};

const SidebarLogo = (props: PropsType) => {
  const { config } = useLayout();
  const lang = useLang();

  const toggleRef = useRef<HTMLDivElement>(null);

  const appSidebarDefaultMinimizeDesktopEnabled =
    config?.app?.sidebar?.default?.minimize?.desktop?.enabled;
  const appSidebarDefaultCollapseDesktopEnabled =
    config?.app?.sidebar?.default?.collapse?.desktop?.enabled;
  const toggleType = appSidebarDefaultCollapseDesktopEnabled
    ? "collapse"
    : appSidebarDefaultMinimizeDesktopEnabled
    ? "minimize"
    : "";
  const toggleState = appSidebarDefaultMinimizeDesktopEnabled ? "active" : "";
  const appSidebarDefaultMinimizeDefault =
    config.app?.sidebar?.default?.minimize?.desktop?.default;

  useEffect(() => {
    setTimeout(() => {
      const toggleObj = ToggleComponent.getInstance(
        toggleRef.current!
      ) as ToggleComponent | null;

      if (toggleObj === null) {
        return;
      }

      // Add a class to prevent sidebar hover effect after toggle click
      toggleObj.on("kt.toggle.change", function () {
        // Set animation state
        props.sidebarRef.current!.classList.add("animating");

        // Wait till animation finishes
        setTimeout(function () {
          // Remove animation state
          props.sidebarRef.current!.classList.remove("animating");
        }, 300);
      });
    }, 600);
  }, [toggleRef, props.sidebarRef]);

  return (
    <>
      {/* <div style={{ "position": "absolute", "right": 0, "top": 0 }} >
        <img
          alt='Logo'
          src={toAbsoluteUrl('/media/logos/png/beta.png')}
          style={{ "height": "95px" }}
        />
      </div> */}
      {/* {
          lang === 'ar' ? (
            <div style={{ "position": "absolute", "right": 0, "top": 0 }} >
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/logos/png/beta.png')}
              style={{ "height": "95px" }}
            />
          </div>
          ):
          (
            <div style={{ "position": "absolute", "left": 0, "top": 0,"rotate": "0deg" }} >
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/logos/png/beta-en-left.png')}
              style={{ "height": "95px" }}
            />
          </div>
          )
} */}

      <div className="app-sidebar-logo px-9 py-15" id="kt_app_sidebar_logo">
        <Link to="/fms-dashboard">
          {lang === "ar" ? (
            <>
              <img
                alt="Logo"
                src={toAbsoluteUrl("/media/logos/png/logo-ar.png")}
                className="h-60px app-sidebar-logo-default theme-light-show sidebar_logo_container"
              />
              {/* <img
            alt='Logo'
            src={toAbsoluteUrl('/media/logos/png/output-onlinepngtools.png')}
            className='h-60px app-sidebar-logo-default theme-light-show sidebar_logo_only'
          />  */}
            </>
          ) : (
            <>
              <img
                alt="Logo"
                src={toAbsoluteUrl("/media/logos/png/logo.png")}
                className="h-60px app-sidebar-logo-default theme-light-show sidebar_logo_container"
              />

              {/* <img
              alt='Logo'
              src={toAbsoluteUrl('/media/logos/png/output-onlinepngtools.png')}
              className='h-60px app-sidebar-logo-default theme-light-show sidebar_logo_only'
            /> */}
            </>
          )}
        </Link>

        {/* SIDEBAR MENU TOGGLE HIDE AND SHOW */}
        {/* {(appSidebarDefaultMinimizeDesktopEnabled || appSidebarDefaultCollapseDesktopEnabled) && (
        <div
          ref={toggleRef}
          id='kt_app_sidebar_toggle'
          className={clsx(
            'app-sidebar-toggle btn btn-icon btn-shadow btn-sm btn-color-muted btn-active-color-primary h-30px w-30px position-absolute top-50 start-100 translate-middle rotate',
            { active: appSidebarDefaultMinimizeDefault }
          )}
          data-kt-toggle='true'
          data-kt-toggle-state={toggleState}
          data-kt-toggle-target='body'
          data-kt-toggle-name={`app-sidebar-${toggleType}`}
        >
          <KTIcon iconName='black-left-line' className='fs-3 rotate-180 ms-1' />
        </div>
      )} */}
      </div>

      <SidebarUserProfile />
    </>
  );
};

export { SidebarLogo };
