import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { MIMEConstantType, getAllowedMimeTypes } from "../../modules/utils/attachmentCommon";
import { toast } from "react-toastify";
import { toAbsoluteUrl } from "../../../_metronic/helpers";
import "../components/UserAttachments.css";

type Props = {
  /** i18n id or plain label for the field (used in required message) */
  title: string;
  /** unique field name/id used by react-hook-form */
  tempguid: string;

  /** react-hook-form register for this file input */
  register: (name: string, options?: any) => {
    onChange: any;
    onBlur: any;
    name: string;
    ref: (instance: HTMLInputElement | null) => void;
  };

  /** Allowed mime types map: { "image/png": ".png", ... } */
  fileTypes: MIMEConstantType;

  /** UI flags */
  showUpload?: boolean;      // default: true
  showType?: boolean;        // optional heading (not rendered by default)
  required?: boolean;        // show RHF required
  loadedfileName?: string;   // initial shown file name
  showfile?: React.ReactNode;

  /** Validation & limits */
  perFileMaxAllowedSizeInMb?: number; // default: 10
  isAttachmentEmpty?: (hasFile: boolean) => void;
  isAttachmentSizeError?: (isTooBig: boolean) => void;
  isAttachmentTypeError?: (payload: { status: boolean; message?: string } | boolean) => void;

  /** Output */
  setCurrentFile: (file?: File) => void;
};

const AttachmentUpload: React.FC<Props> = ({
  title,
  tempguid,
  register,
  fileTypes,

  showUpload = true,
  showType = false,
  required = false,
  loadedfileName = "",
  showfile,

  perFileMaxAllowedSizeInMb = 10,
  isAttachmentEmpty,
  isAttachmentSizeError,
  isAttachmentTypeError,

  setCurrentFile,
}) => {
  const intl = useIntl();
  const [fileName, setFileName] = useState<string>(loadedfileName);

  useEffect(() => {
    // Compute allowed types info (useful if you want to display it)
    getAllowedMimeTypes(
      true,
      fileTypes,
      intl.formatMessage({ id: "MOD.GLOBAL.FILEUPLOAD.FILESIZE.INFOMESSAGE" }),
      perFileMaxAllowedSizeInMb
    );
  }, [fileTypes, intl, perFileMaxAllowedSizeInMb]);

  const isGreaterThan = (bytes: number) => bytes / (1024 * 1024) > perFileMaxAllowedSizeInMb;

  const handleOnSelectFileForUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    const file = files?.[0];

    isAttachmentEmpty?.(!!file);
    setCurrentFile(file ?? undefined);

    if (!file) {
      setFileName("");
      return;
    }

    // size check
    if (isGreaterThan(file.size)) {
      isAttachmentSizeError?.(true);
      toast.warning(
        `${intl.formatMessage({
          id: "LABEL.POPUP.ATTACHMENTS.SIZE.HIGHER",
        })} ${perFileMaxAllowedSizeInMb} MB`
      );
      return;
    } else {
      isAttachmentSizeError?.(false);
    }

    // type check
    if (fileTypes && !fileTypes[file.type]) {
      const allowed = getAllowedMimeTypes(
        true,
        fileTypes,
        intl.formatMessage({
          id: "MOD.GLOBAL.FILEUPLOAD.FILESIZE.INFOMESSAGE",
        }),
        perFileMaxAllowedSizeInMb
      ).extension;
      const msg = intl
        .formatMessage({ id: "MOD.GLOBAL.FILEUPLOAD.FILETYPE.INFOMESSAGE" })
        .replace("{X}", allowed);
      toast.warning(msg);
      isAttachmentTypeError?.({ status: true, message: msg });
      return;
    }

    setFileName(file.name);
  };

  return (
    <>
      {/* DO NOT wrap title like {{title}}; that would create an object */}
      {/* {!showType && title} */}

      <div className="file-upload">
        <div className="single-fileUpload">
          {/* Hidden input controlled by label — only RHF provides the ref now */}
          <input
            id={tempguid}
            type="file"
            multiple={false}
            {...register(tempguid, {
              required: required
                ? `${intl.formatMessage({ id: title })} ${intl.formatMessage({
                    id: "FORM.LABEL.REQUIRED",
                  })}`
                : false,
            })}
            onChange={handleOnSelectFileForUpload}
            hidden
          />

          {/* Upload button */}
          <div hidden={!showUpload} className="file-upload-button float-start">
            <label htmlFor={tempguid} style={{ cursor: "pointer" }}>
              <img
                src={toAbsoluteUrl("/media/svg/mod-specific/icon-upload.svg")}
                className="float-start"
                alt="upload"
              />
              <div className="single-fileUpload-label float-start ps-2">
                {intl.formatMessage({ id: "FORM.FILEMANAGEMENT.UPLOADFILE" })}
              </div>
            </label>
          </div>

          {/* Selected file name */}
          <span className="float-start pt-2 ps-2">{fileName}</span>

          {/* Optional right-side content */}
          {showfile ? (
            <div className="row">
              <div className="col pb-4">
                <div className="float-end">{showfile}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default AttachmentUpload;