import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getUnreadNotificationCount } from "../../../services/notificationService";
import "./NotificationBell.css";

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  className = "",
}) => {
  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    // Fetch initial unread count
    //dispatch(getUnreadNotificationCount());
    // Set up polling for unread count every 30 seconds
    // const interval = setInterval(() => {
    //   dispatch(getUnreadNotificationCount());
    // }, 30000);
    // return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className={`notification-bell-container`} onClick={onClick}>
      {/* <Badge
        badgeContent={unreadCount > 0 ? unreadCount : null}
        color="error"
        overlap="circular"
        variant={unreadCount > 99 ? "standard" : "standard"}
        max={99}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: "#B7945A",
            color: "white",
            fontSize: "0.7rem",
            fontWeight: "bold",
            minWidth: "16px",
            height: "16px",
            borderRadius: "8px",
            boxShadow: "0 1px 4px rgba(183, 148, 90, 0.3)",
            padding: "2px",
          },
        }}
      > */}
      <div className="notification-bell-icon">
        <FontAwesomeIcon
          icon={faBell}
          size="lg"
          color="#6B7280"
          className="bell-icon"
        />
      </div>
      {/* </Badge> */}
    </div>
  );
};

export default NotificationBell;
