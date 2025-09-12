import { Accordion, Col, Row } from "react-bootstrap";
import InlineTable from "../../../modules/components/inlineTable/InlineTable";
import {
  WorkflowStepActionsModel,
  WorkflowStepModel,
  workflowStepInitValue,
} from "../../../models/global/serviceWorkflow";
import { GlobalLabel } from "../../../modules/components/common/label/LabelCategory";
import { useIntl } from "react-intl";
import DropdownList from "../../../modules/components/dropdown/DropdownList";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../../store";
import {
  AddUpdateWorkflowStepAndActions,
  checkIfStepExists,
  fetchServiceFormEntities,
  fetchStatuses,
} from "../../../modules/services/adminSlice";
import { StatusModel } from "../../../models/global/statusModel";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { ServiceEntitiesModel } from "../../../models/global/ServiceEntitiesModel";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { writeToBrowserConsole } from "../../../modules/utils/common";
import RenderFontAwesome from "../../../modules/utils/RenderFontAwesome";
import {
  WorkFlowActionConstant,
  WorkFlowStatusConstant,
} from "../../../helper/_constant/workflow.constant";
import { EntityType } from "../../../helper/_constant/entity.constant";

type Props = {
  step: WorkflowStepModel;
  index: number;
  steps: WorkflowStepModel[];
  handleDeleteStep: (stepId: number, index: number) => void;
  setReloadKey: any;
  saveStepDataToParentState: Function;
  readOnly: boolean;
  setWorkflowError: any;
};

type ValidationErrors = {
  stepName?: string;
  fromEntityId?: string;
  currentStatusId?: string;
  serviceWorkflowStepActions?: TagErrors[];
};

type TagErrors = {
  actionId?: string;
  nextStatusId?: string;
  toEntityId?: string;
  returnStepId?: string;
};

export const WorkflowStep = ({
  step,
  index,
  steps,
  handleDeleteStep,
  setReloadKey,
  saveStepDataToParentState,
  readOnly,
  setWorkflowError,
}: Props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const lang = useLang();
  const [workflowStep, setWorkflowStep] = useState<WorkflowStepModel>(step);
  const [statuses, setStatuses] = useState<StatusModel[]>([]);
  const [currentStatuses, setCurrentStatuses] = useState<StatusModel[]>([]);
  const [fromEntities, setFromEntities] = useState<ServiceEntitiesModel[]>([]);
  const [toEntities, setToEntities] = useState<ServiceEntitiesModel[]>([]);
  const [isEntityUpdated, setIsEntityUpdated] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState("");
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [stepError, setStepError] = useState<string>("");

  useEffect(() => {
    setWorkflowStep((prev) => ({
      ...prev,
      stepOrder: prev.stepOrder == 0 ? index + 1 : prev.stepOrder,
    }));
    dispatch(fetchStatuses()).then((apiResponse) => {
      let _response: StatusModel[] = apiResponse.payload.data;
      setStatuses(_response);
      setCurrentStatuses(getValidCurrentStatuses(_response, index + 1));
    });

    dispatch(fetchServiceFormEntities({ serviceId: step.serviceId! })).then(
      (apiResponse) => {
        let _entities: ServiceEntitiesModel[] = apiResponse.payload.data;
        setFromEntities(_entities);
        //setToEntities(_entities.filter((e) => e.entityId != workflowStep.fromEntityId));
        setToEntities(_entities);
      }
    );
  }, [isEntityUpdated]);

  const saveChildDataToParentState = (data: WorkflowStepActionsModel[]) => {
    setWorkflowStep((prev) => ({
      ...prev,
      serviceWorkflowStepActions: data,
    }));

    if (data && data.length > 0) {
      const newFormErrors: ValidationErrors = {};
      if (validateStepActions(data!) != undefined)
        newFormErrors.serviceWorkflowStepActions = validateStepActions(data!);
      setFormErrors((prev) => ({
        ...prev,
        serviceWorkflowStepActions: newFormErrors.serviceWorkflowStepActions,
      }));
    }

    let currentStep: WorkflowStepModel = workflowStep;
    currentStep.serviceWorkflowStepActions = data;
    saveStepDataToParentState(currentStep);
  };

  const handleChange = (e: any, rowindex: number, fieldName: string) => {
    if (fieldName == "stepName")
      setWorkflowStep((prev) => ({
        ...prev,
        stepName: e.target.value,
      }));

    if (fieldName == "fromEntityId") {
      setWorkflowStep((prev) => ({
        ...prev,
        fromEntityId: Number(e),
      }));

      //let _toEntities: ServiceEntitiesModel[] = fromEntities;
      // _toEntities = _toEntities.filter((e) => e.entityId != Number(e));
      //setToEntities(fromEntities);
      //setIsEntityUpdated(!isEntityUpdated);
    }

    if (fieldName == "currentStatusId")
      setWorkflowStep((prev) => ({
        ...prev,
        currentStatusId: Number(e),
      }));

    setFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
    saveStepDataToParentState(workflowStep);
  };

  const validateWorkStepsAndActions = () => {
    
    const newFormErrors: ValidationErrors = {};
    if (workflowStep.stepName.trim() == "") {
      newFormErrors.stepName = intl.formatMessage({ id: "LABEL.STEPNAMEREQ" });
    }

    if (workflowStep.fromEntityId == 0) {
      newFormErrors.fromEntityId = intl.formatMessage({ id: "LABEL.FROMREQ" });
    }

    if (workflowStep.currentStatusId == 0 && workflowStep.stepOrder != 1) {
      newFormErrors.currentStatusId = intl.formatMessage({
        id: "LABEL.CURRENTSTATUSREQ",
      });
    }

    const exists = steps.some(
      (step) =>
        step.stepName == workflowStep.stepName &&
        step.stepId != 0 &&
        step.stepId != workflowStep.stepId
    );
    if (exists)
      newFormErrors.stepName = intl.formatMessage({
        id: "LABEL.STEPNAMEEXISTS",
      });

    if (workflowStep.currentStatusId != 0 && workflowStep.fromEntityId != 0) {
      const isduplicate = steps.some(
        (step) =>
          step.fromEntityId === workflowStep.fromEntityId &&
          step.currentStatusId === workflowStep.currentStatusId &&
          step.stepId != workflowStep.stepId
      );
      if (isduplicate)
        newFormErrors.fromEntityId = intl.formatMessage({
          id: "MESSAGE.WORKFLOWSTEP.DUPLICATE",
        });
    }

    if (
      workflowStep.serviceWorkflowStepActions &&
      workflowStep.serviceWorkflowStepActions.length > 0
    ) {
      if (
        validateStepActions(workflowStep.serviceWorkflowStepActions!) !=
        undefined
      )
        newFormErrors.serviceWorkflowStepActions = validateStepActions(
          workflowStep.serviceWorkflowStepActions!
        );
    }

    setFormErrors(newFormErrors);
    return Object.keys(newFormErrors).length == 0;
  };

  function hasDuplicateSteps() {
    
    const uniqueList: string[] = [];
    let isDuplicate: boolean = false;
    steps.forEach((step) => {
      step.serviceWorkflowStepActions?.forEach((action) => {
        const uniqueKey = `${step.currentStatusId}-${action.toEntityId}-${action.nextStatusId}`;
        if (uniqueList.indexOf(uniqueKey) !== -1) {
          isDuplicate = true;
        }

        uniqueList.push(uniqueKey);
      });
    });
    return isDuplicate;
  }

  const validateStepActions = (
    WorkflowStepActions: WorkflowStepActionsModel[]
  ) => {
    const tagErrors: TagErrors[] = WorkflowStepActions.map((action) => {
      const tagError: TagErrors = {};

      if (action.actionId == 0)
        tagError.actionId = intl.formatMessage({ id: "LABEL.ACTIONREQ" });
      if (action.nextStatusId == 0)
        tagError.nextStatusId = intl.formatMessage({
          id: "LABEL.NEXTSTATUSREQ",
        });
      if (
        action.actionId != WorkFlowActionConstant.Reject &&
        action.toEntityId == 0
      )
        tagError.toEntityId = intl.formatMessage({ id: "LABEL.TOREQ" });
      if (
        action.actionId == WorkFlowActionConstant.Return &&
        action.returnStepId == 0
      )
        tagError.returnStepId = intl.formatMessage({
          id: "LABEL.RETURNPATHREQ",
        });
      if (
        action.actionId == WorkFlowActionConstant.AssignToDelegation &&
        action.toEntityId != 0 &&
        action.toEntityId != Number(EntityType.DelegationUnit)
      )
        tagError.toEntityId = intl.formatMessage({
          id: "LABEL.INCORRECTTOENTITY",
        });
      if (
        action.actionId == WorkFlowActionConstant.AssignToSupporting &&
        action.toEntityId != 0 &&
        action.toEntityId != Number(EntityType.SupportingUnit)
      )
        tagError.toEntityId = intl.formatMessage({
          id: "LABEL.INCORRECTTOENTITY",
        });
      return tagError;
    });

    const hasTagErrors = tagErrors.some(
      (er) => er.actionId || er.nextStatusId || er.returnStepId || er.toEntityId
    );
    if (hasTagErrors) return tagErrors;
  };

  const handleSaveStep = () => {
    const isValid = validateWorkStepsAndActions();

    if (!isValid) {
      setWorkflowError("");
      return;
    }

    const hasDuplicate = hasDuplicateSteps();
    if (hasDuplicate) {
      setStepError("MESSAGE.WORKFLOWSTEP.DUPLICATE");
      setWorkflowError("");
      return;
    } else setStepError("");

    const hasNoActions =
      workflowStep.serviceWorkflowStepActions &&
      workflowStep.serviceWorkflowStepActions.length == 0;
    if (hasNoActions) {
      setStepError("MESSAGE.WORKFLOWSTEP.NOACTION");
      setWorkflowError("");
      return;
    } else setStepError("");

    let formDataObject: WorkflowStepModel = workflowStep;
    
    dispatch(AddUpdateWorkflowStepAndActions({ formDataObject }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          toast.success(intl.formatMessage({ id: "MESSAGE.UPDATE.SUCCESS" }));
          setReloadKey((prev) => prev + 1);
          setActiveKey("");
          setWorkflowStep((prev) => ({
            ...prev,
            stepId: originalPromiseResult.data,
          }));
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
      });
  };

  const handleOnBlurDuplicateStepNameValidation = (stepName: string) => {
    try {
      //const newFormErrors: ValidationErrors = {};
      
      if (stepName.length === 0) return;
      // const exists = steps.some(
      //   (step) =>
      //     step.stepName == workflowStep.stepName &&
      //     step.stepId != 0 &&
      //     step.stepId != workflowStep.stepId
      // );
      const exists = steps.filter((step) =>
      step.stepName == workflowStep.stepName &&
      step.stepId != 0 &&
      step.stepId != workflowStep.stepId)      
      if (exists && exists.length > 0) {
        
        setFormErrors((prev) => ({
          ...prev,
          stepName: intl.formatMessage({ id: "LABEL.STEPNAMEEXISTS" }).replaceAll("X", exists[0].stepOrder.toString()),
        }));
      } else setFormErrors((prev) => ({ ...prev, stepName: "" }));
    } catch (e) {
      console.log("Error at handleOnBlurDuplicateStepNameValidation " + e);
      return false;
    }
  };

  function getValidCurrentStatuses(
    statuses: StatusModel[],
    currentStepOrder: number
  ) {
    const previousSteps = steps.filter(
      (step) => step.stepOrder < currentStepOrder && step.stepOrder != 0
    );
    let statusList: StatusModel[] = [];
    let excludedStatus: number[] = [];
    previousSteps.forEach((step) => {
      step.serviceWorkflowStepActions?.forEach((action) => {
        const match = previousSteps.some(
          (s) =>
            s.fromEntityId == action.toEntityId &&
            s.currentStatusId == action.nextStatusId
        );
        if (!match) {
          if (
            action.nextStatusId != 0 &&
            action.actionId != WorkFlowActionConstant.Reject &&
            action.actionId != WorkFlowActionConstant.Return
          )
            excludedStatus.push(action.nextStatusId);
        }
      });
      statusList = statuses.filter((s) => excludedStatus.includes(s.statusId));
    });

    return statusList;
  }

  return (
    <>
      <Accordion.Item
        eventKey={step.stepOrder.toString()}
        key={step.stepOrder}
        className={`ec-card accordionHeader with-top-border mb-4`}
      >
        <Accordion.Header className="ec-card-header-custom card border-0">
          <Row style={{ width: "100%" }}>
            <Col className={"col-6 align-self-center"}>
              <div className="titleText">
                {workflowStep.stepOrder + " . " + workflowStep.stepName}
              </div>
            </Col>
            <Col
              className={
                "col-6 d-flex align-items-center justify-content-end px-6"
              }
            >
              {workflowStep.stepOrder != 1 && !readOnly && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStep(step.stepId!, index);
                  }}
                >
                  <RenderFontAwesome
                    display
                    size="lg"
                    icon="trash"
                    color="#6B7280"
                  />
                </div>
              )}
            </Col>
          </Row>
        </Accordion.Header>
        <Accordion.Body className="ec-card-body">
          {stepError && stepError.length > 0 && (
            <div className={"error mb-2"}>
              {intl.formatMessage({ id: stepError })}
            </div>
          )}
          <Row className="mb-2 px-4">
            <Col className={"col-1 align-self-center"}>
              <GlobalLabel
                required
                value={intl.formatMessage({ id: "LABEL.STEPNAME" })}
              />
            </Col>
            <Col className={"col-11 align-self-center"}>
              <input
                className={`form-control form-control-solid input5 lbl-txt-medium-2 p-2`}
                type="text"
                autoComplete="off"
                aria-autocomplete="none"
                value={workflowStep.stepName}
                placeholder={intl.formatMessage({ id: "LABEL.STEPNAME" })}
                maxLength={250}
                disabled={index == 0 || readOnly}
                onChange={(e) => handleChange(e, index, "stepName")}
                onBlur={(e) =>
                  handleOnBlurDuplicateStepNameValidation(workflowStep.stepName)
                }
              />
              <div className={"error"}>{formErrors.stepName}</div>
            </Col>
          </Row>
          <Row className="mb-4 px-4">
            <Col className={"col-1 align-self-center"}>
              <GlobalLabel
                required
                value={intl.formatMessage({ id: "LABEL.FROM" })}
              />
            </Col>
            <Col className={"col-5 align-self-center"}>
              <DropdownList
                dataKey="entityId"
                dataValue={lang === "ar" ? "entityNameAr" : "entityNameEn"}
                defaultText={intl.formatMessage({ id: "LABEL.FROM" })}
                value={workflowStep.fromEntityId}
                data={fromEntities}
                setSelectedValue={0}
                isDisabled={index == 0 || readOnly}
                onChangeFunction={(e) => handleChange(e, index, "fromEntityId")}
              />
              <div className={"error"}>{formErrors.fromEntityId}</div>
            </Col>
            <Col className={"col-1 align-self-center"}>
              <GlobalLabel
                required
                value={intl.formatMessage({ id: "LABEL.CURRENTSTATUS" })}
              />
            </Col>
            <Col className={"col-5 align-self-center"}>
              {currentStatuses && (
                <DropdownList
                  dataKey="statusId"
                  dataValue={lang === "ar" ? "statusNameAr" : "statusNameEn"}
                  defaultText={intl.formatMessage({
                    id: "LABEL.CURRENTSTATUS",
                  })}
                  value={workflowStep.currentStatusId}
                  data={currentStatuses}
                  setSelectedValue={0}
                  isDisabled={index == 0 || readOnly}
                  onChangeFunction={(e) =>
                    handleChange(e, index, "currentStatusId")
                  }
                />
              )}
              <div className={"error"}>{formErrors.currentStatusId}</div>
            </Col>
          </Row>
          <Row className="px-4">
            <Col className={"col-12 align-self-center"}>
              <div className="d-flex gap-4 flex-column">
                <InlineTable
                  intialData={workflowStep.serviceWorkflowStepActions!}
                  sendDataToParent={saveChildDataToParentState}
                  statuses={statuses}
                  entities={toEntities}
                  stepIndex={index}
                  workflowSteps={steps}
                  formErrors={formErrors.serviceWorkflowStepActions}
                  readOnly={readOnly}
                />
              </div>
            </Col>
          </Row>
          <Row className="px-4">
            <Col>
              <hr />
            </Col>
          </Row>
          <Row className="mb-2 px-4" hidden={readOnly}>
            <Col
              className={
                "col-12 d-flex align-items-center justify-content-end gap-3"
              }
            >
              <button
                type="submit"
                className="btn MOD_btn btn-create cursor-pointer"
                onClick={handleSaveStep}
              >
                {intl.formatMessage({ id: "BUTTON.LABEL.SAVE" })}
              </button>
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </>
  );
};
