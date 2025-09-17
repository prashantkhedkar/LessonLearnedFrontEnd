import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useLang } from "../../../_metronic/i18n/Metronici18n";
import { DetailLabels, InfoLabels } from "../../modules/components/common/formsLabels/detailLabels";
import UserAttachmentUpload from "./AttachmentUpload";
import NoRecordsAvailable from "./NoRecordsAvailable";
import { AttachmentDownloader } from "./AttachmentDownloader";
import { ModulesAttachmentConstant } from "../../helper/_constant/modules.constant";
import { toast } from "react-toastify";
import { getAllowedMimeTypes } from "../../modules/utils/common";
import axios from "axios";
import MIMEConstantALL from "../../helper/_constant/mime.constant";
import { Tooltip } from "@mui/material";
import { UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { RequestAttachmentList } from "../../../app/models/attachment/AttachmentModel";
import "../components/UserAttachments.css";

type FormValues = Record<string, any>;

type AttachmentManagerProps = {
    observationID: number;

    /** loading & spinners */
    isLoading: boolean;
    isFileUploading: boolean;
    setisFileUploading: (v: boolean) => void;

    /** react-hook-form bits used here and in the file uploader */
    register: UseFormRegister<FormValues>;
    setValue: UseFormSetValue<FormValues>;
    getValues: UseFormGetValues<FormValues>;

    /** data & actions */
    AttachmentList: RequestAttachmentList[];
    refresh: () => void;
    OnDeleteCallBack: (id: number) => void;

    /** row action spinners */
    isDeleteLoading: boolean;
    setDeleteLoading: (v: boolean) => void;
    isViewLoading: boolean;
    setisViewLoading: (v: boolean) => void;
    loadingIndex: number | null;
    setLoadingIndex: (v: number | null) => void;
};

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  observationID,
  isLoading,
  isFileUploading,
  setisFileUploading,

  register,
  setValue,
  getValues,

  AttachmentList,
  refresh,
  OnDeleteCallBack,

  isDeleteLoading,
  setDeleteLoading,
  isViewLoading,
  setisViewLoading,
  loadingIndex,
  setLoadingIndex,
}) => {
  const intl = useIntl();
  const lang = useLang();

  // Local state
  const [title, setTitle] = useState("");
  const [titleErrorMsg, setTitleErrorMsg] = useState("");
  const [attachmentErrorMsg, setAttachmentErrorMsg] = useState("");
  const [attachmentErrorSizeMsg, setAttachmentSizeErrorMsg] = useState("");
  const [attachmentErrorTypeMsg, setAttachmentErrorTypeMsg] = useState("");
  const [isAttachmentSizeExceed, setisAttachmentSizeExceed] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | undefined>();
  const [loadingButtonId, setLoadingButtonId] = useState<number | null>(null);

  const perFileMaxAllowedSizeInMb = 50;

  useEffect(() => {
    // reset fields on mount
    setValue("attachment_file", "");
    setValue("attachment_title", "");
    setisFileUploading(false);
    clearAttachmentFileError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearAttachmentFileError() {
    setisAttachmentSizeExceed(false);
    setTitleErrorMsg("");
    setAttachmentErrorMsg("");
    setAttachmentSizeErrorMsg("");
    setAttachmentErrorTypeMsg("");
  }

  const ManageTooltipTitle: React.FC<{ title: string }> = ({ title }) => (
    <div className="txt-trim-content">
      <span className="txt-name">
        <DetailLabels text={title} isI18nKey />
      </span>
    </div>
  );

  const handleDelete = (requestAttachmentId: number) => {
    setDeleteLoading(true);
    setLoadingIndex(requestAttachmentId);
    OnDeleteCallBack(requestAttachmentId);
  };

  const handleView = async (requestAttachmentId: number) => {
    try {
      debugger;
      setLoadingButtonId(requestAttachmentId);
      setisViewLoading(true);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/Attachment/GetAttachmentByObservation/${requestAttachmentId}`,
        { responseType: "blob" }
      );

      const disposition = response.headers["content-disposition"];
      let fileName = "download-file";
      if (disposition && disposition.includes("filename=")) {
        const filenameRegex = /filename="?([^"]+)"?/;
        const matches = filenameRegex.exec(disposition);
        if (matches?.[1]) fileName = matches[1];
      }

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log("GetAttachmentByObservation failed", e);
    } finally {
      setisViewLoading(false);
      setLoadingIndex(null);
      setLoadingButtonId(null);
    }
  };

  function validate(): boolean {
    let hasError = false;

    const titleVal = getValues("attachment_title");
    if (!titleVal) {
      hasError = true;
      setTitleErrorMsg(
        `${intl.formatMessage({ id: "ATTACHMENT.NAME" })} ${intl.formatMessage({
          id: "FORM.LABEL.REQUIRED",
        })}`
      );
    } else {
      setTitleErrorMsg("");
    }

    const fileVal = getValues("attachment_file");
    if (!fileVal) {
      hasError = true;
      setAttachmentErrorMsg(
        `${intl.formatMessage({
          id: "LABEL.POPUP.ATTACHMENTS",
        })} ${intl.formatMessage({ id: "FORM.LABEL.REQUIRED" })}`
      );
    } else {
      setAttachmentErrorMsg("");
    }

    if (isAttachmentSizeExceed) {
      hasError = true;
      setAttachmentSizeErrorMsg(
        `${intl.formatMessage({
          id: "LABEL.POPUP.ATTACHMENTS.SIZE.HIGHER",
        })} ${perFileMaxAllowedSizeInMb} MB`
      );
    } else {
      setAttachmentSizeErrorMsg("");
    }

    return hasError;
  }

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const hasError = validate();
    if (hasError) return;

    setisFileUploading(true);
    SetAttachmentLoaderStatus("fatwa", "true");

    try {
      if (!currentFile) {
        setisFileUploading(false);
        SetAttachmentLoaderStatus("fatwa", "false");
        return;
      }

      const titleVal = getValues("attachment_title") ?? "";

      const formData = new FormData();
      formData.append("File", currentFile, currentFile.name);
      formData.append("Id", String(observationID));
      formData.append("Title", String(titleVal));

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/Attachment/UploadObservationAttachmentFromForm`,
        formData,
        {
          transformRequest: [(data) => data],
        }
      );

      const ok = response.status === 200 && (response.data?.data ?? true);
      debugger;
      if (ok) {
        refresh();
        toast.success(intl.formatMessage({ id: "LAW.FORM.ATTACHMENT" }));
        setValue("attachment_title", "");
        setValue("attachment_file", "");
      } else {
        toast.error(intl.formatMessage({ id: "LAW.FORM.ATTACHMENT.ERROR" }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(intl.formatMessage({ id: "LAW.FORM.ATTACHMENT.ERROR" }));
    } finally {
      setisFileUploading(false);
      SetAttachmentLoaderStatus("fatwa", "false");
    }
  };

  const isAttachmentTypeError = (value: { message?: string } | boolean) => {
    clearAttachmentFileError();
    if (typeof value === "object" && value?.message) {
      setAttachmentErrorTypeMsg(value.message);
    } else {
      setAttachmentErrorTypeMsg(
        intl.formatMessage({ id: "LABEL.POPUP.ATTACHMENTS.TYPE.INVALID" })
      );
    }
  };

  const isAttachmentSizeError = (value: boolean) => {
    if (value) {
      clearAttachmentFileError();
      setisAttachmentSizeExceed(true);
      const msg = `${intl.formatMessage({
        id: "LABEL.POPUP.ATTACHMENTS.SIZE.HIGHER",
      })} ${perFileMaxAllowedSizeInMb} MB`;
      setAttachmentSizeErrorMsg(msg);
      toast.warning(msg);
    } else {
      setisAttachmentSizeExceed(false);
    }
  };

  const isAttachmentEmpty = (hasFile: boolean) => {
    setValue("attachment_file", hasFile ? "notEmpty" : "");
  };

  return (
    <>
      <div className="row mb-4 p-2 align-items-center">
        {/* File input */}
        <div className="col-12 pt-4">
          <div className="row align-items-center mx-0 px-0 ">
            <div className="col-md-2 mx-0 px-2 form-field-label-wrapper">
              <InfoLabels
                text={intl.formatMessage({
                  id: "LABEL.POPUP.ATTACHMENTS",
                })}
                isRequired
                isI18nKey
              />
            </div>
            <div className="col-md-10 mx-0 px-0 ">
              <UserAttachmentUpload
                title={intl.formatMessage({
                  id: "LABEL.POPUP.ATTACHMENTS",
                })}
                tempguid="attachment_file"
                register={register}
                showUpload
                required
                fileTypes={MIMEConstantALL}
                perFileMaxAllowedSizeInMb={perFileMaxAllowedSizeInMb}
                isAttachmentEmpty={isAttachmentEmpty}
                isAttachmentSizeError={isAttachmentSizeError}
                isAttachmentTypeError={isAttachmentTypeError}
                setCurrentFile={setCurrentFile}
              />

              <div className="error">{attachmentErrorMsg}</div>
              <div className="error">{attachmentErrorSizeMsg}</div>
              <div className="error">{attachmentErrorTypeMsg}</div>
              <div className="info pt-2">
                <InfoLabels
                  text={
                    getAllowedMimeTypes(
                      true,
                      MIMEConstantALL!,
                      intl.formatMessage({
                        id: "MOD.GLOBAL.FILEUPLOAD.FILESIZE.INFOMESSAGE",
                      }),
                      perFileMaxAllowedSizeInMb
                    ).generalMsg
                  }
                  isRequired
                />
              </div>
            </div>
          </div>
        </div>
        {/* Title input */}
        <div className="col-12 pt-4 pe-0">
          <div className="row align-items-center mx-0 px-0 ">
            <div className="col-md-2 mx-0 px-2 form-field-label-wrapper">
              <InfoLabels text={"ATTACHMENT.NAME"} isRequired isI18nKey />
            </div>
            <div className="col-md-9 mx-0 px-0 ">
              <input
                type="text"
                value={title}
                autoComplete="off"
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleErrorMsg("");
                  setValue("attachment_title", e.target.value);
                }}
                className="form-control form-control-solid input5 lbl-txt-medium-2 p-2"
                placeholder={intl.formatMessage({ id: "ATTACHMENT.NAME" })}
                name="attachment_title"
              />
              <div className="error">{titleErrorMsg}</div>
            </div>
            <div className="col-md-1 align-items-center d-flex justify-content-end">
              {" "}
              <button
                type="button"
                className="btn MOD_btn btn-create"
                onClick={handleAdd}
                disabled={isFileUploading}
              >
                <span className="detailLabels_btn-lbl-txt-medium-2-ar__H+GFf">
                  {intl.formatMessage({ id: "LABEL.UPLOAD" })}
                </span>

                {GetAttachmentLoaderStatus("fatwa") === "true" && (
                  <span style={{ display: "block" }}>
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Grid */}
        <div className="col-12 pt-4">
          {AttachmentList && AttachmentList.length === 0 && isLoading ? (
            <NoRecordsAvailable />
          ) : null}

          {AttachmentList && AttachmentList.length > 0 ? (
            <div className="row py-5 attachment-table-header">
              <div className="col">
                <span>
                  {intl.formatMessage({
                    id: "LABEL.FORM.ATTACHMENT.TAB.ATTACHMENT.TITLE",
                  })}
                </span>
              </div>
              <div
                className="col"
                style={{
                  paddingRight: lang === "ar" ? "300px" : "0px",
                  paddingLeft: lang === "en" ? "300px" : "0px",
                }}
              >
                <div className="text-start">
                  <span>
                    {intl.formatMessage({
                      id: "LABEL.FORM.ATTACHMENT.TAB.FILENAME",
                    })}
                  </span>
                </div>
              </div>
              <div className="col">
                <div className="text-end">
                  <span>
                    {intl.formatMessage({
                      id: "LABEL.FORM.ATTACHMENT.TAB.ACTION",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {AttachmentList?.map((item) => (
            <div key={item.id} className="row py-5 attachment-table-border-row">
              <div className="col">
                <div>
                  <span>{String(item.title ?? "")}</span>
                </div>
              </div>
              <div
                className="col"
                style={{
                  paddingRight: lang === "ar" ? "300px" : "0px",
                  paddingLeft: lang === "en" ? "300px" : "0px",
                }}
              >
                <div>
                  <span>{String(item.fileName ?? "")}</span>
                </div>
              </div>
              <div className="col">
                <div className="d-flex gap-5 flex-end">
                  <div>
                    {!isDeleteLoading && loadingIndex == null ? (
                      <Tooltip
                        placement="bottom"
                        title={
                          <ManageTooltipTitle
                            title={"LABEL.ATTACHMENTS.TOOLTIP.DELETE"}
                          />
                        }
                        arrow
                        TransitionProps={{ timeout: 400 }}
                      >
                        <i
                          className="fa fa-light fa-trash-can fs-2 fs-3 text-gray pointer"
                          onClick={() => handleDelete(item.id)}
                        />
                      </Tooltip>
                    ) : null}

                    {isDeleteLoading && loadingIndex === item.id && (
                      <span
                        className="indicator-progress"
                        style={{ display: "block" }}
                      >
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </span>
                    )}
                  </div>

                  <div>
                    <AttachmentDownloader item={item} attchmentType="Fatwa" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading ? <div className="my-2" /> : null}
        </div>
      </div>
    </>
  );
};

export function SetAttachmentLoaderStatus(uniqueKey: any, value: any) {
  try {
    localStorage.setItem(`${uniqueKey}_LABEL-isAttachmentLoading`, value);
  } catch (e) {
    console.log(e);
  }
}

export function GetAttachmentLoaderStatus(uniqueKey: any) {
  try {
    return (
      localStorage.getItem(`${uniqueKey}_LABEL-isAttachmentLoading`) || "false"
    );
  } catch (e) {
    console.log(e);
    return "false";
  }
}