import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { motion } from "framer-motion";
import { fadeInUp } from "../../../variantes";
import { Tab as BaseTab, tabClasses } from "@mui/base/Tab";
import { Tabs } from "@mui/base/Tabs";
import { TabsList as BaseTabsList } from "@mui/base/TabsList";
import { TabPanel as BaseTabPanel } from "@mui/base/TabPanel";
import { styled } from "@mui/system";
import { ServiceFormDynamicTemplate } from "./ServiceFormDynamicTemplate";
import { ModulesAttachmentConstant } from "../../../helper/_constant/modules.constant";
import { generateUUID } from "../../../modules/utils/common";
import MIMEConstantALL from "../../../helper/_constant/mime.constant";
import Attachments from "../common/Attachments";
import { EntityType } from "../../../helper/_constant/entity.constant";
import { GetServiceRequestDetailsByServiceId, fetchWorkflowStepsByRequestId } from "../../../modules/services/serviceRequestSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  ServiceEntitiesMaster,
  ServiceEntityAndFormMasterDto,
  ServiceFormEntitiesMappingModel,
  ServiceModel,
  ServiceRequestModel,
  ServiceWorkflowActionSearchModel,
} from "../../../models/global/serviceModel";
import { DynamicFieldModel } from "../../../modules/components/dynamicFields/utils/types";
import { TimelineActivityLogChartWithDetails } from "../../../modules/components/timeline/TimelineActivityLogChartWithDetails";
import { ServiceRequestHeader } from "../common/ServiceRequestHeader";
import { WorkFlowStatusConstant } from "../../../helper/_constant/workflow.constant";
import { WorkflowStepModel } from "../../../models/global/serviceWorkflow";
import {
  fetchServiceFormEntities,
  fetchWorkflowStepsByServiceId,
} from "../../../modules/services/adminSlice";
import {
  fetchUserRolesAccessAsync,
  globalActions,
} from "../../../modules/services/globalSlice";
import { IRoleAcces } from "../../../models/global/globalGeneric";
import RolesConstant from "../../../helper/_constant/roles.constant";
import { stringify } from "querystring";
import { ServiceRequestStepper } from "../common/ServiceRequestStepper";
import { auto } from "@popperjs/core";

export const ServiceRequestEndUserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = useLang();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [serviceId, setServiceId] = useState(0);
  const [tabInit, setTabInit] = useState(1);
  const [newDraftGuid, setNewDraftGuid] = useState(generateUUID());
  //const [isAttachmentDisabled, setIsAttachmentDisabled] = useState(requestId === 0);
  const [isTabChanged, setIsTabChanged] = useState(false);
  const [attachmentCount, setAttachmentCount] = useState<number>(0);
  const [requestId, setRequestId] = useState(0);
  const [isSelf, setIsSelf] = useState<boolean>(true);
  const [isreadOnly, setReadOnly] = useState<boolean>(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepModel[]>([]);
  const [statusId, setStatusId] = useState<number>(0);
  const [serviceEntities, setServiceEntities] = useState<
    ServiceEntityAndFormMasterDto[]
  >([]);
  const [serviceDetails, setServiceDetails] = useState<ServiceRequestModel>();
  const { userRoleAccess } = useAppSelector((s) => s.globalgeneric);
  const [activeTab, setActiveTab] = useState(1);
  const [userAccess, setUserAccess] = useState<IRoleAcces[]>([]);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<
    WorkflowStepModel[]
  >([]);
  const [currentStepId, setCurrentStepId] = useState<number>(0);

  const blue = {
    50: "#F0F7FF",
    100: "#C2E0FF",
    200: "#80BFFF",
    300: "#66B2FF",
    400: "#3399FF",
    500: "#007FFF",
    600: "#6b7280",
    700: "#0059B2",
    800: "#004C99",
    900: "#003A75",
  };

  const Tab = styled(BaseTab)`
    font-family: "FrutigerLTArabic-Roman_0", sans-serif;

    cursor: pointer;
    font-size: 0.875rem;
    font-weight: bold;
    background-color: transparent;

    line-height: 1.5;
    padding: 8px 12px;

    border: none;

    display: flex;
    justify-content: center;
    height: 2.75rem;
    padding: 1rem;
    &:hover {
      box-shadow: 0px 2px 0px 0px #b7945a;
    }

    &:focus {
      box-shadow: 0px 2px 0px 0px #b7945a;
      outline: 3px solid ${blue[200]};
    }
    &.${tabClasses.selected} {
      background-color: #fff;
      color: ${blue[600]};
      box-shadow: 0px 2px 0px 0px #b7945a;
    }
  `;

  const TabPanel = styled(BaseTabPanel)`
    width: 100%;
    font-family: "FrutigerLTArabic-Roman_0", sans-serif;
    font-size: 0.875rem;
    padding: 25px;
  `;

  const TabsList = styled(BaseTabsList)(
    ({ theme }) => `
        min-width: 400px;
        border-bottom:solid #ccc 1px;

        margin: 16px;
        display: flex;

        align-content: space-between;

        `
  );

  useEffect(() => {
    console.log("Parent reerendering");
    if (!userRoleAccess || userRoleAccess.length == 0) {
      dispatch(fetchUserRolesAccessAsync())
        .then(unwrapResult)
        .then((orginalPromiseResult) => {
          if (orginalPromiseResult.statusCode === 200) {
            if (orginalPromiseResult.data) {
              const authorizedRole = orginalPromiseResult.data as IRoleAcces[];
              dispatch(globalActions.updateUserRoleAccess(authorizedRole));
              setUserAccess(authorizedRole);
            }
          } else {
            console.error("fetching data error");
          }
        })
        .catch((error) => {
          console.error("fetching data error");
        });
    } else setUserAccess(userRoleAccess);
  }, []);

  useEffect(() => {

    if (location.state) {
      var output = location.state
        ? JSON.parse(JSON.stringify(location.state)).serviceId
        : 0;
      var requestId = location.state
        ? JSON.parse(JSON.stringify(location.state)).requestId
        : 0;
      var isReadOnly = location.state
        ? JSON.parse(JSON.stringify(location.state)).isReadOnly
        : false;
      var currentStatusId = location.state
        ? JSON.parse(JSON.stringify(location.state)).statusId
        : 0;
      var currentStepId = location.state
        ? JSON.parse(JSON.stringify(location.state)).currentStepId
        : 0;
      setServiceId(output);
      setRequestId(requestId);
      setReadOnly(isReadOnly);
      setStatusId(currentStatusId);
      setCurrentStepId(currentStepId);

      dispatch(fetchWorkflowStepsByRequestId({ serviceId: output, requestId: Number(requestId) })).then(
        (apiResponse) => {
          let _workflowSteps: WorkflowStepModel[] = apiResponse.payload.data;
          if (_workflowSteps && _workflowSteps.length > 0) {
            setWorkflowSteps(_workflowSteps);
            setCurrentWorkflowStep(
              _workflowSteps.filter(
                (step) =>
                  step.stepId == currentStepId ||
                  step.currentStatusId === currentStatusId
              )
            );
          }
        }
      );

      dispatch(fetchServiceFormEntities({ serviceId: output, requestId: Number(requestId) }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            var modelData =
              originalPromiseResult.data as ServiceEntityAndFormMasterDto[];
            if (modelData) {
              modelData = modelData.filter(
                (e) => e.entityId != EntityType.RequestingUnit
              );
              setServiceEntities(modelData);
            }
          }
        });

      if (requestId != 0) {
        dispatch(
          GetServiceRequestDetailsByServiceId({
            requestId: requestId,
            serviceId: output,
          })
        )
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              var modelData = originalPromiseResult.data as ServiceRequestModel;
              if (modelData) {
                setServiceDetails(modelData);
                //setStatusId(modelData.statusId);
              }
            }
          });
      }
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const setEditableFieldsByEntity = (entityId: number, loggedInUserUnitId?: string, serviceRequestUnitId?: string, reference?: string) => {
    //let currentStep = workflowSteps.filter((step) => step.currentStatusId === statusId);
    let actionTobeTakenBy: number = 0;
    if (
      statusId === undefined ||
      statusId === Number(WorkFlowStatusConstant.Draft)
    ) {
      actionTobeTakenBy = Number(EntityType.RequestingUnit);
      console.log("1- actionTobeTakenBy " + actionTobeTakenBy + " reference " + reference);
    }

    if (currentWorkflowStep != undefined && currentWorkflowStep.length > 0) {
      actionTobeTakenBy = currentWorkflowStep[0].fromEntityId;
      console.log("2- actionTobeTakenBy " + actionTobeTakenBy + " reference " + reference);
    }


    if (isreadOnly) {
      console.log("3- isreadOnly " + isreadOnly  + " reference " + reference);
      return isreadOnly;
    }

    if (
      userAccess.some(
        (d) =>
          (d.roleName.trim() === RolesConstant.REQUESTINGUNIT.trim() ||
            d.roleName.trim() === RolesConstant.UNITADMIN.trim()) &&
          actionTobeTakenBy === Number(EntityType.RequestingUnit) &&
          entityId == actionTobeTakenBy
          && loggedInUserUnitId == serviceRequestUnitId
      )
    ) {
      console.log("4- here" + " reference " + reference);
      return false;
    }

    if (
      userAccess.some(
        (d) =>
          d.roleName.trim() === RolesConstant.FULFILLMENTUNIT.trim() &&
          actionTobeTakenBy === Number(EntityType.FulFilmentUnit) &&
          entityId === actionTobeTakenBy
          && loggedInUserUnitId == serviceRequestUnitId
      )
    ) {
      console.log("5- here" + " reference " + reference);
      return false;
    }

    if (
      userAccess.some(
        (d) =>
          d.roleName.trim() === RolesConstant.SECURITYUNIT.trim() &&
          actionTobeTakenBy === Number(EntityType.SecurityUnit) &&
          entityId === actionTobeTakenBy
          && loggedInUserUnitId == serviceRequestUnitId
      )
    ) {
      console.log("6- here" + " reference " + reference);
      return false;
    }

    if (
      userAccess.some(
        (d) =>
          d.roleName.trim() === RolesConstant.SUPPORTINGUNIT.trim() &&
          actionTobeTakenBy === Number(EntityType.SupportingUnit) &&
          entityId === actionTobeTakenBy
          && loggedInUserUnitId == serviceRequestUnitId
      )
    ) {
      console.log("7- here" + " reference " + reference);
      return false;
    }

    if (
      userAccess.some(
        (d) =>
          d.roleName.trim() === RolesConstant.DELEGATIONUNIT.trim() &&
          actionTobeTakenBy === Number(EntityType.DelegationUnit) &&
          entityId === actionTobeTakenBy
          && loggedInUserUnitId == serviceRequestUnitId
      )
    ) {
      console.log("8- here" + " reference " + reference);
      return false;
    }

    return true;
  };

  const TabStyle = {
    display: "inline-block",
    padding: "12px 24px",
    cursor: "pointer",
    border: "none",
    outline: "none",
    background: "none",
    color: "#555",
    transition: "color 0.2s",
    fontFamily: "FrutigerLTArabic-Roman_0",
    backgroundColor: "transparent",
    fontSize: " 0.875rem",
    fontWeight: "bold",
    borderBottom: "none",
  };
  const activeTabStyle = {
    ...TabStyle,
    color: blue[600],
    borderBottom: "solid #ccc 1px",
    fontWeight: 600,
    boxShadow: "0px 2px 0px 0px #B7945A",
  };
  const tabListStyle = {
    display: "flex",
    borderBottom: "1px solid #e0e0e0",
    gap: 2,
    marginBottom: "2rem",
  };

  return (
    <>
      {/* {"currentWorkflowStep :: " + JSON.stringify(currentWorkflowStep)} */}
      {/* {"isreadOnly :: " + JSON.stringify(isreadOnly)} */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        {serviceId != 0 && workflowSteps && workflowSteps.length > 0 && (
          <>
            <div className="card p-6 mt-6">
              {statusId != Number(WorkFlowStatusConstant.Draft) &&
                serviceDetails && (
                  <>
                    <div className="mb-2">
                      <ServiceRequestHeader data={serviceDetails!} />
                    </div>
                    <div
                      className="mb-2"
                      style={{
                        width: "100%",
                        overflowX: auto,
                        whiteSpace: "nowrap",
                        border: "0px solid #ccc",
                      }}
                    >
                      <ServiceRequestStepper
                        workflowSteps={workflowSteps}
                        currentStepId={currentStepId}
                      />
                    </div>
                  </>
                )}

              <div style={tabListStyle}>
                <button
                  onClick={() => setActiveTab(1)}
                  style={activeTab == 1 ? activeTabStyle : TabStyle}
                >
                  {intl.formatMessage({ id: "LABEL.REQUESTINFO" })}
                </button>
                <button
                  onClick={() => setActiveTab(2)}
                  style={activeTab == 2 ? activeTabStyle : TabStyle}
                >
                  {intl.formatMessage({ id: "LABEL.ATTACHMENTS" })}
                </button>
                {statusId !== undefined && statusId != 0 && (
                  <button
                    onClick={() => setActiveTab(3)}
                    style={activeTab == 3 ? activeTabStyle : TabStyle}
                  >
                    {intl.formatMessage({ id: "LABEL.ACTIVITYLOG" })}
                  </button>
                )}
                {statusId !== undefined &&
                  statusId != 0 &&
                  statusId != WorkFlowStatusConstant.Draft &&
                  serviceEntities &&
                  serviceEntities.map((step, index) => (
                    <button
                      onClick={() => setActiveTab(index + 4)}
                      style={activeTab == index + 4 ? activeTabStyle : TabStyle}
                    >
                      {step.entityNameAr}
                    </button>
                  ))}
              </div>
              <div style={{ display: activeTab === 1 ? "block" : "none" }}>
                <>
                  <div className="form-check form-switch ms-10 mb-4">
                    <input
                      type="checkbox"
                      role="switch"
                      className="form-check-input switch-sm"
                      aria-label="is-active"
                      checked={isSelf}
                      onChange={(e) => setIsSelf(!isSelf)}
                      style={{ height: "25px" }}
                      disabled={setEditableFieldsByEntity(
                        Number(EntityType.RequestingUnit),"","","input"
                      )}
                    ></input>
                  </div>

                  <ServiceFormDynamicTemplate
                    requestId={requestId}
                    serviceId={serviceId}
                    entityId={Number(EntityType.RequestingUnit)}
                    isSelfRequest={isSelf}
                    statusId={statusId}
                    //draftGuid={newDraftGuid}
                    isreadOnly={setEditableFieldsByEntity(
                      Number(EntityType.RequestingUnit),"","","fixed-request"
                    )}
                    currentStepId={
                      currentWorkflowStep != undefined &&
                        currentWorkflowStep.length > 0
                        ? currentWorkflowStep[0].stepId!
                        : 0
                    }
                  />
                </>
              </div>
              <div style={{ display: activeTab === 2 ? "block" : "none" }}>
                <Attachments
                  requestId={requestId}
                  moduleTypeId={ModulesAttachmentConstant.FMS}
                  fileTypes={MIMEConstantALL}
                  perFileMaxAllowedSizeInMb={30}
                  perFileMaxAllowedChunkSizeToSplitInMb={15}
                  allowMultipleFileUpload={false}
                  limitToSingleAttachment={false}
                  showUpload={true}
                  showUploadTooltip={false}
                  UploadTooltip={""}
                  showFileTypes={true}
                  storageServer={"mediaserver"}
                  draftGuid={newDraftGuid}
                  isreadOnly={
                    currentWorkflowStep && currentWorkflowStep.length > 0
                      ? setEditableFieldsByEntity(
                        currentWorkflowStep[0].fromEntityId,"","","fixed-attach"
                      )
                      : true
                  }
                //refreshAttachmentCount={refreshAttachmentCount}
                />
              </div>
              {statusId !== undefined && statusId != 0 && (
                <div style={{ display: activeTab === 3 ? "block" : "none" }}>
                  <TimelineActivityLogChartWithDetails
                    isShowAddComments={true}
                    requestId={requestId}
                    currentEntityId={
                      currentWorkflowStep != undefined &&
                        currentWorkflowStep.length > 0
                        ? currentWorkflowStep[0].fromEntityId!
                        : 0
                    }
                  />
                </div>
              )}
              {/* {"Test " + JSON.stringify(serviceEntities)}
              {"currentWorkflowStep " + JSON.stringify(currentWorkflowStep)} */}
              {statusId != 0 &&
                statusId !== undefined &&
                statusId != WorkFlowStatusConstant.Draft &&
                serviceEntities &&
                serviceEntities.map((step, index) => (
                  <div
                    style={{
                      display: activeTab === index + 4 ? "block" : "none",
                    }}
                  >
                    <ServiceFormDynamicTemplate
                      requestId={requestId}
                      serviceId={serviceId}
                      entityId={step.entityId}
                      statusId={statusId}
                      isreadOnly={setEditableFieldsByEntity(step.entityId, step.loggedInUserUnitId, step.serviceRequestUnitId,"dynamic-form")}
                      currentStepId={
                        currentWorkflowStep != undefined &&
                          currentWorkflowStep.length > 0
                          ? currentWorkflowStep[0].stepId!
                          : 0
                      }
                    />
                  </div>
                ))}
            </div>
          </>
        )}
      </motion.div>
    </>
  );
};
