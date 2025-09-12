import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch } from "../../../../store";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  BtnLabelCanceltxtMedium2,
  DetailLabels,
  HeaderLabels,
  InfoLabels,
} from "../common/formsLabels/detailLabels";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { fetchLookupAsync } from "../../services/globalSlice";
import {
  ActionMasterModel,
  WorkflowStepActionsModel,
  WorkflowStepModel,
  workflowStepActionsInitValue,
} from "../../../models/global/serviceWorkflow";
import { HtmlTooltip } from "../tooltip/HtmlTooltip";
import RenderFontAwesome from "../../utils/RenderFontAwesome";
import { generateUUID } from "../../utils/common";
import { Controller, useForm } from "react-hook-form";
import DropdownList from "../dropdown/DropdownList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ServiceEntitiesModel } from "../../../models/global/ServiceEntitiesModel";
import { StatusModel } from "../../../models/global/statusModel";
import { LookupModel } from "../../../models/global/lookupModel";
import { Modal } from "react-bootstrap";
import AddEditDropDownOptions from "../dropdownOptions/AddEditDropDownOptions";
import {
  fetchAllWorkflowStepActions,
  fetchStatuses,
} from "../../services/adminSlice";
import { WorkFlowActionConstant } from "../../../helper/_constant/workflow.constant";
import { DropDownConstant } from "../../../helper/_constant/dropdown.constant";
import { WorkFlowStatusConstant } from "../../../helper/_constant/workflow.constant";
import { BoxProps } from "@mui/material";

type Props = {
  intialData: WorkflowStepActionsModel[];
  sendDataToParent: Function;
  statuses: StatusModel[];
  entities: ServiceEntitiesModel[];
  stepIndex: number;
  workflowSteps: WorkflowStepModel[];
  formErrors: any;
  readOnly: boolean;
};

export default function InlineTable({
  intialData,
  sendDataToParent,
  statuses,
  entities,
  stepIndex,
  workflowSteps,
  formErrors,
  readOnly,
}: Props) {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const lang = useLang();

  const [workflowStepActions, setWorkflowStepActions] =
    useState<WorkflowStepActionsModel[]>(intialData);
  const [actionList, setActionList] = useState<ActionMasterModel[]>();
  const [isDataUpdated, setIsDataUpdated] = useState<boolean>(false);
  const [showOptionPopup, setShowOptionPopup] = useState<boolean>(false);
  const [refreshData, setRefreshData] = useState<boolean>(false);
  const [dropdownType, setDropDownType] = useState<number>(0);
  const [nextStatuses, setNextStatuses] = useState<StatusModel[]>([]);
  const [currentAction, setCurrentAction] =
    useState<WorkflowStepActionsModel>();

  useEffect(() => {
    sendDataToParent(workflowStepActions);
  }, [workflowStepActions]);

  useEffect(() => {
    getActionList();
    getStatuses();
  }, [refreshData]);

  const getStatuses = () => {
    try {
      dispatch(fetchStatuses())
        .then((apiResponse) => {
          setNextStatuses(apiResponse.payload.data);
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
          return false;
        });
    } catch {}
  };

  const getActionList = () => {
    try {
      dispatch(fetchAllWorkflowStepActions())
        .then((apiResponse) => {
          let _responseLookUp: ActionMasterModel[] = apiResponse.payload.data;
          setActionList(_responseLookUp);
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
          return false;
        });
    } catch {}
  };

  const handleAddAction = () => {
    
    //setWorkflowStepActions()
    const newAction: WorkflowStepActionsModel = {
      ...workflowStepActionsInitValue,
    };
    setWorkflowStepActions([
      ...workflowSteps[stepIndex].serviceWorkflowStepActions!,
      newAction,
    ]);
    setIsDataUpdated(!isDataUpdated);
  };

  const handleDelete = (index: number) => {
    const currentActions = [...workflowStepActions];
    currentActions.splice(index, 1);
    setWorkflowStepActions(currentActions);
    setIsDataUpdated(!isDataUpdated);
  };

  const handleChange = (e: any, rowindex: number, fieldName: string) => {
    const updatedItem = [...workflowSteps[stepIndex].serviceWorkflowStepActions!];
    setCurrentAction(updatedItem[rowindex]);
    if (fieldName == "actionId") {
      if (e == WorkFlowActionConstant.Other) {
        setDropDownType(DropDownConstant.Action);
        setShowOptionPopup(true);
      } else {
        updatedItem[rowindex].actionId = e;
        updatedItem[rowindex].nextStatusId = 0;
        updatedItem[rowindex].toEntityId = 0;
        updatedItem[rowindex].returnStepId = 0;
      }
    }
    if (fieldName == "nextStatusId") {
      if (e == WorkFlowStatusConstant.Other) {
        setDropDownType(DropDownConstant.Status);
        setShowOptionPopup(true);
      } else updatedItem[rowindex].nextStatusId = e;
    }

    if (fieldName == "toEntityId") updatedItem[rowindex].toEntityId = e;
    if (fieldName == "returnStepId") updatedItem[rowindex].returnStepId = e;
    setWorkflowStepActions(updatedItem);
    setIsDataUpdated(!isDataUpdated);
  };

  return (
    <>
      {/* {JSON.stringify(workflowStepActions)} */}

      {stepIndex != 0 && !readOnly && (
        <div className="d-flex justify-content-end">
          <button
            onClick={handleAddAction}
            className="btn MOD_btn btn-add min-w-75px w-100 align-self-end px-6"
            id={generateUUID()}
          >
            <FontAwesomeIcon
              icon={faPlus}
              size="lg"
              color="var(--text-2)"
            ></FontAwesomeIcon>
            <BtnLabelCanceltxtMedium2
              text={intl.formatMessage({ id: "BUTTON.LABEL.ADD" })}
            />
          </button>

          <br />
        </div>
      )}
      <table className="table create-project-task-ms mb-0 bg-light rounded-1">
        <thead>
          {workflowStepActions && workflowStepActions.length > 0 && (
            <tr>
              <td width="24%" className="ps-8">
                {intl.formatMessage({ id: "LABEL.ACTION" })}
              </td>
              <td width="24%" className="ps-4">
                {intl.formatMessage({ id: "LABEL.NEXTSTATUS" })}
              </td>
              <td width="24%" className="ps-4">
                {intl.formatMessage({ id: "LABEL.TO" })}
              </td>
              <td width="24%" className="ps-4">
                {intl.formatMessage({ id: "LABEL.RETURNPATH" })}
              </td>
            </tr>
          )}
        </thead>
        <tbody>
          {workflowStepActions &&
            workflowStepActions.map((action, index) => (
              <tr id={action.id?.toString()} key={index}>
                <td width="24%" className="ps-8">
                  <DropdownList
                    key={"actionId" + index}
                    dataKey="id"
                    dataValue={lang == "ar" ? "actionName" : "actionNameEn"}
                    defaultText={intl.formatMessage({ id: "LABEL.ACTION" })}
                    value={workflowStepActions[index].actionId}
                    data={actionList}
                    setSelectedValue={(e) => handleChange(e, index, "actionId")}
                    isDisabled={(stepIndex == 0 && index == 0) || readOnly}
                  />
                  <div className={"error"}>
                    {formErrors &&
                      formErrors[index] &&
                      formErrors[index].actionId}
                  </div>
                </td>
                <td width="24%">
                  <DropdownList
                    key={"nextStatusId" + index}
                    dataKey="statusId"
                    dataValue={lang === "ar" ? "statusNameAr" : "statusNameEn"}
                    defaultText={intl.formatMessage({ id: "LABEL.NEXTSTATUS" })}
                    value={workflowStepActions[index].nextStatusId}
                    //data={statuses}
                    data={nextStatuses}
                    setSelectedValue={(e) =>
                      handleChange(e, index, "nextStatusId")
                    }
                    isDisabled={(stepIndex == 0 && index == 0) || readOnly}
                  />
                  <div className={"error"}>
                    {formErrors &&
                      formErrors[index] &&
                      formErrors[index].nextStatusId}
                  </div>
                </td>
                <td width="24%">
                  <DropdownList
                    key={"toEntityId" + index}
                    dataKey="entityId"
                    dataValue={lang === "ar" ? "entityNameAr" : "entityNameEn"}
                    defaultText={intl.formatMessage({ id: "LABEL.TO" })}
                    value={workflowStepActions[index].toEntityId}
                    data={entities}
                    setSelectedValue={(e) =>
                      handleChange(e, index, "toEntityId")
                    }
                    isDisabled={readOnly}
                  />
                  <div className={"error"}>
                    {formErrors &&
                      formErrors[index] &&
                      formErrors[index].toEntityId}
                  </div>
                </td>
                <td width="24%">
                  <DropdownList
                    key={"returnStepId" + index}
                    dataKey="stepId"
                    dataValue={"stepName"}
                    defaultText={intl.formatMessage({ id: "LABEL.RETURNPATH" })}
                    value={workflowStepActions[index].returnStepId}
                    data={workflowSteps.filter(
                      (steps) =>
                        steps.stepId != 0 && steps.stepOrder! < stepIndex + 1
                    )}
                    setSelectedValue={(e) =>
                      handleChange(e, index, "returnStepId")
                    }
                    isDisabled={
                      (stepIndex == 0 && index == 0) ||
                      workflowStepActions[index].actionId !=
                        WorkFlowActionConstant.Return ||
                      readOnly
                    }
                  />
                  <div className={"error"}>
                    {formErrors &&
                      formErrors[index] &&
                      formErrors[index].returnStepId}
                  </div>
                </td>
                <td width="4%" className="pe-8">
                  <HtmlTooltip
                    title={intl.formatMessage({ id: "LABEL.DELETE" })}
                  >
                    <div
                      key={generateUUID()}
                      hidden={(stepIndex == 0 && index == 0) || readOnly}
                      onClick={() => handleDelete(index)}
                      className="clickable-label p-4 cursor-pointer"
                      id={generateUUID()}
                    >
                      <RenderFontAwesome
                        color={""}
                        size="lg"
                        display={true}
                        icon={"faXmark"}
                      />
                    </div>
                  </HtmlTooltip>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <Modal
        className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
        centered
        backdrop="static"
        keyboard={false}
        size="lg"
        show={showOptionPopup}
        onHide={() => setShowOptionPopup(false)}
        dialogClassName={"customModal"}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <HeaderLabels text={"LABEL.ADDOPTION"} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddEditDropDownOptions
            setShowOptionPopup={setShowOptionPopup}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            type={dropdownType}
            currentAction={currentAction!}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
