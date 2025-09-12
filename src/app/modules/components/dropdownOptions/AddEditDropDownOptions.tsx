import { Col, Row } from "react-bootstrap";
import { GlobalLabel } from "../../../modules/components/common/label/LabelCategory";
import { useIntl } from "react-intl";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../../store";
import { useForm, SubmitHandler } from "react-hook-form";
import { LookupModel } from "../../../models/global/lookupModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
} from "../common/formsLabels/detailLabels";
import {
  ActionMasterModel,
  WorkflowStepActionsModel,
  actionInitValue,
} from "../../../models/global/serviceWorkflow";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { writeToBrowserConsole } from "../../utils/common";
import {
  AddUpdateWorkflowStatus,
  AddUpdateWorkflowStepAction,
} from "../../services/adminSlice";
import { DropDownConstant } from "../../../helper/_constant/dropdown.constant";
import { StatusModel } from "../../../models/global/statusModel";
import { useState } from "react";

type Props = {
  setShowOptionPopup: any;
  refreshData: boolean;
  setRefreshData: any;
  type: number;
  currentAction: WorkflowStepActionsModel;
};

export default function AddEditDropDownOptions({
  setShowOptionPopup,
  refreshData,
  setRefreshData,
  type,
  currentAction,
}: Props) {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const lang = useLang();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ActionMasterModel>();

  const onSubmit: SubmitHandler<ActionMasterModel> = (data) => {
    if (type == DropDownConstant.Action) {
      let formDataObject: ActionMasterModel = {
        ...actionInitValue,
        actionName: data.actionName,
        isActive: true,
      };

      dispatch(AddUpdateWorkflowStepAction({ formDataObject }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          
          if (originalPromiseResult.statusCode === 200) {
            if (originalPromiseResult.data == -2) {
              // setErrors({ ...errors, selectedEndDate: "" });
              toast.error(intl.formatMessage({ id: "LABEL.ACTIONNAMEEXISTS" }));
            } else {
              // message: 'Duplicate', data: -2
              toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
              setShowOptionPopup(false);
              setRefreshData(!refreshData);
              currentAction.actionId = originalPromiseResult.data;
            }
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    } else if (type == DropDownConstant.Status) {
      let formDataObject: StatusModel = {
        statusId: 0,
        statusNameAr: data.actionName!,
        statusNameEn: data.actionName!,
      };

      dispatch(AddUpdateWorkflowStatus({ formDataObject }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            if (originalPromiseResult.data == -2) {
              // setErrors({ ...errors, selectedEndDate: "" });
              toast.error(intl.formatMessage({ id: "LABEL.ACTIONNAMEEXISTS" }));
            } else {
              toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
              setShowOptionPopup(false);
              setRefreshData(!refreshData);
              currentAction.nextStatusId = originalPromiseResult.data;
            }
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row className="mb-2">
        <Col className={"col-12 align-self-center"}>
          <input
            type="text"
            maxLength={45}
            autoComplete="off"
            className="form-control form-control-solid active input5 lbl-txt-medium-2"
            placeholder={intl.formatMessage({ id: "LABEL.OPTION" })}
            {...register("actionName", {
              required: intl.formatMessage({ id: "LABEL.OPTIONREQ" }),
            })}
            name="actionName"
          />
          <div className={"error"}>{errors.actionName?.message}</div>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col className={"col-12 align-self-center"}>
          <button
            type="submit"
            className="btn MOD_btn btn-create min-w-75px align-self-end px-6"
          >
            <FontAwesomeIcon color={""} size="1x" icon={faPlus} />
            <BtnLabeltxtMedium2
              text={"BUTTON.LABEL.ADD"}
              isI18nKey={true}
            />{" "}
          </button>
        </Col>
      </Row>
    </form>
  );
}
