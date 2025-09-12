import { Box, IconButton, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import NotificationCard from "../../../../app/modules/components/notification/noticationCard";
import { useLang } from "../../../i18n/Metronici18n";
import {
  Notification_MakeAllRead,
  fetchGlobalJPNotifications,
  globalActions,
  insertPageLog,
} from "../../../../app/modules/services/globalSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { useIntl } from "react-intl";
import { LabelTitleSemibold1 } from "../../../../app/modules/components/common/formsLabels/detailLabels";
import SquarLoader from "../../../../app/modules/components/animation/SquarLoader";
import { useAuth } from "../../../../app/modules/auth";
import { IPageLog } from "../../../../app/models/global/globalGeneric";
import { NotificationCategoryConstant } from "../../../../app/helper/_constant/modules.constant";
import { toAbsoluteUrl } from "../../../helpers";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const NotificationPopup = ({ sidebarModel, setSidebarModel }) => {
  const [totalPages, setTotalPages] = useState(0);
  const [readCount, setReadCount] = useState(0);

  const [modelData, setModelData] = useState({
    notificationData: [],
    unreadCount: 0,
    unreadIds: "",
    notificationMsg: "No notification available!",
    loading: true,
    rowsPerPage: 10,
  });

  const dispatch = useAppDispatch();
  const lang = useLang();
  const intl = useIntl();
  const { isHeader } = useAppSelector((s) => s.globalgeneric);
  const [notificationCategory, setNotificationCategory] = useState(
    isHeader ? NotificationCategoryConstant.ACTIONSLIST : 0
  );

  const [refreshData, setRefreshData] = useState(0);

  useEffect(() => {
    let formDataObject: IPageLog;
    formDataObject = {
      pageName: "/notifications",
      username: "",
    };
    dispatch(insertPageLog({ formDataObject }));
  }, []);

  const getAllNotifications = async (pageNumber?: number) => {
    try {
      const response = await dispatch(
        fetchGlobalJPNotifications({
          lang,
          pageNumber: pageNumber ? pageNumber : 1,
          rowsPerPage: 10,
          unitId: "",
          notificationCategoryId: notificationCategory,
        })
      );

      if (response.payload.data && response.payload.data.length > 0) {
        setTotalPages(Math.ceil(response.payload.data[0].totalrowcount / 10));
        setReadCount(response.payload.data[0].readCount);
        let unReadCount =
          response.payload.data[0].totalrowcount -
          response.payload.data[0].readCount;
        setModelData({
          ...modelData,
          notificationData: response.payload.data,
          loading: false,
          unreadCount: unReadCount,
        });
      } else {
        setModelData({
          ...modelData,
          notificationData: [],
          loading: false,
          unreadCount: 0,
        });
      }
      //     setTotalPages(Math.ceil(6 / 3));
    } catch (error) {
      // Handle errors
      console.error("Error fetching notifications:", error);
    }
  };

  function decreaseCountFunc(tabNumber: Number) {}

  useEffect(() => {
    setModelData({
      ...modelData,
      notificationData: [],
      loading: true,
    });
    if (notificationCategory != NotificationCategoryConstant.ACTIONSLIST) {
      getAllNotifications();
    }
  }, [notificationCategory, refreshData]);

  const closeHanlde = () => {
    document
      .getElementsByClassName("notification_div")[0]
      .classList.remove("active");
    setTimeout(() => {
      setSidebarModel({
        ...sidebarModel,
        showModal: false,
      });
      dispatch(globalActions.showNotificationPopup(false));
    }, 300);
  };

  return (
    <div className="noti_overlay active notification-popup">
      {/* <motion.div
        variants={fadeInUpSide}
        initial="initial"
        animate="animate"
      >  */}
      <Box
        className={"notification_div active"}
        sx={{
          alignItems: "end",
          backgroundColor: "var(--notification-paper-color)",
          backdropFilter: "blur(45px)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          justifyContent: "center",
          padding: "1rem",
          width: "100%",
        }}
      >
        {/* Header with Close Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            alignItems: "center",
          }}
          className="animate__animated animate__fadeInDown"
        >
          <Typography className="modal-popup-title">
            {intl.formatMessage({
              id: "MOD.NOTIFICATION.NOTIFICATIONS",
            })}
          </Typography>

          <IconButton
            onClick={closeHanlde}
            sx={{
              padding: "8px",
              borderRadius: "8px",
              boxShadow: "0px 1px 2px rgba(6, 25, 56, 0.05)",
            }}
          >
            <img
              src={toAbsoluteUrl(
                `/media/new-design/final-icons/cross-light.svg`
              )}
              className="widget-mim-icon notification-icon-color"
            />
          </IconButton>
        </Box>

        {/* Notification Body */}
        {
          <div className="divNotificationTabs">
            <ul className="nav nav-tabs nav-line-tabs nav-line-tabs-2x fs-6">
              <li
                style={{ cursor: "pointer", position: "relative" }}
                className={`nav-item${
                  notificationCategory ==
                  NotificationCategoryConstant.ACTIONSLIST
                    ? " active"
                    : ""
                }`}
              >
                <a
                  className={
                    notificationCategory ==
                    NotificationCategoryConstant.ACTIONSLIST
                      ? "nav-link active"
                      : "nav-link"
                  }
                  data-bs-toggle="tab"
                  // href="#not_tab_pane_0"
                  onClick={(e) => {
                    setNotificationCategory(
                      NotificationCategoryConstant.ACTIONSLIST
                    );
                  }}
                >
                  <img
                    src="/media/new-design/final-icons/edit-vector-white.svg"
                    className={"notification-icon-color"}
                  ></img>
                  <LabelTitleSemibold1
                    customClassName="title"
                    text={"MOD.SIDEBAR.MENU.ACTIONSLIST"}
                  />
                  <div
                    className="unreadNotifications"
                    key={"key_ACTIONSLIST" + 0}
                  >
                    {/* {unreadMawaredToDo > 99 ? 99 : unreadMawaredToDo} */}
                  </div>
                </a>
              </li>
            </ul>

            <div className="tab-content" id="notificationTabContent">
              <div className="tab-content" id="myTabContent">
                {notificationCategory ==
                  NotificationCategoryConstant.ACTIONSLIST && (
                  <div
                    className={
                      notificationCategory ==
                      NotificationCategoryConstant.ACTIONSLIST
                        ? "tab-pane fade show active"
                        : "tab-pane fade"
                    }
                    id="not_tab_pane_0"
                    role="tabpanel"
                  >
                    <ManageUI
                      getAllNotifications={getAllNotifications}
                      modelData={modelData}
                      notificationCategory={notificationCategory}
                      totalPages={totalPages}
                      decreaseCountFunc={decreaseCountFunc}
                      setRefreshData={setRefreshData}
                      type="ACTIONSLIST"
                      unitId={""}
                      unreadNotifications={0}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        }
      </Box>
      {/* </motion.div> */}
    </div>
  );
};

function ManageUI(props: {
  modelData;
  decreaseCountFunc?;
  notificationCategory: number;
  getAllNotifications;
  totalPages: number;
  unitId;
  setRefreshData?;
  unreadNotifications: number;
  type: string;
}) {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const divRef = useRef<HTMLDivElement>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const scrollTop = () => {
    if (divRef.current) {
      divRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handlePrevClick = () => {
    var prevPage = pageNumber - 1;
    setPageNumber(prevPage);
    props.getAllNotifications(prevPage);
    scrollTop();
  };

  const handleNextClick = () => {
    var nextPage = pageNumber + 1;
    setPageNumber(nextPage);

    props.getAllNotifications(nextPage);
    scrollTop();
  };

  function makeAllUnread(type: string) {
    try {
      dispatch(Notification_MakeAllRead({ unitId: props.unitId, type: type }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode == 200)
            props.setRefreshData(Math.floor(Math.random() * 9999) + 1);
          else
            toast.error(
              intl.formatMessage({ id: "NOTIFICATION.UNREADALL.FAILED" })
            );
        });
    } catch (err) {
      toast.error(intl.formatMessage({ id: "NOTIFICATION.UNREADALL.FAILED" }));
    }
  }

  return (
    <React.Fragment>
      <React.Fragment>
        <NotificationCard
          data={props.modelData.notificationData}
          decreaseCountFunc={props.decreaseCountFunc}
          tabNumber={props.notificationCategory}
          setRefreshData={props.setRefreshData}
        />
      </React.Fragment>
      {props.modelData.notificationData.length == 0 &&
      props.modelData.loading ? (
        <div className="notification-loader">
          <SquarLoader />
        </div>
      ) : props.modelData.notificationData &&
        props.modelData.notificationData?.length > 0 ? (
        <div
          className={`d-flex flex-row gap-6 justify-content-between notification-navigation-btn`}
        >
          <button
            className="slick-btn slider-button"
            disabled={pageNumber == 1}
            onClick={handlePrevClick}
          >
            {intl.formatMessage({ id: "MOD.PREVIOUS" })}
          </button>
          <button
            className="slick-btn slider-button me-auto"
            disabled={
              pageNumber === props.totalPages ||
              props.notificationCategory ==
                NotificationCategoryConstant.ACTIONSLIST
            }
            onClick={handleNextClick}
          >
            {intl.formatMessage({ id: "MOD.NEXT" })}
          </button>
          <button
            className="slick-btn slider-button"
            disabled={
              !(
                props.unreadNotifications > 0 &&
                props.type != "ACTIONSLIST" &&
                props.type != "EXTERNAL"
              )
            }
            onClick={(e) => {
              makeAllUnread(props.type);
            }}
          >
            {intl.formatMessage({ id: "NOTIFICATION.UNREADALL" })}
          </button>
        </div>
      ) : (
        <div className="notification-rows">
          <div className="animate-item theme-no-record-to-display no-record-light">
            {intl.formatMessage({ id: "MOD.NOTIFICATION.NOALERTS" })}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
