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
} from "../../../modules/services/notificationSlice";
import { INotification } from "../../../models/notification/notificationModel";
import DataTableMain2, {
  ComponentAndProps,
} from "../../../modules/components/dataTable2/DataTableMain";
import { Row } from "../../../models/row";
import moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RenderFontAwesome from "../../../modules/utils/RenderFontAwesome";
import { useNavigate } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import notificationTableConfig from "./notificationTableConfig.json";
import {
  DetailLabels,
  LabelTitleSemibold1,
} from "../common/formsLabels/detailLabels";

import { GlobalLabel } from "../../../modules/components/common/label/LabelCategory";

interface NotificationRow extends Row {
  notificationId: number;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  notificationType: string | null;
  isRead: boolean;
  actionUrl: string | null;
  actionParams: string | null;
  formattedDate: string;
  readStatus: string;
  actions: string;
  notificationDetails: string;
  actionBy: string;
  requestNumber: string;
}

const NotificationListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const lang = useLang();
  const navigate = useNavigate();
  const tableRef = useRef<any>(null);

  const {
    notifications,
    loading,
    unreadCount,
    totalCount,
    currentPage,
    pageSize,
    hasMorePages,
  } = useAppSelector((state) => state.notifications);

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  // Default sort column and direction for notifications
  const defaultSortColumn = "createdDate";
  const defaultSortDirection = "desc";

  // Table configuration for notifications
  const tableConfig = JSON.stringify(notificationTableConfig);

  const componentsList = [
    {
      component: NotificationDetailsItem,
    },

    {
      component: ViewRequestItem,
    },
  ];

  useEffect(() => {
    // Load notifications when component mounts or filter changes
    dispatch(resetPagination());
    getNotificationData(
      1,
      10,
      defaultSortColumn,
      defaultSortDirection,
      "",
      true
    );
  }, [dispatch, showUnreadOnly]);

  const formatDate = (dateString: string) => {
    const date = moment(dateString);

    // Always return dd/MM/yyyy format regardless of language
    return date.format("DD/MM/YYYY");
  };

  const getNotificationData = (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean
  ) => {
    if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

    setLocalLoading(true);

    dispatch(
      fetchNotifications({
        pageNumber: pageNumber || 1,
        pageSize: pageSize ? pageSize : 10,
        unreadOnly: showUnreadOnly,
      })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (tableRef.current) {
          if (
            originalPromiseResult.data &&
            originalPromiseResult.data.length > 0
          ) {
            // Transform notifications data for the table
            const transformedData: NotificationRow[] =
              originalPromiseResult.data.map((notification: INotification) => {
                const title =
                  lang === "ar" ? notification.titleAr : notification.titleEn;
                const message =
                  lang === "ar"
                    ? notification.messageAr
                    : notification.messageEn;
                const type = notification.notificationType || "General";
                const formattedDate = dayjs(notification.createdDate).format(
                  "YYYY/MM/DD"
                );

                // Since we're using a component for details, we can just pass a simple identifier
                const notificationDetails = `notification-${notification.notificationId}`;

                return {
                  id: notification.notificationId,
                  createdDate: notification.createdDate,
                  progress: "",
                  serviceId: notification.serviceId!,
                  attachmentId: 0,
                  categoryId: 0,
                  notificationId: notification.notificationId,
                  titleEn: notification.titleEn,
                  titleAr: notification.titleAr,
                  messageEn: notification.messageEn,
                  messageAr: notification.messageAr,
                  notificationType: notification.notificationType || "General",
                  isRead: notification.isRead ?? false,
                  actionUrl: notification.actionUrl,
                  actionParams: notification.actionParams,
                  formattedDate: formattedDate,
                  readStatus: notification.isRead
                    ? intl.formatMessage({ id: "NOTIFICATION.STATUS.READ" })
                    : intl.formatMessage({ id: "NOTIFICATION.STATUS.UNREAD" }),
                  actions: "",
                  notificationDetails: notificationDetails,

                  serviceRequestId: notification.serviceRequestId || 0,
                  serviceRequestCurrentStepId:
                    notification.serviceRequestCurrentStepId || 0,
                  serviceRequestStatusId:
                    notification.serviceRequestStatusId || 0,
                  actionBy: notification.actionBy || "",
                  requestNumber: notification.requestNumber || "",
                };
              });

            tableRef.current.setData(transformedData);
            tableRef.current.setTotalRows(originalPromiseResult.totalCount);
          } else {
            tableRef.current.setData([]);
            tableRef.current.setTotalRows(0);
          }
        }

        if (useSpinner && tableRef.current)
          tableRef.current.setIsLoading(false);

        setLocalLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setLocalLoading(false);
        if (useSpinner && tableRef.current)
          tableRef.current.setIsLoading(false);
      });
  };

  function NotificationDetailsItem(props: { row: Row }) {
    const notificationRow = props.row as NotificationRow;
    const title =
      lang === "ar"
        ? notificationRow.requestNumber + " - " + notificationRow.titleAr
        : notificationRow.requestNumber + " - " + notificationRow.titleEn;
    const message =
      lang === "ar" ? notificationRow.messageAr : notificationRow.messageEn;
    const type = notificationRow.notificationType || "";

    // const titleLabel = lang === "ar" ? "العنوان" : "Title";
    // const typeLabel = lang === "ar" ? "النوع" : "Type";
    // const messageLabel = lang === "ar" ? "الرسالة" : "Message";
    // const dateLabel = lang === "ar" ? "التاريخ" : "Date";

    return (
      <div style={{ lineHeight: "1.6", padding: "8px" }}>
        <DetailLabels
          isI18nKey={false}
          text={title}
          customClassName="lbl-txt-semibold-light"
        />{" "}
        <div>
          <DetailLabels
            isI18nKey={false}
            text={message}
            customClassName="lbl-txt-semibold-1"
          />{" "}
        </div>
        <DetailLabels
          isI18nKey={false}
          text={notificationRow.formattedDate}
          customClassName="lbl-txt-semibold-light"
        />{" "}
        <div>
          <DetailLabels
            isI18nKey={false}
            text={notificationRow.actionBy}
            customClassName="lbl-txt-semibold-light"
          />{" "}
        </div>
      </div>
    );
  }

  function ViewRequestItem(props: { row: Row }) {
    const notificationRow = props.row as NotificationRow;
    return (
      <>
        {
          <div className="col col-auto px-2">
            {
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip">
                    <div className="tooltip-text">
                      {intl.formatMessage({ id: "TOOLTIP.VIEW" })}
                    </div>
                  </Tooltip>
                }
              >
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/end-user/service-request-form", {
                      state: {
                        serviceId: props.row.serviceId,
                        requestId: props.row.serviceRequestId,
                        isReadOnly: true,
                        statusId: props.row.serviceRequestStatusId,
                        currentStepId: props.row.serviceRequestCurrentStepId,
                      },
                    })
                  }
                >
                  {/* {JSON.stringify(props.row)} */}
                  <RenderFontAwesome
                    marginInlineStart="3px"
                    display
                    size="lg"
                    icon={"faEye"}
                  />
                </div>
              </OverlayTrigger>
            }
          </div>
        }
      </>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <LabelTitleSemibold1 text={"MENU.HEADER.NOTIFICATIONS"} />
          {/* <div className="d-flex gap-3 align-items-center">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showUnreadOnly"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showUnreadOnly">
                  {intl.formatMessage({ id: 'NOTIFICATION.UNREAD_ONLY' })}
                </label>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                {intl.formatMessage({ id: 'NOTIFICATION.MARK_ALL_READ' })}
              </button>
            </div> */}
        </div>
      </div>

      <div className="card-body">
        <DataTableMain2
          ref={tableRef}
          tableConfig={tableConfig}
          lang={lang}
          paginationServer={true}
          displaySearchBar={false}
          componentsList={componentsList}
          getData={getNotificationData}
        />
      </div>
    </div>
  );
};

export default NotificationListPage;
