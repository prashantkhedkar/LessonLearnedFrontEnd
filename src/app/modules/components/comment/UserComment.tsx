import cssModule from "./userComment.module.css";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { stripHtml } from "string-strip-html";
import { generateUUID, getCurrentUserID } from "../../utils/common";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { useAuth } from "../../auth/core/Auth";
import { UserContactInfo } from "../customAvatar/CustomAvatar";
import { IUserCommentModel } from "../../../models/global/globalGeneric";
import { addUserCommentsAsync, deleteUserCommentsAsync, fetchUserCommentsListAsync, globalActions } from "../../services/globalSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import * as DOMPurify from 'dompurify';
import { BtnLabelCanceltxtMedium2, BtnLabeltxtMedium2, LabelTitleRegular2 } from "../common/formsLabels/detailLabels";
import NoRecordsAvailable from "../noRecordsAvailable/NoRecordsAvailable";
import { HtmlTooltip } from "../tooltip/HtmlTooltip";
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

interface props {
  recordId: number;
  showAdd?: boolean;
  moduleTypeId: number;
}
const UserComment = ({ recordId, showAdd, moduleTypeId }: props) => {
  const dispatch = useAppDispatch();
  const { userComments } = useAppSelector((s) => s.globalgeneric);
  const intl = useIntl();
  const lang = useLang();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<IUserCommentModel>();
  const [controlVisibility, setControlVisibility] = useState(false);
  const [getSortOrder, setSortOder] = useState(true);
  const { auth } = useAuth();
  const userid = getCurrentUserID();

  useEffect(() => {
    fetchUserCommentsList(recordId, moduleTypeId);
  }, []);


  // Hide the textbox control and display rich text editor control
  const handleHidePlaceholderControl = () => {
    setControlVisibility(true);
  };

  // On form submit, below function will push the form data to parent component via function onMessageSave
  const onSubmit: SubmitHandler<IUserCommentModel> = (formData) => {
    try {

      if (recordId > 0) {
        let formDataObject: IUserCommentModel;
        formDataObject = {
          id: 0,
          recordId,
          moduleTypeId,
          postedComment: formData.postedComment,
        };

        dispatch(addUserCommentsAsync({ formDataObject }))
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              const responseData = originalPromiseResult.data as boolean;

              if (responseData) {
                fetchUserCommentsList(recordId, formDataObject.moduleTypeId);
              }
            } else {
              if (originalPromiseResult.statusCode === 401) {
                toast.error("Session expired. Kindly login");
              }
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            console.log(rejectedValueOrSerializedError);
          })
      }
    } catch (e) {
      console.log(e);
    }
    onReset();
  };

  const fetchUserCommentsList = (recordId: number, moduleTypeId: number) => {
    try {
      dispatch(fetchUserCommentsListAsync({ recordId, lang, moduleTypeId }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as IUserCommentModel[];
            dispatch(globalActions.updateUserCommentList({ data: responseData, sortOrder: 'desc' }));
            setSortOder(true);
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
  }

  const onClickSortUserComments = () => {
    // Update the label & icon
    // Update store with new sort order and render
    if (getSortOrder) {
      dispatch(globalActions.updateUserCommentList({ data: userComments, sortOrder: "asc", }));
      setSortOder(false);
    } else {
      dispatch(
        globalActions.updateUserCommentList({ data: userComments, sortOrder: "desc", }));
      setSortOder(true);
    }
  };

  const onReset = () => {
    setControlVisibility(false);
    reset();
  };

  function onDeleteComment(id: number) {

    if (recordId > 0) {
      let formDataObject: IUserCommentModel;
      formDataObject = {
        id: id,
        recordId,
        moduleTypeId,
        postedComment: "",
      };

      dispatch(deleteUserCommentsAsync({ formDataObject }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as boolean;

            if (responseData) {
              toast.success(intl.formatMessage({ id: 'MOD.COMMENTS.DELETE.MESSAGE' }));
              fetchUserCommentsList(recordId, formDataObject.moduleTypeId);
            }
          } else {
            toast.error(intl.formatMessage({ id: 'MOD.GLOBAL.ERROR.MESSAGE' }));
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
        })
    }

  };

  return (
    <>
      <div className="row">
        <>
          <div className="col-md-6">
            <div className={`mb-5`}>
              {/* <LabelSemibold6 text={"MOD.PROJECTMANAGEMENT.COMMENTS"} /> */}
            </div>
          </div>
          <div className="col-md-6">
            <div className={`mb-9 float-end`}>
              <div
                className={cssModule["frame-9048"]}
                onClick={onClickSortUserComments}
                style={{ cursor: "pointer" }}>
                {
                  getSortOrder ?
                    // Newest First will be True
                    (
                      <div className={`${cssModule["newest-first"]}`}>
                        {intl.formatMessage({
                          id: "MOD.PROJECTMANAGEMENT.COMMENTNEWSORT",
                        })}{" "}
                        <div className="fa-solid fa-arrow-down-short-wide"></div>
                      </div>
                    )
                    :
                    // Oldest First will be False                      
                    (
                      <div className={`${cssModule["newest-first"]}`}>
                        {intl.formatMessage({
                          id: "MOD.PROJECTMANAGEMENT.COMMENTOLDSORT",
                        })}{" "}
                        <div className="fa-solid fa-arrow-up-wide-short"></div>
                      </div>
                    )
                }
              </div>
            </div>
          </div>
        </>
      </div>
      <div className="row" style={{ overflow: 'auto', height: '264px' }}>
        <div className="col-md-12">
          <div className={`mb-5 mb-xxl-8`}>
            {/* begin::Body */}
            <div className="card-body pb-0 p-0">
              {/* begin::Header */}

              {
                (showAdd) &&
                <div className="d-flex align-items-center mb-3">
                  <div className="d-flex align-items-center flex-grow-1">
                    <div className={`me-5 ${cssModule["avatar"]}`}>
                      <UserContactInfo
                        userid={userid}
                        name={(lang === "en") ? auth?.rankNameEn + " " + auth?.displayNameEn?.trim() : auth?.rankNameAr + " " + auth?.displayNameAr?.trim()}
                        image={""}
                        customStyle={""}
                        isShowText={false}
                        isAvtIconLarge={true}
                        gender={""}
                      />
                    </div>

                    <div className="d-flex flex-column pt-1" style={{ width: '100%' }}>
                      {!controlVisibility &&
                        (
                          <input
                            className="form-control form-control-solid input5 lbl-txt-medium-2"
                            data-kt-autosize="true"
                            onFocus={handleHidePlaceholderControl}
                            readOnly={true}
                            placeholder={intl.formatMessage({
                              id: "MOD.PROJECTMANAGEMENT.USERCOMMENT",
                            })}
                          />
                        )}

                      {controlVisibility && (
                        <>

                          <form
                            onSubmit={handleSubmit(onSubmit)}

                            className={`form`}
                            autoComplete="off"
                            id="userCommentForm"
                          >
                            {/* <Controller
                              render={({ field }) => (
                                <WYSIWYGEditor

                                  removeBlockquoteButton={true}
                                  removeImageButton={true}
                                  {...field} cssClass={cssModule["editorClassNameCommments"]} />
                              )}
                              {...register("postedComment", {
                                required: intl.formatMessage({ id: 'MOD.PROJECTMANAGEMENT.COMMENTSREQUIRED' }),
                              })}
                              control={control}
                              defaultValue=""
                              rules={{
                                validate: {
                                  required: (v) =>
                                    (v && stripHtml(v).result.length > 0) ||
                                    intl.formatMessage({ id: 'MOD.PROJECTMANAGEMENT.COMMENTSREQUIRED' }),
                                  maxLength: (v) =>
                                    (v && stripHtml(v).result.length <= 2000) ||
                                    intl.formatMessage({ id: 'MOD.PROJECTMANAGEMENT.VALIDATION.MAXCHARLIMIT' }) + " 2000",
                                },
                              }}
                            /> */}
                            <div className={"error"}>{errors.postedComment?.message}</div>


                            <div className="my-3"></div>

                            <div className="row">
                              <div className="col-sm-8">
                                <button
                                  type="submit"
                                  className="btn btn-sm  create-project-submit me-5"
                                  id="kt_invoice_submit_button_usercomment"
                                  style={{ padding: "8px 16px" }}
                                >
                                  <BtnLabeltxtMedium2 text={'MOD.PROJECTMANAGEMENT.SAVECHANGES'} isI18nKey={true} />
                                </button>
                                <button
                                  className="btn btn-sm btn-cancel w-5 col-form-label"
                                  onClick={() => onReset()}
                                  id={generateUUID()}
                                  style={{ padding: "8px 16px" }}
                                >
                                  <BtnLabelCanceltxtMedium2 text={'MOD.PROJECTMANAGEMENT.CANCEL'} isI18nKey={true} />
                                </button>
                              </div>
                            </div>

                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              }
              {/* end::Header */}

              {/* begin::Replies */}
              <div className="mb-7 mt-7">
                {userComments &&
                  userComments.length > 0 &&
                  userComments.map((item, i) => (
                    <div className={`d-flex mb-5 ${cssModule["div-cooments"]}`} style={{ borderBottom: "1px solid #efeaea" }} key={i}>
                      {/* begin::Avatar */}
                      <div className={`me-5 ${cssModule["avatar"]}`}>

                        <UserContactInfo
                          userid={item?.createdBy}
                          name={item?.createdByUsername}
                          image={""}
                          customStyle={""}
                          isShowText={false}
                          isAvtIconLarge={true}
                          gender={item?.createdByUserGender}
                        />
                      </div>
                      {/* end::Avatar */}

                      {/* begin::Info */}
                      <div className="d-flex flex-column flex-row-fluid  mt-1">
                        {/* begin::Info */}
                        <div className="d-flex align-items-center flex-wrap mb-1">
                          <span className="me-3">
                            <LabelTitleRegular2 isI18nKey={false} text={
                              lang === "en"
                                ? item.createdByUsername!
                                : item.createdByUsernameAr!
                            } />
                          </span>
                          <LabelTitleRegular2 text={item?.durationSinceLastActivity!} customClassName="text-gray-400" />
                          <LabelTitleRegular2 text={"(" + item?.durationSinceLastPostedComment! + ")"} customClassName="text-gray-400 fs-9 mx-2" />
                        </div>
                        {/* end::Info */}

                        {/* begin::Post */}
                        <p className="lead mb-0">
                          <span
                          style={{background:'transparent'}}
                            className={`text-capitalize  activityCommentText-` + lang}
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(item.postedComment),
                            }}
                          ></span>
                        </p>

                        {/* end::Post */}
                      </div>
                      {/* {"=>"+item.isAllowDelete}
                      {"=>"+item.recordId}
                      {"=>"+item.id} */}
                      {item.isAllowDelete && showAdd && (
                        <div className={`me-5 ${cssModule["comment-delete-icon"]}`}>

                          <HtmlTooltip title={intl.formatMessage({
                            id: "MOD.COMMENTS.DELETE",
                          })}>
                            <button
                              type="button"
                              className="btn btn-active-light p-0"
                              style={{ cursor: 'pointer' }}
                              aria-label="delete"
                              id={"delete" + generateUUID() + item.recordId}
                              onClick={() => onDeleteComment(item.id)}
                            >
                              <ClearOutlinedIcon />
                              {/* <span className="prj-icon-stroke-plus">
                              <img src={toAbsoluteUrl('/media/svg/mod-specific/shared-files-trash.svg')} />
                            </span> */}
                            </button>
                          </HtmlTooltip>
                        </div>
                      )}
                      <hr></hr>
                    </div>

                  ))}

                {
                  (!userComments || userComments.length === 0) &&
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

export default UserComment;
