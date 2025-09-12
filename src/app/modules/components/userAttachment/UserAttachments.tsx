import { useIntl } from "react-intl";
import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import { generateUUID, getAllowedMimeTypes, getImagesExtension, getSharePointMimeTypes, writeToBrowserConsole } from "../../utils/common";
import { toast } from "react-toastify";
import {
  addAttachmentItemAsync, deleteAttachmentAsync, deleteAttachmentChunkItemAsync, downloadAttachmentAsync, fetchAttachmentListAsync,
  globalActions, saveAttachmentsOnChunkCompletionAsync, uploadAttachmentChunkCompleteItemAsync, uploadAttachmentChunkCompleteSharepointItemAsync
} from "../../services/globalSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import "./UserAttachments.css";
import { IAttachment, IAttachmentMediaCenter, IAttachmentSharepoint, IUserAttachmentResponseModel } from "../../../models/global/globalGeneric";
import { unwrapResult } from "@reduxjs/toolkit";
import { LabelTitleSemibold1, LabeltxtMedium2 } from "../common/formsLabels/detailLabels";
import NoRecordsAvailable from "../noRecordsAvailable/NoRecordsAvailable";
import UserAttachmentUploadButton from "./UserAttachmentUploadButton";
import { ProgressBar } from "react-bootstrap";
import { useAuth } from "../../auth/core/Auth";
import { ColoredFileTypeSvg } from "../common/image/ModSpecificSvg";

type MIMEConstantType = {
  [key: string]: { extension: string };
};
interface props {
  allowMultipleFileUpload?: boolean,
  limitToSingleAttachment?: boolean,
  showCheckbox?: boolean,
  showDelete?: boolean,
  showDownload?: boolean,
  showUpload?: boolean,
  initialData: IAttachment[]; // Input
  recordId: number;
  moduleTypeId?: number; // Refer to Global Generics for Enum constant
  onFileSave?: Function;
  onFileRemove?: Function;
  fileTypes: MIMEConstantType;
  showUploadTooltip?: boolean,
  UploadTooltip?: string,
  customTitle?: string,
  showFileTypes?: boolean,
  perFileMaxAllowedSizeInMb: number, // If provided, will override global setting
  perFileMaxAllowedChunkSizeToSplitInMb: number // If provided, will override global setting
  shouldUploadFileAsChunks: boolean // If true, file will be splitted as per value in 'perFileMaxAllowedChunkSizeToSplitInMb' and uploaded to api and merged on server
  onSetDisableSubmitAction?: (columnName: boolean) => void,
  storageServer?: string,
  moduleNewRecordGuid?: string, // Required for module which is in draft mode and not submitted to database and user is uploading attachment without ID of service record

  //Optional parameter to use different styles for displaying button
  buttonLayout?: string,

  //Will Enable Validation Handler For Duplicate file restriction, where condition will be handled on Parent Component.
  shouldCheckForDuplicateFileAndRestrictUpload?: boolean,

  shouldCheckForDuplicateFileAndConfirmBeforeUpload?: boolean,
  handleonBeforeFileUploadCheckForDuplicate?: (fileName: File) => Promise<[File, boolean, number]>,
};
const UserAttachments = ({ initialData, recordId, showCheckbox, showDelete, showDownload, showUpload, allowMultipleFileUpload, moduleTypeId, fileTypes,
  limitToSingleAttachment, showUploadTooltip, UploadTooltip, customTitle, showFileTypes,
  perFileMaxAllowedChunkSizeToSplitInMb, perFileMaxAllowedSizeInMb, shouldUploadFileAsChunks, onSetDisableSubmitAction,
  shouldCheckForDuplicateFileAndRestrictUpload, storageServer, moduleNewRecordGuid, shouldCheckForDuplicateFileAndConfirmBeforeUpload, handleonBeforeFileUploadCheckForDuplicate }: props) => {

  const { auth } = useAuth();
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { userAttachment, uploadProgress } = useAppSelector((s) => s.globalgeneric);
  const [arrayIds, setArrayIds] = useState<string[]>([]);
  const [fileSizeTypeWarning, setFileSizeTypeWarning] = useState<string>('');
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (recordId > 0) {
      if (initialData && initialData.length > 0) {
        dispatch(globalActions.updateUserAttachment({ data: initialData, action: 'init' }));
      } else {
        handleOnFetchAttachments(recordId, moduleTypeId,"");
      }
    }
    loadAttachmentDisclaimer();
  }, [dispatch]);

  // Show list of file extension as comma separated
  const loadAttachmentDisclaimer = () => {
    let listOfExtensions: string = getAllowedMimeTypes(showFileTypes!, fileTypes, intl.formatMessage({ id: 'MOD.GLOBAL.FILEUPLOAD.FILESIZE.INFOMESSAGE' }), perFileMaxAllowedSizeInMb).generalMsg;
    setFileSizeTypeWarning(listOfExtensions);
    return listOfExtensions;
  };

  // Event handler for Checkbox Grid Event Handler
  const handleOnChange = (event, id: any) => {
    if (event.target.checked === true) {
      setArrayIds(oldArray => [...oldArray, id]);
    } else {
      setArrayIds(arrayIds.filter((i) => i !== id));
    }
  };

  // Get total checked items from grid
  const countCheckedCheckboxes = () => {
    return arrayIds.length;
  };

  // Remove bulk attachments 
  const handleRemoveMultipleItems = () => {
    // Remove items by checking the checkbox on every row and deleting row item attachment in bulk
    // Delete checked items from grid
    arrayIds.map((item) => {
      // Delete from server, if module id exists
      if (recordId > 0) {
        const toDelete = userAttachment.filter((aItem) => aItem.id.toString() === item.toString());
        handleOnRemoveAttachment({ ...toDelete[0], isActive: false, moduleTypeId: moduleTypeId });
      } else {
        // Delete from store, if module id does not exist
        const toDelete = userAttachment.filter((aItem) => aItem.draftId!.toString() === item);
        dispatch(globalActions.updateUserAttachment({ data: toDelete, action: 'del' }));
      }
    });

    if (recordId > 0) {
      handleOnFetchAttachments(recordId, moduleTypeId,"");
    }

    setArrayIds([]);
  };

  // Remove single attachment from remote server by clicking on the bin icon corresponding to record in ui
  function handleRemoveSingleItem(id: string, guid: string, attachmentItem: IAttachment) {

    // Remove items by clicking on the delete icon provided on each row to delete single row item attachment
    let filteredItem;

    if ((id === "0" || id === "") && guid.includes("-")) {
      filteredItem = userAttachment.filter((item) => item.draftId !== guid);
    } else if (id !== "0" && id !== "") {
      filteredItem = userAttachment.filter((item) => item.id?.toString() === id);
    }

    // Delete item if module id is available
    if (recordId > 0 && filteredItem) {
      handleOnRemoveAttachment({ ...filteredItem[0], isActive: false, moduleTypeId: moduleTypeId });
    }
    else {
      // DRAFT MODE
      // Delete item if module id is not available
      dispatch(globalActions.updateUserAttachment({ data: filteredItem, action: "init" }));

      //File-Chunk Related Code
      if (shouldUploadFileAsChunks) {
        let formDataModel: IAttachment;
        formDataModel = {
          formData: null,
          fileName: guid,
          fileType: "",
          isActive: true,
          fileSize: 0,
          id: 0,
          moduleId: "0",
          createdByEmailAddress: "",
          moduleTypeId: moduleTypeId,
          chunkFileReferenceGuid: "",
          chunkFileTempPath: process.env.REACT_APP_CHUNK_FILE_PATH,
          docGUID: attachmentItem.docGUID,
          itemId: attachmentItem.itemId,
          docUrl: attachmentItem.docUrl
        };

        if (!storageServer || storageServer === "") {
          handleOnRemoveAttachmentChunk(formDataModel);
        } else {
          handleOnRemoveAttachment(formDataModel);
        }

      }
    }
  };

  // Download attachment from remote server
  function handleOnDownloadAttachment(id: string): void {
    try {
      const toDownload = userAttachment.filter((item) => item.id!.toString() === id);

      if (recordId) {
        toast.info(intl.formatMessage({ id: 'MOD.GLOBAL.FILEDOWNLOAD.WAIT.MESSAGE' }).toString().replaceAll("{X}", toDownload[0].fileName!), { isLoading: true, toastId: 'DownloadToastr' });

        let formDataModel: IAttachment = {
          docGUID: toDownload[0].docGUID,
          fileName: toDownload[0].fileName,
          fileType: toDownload[0].fileType,
          id: toDownload[0].id,
          fileSize: toDownload[0].fileSize,
          moduleId: toDownload[0].moduleId,
          itemId: toDownload[0].itemId,
          docUrl: toDownload[0].docUrl,
          moduleTypeId: moduleTypeId
        };

        dispatch(downloadAttachmentAsync({ formDataObject: formDataModel }))
          .then(unwrapResult)
          .then((originalPromiseResult) => {

            if (originalPromiseResult.statusCode === 200) {
              const responseData = originalPromiseResult.data;
              const responseMessage = originalPromiseResult.message;

              if (responseData) {
                let anchorRef = document.getElementById("dwnldLnk_" + formDataModel.docGUID) as HTMLAnchorElement;
                anchorRef.href = 'data:' + formDataModel.fileType + ';base64,' + responseData;
                anchorRef.click();
                toast.success(intl.formatMessage({ id: 'MOD.GLOBAL.FILEDOWNLOAD.SUCCESS.MESSAGE' }));
              } else {
                if (responseMessage === "MOD.DOCUMENT.PENDING.UPLOAD") {
                  toast.info(intl.formatMessage({ id: 'MOD.DOCUMENT.PENDING.UPLOAD' }).replaceAll("{x}", formDataModel.fileName!.toString()));
                }
              }
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
          })
          .finally(() => {
            toast.dismiss("DownloadToastr");
          })
      }
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  // When All Chunks of selected file is uploaded, notify API to merge and push file to sharepoint
  const handleOnUploadAttachmentChunksComplete = (formObject: IAttachment) => {
    try {
      if (formObject && formObject.storageServer === "mediaserver") {
        dispatch(uploadAttachmentChunkCompleteItemAsync({ formDataObject: formObject }))
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              const responseData = originalPromiseResult.data as boolean;
              if (responseData) {
                if (recordId > 0) {
                  handleOnFetchAttachments(formObject.moduleId, formObject.moduleTypeId,"");
                }
                // Notify parent component to disable action button during upload
                onSetDisableSubmitAction!(false);
              }
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
            // Notify parent component to disable action button during upload
            onSetDisableSubmitAction!(false);
          })
          .finally(() => {
            const loaderMessage = 'LoadingToastr' + formObject.fileName?.replaceAll(' ', '_').toString();
            toast.dismiss(loaderMessage);
          });
      } else if (formObject && formObject.storageServer === "sharepoint") {

        let newFormDataObject: IAttachmentSharepoint = {
          chunkFileReferenceGuid: formObject.chunkFileReferenceGuid!,
          fileName: formObject.fileName!,
          jpModule: formObject.moduleTypeId!,
          dbRecordId: (moduleTypeId === 1 || moduleTypeId === 3 || moduleTypeId === 8) ? 0 : Number(formObject.moduleId!), //Modules to use Guid based folder structure in sharepoint: Task, Watira & Meetings
          uploadedBy: "",
          folderURL: (moduleTypeId === 1 || moduleTypeId === 3 || moduleTypeId === 8) ? moduleNewRecordGuid + "/" : "" //Modules to use Guid based folder structure in sharepoint: Task, Watira & Meetings
        }

        // Send request to Sharepoint to merge chunks and return reference details
        dispatch(uploadAttachmentChunkCompleteSharepointItemAsync({ formDataObject: newFormDataObject }))
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            const responseData = originalPromiseResult as IUserAttachmentResponseModel;

            if (responseData.responseCode === 1 && responseData.success === true) {
              // Payload to send to Database to save final output from sharepoint
              formObject = {
                ...formObject,
                docGUID: responseData.data.docGUID,
                itemId: responseData.data.itemID,
                docUrl: responseData.data.docUrl
              }

              if (recordId === 0 && (moduleTypeId === 1 || moduleTypeId === 3 || moduleTypeId === 8 || moduleTypeId === 7)) {
                let tempUserAttachment: IAttachment = {
                  chunkFileReferenceGuid: formObject.chunkFileReferenceGuid!,
                  id: (moduleTypeId === 1 || moduleTypeId === 3 || moduleTypeId === 8) ? 0 : Number(formObject.moduleId!),
                  fileSize: 0,
                  fileName: formObject.fileName!,
                  docGUID: responseData.data.docGUID,
                  itemId: responseData.data.itemID,
                  docUrl: responseData.data.docUrl,
                  draftId: moduleNewRecordGuid
                };
                dispatch(globalActions.updateUserAttachment({ data: tempUserAttachment, action: 'update' }));
              }
              // Insert into database- for module specific Data
              handleOnChunkCompletionSaveAttachment(formObject);
            }

            // Notify parent component to enable action button after upload is completed
            onSetDisableSubmitAction!(false);
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
            // Notify parent component to disable action button during upload
            onSetDisableSubmitAction!(false);
          })
      }
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  // Upload attachment to database when use uploads attachment to Joint Portal Module as chunks to Sharepoint
  const handleOnChunkCompletionSaveAttachment = (formObject: IAttachment) => {
    try {
      formObject = {
        ...formObject,
        draftId: moduleNewRecordGuid
      }
      dispatch(saveAttachmentsOnChunkCompletionAsync({ formDataObject: formObject }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as boolean;
            if (responseData) {
              toast.success(intl.formatMessage({ id: "MOD.GLOBAL.NOTIFICATION.DOCUPLSUC" }) + " : " + formObject.fileName!.toString());
            }

            if (recordId > 0) {
              handleOnFetchAttachments(formObject.moduleId, formObject.moduleTypeId,"");
            }

          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
          toast.error(intl.formatMessage({ id: "MOD.GLOBAL.NOTIFICATION.DOCUPLFAIL" }) + " : " + formObject.fileName!.toString());
        })
        .finally(() => {
          toast.dismiss('LoadingToastr' + formObject.fileName?.replaceAll(' ', '_').toString());
        });
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  // Upload attachment to remote server
  const handleOnSaveAttachment = (formObject: IAttachmentMediaCenter) => {
    try {
      dispatch(addAttachmentItemAsync({ formDataObject: formObject }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as boolean;

            if (responseData) {
              handleOnFetchAttachments(formObject.moduleId, formObject.moduleTypeId,"");
            }

            toast.success(intl.formatMessage({ id: "MOD.GLOBAL.NOTIFICATION.DOCUPLSUC", }));
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        })
        .finally(() => {
          toast.dismiss('LoadingToastr' + formObject.fileName!.replaceAll(' ', '_').toString());
        })
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  // Remove attachment from remote server
  const handleOnRemoveAttachment = (formObject: IAttachment) => {

    try {
      dispatch(deleteAttachmentAsync({ formDataObject: formObject }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as boolean;
            if (responseData && recordId > 0) {
              handleOnFetchAttachments(formObject.moduleId, formObject.moduleTypeId,"");
            }
            toast.success(intl.formatMessage({ id: "MOD.GLOBAL.NOTIFICATION.DOCREMSUC", }));
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  // Fetch all attachments for current project
  const handleOnFetchAttachments = (recordId: any, moduleTypeId: any, draftId: any) => {
    try {
      dispatch(fetchAttachmentListAsync({ recordId, moduleTypeId, draftId }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as IAttachment[];
            dispatch(globalActions.updateUserAttachment({ data: responseData, action: 'init' }));
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  // Remove Temporary attachment from remote server
  const handleOnRemoveAttachmentChunk = (formObject: IAttachment) => {
    try {
      dispatch(deleteAttachmentChunkItemAsync({ formDataObject: formObject }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const responseData = originalPromiseResult.data as boolean;

          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  

  return (
    <>
      <div className="card MOD-Card" style={{ width: "100%", height: "353px", overflowY: "scroll" }}>

        <div className="card-header cursor-pointer">
          <div className="project-user-form-header w-50">
            <div className="col-10">
              <LabelTitleSemibold1 text={customTitle && customTitle.length > 0 ? customTitle : "MOD.PROJECTMANAGEMENT.ATTACHMENTS"} />
            </div>
            <div className="col-2 ms-3">
              {showProgress === true &&
                <div style={{ display: 'block', padding: 30 }}>
                  <ProgressBar key={generateUUID()} animated now={uploadProgress} label={`${uploadProgress.toFixed(2)}%`} variant="progressBarCustom" />
                </div>
              }
            </div>
          </div>
          <div className="card-toolbar">
            {
              (countCheckedCheckboxes() > 0)
                ?
                <>
                  {/* Delete Button With # of checked items */}
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="fw-bold me-5">
                      <span className="me-1" data-kt-user-table-select="selected_count">
                        {countCheckedCheckboxes()}
                      </span>
                      {" "}{intl.formatMessage({ id: "MOD.PROJECTMANAGEMENT.LABEL.COUNTSELECTED", })}
                    </div>
                    <button
                      type="button"
                      hidden={!showDelete}
                      style={{ cursor: 'pointer' }}
                      className="btn MOD_btn btn-create w-10 pl-5 mx-3"
                      value={intl.formatMessage({ id: "MOD.PROJECTMANAGEMENT.BUTTON.DELETESELECTED", })}
                      onClick={handleRemoveMultipleItems}>
                      {intl.formatMessage({ id: "MOD.PROJECTMANAGEMENT.BUTTON.DELETESELECTED", })}
                    </button>
                  </div>
                </>
                :
                <>
                  {/* Upload Common Attachment Component */}
                  <UserAttachmentUploadButton
                    recordId={recordId}
                    moduleTypeId={moduleTypeId!}
                    fileTypes={fileTypes}
                    perFileMaxAllowedSizeInMb={perFileMaxAllowedSizeInMb!}
                    perFileMaxAllowedChunkSizeToSplitInMb={perFileMaxAllowedChunkSizeToSplitInMb!}
                    onUploadAttachmentChunksComplete={handleOnUploadAttachmentChunksComplete}
                    allowMultipleFileUpload={allowMultipleFileUpload}
                    limitToSingleAttachment={limitToSingleAttachment}
                    showUpload={showUpload}
                    showUploadTooltip={showUploadTooltip}
                    uploadTooltip={UploadTooltip!}
                    showFileTypes={showFileTypes}
                    onDisableSubmitAction={onSetDisableSubmitAction!}
                    storageServer={storageServer}
                    setShowProgress={setShowProgress}
                    shouldCheckForDuplicateFileAndRestrictUpload={shouldCheckForDuplicateFileAndRestrictUpload}

                    shouldCheckForDuplicateFileAndConfirmBeforeUpload={shouldCheckForDuplicateFileAndConfirmBeforeUpload}
                    onConfirmBeforeFileUploadCheckForDuplicate={handleonBeforeFileUploadCheckForDuplicate}

                    //moduleNewRecordGuid={moduleNewRecordGuid}
                    buttonLayout={""}
                  />
                </>
            }
          </div>
        </div>

        <div className="card-body MOD-Cardbody-inner-pages">
          <div className="row" style={{ width: "100%", margin: "auto" }}>
            <div className="col-lg-12 col-md-12 col-sm-12 p-0">
              <table className="table create-project-task-ms  table-striped table-bordered">
                <tbody>
                  {
                    userAttachment && userAttachment
                      .filter((item) => item.isActive === true)
                      .map((item, index) => (
                        <>
                          <tr key={(item.id && item.id.toString() !== "0") ? item.id : item.draftId!}>
                            <td className="w-5px " hidden={!showCheckbox}
                              ref={el => {
                                if (el) {
                                  el.style.setProperty('padding-top', '0', 'important');
                                }
                              }} >
                              <Checkbox
                                edge="start"
                                onChange={(e) => handleOnChange(e, (recordId > 0 ? item.id : item.draftId))}
                                tabIndex={-1}
                                disableRipple
                                sx={{
                                  "& .MuiSvgIcon-root": { border: "1px" },
                                  "&.Mui-checked": {
                                    color: "#B7945A",
                                  },
                                }}
                              />
                            </td>

                            <td className="w-5px">
                              <ColoredFileTypeSvg name={getImagesExtension(item.fileName!.toString())} />
                            </td>


                            <td className="w-30px min-w-10px max-w-30px" hidden={!showDownload}>
                              <a id={"dwnldLnk_" + item.docGUID} download={item.fileName} hidden={true} />
                              <button
                                type="button"
                                className="btn btn-active-light p-0"
                                style={{ cursor: 'pointer' }}
                                aria-label="download"
                                id={"download" + generateUUID() + item.id}
                                onClick={() => handleOnDownloadAttachment(item.id!.toString())}>
                                <svg
                                  className="icon-stroke-file-download"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M13.1499 3.85051C13.1058 3.85046 13.0597 3.85043 13.0117 3.85043H9.7999C8.9458 3.85043 8.35634 3.85109 7.89873 3.88848C7.45103 3.92506 7.20489 3.99251 7.02382 4.08477C6.61928 4.2909 6.29037 4.61981 6.08424 5.02435C5.99198 5.20542 5.92453 5.45157 5.88795 5.89926C5.85056 6.35687 5.8499 6.94633 5.8499 7.80043V16.2004C5.8499 17.0545 5.85056 17.644 5.88795 18.1016C5.92453 18.5493 5.99198 18.7954 6.08424 18.9765C6.29037 19.3811 6.61928 19.71 7.02382 19.9161C7.20489 20.0084 7.45103 20.0758 7.89873 20.1124C8.35634 20.1498 8.9458 20.1504 9.7999 20.1504H14.1999C15.054 20.1504 15.6435 20.1498 16.1011 20.1124C16.5488 20.0758 16.7949 20.0084 16.976 19.9161C17.3805 19.71 17.7094 19.3811 17.9156 18.9765C18.0078 18.7954 18.0753 18.5493 18.1119 18.1016C18.1492 17.644 18.1499 17.0545 18.1499 16.2004V8.98866C18.1499 8.94062 18.1499 8.89461 18.1498 8.85049H17.1999L17.1661 8.85049H17.1661C16.6348 8.85051 16.1854 8.85052 15.8171 8.82042C15.431 8.78888 15.0597 8.72009 14.706 8.53986C14.1698 8.26662 13.7338 7.83063 13.4605 7.29437C13.2803 6.94066 13.2115 6.56938 13.18 6.18331C13.1499 5.81495 13.1499 5.36555 13.1499 4.83429V4.83428V4.80049V3.85051ZM14.8499 4.14878V4.80049C14.8499 5.37457 14.8506 5.75401 14.8743 6.04487C14.8973 6.32581 14.9375 6.44847 14.9752 6.52258C15.0855 6.73897 15.2614 6.9149 15.4778 7.02515C15.5519 7.06291 15.6746 7.10312 15.9555 7.12607C16.2464 7.14983 16.6258 7.15049 17.1999 7.15049H17.8516C17.8455 7.14018 17.8393 7.12992 17.8331 7.1197C17.7123 6.92268 17.5404 6.74305 16.993 6.19559L15.8047 5.00736C15.2573 4.4599 15.0777 4.28799 14.8806 4.16726C14.8704 4.16101 14.8602 4.15485 14.8499 4.14878ZM13.1042 2.15041C13.7487 2.15018 14.2112 2.15001 14.656 2.25681C15.0489 2.35112 15.4244 2.50668 15.7689 2.71777C16.1589 2.9568 16.4859 3.28394 16.9414 3.73984L17.0068 3.80528L18.1951 4.99351L18.2605 5.05891C18.7164 5.51448 19.0435 5.84139 19.2826 6.23145C19.4937 6.57592 19.6492 6.95147 19.7435 7.34431C19.8503 7.78915 19.8502 8.25163 19.8499 8.89613V8.89614L19.8499 8.98866V16.2004V16.2363C19.8499 17.0459 19.8499 17.705 19.8062 18.24C19.761 18.7929 19.665 19.2876 19.4303 19.7483C19.0612 20.4727 18.4722 21.0617 17.7478 21.4308C17.2871 21.6655 16.7923 21.7616 16.2395 21.8067C15.7045 21.8505 15.0454 21.8504 14.2357 21.8504H14.1999H9.7999H9.7641C8.95444 21.8504 8.29533 21.8505 7.76029 21.8067C7.20747 21.7616 6.71271 21.6655 6.25204 21.4308C5.52762 21.0617 4.93864 20.4727 4.56953 19.7483C4.33481 19.2876 4.23877 18.7929 4.1936 18.24C4.14989 17.705 4.14989 17.0459 4.1499 16.2363V16.2363V16.2004V7.80043V7.76457V7.76455C4.14989 6.95493 4.14989 6.29584 4.1936 5.76082C4.23877 5.208 4.33481 4.71324 4.56953 4.25257C4.93864 3.52815 5.52762 2.93917 6.25204 2.57006C6.71271 2.33534 7.20747 2.2393 7.76029 2.19413C8.29531 2.15042 8.95441 2.15042 9.76404 2.15043L9.7999 2.15043H13.0117L13.1042 2.15041ZM11.9999 10.1505C12.4693 10.1505 12.8499 10.5311 12.8499 11.0005V14.9484L13.8989 13.8995C14.2308 13.5675 14.769 13.5675 15.1009 13.8995C15.4329 14.2314 15.4329 14.7696 15.1009 15.1016L12.6009 17.6016C12.269 17.9335 11.7308 17.9335 11.3989 17.6016L8.89886 15.1016C8.56692 14.7696 8.56692 14.2314 8.89886 13.8995C9.23081 13.5675 9.769 13.5675 10.1009 13.8995L11.1499 14.9484V11.0005C11.1499 10.5311 11.5305 10.1505 11.9999 10.1505Z"
                                    fill="#1F2937"
                                  />
                                </svg>
                              </button>
                            </td>

                            <td className="w-30px min-w-10px max-w-30px" hidden={!showDelete}>
                              <button hidden={(recordId > 0) ? !item.isAllowDelete : false}
                                type="button"
                                className="btn btn-active-light p-0"
                                aria-label="delete"
                                id={"delete" + generateUUID() + item.id}
                                onClick={() => handleRemoveSingleItem(item.id.toString(), item.draftId!, item)}
                              >
                                <svg
                                  className="icon-stroke-trash-2"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.72066 3.85039C9.6561 3.85039 9.59878 3.89171 9.57836 3.95296L9.17921 5.15039H14.8206L14.4214 3.95296C14.401 3.89171 14.3437 3.85039 14.2791 3.85039H9.72066ZM16.6125 5.15039L16.0342 3.41537C15.7824 2.65994 15.0754 2.15039 14.2791 2.15039H9.72066C8.92437 2.15039 8.21741 2.65994 7.9656 3.41537L7.38726 5.15039H4.9999H2.9999C2.53046 5.15039 2.1499 5.53095 2.1499 6.00039C2.1499 6.46983 2.53046 6.85039 2.9999 6.85039H4.20468L4.96509 18.2565C5.09992 20.2789 6.77968 21.8504 8.80656 21.8504H15.1932C17.2201 21.8504 18.8999 20.2789 19.0347 18.2565L19.7951 6.85039H20.9999C21.4693 6.85039 21.8499 6.46983 21.8499 6.00039C21.8499 5.53095 21.4693 5.15039 20.9999 5.15039H18.9999H16.6125ZM18.0913 6.85039H15.9999H7.9999H5.90846L6.66132 18.1434C6.73662 19.2728 7.67466 20.1504 8.80656 20.1504H15.1932C16.3251 20.1504 17.2632 19.2728 17.3385 18.1434L18.0913 6.85039Z"
                                    fill="#1F2937"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr >
                        </>
                      ))
                  }

                  {
                    (!userAttachment || userAttachment.length === 0) &&
                    <>
                      <NoRecordsAvailable />
                    </>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {
          showFileTypes &&
          <div className='card-footer py-2 text-center'>
            <NoRecordsAvailable customText={fileSizeTypeWarning} />
          </div>
        }

      </div >
    </>
  );
}

export default UserAttachments;