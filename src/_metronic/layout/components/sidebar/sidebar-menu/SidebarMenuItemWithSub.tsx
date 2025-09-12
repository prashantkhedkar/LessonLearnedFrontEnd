import React from "react";
import clsx from "clsx";
import { useLocation } from "react-router";
import { checkIsActive, KTIcon, WithChildren } from "../../../../helpers";
import { useLayout } from "../../../core";

type Props = {
  to: string;
  title: string;
  icon?: string;
  fontIcon?: string;
  hasBullet?: boolean;
};

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet,
}) => {
  const { pathname } = useLocation();
  const { config } = useLayout();
  const { app } = config;

  // Check if any child SidebarMenuItem's 'to' matches current path
  let isChildActive = false;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.props && child.props.to) {
      if (checkIsActive(pathname, child.props.to)) {
        isChildActive = true;
      }
    }
  });

  const isActive = checkIsActive(pathname, to) || isChildActive;

  return (
    <>
      <div
        className={clsx(
          "menu-item",
          { "here show": isActive },
          "menu-accordion"
        )}
        data-kt-menu-trigger="click"
      >
        <span className={clsx("menu-link", { active: isActive })}>
          {hasBullet && (
            <span className="menu-bullet">
              <span className="bullet bullet-dot"></span>
            </span>
          )}
          {icon && app?.sidebar?.default?.menu?.iconType === "svg" && (
            <span
              className={clsx("menu-icon", { menu_icon_selected: isActive })}
              style={{ width: "1.3rem" }}
            >
              <KTIcon iconName={icon} className="fs-2" />
            </span>
          )}
          {fontIcon && (
            <i
              className={fontIcon}
              style={isActive ? { color: "#fff" } : {}}
            ></i>
          )}
          {icon && app?.sidebar?.default?.menu?.iconType === "custom" && (
            <span
              className={clsx("menu-icon", { menu_icon_selected: isActive })}
              style={{ width: "1.3rem" }}
            >
              {<img src={icon} className={`fs-2}`} />}
            </span>
          )}
          <span className="menu-title"> {title} </span>
          <span className="menu-arrow"></span>
        </span>
        <div
          className={clsx("menu-sub menu-sub-accordion", {
            "menu-active-bg": isActive,
          })}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export { SidebarMenuItemWithSub };
