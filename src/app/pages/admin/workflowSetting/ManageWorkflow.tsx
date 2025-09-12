import {
  Accordion,
  Col,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useIntl } from "react-intl";
import { WorkflowStep } from "./WorkflowStep";
import {
  ActionMasterModel,
  WorkflowStepActionsModel,
  WorkflowStepModel,
  workflowStepInitValue,
} from "../../../models/global/serviceWorkflow";
import "./WorkflowSettings.css";
import { useAppDispatch } from "../../../../store";
import {
  deleteWorkflowStepAndReorder,
  fetchAllWorkflowStepActions,
  fetchServiceFormEntities,
  fetchStatuses,
  fetchWorkflowStepsByServiceId,
} from "../../../modules/services/adminSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  generateUUID,
  writeToBrowserConsole,
} from "../../../modules/utils/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  BtnLabelCanceltxtMedium2,
  HeaderLabels,
} from "../../../modules/components/common/formsLabels/detailLabels";
import { StatusModel } from "../../../models/global/statusModel";
import { ServiceEntitiesModel } from "../../../models/global/ServiceEntitiesModel";
import {
  WorkFlowActionConstant,
  WorkFlowStatusConstant,
} from "../../../helper/_constant/workflow.constant";
import ConfirmDeleteModal from "../../../modules/components/confirmDialog/ConfirmDeleteModal";
import { EntityType } from "../../../helper/_constant/entity.constant";
import ApiWorkflowWrapper from "../workflowcharts/ApiWorkflowWrapper";

type props = {
  serviceId: number;
  readOnly?: boolean;
  // onSuccess?: () => void;
};

export const ManageWorkflow = forwardRef(
  ({ serviceId, readOnly }: props, ref) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const [workflowSteps, setworkflowSteps] = useState<WorkflowStepModel[]>([]);
    const [viewType, setViewType] = useState<string>("steps");
    const [reloadKey, setReloadKey] = useState<number>(0);
    const [statuses, setStatuses] = useState<StatusModel[]>([]);
    const [entities, setEntities] = useState<ServiceEntitiesModel[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [stepToRemove, setStepToRemove] = useState<{
      stepId: number;
      index: number;
    }>({ stepId: 0, index: 0 });
    const [missingActions, setMissingActions] = useState<
      {
        actionIndex: number;
        entityId: number;
        entityName: string;
        statusId: number;
        statusName: string;
      }[]
    >([]);
    const [workflowError, setWorkflowError] = useState<string>("");
    const [activeStep, setActiveStep] = useState<string>("1");
    const [actionList, setActionList] = useState<ActionMasterModel[]>();

    useImperativeHandle(ref, () => ({
      submit: (): boolean => {
        return validateWorkflow();
      },
    }));

    useEffect(() => {
      dispatch(fetchStatuses()).then((apiResponse) => {
        setStatuses(apiResponse.payload.data);
      });

      dispatch(fetchServiceFormEntities({ serviceId: serviceId })).then(
        (apiResponse) => {
          setEntities(apiResponse.payload.data);
        }
      );

      dispatch(fetchWorkflowStepsByServiceId({ serviceId: serviceId, requestId: 0 })).then(
        (apiResponse) => {
          let _workflowSteps: WorkflowStepModel[] = apiResponse.payload.data;
          let stepOrder = 0;

          if (_workflowSteps.length > 0) {
            setworkflowSteps(_workflowSteps);
            stepOrder = _workflowSteps.length;
            setActiveStep(stepOrder.toString());
          } else {
            const steps: WorkflowStepModel[] = [];
            const actions: WorkflowStepActionsModel[] = [];
            actions.push({
              stepId: 0,
              actionId: 1,
              nextStatusId: 2,
              toEntityId: 0,
              returnStepId: 0,
            });
            steps.push({
              stepId: 0,
              stepName: intl.formatMessage({ id: "LABEL.INITIALSTEP" }),
              stepOrder: 1,
              serviceId: serviceId,
              fromEntityId: 1,
              currentStatusId: 0,
              serviceWorkflowStepActions: actions,
            });
            setworkflowSteps(steps);
            setActiveStep("1");
          }
        }
      );

      getActions();
    }, [reloadKey]);

    const handleAddStep = () => {
      const newstepOrder = workflowSteps.length + 1;
      const newStep: WorkflowStepModel = {
        ...workflowStepInitValue,
        serviceId: serviceId,
        stepOrder: newstepOrder,
      };
      setworkflowSteps([...workflowSteps, newStep]);
      setActiveStep(newstepOrder.toString());
    };

    function onClickSteps() {
      setViewType("steps");
    }

    function onClickFlow() {
      setViewType("flow");
    }

    const handleDeleteStep = () => {
      setworkflowSteps([]);
      let stepId: number = stepToRemove.stepId,
        index: number = stepToRemove.index;
      let isLastStep: boolean = workflowSteps.length == index + 1;
      if (stepId != 0) {
        dispatch(
          deleteWorkflowStepAndReorder({ serviceId: serviceId, stepId: stepId })
        )
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              toast.success(
                intl.formatMessage({
                  id: isLastStep
                    ? "MESSAGE.WORKFLOWSTEP.DELETED"
                    : "MESSAGE.CUSTOM.WORKFLOWSTEP.DELETED",
                })
              );
              var response = originalPromiseResult.data as WorkflowStepModel[];
              setworkflowSteps(response);
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
          });
        setShowConfirm(false);
      } else {
        const steps = [...workflowSteps];
        steps.splice(index, 1);
        setworkflowSteps(steps);
        toast.success(
          intl.formatMessage({ id: "MESSAGE.WORKFLOWSTEP.DELETED" })
        );
        setShowConfirm(false);
      }
    };

    const confirmDelete = (stepId: number, index: number) => {
      setStepToRemove({ stepId: stepId, index: index });
      setShowConfirm(true);
    };

  const validateWorkflow = () => {
    try {

      //check if there is unsaved information
      let hasUnSavedInfo: boolean = false;
      hasUnSavedInfo = workflowSteps.some((s) => s.stepId === 0 || s.serviceWorkflowStepActions?.some((a) => a.id === 0));
      if (hasUnSavedInfo) {
        setWorkflowError(intl.formatMessage({ id: "MESSAGE.WORKFLOWSTEP.SAVECHANGES" }));
        return false;
      }

        // check if there is any missing step related to any preceeding actions
        const missingActions1: {
          actionIndex: number;
          entityId: number;
          entityName: string;
          statusId: number;
          statusName: string;
        }[] = [];
        let isClosureActionAdded: boolean = false;
        let isAssignToDelegationAdded: boolean = false;
        let isAssignToSupportingAdded: boolean = false;
        workflowSteps.forEach((step) => {
          if (!isClosureActionAdded)
            isClosureActionAdded = step.serviceWorkflowStepActions?.some(
              (a) =>
                a.nextStatusId == WorkFlowStatusConstant.Completed ||
                a.nextStatusId == WorkFlowStatusConstant.Closed
            )!;
          if (!isAssignToDelegationAdded)
            isAssignToDelegationAdded = step.serviceWorkflowStepActions?.some(
              (a) => a.actionId == WorkFlowActionConstant.AssignToDelegation
            )!;
          if (!isAssignToSupportingAdded)
            isAssignToSupportingAdded = step.serviceWorkflowStepActions?.some(
              (a) => a.actionId == WorkFlowActionConstant.AssignToSupporting
            )!;

          step.serviceWorkflowStepActions?.forEach((action, index) => {
            if (
              action.actionId === WorkFlowActionConstant.Reject ||
              action.actionId === WorkFlowActionConstant.Return ||
              action.actionId === WorkFlowActionConstant.Complete ||
              action.nextStatusId === WorkFlowStatusConstant.Completed ||
              action.actionId === WorkFlowActionConstant.Close ||
              action.actionId === WorkFlowStatusConstant.Closed ||
              action.actionId === WorkFlowActionConstant.AssignToDelegation ||
              action.actionId === WorkFlowActionConstant.AssignToSupporting
            )
              return;
            const match = workflowSteps.some(
              (s) =>
                s.fromEntityId == action.toEntityId &&
                s.currentStatusId == action.nextStatusId
            );
            if (!match)
              missingActions1.push({
                actionIndex: index,
                entityId: action.toEntityId,
                entityName:
                  action.toEntityId == 0
                    ? ""
                    : entities.filter(
                        (e) => e.entityId === action.toEntityId
                      )[0].entityNameAr,
                statusId: action.nextStatusId,
                statusName: statuses.filter(
                  (e) => e.statusId === action.nextStatusId
                )[0].statusNameAr,
              });
          });
        });

        setMissingActions(missingActions1);

        // if (onSuccess)
        //   onSuccess()

        // resolve(true);

        if (missingActions1.length > 0) {
          const missingStatus = missingActions1
            .map((a, i) => `${i + 1}.  ${a.entityName} - ${a.statusName}`)
            .join("\n");
          setWorkflowError(
            intl.formatMessage({ id: "MESSAGE.WORKFLOWSTEP.MISSINGSTEP" }) +
              " \n " +
              missingStatus
          );
          return false;
        }

        const stepWithNoAction = workflowSteps.filter(
          (s) => s.serviceWorkflowStepActions?.length == 0
        );
        if (stepWithNoAction && stepWithNoAction.length > 0) {
          setWorkflowError(
            intl.formatMessage({ id: "MESSAGE.WORKFLOWSTEP.NOACTION" }) +
              " " +
              stepWithNoAction[0].stepName
          );
          return false;
        }

        if (!isClosureActionAdded) {
          setWorkflowError(
            intl.formatMessage({
              id: "MESSAGE.WORKFLOWSTEP.MISSINGCOMPLETIONSTEP",
            })
          );
          return false;
        }

        if (
          entities.some(
            (e) => e.entityId === Number(EntityType.DelegationUnit)
          ) &&
          !isAssignToDelegationAdded
        ) {
          const actionName = actionList?.filter(
            (a) => a.id == Number(WorkFlowActionConstant.AssignToDelegation)
          )[0].actionName;
          setWorkflowError(
            intl.formatMessage({ id: "MESSAGE.WORKFLOWSTEP.MISSINGACTION" }) +
              " \n " +
              actionName
          );
          //setWorkflowError(JSON.stringify(getAction(Number(WorkFlowActionConstant.AssignToDelegation))));
          return false;
        }

        if (
          entities.some(
            (e) => e.entityId === Number(EntityType.SupportingUnit)
          ) &&
          !isAssignToSupportingAdded
        ) {
          const actionName = actionList?.filter(
            (a) => a.id == Number(WorkFlowActionConstant.AssignToSupporting)
          )[0].actionName;
          setWorkflowError(
            intl.formatMessage({ id: "MESSAGE.WORKFLOWSTEP.MISSINGACTION" }) +
              " \n " +
              actionName
          );
          return false;
        }

        setWorkflowError("");
        return true;
      } catch (e) {
        // resolve(false);

        return false;
      }
    };

    const getActions = () => {
      try {
        dispatch(fetchAllWorkflowStepActions())
          .then((apiResponse) => {
            
            let _responseLookUp: ActionMasterModel[] = apiResponse.payload.data;
            setActionList(_responseLookUp);
          })
          .catch((rejectedValueOrSerializedError) => {
            console.log(rejectedValueOrSerializedError);
            return "";
          });
      } catch {}
      return "";
    };

    const saveStepDataToParentState = (updatedStep: WorkflowStepModel) => {
      setworkflowSteps((prev) =>
        prev.map((step) =>
          step.stepOrder == updatedStep.stepOrder ? updatedStep : step
        )
      );
    };

    return (
      <>
        {/* {JSON.stringify(missingActions)} */}
        {/* {JSON.stringify(workflowSteps)} */}
        <div className="card card-custom-box-shadow">
          <div className="card-body border-0">
            <Row className="mb-4">
              <Col>
                <div className="viewType">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip">
                        <div className="tooltip-text">
                          {intl.formatMessage({ id: "TOOLTIP.GRIDVIEW" })}
                        </div>
                      </Tooltip>
                    }
                  >
                    <div
                      className={
                        "viewType-button " +
                        (viewType == "steps" ? "viewType-button-selected" : "")
                      }
                      onClick={() => {
                        onClickSteps();
                      }}
                    >
                      <i
                        className={`fa fa-grid-2 fs-3 ${
                          viewType == "steps" ? "text-white" : "fa-light"
                        }`}
                      />{" "}
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip">
                        <div className="tooltip-text">
                          {intl.formatMessage({ id: "TOOLTIP.FlOWVIEW" })}
                        </div>
                      </Tooltip>
                    }
                  >
                    <div
                      className={
                        "viewType-button " +
                        (viewType == "flow" ? "viewType-button-selected" : "")
                      }
                      onClick={() => {
                        onClickFlow();
                      }}
                    >
                      <i
                        className={`fa fa-diagram-subtask fs-3 ${
                          viewType == "flow" ? "text-white" : "fa-light"
                        }`}
                      />
                    </div>
                  </OverlayTrigger>
                </div>
              </Col>
            </Row>
            {viewType == "steps" ? (
              <>
                {workflowError && workflowError.length > 0 && (
                  <div
                    className={"error mb-2"}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {workflowError}
                  </div>
                )}
                <Row>
                  {workflowSteps && workflowSteps.length > 0 && (
                    <Accordion
                      activeKey={activeStep}
                      onSelect={(key) =>
                        setActiveStep(key ? key.toString() : "")
                      }
                    >
                      {workflowSteps.map((step, index) => (
                        <WorkflowStep
                          step={step}
                          index={index}
                          steps={workflowSteps}
                          handleDeleteStep={confirmDelete}
                          setReloadKey={setReloadKey}
                          saveStepDataToParentState={saveStepDataToParentState}
                          readOnly={readOnly!}
                          setWorkflowError={setWorkflowError}
                        />
                      ))}
                    </Accordion>
                  )}
                </Row>
                <Row className="justify-content-end mt-4" hidden={readOnly}>
                  <Col>
                    <button
                      onClick={handleAddStep}
                      className="btn MOD_btn btn-add min-w-75px w-100 align-self-end px-6"
                      id={generateUUID()}
                      disabled={workflowSteps.some((item) => item.stepId === 0)}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        size="lg"
                      ></FontAwesomeIcon>
                      <BtnLabelCanceltxtMedium2
                        text={intl.formatMessage({
                          id: "BUTTON.LABEL.ADDSTEP",
                        })}
                      />
                    </button>
                  </Col>
                </Row>

                {/* <Row className="justify-content-end mt-4">
                <Col>
                  <button
                    onClick={validateWorkflow}
                    className="btn MOD_btn btn-add min-w-75px w-100 align-self-end px-6"
                    id={generateUUID()}
                  >
                    <BtnLabelCanceltxtMedium2 text={'Validate'} />
                  </button>

                </Col>
              </Row> */}
              </>
            ) : (
              <></>
            )}

            {viewType == "flow" ? (
              <>
                {" "}
                <div style={{ height: "600px", width: "100%" }}>
                  <ApiWorkflowWrapper
                    serviceId={serviceId}
                    workflowId={1}
                    height="100%"
                    showMiniMap={false}
                  />
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>

        <Modal
          className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
          centered
          backdrop="static"
          keyboard={false}
          show={showConfirm}
          size={"sm"}
          onHide={() => setShowConfirm(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <HeaderLabels text={""} />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ConfirmDeleteModal
              setShow={setShowConfirm}
              onConfirm={handleDeleteStep}
            ></ConfirmDeleteModal>
          </Modal.Body>
        </Modal>
      </>
    );
  }
);
