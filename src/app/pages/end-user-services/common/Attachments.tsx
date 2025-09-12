import { unwrapResult } from "@reduxjs/toolkit";
import { useEffect, useRef, useState } from "react";
import { OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { useIntl } from "react-intl";
import { useAuth } from "../../../modules/auth";
import { toast } from "react-toastify";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch, useAppSelector } from "../../../../store";
import ModulesConstant, {
  ModulesAttachmentConstant,
  ApplicationConstant,
} from "../../../helper/_constant/modules.constant";

import {
  IAttachmentMediaCenter,
  IAttachment,
  validateTotalFilesToUploadProp,
  IPageLog,
} from "../../../models/global/globalGeneric";
import {
  BtnLabeltxtMedium2,
  DetailLabels,
  InfoLabels,
} from "../../../modules/components/common/formsLabels/detailLabels";
import DataTableMain, {
  ComponentAndProps,
} from "../../../modules/components/dataTable2/DataTableMain";
import UserAttachmentUploadButton from "../../../modules/components/userAttachment/UserAttachmentUploadButton";
import {
  getAllowedMimeTypes,
  writeToBrowserConsole,
  generateUUID,
  getCurrentUserID,
} from "../../../modules/utils/common";
import tableConfig from "./attachmentDatatableConfig.json";
import { Row, createEmptyRow } from "../../../models/row";
import NoRecordsAvailable from "../../../modules/components/noRecordsAvailable/NoRecordsAvailable";
import { setDataInterface } from "../../../../_metronic/helpers/crud-helper/models";
import {
  addAttachmentItemAsync,
  deleteAttachmentAsync,
  fetchAttachmentListAsync,
  insertPageLog,
  uploadAttachmentChunkCompleteMediaCenterItemAsync,
} from "../../../modules/services/globalSlice";
import DataTableMain2 from "../../../modules/components/dataTable2/DataTableMain";
import { IRequestAttachment } from "../../../models/global/serviceModel";
import { useNavigate } from "react-router-dom";
import RenderFontAwesome from "../../../modules/utils/RenderFontAwesome";
import { Row as DTRow } from "../../../models/row";
import { getUserName } from "../../../modules/auth/core/_requests";
// import { getUserName } from "../../../modules/auth/core/_requests";

interface props {
  requestId: number;
  moduleTypeId: number;
  fileTypes: any;
  perFileMaxAllowedSizeInMb: number;
  perFileMaxAllowedChunkSizeToSplitInMb: number;
  allowMultipleFileUpload: boolean;
  limitToSingleAttachment: boolean;
  showUpload: boolean;
  showUploadTooltip: boolean;
  UploadTooltip: string;
  showFileTypes: boolean;
  storageServer: string;
  draftGuid: string;
  isreadOnly: boolean;
  //refreshAttachmentCount: () => void
}

export default function Attachments({
  requestId,
  moduleTypeId,
  fileTypes,
  perFileMaxAllowedSizeInMb,
  perFileMaxAllowedChunkSizeToSplitInMb,
  allowMultipleFileUpload,
  limitToSingleAttachment,
  showUpload,
  showUploadTooltip,
  UploadTooltip,
  showFileTypes,
  storageServer,
  draftGuid,
  isreadOnly,
}: props) {
  const intl = useIntl();
  const lang = useLang();
  const { auth } = useAuth();
  const dispatch = useAppDispatch();
  const finalTableConfig = JSON.stringify(tableConfig);
  const [isLoading, setIsLoading] = useState(false);
  // Redux Store Global Shared Variables
  const { uploadProgress } = useAppSelector((s) => s.globalgeneric);

  // Upload Attachment Progress Bar
  const [showProgress, setShowProgress] = useState(false);
  const [fileSizeTypeWarning, setFileSizeTypeWarning] = useState<string>("");
  const [disableSubmit, setDisableSubmit] = useState(false);
  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    reset,
    clearErrors,
    setValue,
    setError,
    setFocus,
  } = useForm<IRequestAttachment>();
  let documents: IAttachmentMediaCenter;
  const [documentPath, setDocumentPath] = useState("");
  const [docList, setDocList] = useState<Row[]>([]);
  var data: Row[] = [];
  const [docName, setDocName] = useState("");
  const tableRef = useRef<setDataInterface>();
  const [loading, setLoading] = useState<boolean>(true);
  const [componentsList, setComponentsList] = useState<ComponentAndProps[]>([]);
  const userId = getCurrentUserID();

  useEffect(() => {
    let formDataObject: IPageLog;
    formDataObject = {
      pageName: "/attachments",
      username: "",
    };
    dispatch(insertPageLog({ formDataObject }));
    loadAttachmentDisclaimer();

    setComponentsList([
      {
        component: ViewItem,
      },
      {
        component: DeleteItem,
        props: {
          setRefreshData: tableRef.current?.setRefreshData,
          readOnly: isreadOnly,
          currentUserId: userId,
        },
      },
    ]);
  }, []);

  const fetchAttachments = (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean
  ) => {
    if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

    setLoading(true);
    // Only pass allowed params for published list
    dispatch(
      fetchAttachmentListAsync({
        recordId: requestId.toString(),
        moduleTypeId: moduleTypeId,
        draftId: draftGuid,
      })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          if (tableRef.current) {
            if (originalPromiseResult.data.data) {
              tableRef.current.setData(originalPromiseResult.data.data);
              tableRef.current.setTotalRows(
                originalPromiseResult.data.totalCount
              );
            } else {
              tableRef.current.setData([]);
              tableRef.current.setTotalRows(0);
            }
          }

          if (useSpinner && tableRef.current)
            tableRef.current.setIsLoading(false);
        } else {
          console.error("fetching data error");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("fetching data error");
        setLoading(false);
      });
  };

  // Show list of file extension as comma separated
  const loadAttachmentDisclaimer = () => {
    let listOfExtensions: string = getAllowedMimeTypes(
      showFileTypes!,
      fileTypes,
      intl.formatMessage({ id: "MOD.GLOBAL.FILEUPLOAD.FILESIZE.INFOMESSAGE" }),
      perFileMaxAllowedSizeInMb
    ).generalMsg;
    setFileSizeTypeWarning(listOfExtensions);
    return listOfExtensions;
  };

  // Event Handler: When All Chunks of selected file is uploaded, notify API to merge and push file to sharepoint
  const handleOnUploadAttachmentChunksComplete = (formObject: IAttachment) => {
    try {
      clearErrors("docPath");
      let newformObject: IAttachmentMediaCenter = {
        id: 0,
        moduleId: requestId.toString(),
        moduleTypeId: ModulesAttachmentConstant.FMS,
        applicationId: ApplicationConstant.FMS,
        fileName: formObject.fileName!,
        fileType: formObject.fileType!,
        docUrl: "",
        chunkFileReferenceGuid: formObject.chunkFileReferenceGuid
          ? formObject.chunkFileReferenceGuid
          : "",
        fileDescription: "",
        unitId: auth && auth.unitId ? auth.unitId.toString() : "",
      };

      dispatch(
        uploadAttachmentChunkCompleteMediaCenterItemAsync({
          formDataObject: newformObject,
        })
      )
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.responseCode === 1) {
            const responseData =
              originalPromiseResult.data as IAttachmentMediaCenter;
            if (responseData) {
              documents = newformObject;
              setValue("attachment", documents);
              setValue("docPath", responseData.docUrl!);
              setDocumentPath(responseData.docUrl!);
              clearErrors("docPath");
              toast.success(intl.formatMessage({ id: "LABEL.DOCUPLSUC" }));
              setDisableSubmit(false);
              setDocName(newformObject.fileName);
            }
          }
        })

        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        })
        .finally(() => {
          const loaderMessage =
            "LoadingToastr" +
            formObject.fileName?.replaceAll(" ", "_").toString();
          toast.dismiss(loaderMessage);
        });
    } catch (e) {
      writeToBrowserConsole(e);
    }
  };

  const onSubmit: SubmitHandler<IRequestAttachment> = (data) => {
    //writeToBrowserConsole("attachments :: " +data);
    if (documentPath.trim() === "") {
      setError("docPath", {
        type: "custom",
        message: intl.formatMessage({
          id: "MOD.DEALANNOUNCEMENT.MESSAGE.FILEREQ",
        }),
      });
      setFocus("docPath");
      return;
    } else {
      clearErrors("docPath");
    }

    if (data.attachment) {
      let newformObject: IAttachmentMediaCenter = {
        id: 0,
        moduleId: requestId.toString(),
        moduleTypeId: ModulesAttachmentConstant.FMS,
        applicationId: ApplicationConstant.FMS,
        fileName: data.attachment.fileName!,
        fileType: data.attachment.fileType!,
        docUrl: data.docPath,
        chunkFileReferenceGuid: data.attachment.chunkFileReferenceGuid
          ? data.attachment.chunkFileReferenceGuid
          : "",
        fileDescription: data.description,
        isActive: true,
        draftId: draftGuid,
      };

      dispatch(addAttachmentItemAsync({ formDataObject: newformObject }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            reset();
            setDocName("");
            fetchAttachments();
            //refreshAttachmentCount();
          }
        });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Update Description */}
        <div className="row g-9 mb-8" hidden={isreadOnly}>
          <div className="col-md-3 fv-row fv-plugins-icon-container">
            <DetailLabels style={{}} text={"LABEL.TITLE"} isRequired={true} />
          </div>
          <div className="col-md-9 fv-row fv-plugins-icon-container">
            <>
              <input
                type="text"
                maxLength={50}
                className={`form-control form-control-solid flatpickr-input active input5 lbl-txt-medium-2`}
                {...register("description", {
                  required: intl.formatMessage({ id: "LABEL.TITLEREQ" }),
                })}
                name="description"
              />

              <div className={"error"}>{errors.description?.message}</div>
            </>
          </div>
        </div>
        {/* Upload Media */}
        <div className="row g-9" hidden={isreadOnly}>
          <div className="col-md-3 fv-row fv-plugins-icon-container">
            <DetailLabels style={{}} text={"LABEL.FILE"} isRequired={true} />
          </div>
          <div className="col-md-9 fv-row fv-plugins-icon-container">
            <>
              <UserAttachmentUploadButton
                buttonLayout="boostrap"
                recordId={requestId}
                moduleTypeId={moduleTypeId!}
                fileTypes={fileTypes}
                perFileMaxAllowedSizeInMb={perFileMaxAllowedSizeInMb!}
                perFileMaxAllowedChunkSizeToSplitInMb={
                  perFileMaxAllowedChunkSizeToSplitInMb!
                }
                onUploadAttachmentChunksComplete={
                  handleOnUploadAttachmentChunksComplete
                }
                allowMultipleFileUpload={allowMultipleFileUpload}
                limitToSingleAttachment={limitToSingleAttachment}
                showUpload={showUpload}
                showUploadTooltip={showUploadTooltip}
                uploadTooltip={UploadTooltip!}
                showFileTypes={showFileTypes}
                storageServer={storageServer}
                setShowProgress={setShowProgress}
                onDisableSubmitAction={(e) => setDisableSubmit(e)}
              />
              <div className={"error"}>{errors.docPath?.message}</div>

              {showProgress === true && (
                <div style={{ display: "block", padding: 30 }}>
                  <ProgressBar
                    key={generateUUID()}
                    animated
                    now={uploadProgress}
                    label={`${uploadProgress.toFixed(2)}%`}
                    variant="progressBarCustom"
                  />
                </div>
              )}

              <div className="row pt-2">
                <div className="col-xl-12">
                  <InfoLabels
                    style={{}}
                    text={docName}
                    customClassName="mb-2"
                  />
                </div>
              </div>
            </>
          </div>
        </div>
        {showFileTypes && (
          <div className="card-footer text-center py-0" hidden={isreadOnly}>
            <NoRecordsAvailable customText={fileSizeTypeWarning} />
          </div>
        )}

        <div
          className={`row border-bottom justify-content-end me-0 pb-3`}
          hidden={isreadOnly}
        >
          <button
            type="submit"
            disabled={disableSubmit}
            className="btn MOD_btn btn-create w-10 pl-5"
            id={generateUUID()}
          >
            <BtnLabeltxtMedium2 text={"BUTTON.LABEL.ADD"} />
          </button>
        </div>
      </form>

      <div className="row pt-2">
        <div className="col-lg-12 col-md-12 col-sm-12">
          <DataTableMain2
            displaySearchBar={false}
            lang={lang}
            tableConfig={finalTableConfig}
            paginationServer
            getData={fetchAttachments}
            ref={tableRef}
            componentsList={componentsList}
          />
        </div>
      </div>
    </>
  );
}

function DeleteItem(props: {
  row: DTRow;
  setRefreshData;
  readOnly;
  currentUserId;
}) {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleDeleteAttachment = (requestId: number, Id: number) => {
    let newformObject: IAttachmentMediaCenter = {
      id: Id,
      moduleId: requestId.toString(),
      moduleTypeId: ModulesAttachmentConstant.FMS,
      applicationId: ApplicationConstant.FMS,
      fileName: "",
      fileType: "",
      fileDescription: "",
      docUrl: "",
      chunkFileReferenceGuid: "",
    };
    dispatch(deleteAttachmentAsync({ formDataObject: newformObject }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          props.setRefreshData(true);
        }
      });
  };

  return (
    <>
      {/* {"isreadOnly :: " + JSON.stringify(props.readOnly)} */}
      {
        <>
          {
            <div
              className="col col-auto px-2"
              hidden={
                props.readOnly || props.currentUserId != props.row.createdBy
              }
              style={{ cursor: "pointer" }}
            >
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip">
                    <div className="tooltip-text">
                      {intl.formatMessage({ id: "LABEL.DELETE" })}
                    </div>
                  </Tooltip>
                }
              >
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleDeleteAttachment(
                      props.row.requestId!,
                      props.row.attachmentId
                    )
                  }
                >
                  <i className="2xl fa fa-light fa-trash-can fa-xl" />
                </div>
              </OverlayTrigger>
            </div>
          }
        </>
      }
    </>
  );
}

function ViewItem(props: { row: DTRow }) {
  const intl = useIntl();
  return (
    <>
      {
        <div className="col col-auto px-4">
          {
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip">
                  <div className="tooltip-text">
                    {intl.formatMessage({ id: "LABEL.VIEW" })}
                  </div>
                </Tooltip>
              }
            >
              <div
                style={{ cursor: "pointer" }}
                onClick={() =>
                  window.open(
                    process.env.REACT_APP_API_MEDIACENTER_DOMAIN +
                      "/" +
                      props.row.docUrl,
                    "_blank",
                    "noreferrer"
                  )
                }
              >
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
