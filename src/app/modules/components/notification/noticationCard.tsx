import { useIntl } from "react-intl";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch, useAppSelector } from "../../../../store";

import * as DOMPurify from "dompurify";
import {
  DetailLabels,
  LabelTitleRegular2,
  LabeltxtMedium2,
} from "../common/formsLabels/detailLabels";
import { useNavigate } from "react-router-dom";
import {
  UpdateNotificationStatus_delete,
  fetchUserRolesAccessAsync,
  globalActions,
  updateNotificationStatus,
} from "../../services/globalSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { getCurrentUserID, writeToBrowserConsole } from "../../utils/common";
import { useCallback, useEffect, useState } from "react";


import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useAuth } from "../../auth/core/Auth";


import moment from "moment";
import { toast } from "react-toastify";
import { IRoleAcces } from "../../../models/global/globalGeneric";

interface props {
  header?: string;
  data: [];
  decreaseCountFunc?;
  tabNumber?: number;
  setRefreshData?;
}
const NotificationCard: React.FC<props> = ({
  data,
  decreaseCountFunc,
  tabNumber,
  setRefreshData,
}: props) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const lang = useLang();
  const { auth } = useAuth();

  const { userRoleAccess } = useAppSelector((s) => s.globalgeneric);

  useEffect(() => {
    if (!userRoleAccess || userRoleAccess.length == 0) {
      dispatch(fetchUserRolesAccessAsync())
        .then(unwrapResult)
        .then((orginalPromiseResult) => {
          if (orginalPromiseResult.statusCode === 200) {
            
            if (orginalPromiseResult.data) {
              const authorizedRole = orginalPromiseResult.data as IRoleAcces[];
              dispatch(globalActions.updateUserRoleAccess(authorizedRole));
            }
          } else {
            console.error("fetching data error");
          }
        })
        .catch((error) => {
          console.error("fetching data error");
        });
    }
  }, []);


  let dir = "ltr";
  if (lang.toLowerCase() == "ar") {
    dir = "rtl";
  }

  function deleteNotification(
    e: React.MouseEvent<HTMLDivElement>,
    moduleTypeId: number,
    notificationId: number
  ) {
    e.stopPropagation();
    try {
      dispatch(
        UpdateNotificationStatus_delete({
          moduleTypeId: moduleTypeId,
          notificationId: notificationId + "",
        })
      )
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode == 200) {
            setRefreshData(Math.floor(Math.random() * 9999) + 1);
          } else
            toast.error(
              intl.formatMessage({ id: "NOTIFICATION.DELETE.FAILED" })
            );
        });
    } catch (e) {
      toast.error(intl.formatMessage({ id: "NOTIFICATION.DELETE.FAILED" }));
    }
  }

  const handleRowClick = (
    recordId: number,
    moduleTypeId: number,
    notificationId: number,
    redirectURL: string,
    isRead?: boolean
  ) => {
    
  };

  const updateNotification = async (
    notificationId: string,
    moduleTypeId: number
  ) => {
    //let formDataObject = formDataObject
    await dispatch(updateNotificationStatus({ notificationId, moduleTypeId }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
        return false;
      });
  };




  const fixingDOMStructureOfNotificationData = useCallback((dataFromDb) => {
    const rows = dataFromDb.split("<br>");
    return rows.map((row) =>
      row ? (
        <div className="" dangerouslySetInnerHTML={{ __html: row }}></div>
      ) : (
        <></>
      )
    );
  }, []);

  function getDatePart(dateTime: string) {
    if (dateTime) {
      const datePart = dateTime.split(" ");
      if (datePart.length > 0) {
        const splitted = datePart[0].split("-");
        if (splitted.length == 3) {
          return splitted[2] + "/" + splitted[1] + "/" + splitted[0];
        }
      }
    }
    return dateTime;
  }

  function getTimePart(dateTime) {
    if (dateTime) {
      const datePart = dateTime.split(" ");

      return datePart[1];
    }

    return "";
  }



  return (
    <>
      <div className="noti_overflow d-flex flex-column gap-6">
      
      </div>
    </>
  );
};

export default NotificationCard;
