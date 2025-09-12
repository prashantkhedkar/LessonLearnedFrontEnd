import React from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import "./NotificationTimeline.css";
import {
  DetailLabels,
  LabelTitleSemibold1,
} from "../common/formsLabels/detailLabels";
import NoRecordsAvailable from "../noRecordsAvailable/NoRecordsAvailable";
import dayjs from "dayjs";
interface NotificationItem {
  notificationId: number;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  notificationType: string | null;
  actionUrl: string | null;
  actionParams: string | null;
  serviceRequestId: number | null;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  isRead?: boolean;
  readDate?: string;
  serviceRequestCurrentStepId?: number;
  serviceRequestStatusId?: number;
  actionBy?: string;
  serviceId: number | null;
  requestNumber?: string;
}

interface NotificationTimelineProps {
  title?: string;
  data: NotificationItem[];
  height?: number;
  className?: string;
  showBorder?: boolean;
  enableClick?: boolean;
  onItemClick?: (item: NotificationItem, index: number) => void;
  redirectTo?: string;
  redirectState?: any;
}

const NotificationTimeline: React.FC<NotificationTimelineProps> = ({
  title = "التنبيهات",
  data = [],
  height = 400,
  className = "",
  showBorder,
  enableClick = false,
  onItemClick,
  redirectTo,
  redirectState,
}) => {
  const lang = useLang();
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#F87171"; // Red
      case "medium":
        return "#FBBF24"; // Yellow
      case "low":
        return "#9CA3AF"; // Gray
      default:
        return "#9CA3AF";
    }
  };

  const getResponseColor = (response: string) => {
    switch (response) {
      case "approved":
        return "#10B981"; // Green
      case "pending":
        return "#F59E0B"; // Orange
      case "rejected":
        return "#EF4444"; // Red
      case "completed":
        return "#3B82F6"; // Blue
      default:
        return "#6B7280"; // Gray
    }
  };

  const getPrioritySeverity = (priority: string) => {
    switch (priority) {
      case "high":
        return "عالية";
      case "medium":
        return "متوسطة";
      case "low":
        return "منخفضة";
      default:
        return "منخفضة";
    }
  };

  const handleItemClick = (item: NotificationItem, index: number) => {
    // Call custom onClick handler if provided
    // if (onItemClick) {
    //   onItemClick(item, index);
    // }

    // // Navigate if redirectTo is provided
    // if (redirectTo) {
    //   navigate(redirectTo, {
    //     state: {
    //       ...redirectState,
    //       selectedNotification: item,
    //       notificationIndex: index,
    //     },
    //   });
    // }
    navigate("/end-user/service-request-form", {
      state: {
        serviceId: item.serviceId,
        requestId: item.serviceRequestId,
        isReadOnly: true,
        statusId: item.serviceRequestStatusId,
        currentStepId: item.serviceRequestCurrentStepId,
      },
    });
  };

  const renderNotificationItem = (
    item: NotificationItem,
    index: number,
    isScrollable: boolean = false
  ) => {
    // const borderStyle =
    //   showBorder && lang === "ar"
    //     ? { borderRight: `8px solid ${getResponseColor(item.)}` }
    //     : showBorder && lang !== "ar"
    //     ? { borderLeft: `8px solid ${getResponseColor(item.response)}` }
    //     : {};

    const isClickable = enableClick; //&& (onItemClick || redirectTo);

    const itemProps: any = {
      key: item.notificationId,
      className: `notification-timeline-item ${
        item.isRead ? "read" : "unread"
      } ${isScrollable ? "scrollable-notification" : "top-notification"} ${
        isClickable ? "clickable" : ""
      }`,
      // style: borderStyle,
    };

    const formatDate = (dateString: string) => {
      return dayjs(dateString).format("YYYY/MM/DD");
    };

    // Only add onClick if enableClick is true and we have a handler or redirect

    if (isClickable) {
      itemProps.onClick = () => handleItemClick(item, index);
    }

    const getNotificationTitle = (notification: NotificationItem) => {
      return lang === "ar"
        ? notification.requestNumber + " - " + notification.titleAr
        : notification.requestNumber + " - " + notification.titleEn;
    };

    return (
      <div {...itemProps}>
        {/* Status Indicator */}
        <div className="notification-timeline-indicator">
          <div
            className="notification-status-dot"
            // style={{ backgroundColor: getPriorityColor(item.priority) }}
          />
        </div>

        {/* Content */}
        <div className="notification-timeline-item-content">
          <div className="notification-service-info">
            <DetailLabels
              isI18nKey={false}
              text={getNotificationTitle(item)}
              customClassName="lbl-txt-semibold-light"
            />{" "}
            <div>
              <DetailLabels
                isI18nKey={false}
                text={item.messageAr}
                customClassName="lbl-txt-semibold-1"
                style={{ cursor: "pointer" }}
              />{" "}
            </div>
          </div>

          <div className="notification-date">
            <DetailLabels
              isI18nKey={false}
              text={formatDate(item.createdDate)}
              customClassName="lbl-txt-semibold-light"
            />{" "}
          </div>
          <div>
            <DetailLabels
              isI18nKey={false}
              text={item.actionBy!}
              customClassName="lbl-txt-semibold-light"
            />{" "}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`notification-timeline-container ${className}`}>
      <div className="card MOD-Card">
        <div className="card-header" style={{ minHeight: "auto" }}>
          <div className="notification-header mb-5">
            {/* <h3 className="notification-title">{title} </h3> */}
            <LabelTitleSemibold1 text={title} />
          </div>
        </div>

        <div className="card-body px-0">
          <div className="notification-content">
            {/* {JSON.stringify(data)} */}
            {data.length === 0 ? (
              <div className="notification-timeline-empty">
                <NoRecordsAvailable />
              </div>
            ) : (
              <div className="notification-timeline-list">
                {/* All notifications in scrollable area */}
                <div className="scrollable-notifications">
                  {data.map((item, index) =>
                    renderNotificationItem(item, index, true)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTimeline;
