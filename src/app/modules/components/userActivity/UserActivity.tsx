import cssModule from "./userActivity.module.css";
import { useIntl } from "react-intl";
import { useEffect } from "react";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { UserContactInfo } from "../customAvatar/CustomAvatar";
import { IUserActivityModel } from "../../../models/global/globalGeneric";
import { fetchUserActivityListAsync, globalActions } from "../../services/globalSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import * as DOMPurify from 'dompurify';
import { LabelSemibold6, LabelTitleMedium1, LabelTitleRegular2 } from "../common/formsLabels/detailLabels";
import { motion } from "framer-motion";
import { fadeInUpInnerDiv } from "../../../variantes";
import NoRecordsAvailable from "../noRecordsAvailable/NoRecordsAvailable";

interface props {
  recordId: number;
  moduleTypeId: number;
  userId?: string;
}
const UserActivity = ({ recordId, moduleTypeId }: props) => {
  const dispatch = useAppDispatch();
  const { userActivity } = useAppSelector((s) => s.globalgeneric);
  const intl = useIntl();
  const lang = useLang();

  useEffect(() => {
    fetchUserActivityList(recordId, moduleTypeId, "", 10);
  }, []);

  const fetchUserActivityList = (recordId: number, moduleTypeId: number, userId: string, topNth: number) => {
    try {
      dispatch(fetchUserActivityListAsync({ recordId, lang, moduleTypeId, userId, topNth }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as IUserActivityModel[];
            dispatch(globalActions.updateUserActivityList(responseData));
          } else {
            if (originalPromiseResult.statusCode === 401) {
              toast.error("Session expired. Kindly login");
            }
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
        });
    } catch (e) {
      console.log(e);
    }
  };


  return (
    <>

      {/* <div className="row">
        <>
          <div className="col-md-6">
            <div className={`mb-9}`}>
              <LabelSemibold6 text={"MOD.PROJECTMANAGEMENT.ACTIVITY"} />
            </div>
          </div>
          <div className="col-md-6">
          </div>
        </>
      </div> */}
      <div className="row" style={{ overflow: 'auto', height: '300px' }}>
        <div className="col-md-12">
          <div className={`mb-5 mb-xxl-8`}>
            {/* begin::Body */}
            <div className="card-body pb-0 p-0">
              {/* begin::Replies */}
              <div className="mb-7 mt-5">
                {userActivity &&
                  userActivity.length > 0 &&
                  userActivity.map((item, i) => (
                    <div className="d-flex mb-5 mt-5" key={i}>
                      {/* begin::Avatar */}
                      <div className={`me-5 ${cssModule["avatar"]}`}>
                        {/* <ProfileAvatar name={item?.createdByUsername} /> */}
                        <UserContactInfo
                          userid={item?.createdBy}
                          name={(lang === "en") ? item?.displayNameEn : item?.displayNameAr}
                          image={""}
                          customStyle={""}
                          isShowText={false}
                          isAvtIconLarge={true}
                          gender={item.gender}                          
                        />
                      </div>
                      {/* end::Avatar */}

                      {/* begin::Info */}
                      <div className="d-flex flex-column flex-row-fluid mt-1">
                        {/* begin::Info */}
                        <div className="d-flex align-items-center flex-wrap mb-1">
                          <span className="me-3">
                            <LabelTitleMedium1 isI18nKey={false} text={
                              lang === "en"
                                ? item.displayNameEn!
                                : item.displayNameAr!
                            } />
                          </span>
                          <LabelTitleRegular2 text={item.durationSinceLastActivity!} customClassName="text-gray-400" />
                          <LabelTitleRegular2 text={"( " + item?.durationSinceLastPostedComment! + " )"} customClassName="text-gray-400 fs-9 mx-2" />
                        </div>


                        {/* begin::Post */}
                        <p className="lead">
                          <span
                            className={`activityCommentText-` + lang}
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(item.bodyText),
                            }}
                          ></span>
                        </p>

                        {/* end::Post */}
                      </div>
                      {/* end::Info */}
                    </div>
                  ))}

                {
                  (!userActivity || userActivity.length === 0) &&
                  <>
                    <NoRecordsAvailable />
                  </>
                }
              </div>
              {/* end::Replies */}
            </div>
            {/* end::Body */}
          </div>
        </div>
      </div>

    </>
  );
};

export default UserActivity;
