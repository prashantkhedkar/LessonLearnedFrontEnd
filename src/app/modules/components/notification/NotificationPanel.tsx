import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { useIntl } from "react-intl";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import {
  fetchNotifications,
  markNotificationsAsRead,
} from "../../../services/notificationService";
import {
  markAsReadLocally,
  setCurrentPage,
  resetPagination,
} from "../../services/notificationSlice";
import { INotification } from "../../../models/notification/notificationModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCheck,
  faExternalLinkAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "./NotificationPanel.css";
import dayjs from "dayjs";
import { DetailLabels, HeaderLabels } from "../common/formsLabels/detailLabels";
import { GlobalLabel } from "../common/label/LabelCategory";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  anchorEl,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const lang = useLang();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    loading,
    unreadCount,
    totalCount,
    currentPage,
    pageSize,
    hasMorePages,
    isLoadingMore,
  } = useAppSelector((state) => state.notifications);

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset pagination when filter changes
      if (currentPage !== 1) {
        dispatch(resetPagination());
      }
      dispatch(
        fetchNotifications({
          pageNumber: 1,
          pageSize,
          unreadOnly: showUnreadOnly,
        })
      );
    }
  }, [dispatch, isOpen, pageSize, showUnreadOnly]);

  // Handle pagination - load more pages
  useEffect(() => {
    if (isOpen && currentPage > 1) {
      dispatch(
        fetchNotifications({
          pageNumber: currentPage,
          pageSize,
          unreadOnly: showUnreadOnly,
        })
      );
    }
  }, [dispatch, isOpen, currentPage, pageSize, showUnreadOnly]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = (notificationIds: number[]) => {
    dispatch(markAsReadLocally(notificationIds));
    dispatch(markNotificationsAsRead({ notificationIds }));
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n.notificationId);
    if (unreadIds.length > 0) {
      handleMarkAsRead(unreadIds);
    }
  };

  const handleNotificationClick = (notification: INotification) => {
    // Mark as read if not already read
    // 
    // if (!notification.isRead) {
    //   handleMarkAsRead([notification.notificationId]);
    // }
    // // Navigate to action URL if available
    // if (notification.actionUrl) {
    //   let url = notification.actionUrl;
    //   // Parse action params if available
    //   if (notification.actionParams) {
    //     try {
    //       const params = JSON.parse(notification.actionParams);
    //       const queryString = new URLSearchParams(params).toString();
    //       url += `?${queryString}`;
    //     } catch (error) {
    //       console.error("Error parsing action params:", error);
    //     }
    //   }
    //   navigate(url);
    //   onClose();
    // }
    navigate("/end-user/service-request-form", {
      state: {
        serviceId: notification.serviceId,
        requestId: notification.serviceRequestId,
        isReadOnly: true,
        statusId: notification.serviceRequestStatusId,
        currentStepId: notification.serviceRequestCurrentStepId,
      },
    });
    onClose();
  };

  const formatDate = (dateString: string) => {
    // const date = moment(dateString);
    // const now = moment();

    // if (date.isSame(now, "day")) {
    //   return date.format("DD/MM/YYYY HH:mm");
    // } else if (date.isSame(now.clone().subtract(1, "day"), "day")) {
    //   return intl.formatMessage(
    //     { id: "NOTIFICATION.YESTERDAY" },
    //     { time: date.format("HH:mm") }
    //   );
    // } else if (date.isAfter(now.clone().subtract(7, "days"))) {
    //   return date.format("DD/MM/YYYY HH:mm");
    // } else {
    //   return date.format("DD/MM/YYYY");
    // }
    return dayjs(dateString).format("YYYY/MM/DD");
  };

  const getNotificationTitle = (notification: INotification) => {
    return lang === "ar"
      ? notification.requestNumber + " - " + notification.titleAr
      : notification.requestNumber + " - " + notification.titleEn;
  };

  const getNotificationMessage = (notification: INotification) => {
    return lang === "ar" ? notification.messageAr : notification.messageEn;
  };

  const getNotificationTypeIcon = (type: string | null) => {
    // Return empty string to remove icons
    return "";
  };

  const loadMoreNotifications = () => {
    dispatch(setCurrentPage(currentPage + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay">
      <div
        ref={panelRef}
        className="notification-panel"
        style={{
          position: "fixed",
          top: anchorEl ? anchorEl.getBoundingClientRect().bottom + 8 : "60px",
          right: "20px",
          zIndex: 9999,
        }}
      >
        {/* Header */}
        <div className="notification-panel-header">
          <div className="notification-header-left">
            <HeaderLabels
              text={intl.formatMessage({ id: "NOTIFICATION.TITLE" })}
            />

            {/* {unreadCount > 0 && (
              <span className="notification-count-badge">
                {unreadCount}
              </span>
            )} */}
          </div>
          {/* <div className="notification-header-actions">
            <label className="notification-filter">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
              />
              {intl.formatMessage({ id: 'NOTIFICATION.UNREAD_ONLY' })}
            </label>
            <button
              className="notification-action-btn"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              title={intl.formatMessage({ id: 'NOTIFICATION.MARK_ALL_READ' })}
            >
              <FontAwesomeIcon icon={faCheck} />
            </button>
            <button
              className="notification-close-btn"
              onClick={onClose}
              title={intl.formatMessage({ id: 'NOTIFICATION.CLOSE' })}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div> */}
        </div>

        {/* Content */}
        <div className="notification-panel-content">
          {loading && notifications.length === 0 ? (
            <div className="notification-loading">
              <div className="notification-skeleton">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="notification-skeleton-item">
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-message"></div>
                      <div className="skeleton-date"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="empty-icon">�</div>
              <p>
                {intl.formatMessage({ id: "NOTIFICATION.NO_NOTIFICATIONS" })}
              </p>
            </div>
          ) : (
            <div className="notification-list" style={{ cursor: "pointer" }}>
              {notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className="notification-item"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-content">
                    <div className="notification-item-header">
                      <DetailLabels
                        isI18nKey={false}
                        text={getNotificationTitle(notification)}
                        customClassName="lbl-txt-semibold-light"
                      />{" "}
                      <DetailLabels
                        isI18nKey={false}
                        text={formatDate(notification.createdDate)}
                        customClassName="lbl-txt-semibold-light"
                      />{" "}
                    </div>
                    <p className="notification-item-message">
                      <DetailLabels
                        isI18nKey={false}
                        text={getNotificationMessage(notification)}
                        customClassName="lbl-txt-semibold-1"
                        style={{ cursor: "pointer" }}
                      />{" "}
                    </p>
                    <DetailLabels
                      isI18nKey={false}
                      text={notification.actionBy!}
                      customClassName="lbl-txt-semibold-light"
                    />{" "}
                    <div className="notification-item-footer">
                      {notification.actionUrl && (
                        <FontAwesomeIcon
                          icon={faExternalLinkAlt}
                          className="notification-action-icon"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {/* {hasMorePages && (
                <div className="notification-load-more">
                  <div className="notification-pagination-info">
                    {intl.formatMessage(
                      { id: "NOTIFICATION.SHOWING_COUNT" },
                      {
                        current: notifications.length,
                        total: totalCount,
                      }
                    )}
                  </div>
                  <button
                    className="load-more-btn"
                    onClick={loadMoreNotifications}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore
                      ? intl.formatMessage({ id: "NOTIFICATION.LOADING" })
                      : intl.formatMessage({ id: "NOTIFICATION.LOAD_MORE" })}
                  </button>
                </div>
              )} */}

              {/* Show All Button */}
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip">
                    <div className="tooltip-text">
                      {intl.formatMessage({
                        id: "NOTIFICATION.CLICKTOVIEW_ALL",
                      })}
                    </div>
                  </Tooltip>
                }
              >
                <div
                  className="notification-show-all pt-3"
                  onClick={() => {
                    navigate("/notifications");
                    onClose();
                  }}
                >
                  <DetailLabels
                    isI18nKey={false}
                    text={intl.formatMessage({ id: "NOTIFICATION.SHOW_ALL" })}
                    customClassName="lbl-txt-semibold-1"
                    style={{ cursor: "pointer" }}
                  />{" "}
                </div>
              </OverlayTrigger>
              {/* End of results indicator */}
              {/* {!hasMorePages && notifications.length > 0 && notifications.length === totalCount && (
                <div className="notification-end-indicator">
                  {intl.formatMessage({ id: 'NOTIFICATION.ALL_LOADED' })}
                </div>
              )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
