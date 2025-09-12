import React, { useEffect, useRef, useState } from "react";
import { HtmlTooltip } from "../tooltip/HtmlTooltip";
import { toAbsoluteUrl } from "../../../../_metronic/helpers";
import { toast } from "react-toastify";
import CommonConstant from "../../../helper/_constant/common.constant";
import {
  IAttachment,
  IAttachmentFileInfoDuplicateCheckModel,
  attachmentFileInfoDuplicateCheckInitialValue,
  validateTotalFilesToUploadProp,
} from "../../../models/global/globalGeneric";
import {
  duplicateAttachmentInModuleCheckModelAsync,
  globalActions,
  uploadAttachmentChunkItemAsync,
  uploadAttachmentChunkMediaCenterItemAsync,
} from "../../services/globalSlice";
import {
  generateUUID,
  getAllowedMimeTypes,
  getDateTimeWithMilliseconds,
  writeToBrowserConsole,
} from "../../utils/common";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { unwrapResult } from "@reduxjs/toolkit";
import { BtnLabeltxtMedium2 } from "../common/formsLabels/detailLabels";
import { Modal } from "react-bootstrap";
import ModulesConstant from "../../../helper/_constant/modules.constant";
import "./UserAttachments.css";

type MIMEConstantType = {
  [key: string]: { extension: string };
};
interface props {
  recordId: number;
  moduleTypeId: number; // Refer to Global Generics for Enum constant
  fileTypes: MIMEConstantType;
  perFileMaxAllowedSizeInMb: number; // If provided, will override global setting
  perFileMaxAllowedChunkSizeToSplitInMb: number; // If provided, will override global setting
  onUploadAttachmentChunksComplete: Function;

  //Optional parameter to use different styles for displaying button
  buttonLayout?: string;

  //To Allow multiple files to be selected for upload from dialog box instead of one file selection per upload.
  allowMultipleFileUpload?: boolean;

  //Will Enable Validation Handler For Duplicate file checks, where condition will be handled on Parent Component.
  shouldCheckForDuplicateFileAndConfirmBeforeUpload?: boolean;
  onConfirmBeforeFileUploadCheckForDuplicate?: (
    fileName: File
  ) => Promise<[File, boolean, number]>;

  //Will Enable Validation Handler For Duplicate file restriction, where condition will be handled on Parent Component.
  shouldCheckForDuplicateFileAndRestrictUpload?: boolean;

  //Will Enable Validation handle For Total Files Uploaded and Max Allowed Limit, where condition will be handled on Parent Component.
  validateTotalFilesToUpload?: validateTotalFilesToUploadProp;
  returnValidationMessage?: Function;

  //Allow only One Attachment For Current Record
  limitToSingleAttachment?: boolean;

  //For Department Website
  sectionId?: number;
  componentId?: number;

  //Tooltip
  showUploadTooltip?: boolean;
  uploadTooltip?: string;

  //Render Related Toggle
  showFileTypes?: boolean;
  showUpload?: boolean;

  //While uploading in progress, disable submit button will be handled on Parent Component.
  onDisableSubmitAction?: (columnName: boolean) => void;

  // Provide the key to route data to Media Center or Sharepoint server
  storageServer?: string;

  setShowProgress?: any;
}
const UserAttachmentUploadButton = ({
  recordId,
  showUpload,
  allowMultipleFileUpload,
  moduleTypeId,
  fileTypes,
  limitToSingleAttachment,
  showUploadTooltip,
  uploadTooltip,
  showFileTypes,
  shouldCheckForDuplicateFileAndConfirmBeforeUpload,
  validateTotalFilesToUpload,
  perFileMaxAllowedChunkSizeToSplitInMb,
  perFileMaxAllowedSizeInMb,
  onDisableSubmitAction,
  onConfirmBeforeFileUploadCheckForDuplicate,
  returnValidationMessage,
  onUploadAttachmentChunksComplete,
  shouldCheckForDuplicateFileAndRestrictUpload,
  buttonLayout,
  storageServer,
  setShowProgress,
  sectionId,
  componentId,
}: props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { userAttachment } = useAppSelector((s) => s.globalgeneric);

  // New File-Uploader Chunk Concept
  const chunkSize =
    1048576 *
    (perFileMaxAllowedChunkSizeToSplitInMb
      ? perFileMaxAllowedChunkSizeToSplitInMb
      : CommonConstant.PER_FILE_MAX_ALLOWED_CHUNK_SIZE_TO_SPLIT_IN_MB);
  const [fileSize, setFileSize] = useState(0);
  const [counter, setCounter] = useState(1);
  const [fileToBeUpload, setFileToBeUpload] = useState<File>();
  const [progress, setProgress] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [beginingOfTheChunk, setBeginingOfTheChunk] = useState(0);
  const [endOfTheChunk, setEndOfTheChunk] = useState(chunkSize);
  const [fileGuid, setFileGuid] = useState("");

  const [showModalTemplateOne, setShowModalTemplateOne] = useState(false);
  const [showModalTemplateTwo, setShowModalTemplateTwo] = useState(false);
  const [id, setId] = useState(recordId);
  const [fileInfo, setFileInfo] = useState<File>();
  const inputFile = useRef<HTMLInputElement>();
  // File-Chunk Related Code
  useEffect(() => {
    if (fileSize > 0) {
      uploadChunk(counter);
    }
  }, [fileToBeUpload, progress]);

  // File-Chunk Push chunks to API
  const uploadChunk = async (nCounter: number) => {
    try {
      setCounter(nCounter + 1);

      if (nCounter <= chunkCount) {
        var chunk = fileToBeUpload!.slice(beginingOfTheChunk, endOfTheChunk);

        let formDataModel: IAttachment;
        formDataModel = {
          formData: chunk,
          fileName: fileToBeUpload!.name,
          fileType: fileToBeUpload!.type,
          fileSize: fileToBeUpload!.size,
          isActive: true,
          id: id,
          moduleId: recordId.toString(),
          draftId: fileGuid.toString() + counter.toString(),
          createdByEmailAddress: "",
          moduleTypeId: moduleTypeId,
          chunkFileReferenceGuid: fileGuid,
          chunkFileTempPath: process.env.REACT_APP_CHUNK_FILE_PATH,
        };

        handleOnUploadAttachmentChunks(formDataModel);
      }
    } catch (error) {
      writeToBrowserConsole(error);
    }
  };

  // Upload attachment chunks to temp remote server
  const handleOnUploadAttachmentChunks = (formObject: IAttachment) => {
    try {
      if (storageServer && storageServer === "mediaserver") {
        formObject = {
          ...formObject,
          chunkFileSize: 1048576,
        };

        dispatch(
          uploadAttachmentChunkMediaCenterItemAsync({
            formDataObject: formObject,
          })
        )
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              const responseData = originalPromiseResult.data as boolean;

              if (!responseData) {
                writeToBrowserConsole("Error while uploading file chunk");
                return;
              }

              setBeginingOfTheChunk(endOfTheChunk);
              setEndOfTheChunk(endOfTheChunk + chunkSize);

              if (counter === chunkCount) {
                let formDataModel: IAttachment = {
                  ...formObject,
                  formFile: null,
                  sectionId: sectionId,
                  componentId: componentId,
                };
                setProgress(100);
                dispatch(
                  globalActions.updateUploadProgress({
                    data: 100,
                    action: "update",
                  })
                );
                if (setShowProgress !== undefined) {
                  setTimeout(() => {
                    setShowProgress(false);
                  }, 2000);
                }

                // Send to Parent Component: Upload Complete To Temporary Folder
                onUploadAttachmentChunksComplete(formDataModel);
              } else {
                var percentage = (counter / chunkCount) * 100;
                writeToBrowserConsole("Percentage " + percentage);
                setProgress(percentage);
                dispatch(
                  globalActions.updateUploadProgress({
                    data: percentage,
                    action: "update",
                  })
                );
              }
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
          });
      } else {
        dispatch(uploadAttachmentChunkItemAsync({ formDataObject: formObject }))
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              const responseData = originalPromiseResult.data as boolean;

              if (!responseData) {
                writeToBrowserConsole("Error while uploading file chunk");
                return;
              }

              setBeginingOfTheChunk(endOfTheChunk);
              setEndOfTheChunk(endOfTheChunk + chunkSize);

              if (counter == chunkCount) {
                let formDataModel: IAttachment = {
                  ...formObject,
                  formFile: null,
                };

                setProgress(100);
                dispatch(
                  globalActions.updateUploadProgress({
                    data: 100,
                    action: "update",
                  })
                );

                if (setShowProgress !== undefined) {
                  setTimeout(() => {
                    setShowProgress(false);
                  }, 2000);
                }

                // Send to Parent Component: Upload Complete To Temporary Folder
                onUploadAttachmentChunksComplete(formDataModel);

                setId(0);
              } else {
                var percentage = (counter / chunkCount) * 100;
                writeToBrowserConsole("Percentage " + percentage);
                setProgress(percentage);
                dispatch(
                  globalActions.updateUploadProgress({
                    data: percentage,
                    action: "update",
                  })
                );
              }
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
            setId(0);
          });
      }
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  // Event handler for file upload controller - Entry Point
  const handleOnSelectFileForUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (limitToSingleAttachment && userAttachment?.length! > 0) {
      toast.warning(
        intl.formatMessage({ id: "MOD.GLOBAL.FILEUPLOAD.LITMITSINGLEFILE" })
      );
      return;
    }

    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach((file) => {
        // With Duplicate Flag set as TRUE and Callback function implemented in Parent component
        if (shouldCheckForDuplicateFileAndConfirmBeforeUpload) {
          // Call parent component to check and confirm override of duplicate file, a callback function must be implemented in Parent component to handle this function
          onConfirmBeforeFileUploadCheckForDuplicate!(file)
            .then(
              ([fileData, isDuplicate, shareFileId]: [
                File,
                boolean,
                number
              ]) => {
                if (isDuplicate) {
                  // Perform actions for duplicate file
                  setShowModalTemplateOne(true);
                  setId(shareFileId);
                  setFileInfo(fileData);
                } else {
                  // Perform actions for non-duplicate file
                  handleUpload(fileData);
                }
              }
            )
            .catch((error: any) => {
              console.error("Error occurred:", error);
              // Handle error if any
            });
        } else if (shouldCheckForDuplicateFileAndRestrictUpload) {
          // Call parent component to check and restrict duplicate file, a callback function must be implemented in Parent component to handle this function
          handleOnRestrictBeforeFileUploadCheckForDuplicate(file)
            .then(([fileData, isDuplicate]: [File, boolean]) => {
              if (isDuplicate) {
                // Perform actions for duplicate file
                setShowModalTemplateTwo(true);
              } else {
                // Perform actions for non-duplicate file
                handleUpload(fileData);
              }
            })
            .catch((error: any) => {
              console.error("Error occurred:", error);
              // Handle error if any
            });
        } else {
          //With Duplicate Flag set as FALSE | Regular Flow
          handleUpload(file);
        }
      });
    }
    event.currentTarget.value = "";
  };

  // Event handler for file upload modal popup
  const handleUpload = (file: File) => {
    const selectableMaxFileSize =
      1024 *
      1024 *
      (perFileMaxAllowedSizeInMb
        ? perFileMaxAllowedSizeInMb
        : CommonConstant.PER_FILE_MAX_ALLOWED_SIZE_IN_MB);
    let initialFileSize: number = file.size;

    // Custom Validation To Not Allow File Upload If Total Files Uploaded Is More Than Set Upload Limit
    // Model Will Be Configured from Parent Component and Passed Into UserAttachmentUploadButton.tsx
    // Model Will be validated and Returned with updated Information to Parent From UserAttachmentUploadButton.tsx via returnValidationMessage Function
    if (validateTotalFilesToUpload) {
      if (
        validateTotalFilesToUpload.totalUploaded >=
          validateTotalFilesToUpload.maxAllowedUploadLimit &&
        validateTotalFilesToUpload.action === ""
      ) {
        validateTotalFilesToUpload.fileName = file.name;
        validateTotalFilesToUpload.action = "";
        returnValidationMessage!(validateTotalFilesToUpload);
        return;
      }
    }

    // Toastr Configuration - File Size Validation
    if (initialFileSize > selectableMaxFileSize) {
      toast.warning(
        intl
          .formatMessage({ id: "MOD.GLOBAL.FILEUPLOAD.FILESIZE.MESSAGE" })
          .toString()
          .replaceAll(
            "{X}",
            (perFileMaxAllowedSizeInMb
              ? perFileMaxAllowedSizeInMb.toString()
              : CommonConstant.PER_FILE_MAX_ALLOWED_SIZE_IN_MB.toString()) +
              " MB"
          )
      );
      return;
    }

    // Toastr Configuration - Allowed File Type Validation
    if (showFileTypes && fileTypes && Object.keys(fileTypes).length > 0) {
      let _fInfoMessage = intl.formatMessage({
        id: "MOD.GLOBAL.FILEUPLOAD.FILETYPE.INFOMESSAGE",
      });

      // Assuming you want to join the keys (MIME types) of the object
      const mimeTypes = Object.keys(fileTypes);
      const fileTypesString = mimeTypes.join(", ");

      // Check if fileTypesString is a valid string
      if (typeof fileTypesString === "string") {
        // Assuming you have a specific MIME type
        const specificMimeType = file.type;

        // Get the file extension based on the specific MIME type
        const fileExtension = fileTypes[specificMimeType];

        if (!fileExtension) {
          _fInfoMessage = _fInfoMessage.replace(
            "{X}",
            getAllowedMimeTypes(
              showFileTypes,
              fileTypes,
              intl.formatMessage({
                id: "MOD.GLOBAL.FILEUPLOAD.FILESIZE.INFOMESSAGE",
              }),
              perFileMaxAllowedSizeInMb
            ).extension
          );
          toast.warning(_fInfoMessage);
          return fileExtension; // Return the file extension
        }
      }
    }

    //File-Chunk Related Code
    resetChunkProperties(); // File-Chunk Related Code

    // Notify parent component to disable action button during upload
    onDisableSubmitAction!(true);

    setFileSize(initialFileSize); // File-Chunk Related Code

    // Total count of chunks will have been upload to finish the file
    const _totalCount =
      initialFileSize % chunkSize == 0
        ? initialFileSize / chunkSize
        : Math.floor(initialFileSize / chunkSize) + 1; //File-Chunk Related Code
    setChunkCount(_totalCount); // File-Chunk Related Code

    const _customFileName =
      generateUUID() + "-" + getDateTimeWithMilliseconds(); //+ "-MTYPE(" + moduleTypeId + ")" + "-RECID(" + recordId + ")";
    const _fileID = _customFileName + "." + file.name.split(".").pop(); // File-Chunk Related Code
    setFileGuid(_fileID); // File-Chunk Related Code

    // File-Chunk Related Code - If draft, save to Store, from parent save/upload attachment to Db
    let formDataModel: IAttachment = {
      formFile: null,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      isActive: true,
      id: id,
      moduleId: recordId.toString(),
      draftId: _customFileName,
      createdByEmailAddress: "",
      moduleTypeId: moduleTypeId,
      chunkFileReferenceGuid: _customFileName,
      chunkFileSize: chunkSize,
      chunkFileTempPath: process.env.REACT_APP_CHUNK_FILE_PATH,
    };

    if (id === 0) {
      dispatch(
        globalActions.updateUserAttachment({
          data: formDataModel,
          action: "new",
        })
      );
    }

    // Trigger Point: When fileToBeUpload state changes inside this function, useEffect will get triggered *****
    setFileToBeUpload(file); //File-Chunk Related Code

    // Toastr Configuration - Loading File Upload
    let templateMessageSweetAlert = intl
      .formatMessage({ id: "LABEL.DOCUMENT.PENDING.UPLOAD" })
      .replaceAll("{x}", file.name);
    const loaderMessage =
      "LoadingToastr" + file.name.replaceAll(" ", "_").toString();
    toast.info(templateMessageSweetAlert, {
      isLoading: true,
      toastId: loaderMessage,
    });

    // Reset file state
    setFileInfo(undefined);

    // Close the modal
    setShowModalTemplateOne(false);
    setShowModalTemplateTwo(false);
  };

  // Event handler close modal popup One
  const handleCloseModalOne = () => {
    resetProgress();

    // Reset file state
    setFileInfo(undefined);

    // Close the modal
    setShowModalTemplateOne(false);

    resetChunkProperties();
  };

  // Event handler close modal popup Two
  const handleCloseModalTwo = () => {
    resetProgress();

    // Reset file state
    setFileInfo(undefined);

    // Close the modal
    setShowModalTemplateTwo(false);
  };

  //Helper Function - Check for duplicate and restrict upload if found
  const handleOnRestrictBeforeFileUploadCheckForDuplicate = (
    file: File
  ): Promise<[File, boolean]> => {
    return new Promise<[File, boolean]>((resolve, reject) => {
      let duplicateFileCheckModel: IAttachmentFileInfoDuplicateCheckModel;
      duplicateFileCheckModel = {
        ...attachmentFileInfoDuplicateCheckInitialValue,
        fileName: file.name,
        moduleTypeId: moduleTypeId,
        moduleId: recordId,
      };
      if (recordId > 0) {
        // Validate from Database mode
        dispatch(
          duplicateAttachmentInModuleCheckModelAsync({
            duplicateFileCheckModel,
          })
        )
          .then((response) => {
            const output = response.payload.data as boolean;
            if (output) {
              resolve([file, true]); // Resolve with true if duplicate found
            } else {
              resolve([file, false]); // Resolve with false if no duplicate found
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
            reject(rejectedValueOrSerializedError);
          });
      } else {
        // Validate from Redux - Draft Mode
        const duplicateFileNameChecker =
          userAttachment &&
          userAttachment.filter((item) => item.fileName === file.name);
        if (duplicateFileNameChecker && duplicateFileNameChecker.length >= 1) {
          resolve([file, true]); // Resolve with true if duplicate found
        } else {
          resolve([file, false]); // Resolve with false if no duplicate found
        }
      }
    });
  };

  // Helper Function
  const resetProgress = () => {
    if (setShowProgress !== undefined) {
      setShowProgress(false);
    }
  };

  // Helper Function - File-Chunk State Reset
  const resetChunkProperties = () => {
    resetProgress();
    setProgress(0);
    dispatch(globalActions.updateUploadProgress({ data: 0, action: "update" }));
    setCounter(1);
    setBeginingOfTheChunk(0);
    setEndOfTheChunk(chunkSize);
  };

  return (
    <>
      <div className="file-upload ">
        {
          <div className="single-fileUpload">
            <input
              id="fileUpload"
              type="file"
              multiple={false}
              //key={count}
              //ref={inputFile}
              // {...register(tempguid, {
              //   required: required
              //     ? intl.formatMessage({ id: title }) +
              //       " " +
              //       intl.formatMessage({ id: "FORM.LABEL.REQUIRED" })
              //     : false,
              // })}
              onChange={handleOnSelectFileForUpload}
              hidden={true}
            />
            <div
              //  hidden={!showUpload}
              className="file-upload-button float-start"
            >
              <label htmlFor="fileUpload" style={{ cursor: "pointer" }}>
                <img
                  src={toAbsoluteUrl(
                    "/media/svg/mod-specific/upload-files.svg"
                  )}
                  className="float-start"
                ></img>
                <div className="single-fileUpload-label float-start ps-2">
                  {intl.formatMessage({ id: "FORM.FILEMANAGEMENT.UPLOADFILE" })}
                </div>
              </label>
            </div>

            {/* {<span className="float-start pt-2 ps-2">{fileName}</span>} */}

            {/* {loadedfileName && loadedfileName?.length > 0 && (
              <div className="row ">
                <div className="col pb-4">
                  <div className="float-end"></div>
                </div>
              </div>
            )}

            {showfile && showfile !== "" && (
              <div className="row ">
                <div className="col pb-4">
                  <div className="float-end">{showfile}</div>
                </div>
              </div>
            )} */}
          </div>
        }
      </div>
      {/* <input
        id="fileUpload"
        type="file"
        className={
          buttonLayout === "boostrap"
            ? "form-control customFileInput1"
            : "1customFileInput"
        }
        multiple={allowMultipleFileUpload}
        onChange={handleOnSelectFileForUpload}
        hidden={buttonLayout === "boostrap" ? false : true}
        style={{ color: "transparent" }}
      /> */}
      {showUploadTooltip && uploadTooltip && uploadTooltip.length > 0 && (
        <>
          {/* Default Button Layout - Plus Icon only */}
          {!buttonLayout && (
            <HtmlTooltip title={uploadTooltip}>
              <div hidden={!showUpload}>
                <label htmlFor="fileUpload">
                  {" "}
                  <img
                    src={toAbsoluteUrl("/media/svg/mod-specific/icon-plus.svg")}
                  ></img>
                </label>
              </div>
            </HtmlTooltip>
          )}
          {buttonLayout && buttonLayout === "PlusIconWithButton" && (
            <button
              type="submit"
              className="btn MOD_btn btn-create m-2"
              hidden={!showUpload}
              id={generateUUID()}
            >
              <label htmlFor="fileUpload" style={{ marginBottom: 0 }}>
                <span className="prj-icon-stroke-plus">
                  <img
                    src={toAbsoluteUrl(
                      "/media/svg/mod-specific/upload-files.svg"
                    )}
                  />
                </span>
                {"  "}
                <BtnLabeltxtMedium2
                  text={"MOD.SHAREDFILES.BUTTON.UPLOAD.FILES"}
                  style={{ color: "var(--text-6, #9CA3AF) !important;" }}
                />
              </label>
            </button>
          )}
        </>
      )}

      {(!showUploadTooltip ||
        !uploadTooltip ||
        uploadTooltip === undefined) && (
        <>
          {/* Default Button Layout - Plus Icon only */}
          {!buttonLayout && (
            <HtmlTooltip title={uploadTooltip}>
              <div hidden={!showUpload}>
                <label htmlFor="fileUpload">
                  {" "}
                  <img
                    src={toAbsoluteUrl("/media/svg/mod-specific/icon-plus.svg")}
                  ></img>
                </label>
              </div>
            </HtmlTooltip>
          )}
          {buttonLayout && buttonLayout === "PlusIconWithButton" && (
            <button
              type="submit"
              className="btn MOD_btn btn-create m-2"
              hidden={!showUpload}
              id={generateUUID()}
            >
              <label htmlFor="fileUpload" style={{ marginBottom: 0 }}>
                <span className="prj-icon-stroke-plus">
                  <img
                    src={toAbsoluteUrl(
                      "/media/svg/mod-specific/upload-files.svg"
                    )}
                  />
                </span>
                {"  "}
                <BtnLabeltxtMedium2
                  text={"MOD.SHAREDFILES.BUTTON.UPLOAD.FILES"}
                  style={{ color: "var(--text-6, #9CA3AF) !important;" }}
                />
              </label>
            </button>
          )}
        </>
      )}

      {/* Template One - With Yes & No Button */}
      <Modal show={showModalTemplateOne} onHide={handleCloseModalOne}>
        <Modal.Header closeButton>
          <Modal.Title>
            {intl.formatMessage({
              id: "MOD.SHAREDFILES.CONFIRM.UPLOAD.DUPLICATE.TITLE",
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {intl.formatMessage({
            id: "MOD.SHAREDFILES.CONFIRM.FILEUPLOAD.DUPLICATE",
          })}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn MOD_btn btn-create w-10 pl-5 mx-3"
            onClick={() => handleUpload(fileInfo!)}
          >
            {intl.formatMessage({
              id: "MOD.DEALANNOUNCEMENT.BUTTON.CONFIRMYES",
            })}
          </button>
          <button
            type="button"
            className="btn MOD_btn btn-cancel w-10"
            onClick={handleCloseModalOne}
          >
            {intl.formatMessage({
              id: "MOD.DEALANNOUNCEMENT.BUTTON.CONFIRMNO",
            })}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Template Two - With Cancel Button */}
      <Modal show={showModalTemplateTwo} onHide={handleCloseModalTwo}>
        <Modal.Header closeButton>
          <Modal.Title>
            {intl.formatMessage({
              id: "MOD.SHAREDFILES.RESTRICT.UPLOAD.DUPLICATE.TITLE",
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {intl.formatMessage({
            id: "MOD.SHAREDFILES.RESTRICT.FILEUPLOAD.DUPLICATE.MESSAGE",
          })}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn MOD_btn btn-cancel w-10"
            onClick={handleCloseModalTwo}
          >
            {intl.formatMessage({ id: "MOD.PROJECTMANAGEMENT.CANCEL" })}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserAttachmentUploadButton;
