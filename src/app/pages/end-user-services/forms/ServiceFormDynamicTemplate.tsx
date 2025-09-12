import useIntl from "react-intl/src/components/useIntl";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../modules/auth";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../../store";
import {
  BtnLabeltxtMedium2,
  BtnLabelCanceltxtMedium2,
} from "../../../modules/components/common/formsLabels/detailLabels";
import {
  ServiceFormUnits,
  ServiceRequestUnits,
  ServiceWorkflowActionSearchModel,
} from "../../../models/global/serviceModel";
import { useEffect, useState } from "react";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  DynamicFieldModel,
  DynamicFormSubmitPayload,
  FormTypes,
} from "../../../modules/components/dynamicFields/utils/types";
import {
  GetMappedUnitsByEntityTypeAndService,
  GetServiceFieldsByServiceId,
  GetServiceRequestDetailsByRequestId,
  GetServiceWorkflowActionsByEntity,
  SubmitServiceTemplateForm,
  saveTimelineActivity,
} from "../../../modules/services/serviceRequestSlice";
import DynamicFields from "../../../modules/components/dynamicFields/DynamicFields";
import { RequestType } from "../../../helper/_constant/servicerequest.contant";
import { toast } from "react-toastify";
import { writeToBrowserConsole } from "../../../modules/utils/common";
import {
  WorkFlowActionConstant,
  WorkFlowStatusConstant,
} from "../../../helper/_constant/workflow.constant";
import {
  ServiceRequestActionModel,
  UserWorkflowActionModel,
} from "../../../models/global/serviceWorkflow";
import DropdownList from "../../../modules/components/dropdown/DropdownList";
import { JoditEditorComponent } from "../../../modules/components/editor/JoditEditor";
import { GlobalLabel } from "../../../modules/components/common/label/LabelCategory";
import { ITimelineActivitySaveModel } from "../../../models/global/globalGeneric";
import { EntityType } from "../../../helper/_constant/entity.constant";
import { fetchStatuses } from "../../../modules/services/adminSlice";
import { StatusModel } from "../../../models/global/statusModel";
import { json } from "stream/consumers";
import { request } from "http";

type props = {
  entityId: number;
  serviceId: number;
  isSelfRequest?: boolean;
  requestId?: number;
  statusId?: number;
  draftGuid?: string;
  isreadOnly: boolean;
  currentStepId: number;
  setRequestorFieldData?: any;
};

export const ServiceFormDynamicTemplate = ({
  entityId,
  serviceId,
  isSelfRequest,
  requestId,
  statusId,
  draftGuid,
  isreadOnly,
  currentStepId,
  setRequestorFieldData,
}: props) => {
  const intl = useIntl();
  const lang = useLang();
  const { auth } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [statuses, setStatuses] = useState<StatusModel[]>([]);

  const useFormHook = useForm({
    defaultValues: {},
    mode: "all",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
  });

  const [dynamicFieldsModel, setDynamicFieldsModel] = useState<
    DynamicFieldModel[]
  >([]);
  const [fixedFieldsModel, setFixedFieldsModel] = useState<DynamicFieldModel[]>(
    []
  );

  const [show, setShow] = useState<boolean>(false);

  // Configurable columns per row
  const staticColumnsPerRow = 2; // Change this to set static fields columns
  const dynamicColumnsPerRow = 2; // Change this to set dynamic fields columns

  const [serviceWorkflowActions, setServiceWorkflowActions] = useState<
    UserWorkflowActionModel[]
  >([]);

  const [serviceRequestAction, setServiceRequestAction] =
    useState<ServiceRequestActionModel>();

  const [actionError, setActionError] = useState<string>("");

  const [serviceUnits, setServiceUnits] = useState<ServiceRequestUnits[]>([]);

  useEffect(() => {
    getSeviceRequestFieldsByEntity();
    getWorkflowActions();
    getStatuses();
  }, [entityId]);

  // Populate form with saved SelectRooms data when dynamicFieldsModel is loaded
  useEffect(() => {
    if (dynamicFieldsModel.length > 0) {
      const formValues: any = {};

      dynamicFieldsModel.forEach((field) => {
        if (field.fieldTypeId === FormTypes.selectrooms && field.fieldValue) {
          try {
            const selectRoomsData =
              typeof field.fieldValue === "string"
                ? JSON.parse(field.fieldValue as string)
                : field.fieldValue;

            //Set individual field values
            if (selectRoomsData.room) {
              formValues[`${field.fieldKey}_room`] = selectRoomsData.room;
            }
            if (selectRoomsData.startDate) {
              formValues[`${field.fieldKey}_startDate`] = new Date(
                selectRoomsData.startDate
              );
            }
            if (selectRoomsData.endDate) {
              formValues[`${field.fieldKey}_endDate`] = new Date(
                selectRoomsData.endDate
              );
            }
          } catch (error) {}
        } else if (field.fieldValue != undefined) {
          formValues[field.fieldKey] = field.fieldValue;
        }
      });

      //Update form with the parsed values
      if (Object.keys(formValues).length > 0) {
        useFormHook.reset(formValues, { keepErrors: false });
      }
    }
  }, [dynamicFieldsModel]);

  const getStatuses = () => {
    try {
      dispatch(fetchStatuses())
        .then((apiResponse) => {
          setStatuses(apiResponse.payload.data);
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
          return false;
        });
    } catch {}
  };

  const getSeviceRequestFieldsByEntity = () => {
    dispatch(
      GetServiceRequestDetailsByRequestId({
        serviceId: serviceId,
        requestId: requestId!,
        entityId: entityId,
      })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          var modelData = originalPromiseResult.data as DynamicFieldModel[];
          if (modelData && modelData.length > 0) {
            setDynamicFieldsModel(modelData);
          } else {
            getServiceFieldsByServiceId(serviceId);
          }
        }
      });
  };

  const getServiceFieldsByServiceId = (serviceId: number) => {
    dispatch(
      GetServiceFieldsByServiceId({ serviceId: serviceId, entityId: entityId })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          var modelData = originalPromiseResult.data as DynamicFieldModel[];
          if (modelData) {
            setDynamicFieldsModel(modelData);
          }
        }
      });
  };

  // Event handler close modal popup Two
  const togglePreviewMode = () => {
    setShow(!show);
  };

  // Utility to chunk array into rows
  function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  // Static fields grid
  const staticFieldRows = chunkArray(fixedFieldsModel, staticColumnsPerRow);
  const renderStaticFields = (
    <div className="container-fluid px-0">
      {staticFieldRows.map((row, rowIdx) => (
        <div className="row" key={rowIdx}>
          {row.map((formControl) => (
            <div
              className={`col-md-${12 / staticColumnsPerRow} mb-3`}
              key={formControl.fieldKey}
            >
              <DynamicFields
                divClass="form-group"
                containerClass="row"
                headerClass="col-md-4"
                inputClass="col-md-8"
                formHook={useFormHook}
                formControl={formControl}
                customHandlers={{}}
                readonly={isreadOnly}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Dynamic fields grid
  const dynamicFieldRows = chunkArray(dynamicFieldsModel, dynamicColumnsPerRow);
  const renderDynamicFields = (
    <div className="container-fluid px-0">
      {dynamicFieldRows.map((row, rowIdx) => (
        <div className="row" key={rowIdx}>
          {row.map((formControl) => {
            // console.log(JSON.stringify(row));
            const isFullWidth =
              (formControl.fieldTypeId ?? 0) == FormTypes.texteditor ||
              (formControl.fieldTypeId ?? 0) == FormTypes.textarea ||
              (formControl.fieldTypeId ?? 0) == FormTypes.linebreak ||
              (formControl.fieldTypeId ?? 0) == FormTypes.selectrooms ||
              (formControl.fieldTypeId ?? 0) == FormTypes.fieldgrouping;
            const columnClass = isFullWidth
              ? "col-md-12"
              : `col-md-${12 / dynamicColumnsPerRow}`;
            return (
              <div className={`${columnClass} mb-3`} key={formControl.fieldKey}>
                <DynamicFields
                  divClass="form-group"
                  containerClass="row"
                  headerClass="col-md-4"
                  inputClass="col-md-8"
                  formHook={useFormHook}
                  formControl={formControl}
                  customHandlers={{}}
                  readonly={isreadOnly}
                  isDisabled={isreadOnly}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const onSubmit = async () => {
    let hasError = false;
    for (const field of dynamicFieldsModel) {
      if (field.fieldTypeId === FormTypes.text) {
        const value = useFormHook.getValues()[field.fieldKey];
      }
      if (field.fieldTypeId === FormTypes.decimal) {
        const value = useFormHook.getValues()[field.fieldKey];
      }
      
      //Add validation for SelectRooms componant
      if (field.fieldTypeId === FormTypes.selectrooms) {
        const roomFieldkey = `${field.fieldKey}_room` as any;
        const startDateFieldKey = `${field.fieldKey}_startDate` as any;
        const endDateFieldKey = `${field.fieldKey}_endDate` as any;

        const roomValue = useFormHook.getValues()[roomFieldkey];
        const startDateValue = useFormHook.getValues()[startDateFieldKey];
        const endDateValue = useFormHook.getValues()[endDateFieldKey];

        //Validate required fields
        //if (field.isRequired) {
        if (!roomValue) {
          useFormHook.setError(roomFieldkey, {
            type: "required",
            message: intl.formatMessage({ id: "LABBEL.REQUIRED" }),
          });
          hasError = true;
        }
        if (!startDateValue) {
          useFormHook.setError(startDateFieldKey, {
            type: "required",
            message: intl.formatMessage({ id: "LABBEL.REQUIRED" }),
          });
          hasError = true;
        }
        if (!endDateValue) {
          useFormHook.setError(endDateFieldKey, {
            type: "required",
            message: intl.formatMessage({ id: "LABBEL.REQUIRED" }),
          });
          hasError = true;
        }

        //}

        // Validate date range --TODO
      }
    }
    if (hasError) {
      //setSubmittedData('Submission Failed. Validation Issue');
      return;
    }

    const isValid = await useFormHook.trigger();

    if (isValid) {
      if (
        entityId != Number(EntityType.RequestingUnit) &&
        (serviceRequestAction == undefined ||
          (serviceRequestAction && serviceRequestAction?.actionId == 0))
      ) {
        setActionError(intl.formatMessage({ id: "MESSAGE.SELECTACTION" }));
        return;
      }
      setActionError("");

      const formValues = useFormHook.getValues();

      // Collect static fields (use fieldId as key)
      const staticFields = fixedFieldsModel.map((field, idx) => ({
        fieldId: String(field.fieldId), // Use key as fieldId for static fields
        fieldValue: formValues[field.fieldKey],
        serviceEntityId: entityId.toString(),
      }));

      // Collect dynamic fields as before
      const dynamicFields = dynamicFieldsModel.map((field) => {
        let value: any = formValues[field.fieldKey];
        if (field.fieldTypeId === FormTypes.selectrooms) {
          //collect all 3 fields and combine them into single obj
          const roomValue = formValues[`${field.fieldKey}_room`];
          const startDateValue = formValues[`${field.fieldKey}_startDate`];
          const endDateValue = formValues[`${field.fieldKey}_endDate`];

          value = {
            room: roomValue,
            startDate: startDateValue,
            endDate: endDateValue,
          };

          //Convert to JSON
          value = JSON.stringify(value);
        } else if (
          field.fieldTypeId === FormTypes.autocompletedropdownlist &&
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === "object" &&
          value[0].value !== undefined
        ) {
          value = value.map((v: any) => v.value);
        }
        return {
          fieldId: String(field.fieldId),
          fieldValue: value,
          serviceEntityId: entityId.toString(),
        };
      });

      let selectedaction = serviceWorkflowActions.filter(
        (a) => a.actionId === serviceRequestAction?.actionId
      );
      let newStatus = 0;
      if (selectedaction && selectedaction.length > 0)
        newStatus = selectedaction[0].statusId;
      else newStatus = Number(WorkFlowStatusConstant.Submitted);

      // Combine both for submission
      const payload: DynamicFormSubmitPayload = {
        serviceId: serviceId,
        requestId: requestId,
        requestType: isSelfRequest
          ? RequestType.SelfRequest
          : RequestType.RequestOnBehalf,
        statusId:
          statusId == WorkFlowStatusConstant.Draft || statusId == 0
            ? Number(WorkFlowStatusConstant.Submitted)
            : newStatus,
        draftGuid: draftGuid,
        //currentStepId: (statusId == WorkFlowStatusConstant.Draft || statusId == 0) ? 1 : currentStepId,
        currentStepId: currentStepId,
        entityId: entityId,
        actionId:
          statusId == WorkFlowStatusConstant.Draft || statusId == 0
            ? WorkFlowActionConstant.Submit
            : serviceRequestAction?.actionId!,
        unitId: serviceRequestAction?.unitId!,
        attachments: [],
        formData: [
          //...staticFields,
          ...dynamicFields,
        ],
      };

      try {
        const response = await dispatch(
          SubmitServiceTemplateForm({ formDataObject: payload })
        ).then(unwrapResult);
        if (response && response.statusCode === 200) {
          toast.success(
            intl.formatMessage({ id: "MESSAGE.REQUEST.SUBMITTED" })
          );
          let timelineData: ITimelineActivitySaveModel;

          

          timelineData = {
            actionDetails:
              statusId == Number(WorkFlowStatusConstant.Draft) || statusId == 0
                ? intl.formatMessage({ id: "MESSAGE.REQUEST.SUBMITTED" })
                : statuses.filter((s) => s.statusId == newStatus)[0]
                    .statusNameAr +
                  " " +
                  intl.formatMessage({ id: "LABEL.TOVALUE" }) +
                  " " +
                  statuses.filter((s) => s.statusId == statusId)[0]
                    .statusNameAr +
                  " " +
                  intl.formatMessage({ id: "LABEL.FROMVALUE" }) +
                  " " +
                  intl.formatMessage({ id: "LABEL.ACTION.UPDATED" }) +
                  (serviceRequestAction?.actionDesc != undefined &&
                  serviceRequestAction?.actionDesc != "" &&
                  serviceRequestAction?.actionDesc != null
                    ? " <br /> " +
                      serviceRequestAction?.actionDesc! +
                      " : " +
                      intl.formatMessage({ id: "LABEL.ACTIONCOMMENTS" })
                    : ""),
            requestId: requestId!,
            actionId:
              statusId == Number(WorkFlowStatusConstant.Draft)
                ? WorkFlowActionConstant.Submit
                : serviceRequestAction?.actionId!,
            stepId:
              statusId == Number(WorkFlowStatusConstant.Draft)
                ? 1
                : currentStepId,
            previousStatus: statusId,
            newStatus:
              statusId == Number(WorkFlowStatusConstant.Draft)
                ? Number(WorkFlowStatusConstant.Submitted)
                : newStatus,
            logType: 2,
            entityId: entityId,
          };
          const result = await dispatch(
            saveTimelineActivity({ formDataObject: timelineData })
          );

          navigate("/end-user/service-request-list");
        } else {
          return;
        }
      } catch (error: any) {
        writeToBrowserConsole(error);
        return;
      }

      useFormHook.clearErrors();
      useFormHook.reset(
        {
          //...staticDefaultValues,
          ...Object.fromEntries(
            dynamicFieldsModel.map((field) => [
              field.fieldKey,
              field.fieldTypeId === FormTypes.checkbox
                ? "false"
                : field.fieldTypeId === FormTypes.radiogroup
                ? ""
                : "",
            ])
          ),
        },
        { keepErrors: false, keepDirty: false, keepTouched: false }
      );
    }
  };

  const handleSaveAsDraft = async () => {
    let hasError = false;
    for (const field of dynamicFieldsModel) {
      if (field.fieldTypeId === FormTypes.text) {
        const value = useFormHook.getValues()[field.fieldKey];
      }
      if (field.fieldTypeId === FormTypes.decimal) {
        const value = useFormHook.getValues()[field.fieldKey];
      }
    }
    if (hasError) {
      //setSubmittedData('Submission Failed. Validation Issue');
      return;
    }

    const formValues = useFormHook.getValues();

    // Collect static fields (use fieldId as key)
    const staticFields = fixedFieldsModel.map((field, idx) => ({
      fieldId: String(field.fieldId), // Use key as fieldId for static fields
      fieldValue: formValues[field.fieldKey],
      serviceEntityId: entityId.toString(),
    }));

    // Collect dynamic fields as before
    const dynamicFields = dynamicFieldsModel.map((field) => {
      let value: any = formValues[field.fieldKey];
      if (field.fieldTypeId === FormTypes.selectrooms) {
        //collect all 3 fields and combine them into single obj
        const roomValue = formValues[`${field.fieldKey}_room`];
        const startDateValue = formValues[`${field.fieldKey}_startDate`];
        const endDateValue = formValues[`${field.fieldKey}_endDate`];

        value = {
          room: roomValue,
          startDate: startDateValue,
          endDate: endDateValue,
        };

        //Convert to JSON
        value = JSON.stringify(value);
      } else if (
        field.fieldTypeId === FormTypes.autocompletedropdownlist &&
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object" &&
        value[0].value !== undefined
      ) {
        value = value.map((v: any) => v.value);
      }
      return {
        fieldId: String(field.fieldId),
        fieldValue: value,
        serviceEntityId: entityId.toString(),
      };
    });

    // Combine both for submission
    const payload: DynamicFormSubmitPayload = {
      serviceId: serviceId,
      requestId: requestId,
      requestType: isSelfRequest
        ? RequestType.SelfRequest
        : RequestType.RequestOnBehalf,
      statusId: Number(WorkFlowStatusConstant.Draft),
      draftGuid: draftGuid,
      currentStepId: currentStepId,
      entityId: entityId,
      actionId: 0,
      attachments: [],
      formData: [
        //...staticFields,
        ...dynamicFields,
      ],
    };

    try {
      const response = await dispatch(
        SubmitServiceTemplateForm({ formDataObject: payload })
      ).then(unwrapResult);
      if (response && response.statusCode === 200) {
        toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));

        // let timelineData : ITimelineActivitySaveModel;

        // timelineData = {
        //     actionDetails:  intl.formatMessage({ id: 'MESSAGE.SAVE.SUCCESS' }),
        //     requestId: requestId!,
        //     actionId: 0,
        //     stepId: currentStepId,
        //     previousStatus : statusId,
        //     newStatus : Number(WorkFlowStatusConstant.Draft),
        //     entityId: entityId,
        // }
        // const result = await dispatch(saveTimelineActivity({ formDataObject: timelineData }));

        navigate("/end-user/service-request-list");
      } else {
        return;
      }
    } catch (error: any) {
      writeToBrowserConsole(error);
      return;
    }

    useFormHook.clearErrors();
    useFormHook.reset(
      {
        //...staticDefaultValues,
        ...Object.fromEntries(
          dynamicFieldsModel.map((field) => [
            field.fieldKey,
            field.fieldTypeId === FormTypes.checkbox
              ? "false"
              : field.fieldTypeId === FormTypes.radiogroup
              ? ""
              : "",
          ])
        ),
      },
      { keepErrors: false, keepDirty: false, keepTouched: false }
    );
  };

  const getWorkflowActions = () => {
    let formDataObject: ServiceWorkflowActionSearchModel = {
      serviceId: serviceId,
      entityId: entityId,
      statusId: statusId!,
      currentStepId: currentStepId,
      requestId: requestId ? requestId : 0,
    };

    dispatch(
      GetServiceWorkflowActionsByEntity({ formDataObject: formDataObject })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          var modelData =
            originalPromiseResult.data as UserWorkflowActionModel[];
          if (modelData) {
            setServiceWorkflowActions(modelData);
          }
        }
      });
  };

  const handleChange = (e: any, fieldName: string) => {
    if (fieldName == "actionId") {
      setServiceRequestAction((prev) => ({
        ...prev,
        actionId: Number(e),
      }));
      setActionError("");
      getServiceRequestUnitsByAction(Number(e));
    }
    if (fieldName == "actionDesc")
      setServiceRequestAction((prev) => ({
        ...prev,
        actionDesc: e,
      }));
    if (fieldName == "unitId")
      setServiceRequestAction((prev) => ({
        ...prev,
        unitId: Number(e),
      }));
  };

  const getServiceRequestUnitsByAction = (actionId: number) => {
    setServiceUnits([]);
    if (
      actionId == Number(WorkFlowActionConstant.AssignToDelegation) ||
      actionId == Number(WorkFlowActionConstant.AssignToSupporting)
    ) {
      let assignToEntity: number = 0;
      if (actionId == Number(WorkFlowActionConstant.AssignToDelegation))
        assignToEntity = Number(EntityType.DelegationUnit);
      if (actionId == Number(WorkFlowActionConstant.AssignToSupporting))
        assignToEntity = Number(EntityType.SupportingUnit);
      dispatch(
        GetMappedUnitsByEntityTypeAndService({
          entityId: assignToEntity,
          serviceId,
        })
      )
        .then(unwrapResult)
        .then(async (originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const serviceRequestUnits =
              originalPromiseResult.data as ServiceRequestUnits[];
            setServiceUnits(serviceRequestUnits);
          }
        });
    }
  };

  return (
    <>
      <form
        className="form"
        autoComplete="off"
        onSubmit={useFormHook.handleSubmit(onSubmit)}
      >
        {/* Static Input Fields For Admin */}
        {renderDynamicFields}
        {serviceWorkflowActions &&
          serviceWorkflowActions.length > 0 &&
          statusId != WorkFlowStatusConstant.Draft &&
          statusId != 0 &&
          statusId != undefined &&
          !isreadOnly && (
            <div className="container-fluid action-panel mb-4">
              <div className="row mb-8">
                <div className="col-md-2">
                  <GlobalLabel
                    required
                    value={intl.formatMessage({ id: "LABEL.ACTIONNAME" })}
                  />
                </div>
                <div className="col-md-6">
                  <DropdownList
                    dataKey="actionId"
                    dataValue={"actionName"}
                    defaultText={intl.formatMessage({ id: "LABEL.ACTION" })}
                    value={serviceRequestAction?.actionId}
                    data={serviceWorkflowActions}
                    setSelectedValue={0}
                    onChangeFunction={(e) => handleChange(e, "actionId")}
                    isDisabled={isreadOnly}
                  />
                  {actionError != "" && (
                    <div className={"error"}>{actionError}</div>
                  )}
                </div>
              </div>
              <div
                className="row mb-8"
                hidden={
                  serviceRequestAction?.actionId !=
                    Number(WorkFlowActionConstant.AssignToDelegation) &&
                  serviceRequestAction?.actionId !=
                    Number(WorkFlowActionConstant.AssignToSupporting)
                }
              >
                <div className="col-md-2">
                  <GlobalLabel
                    required
                    value={intl.formatMessage({ id: "LABEL.REQUESTUNITS" })}
                  />
                </div>
                <div className="col-md-6">
                  {serviceUnits && (
                    <DropdownList
                      dataKey="id"
                      dataValue={"unitName"}
                      defaultText={intl.formatMessage({
                        id: "LABEL.REQUESTUNITS",
                      })}
                      value={serviceRequestAction?.unitId}
                      data={serviceUnits}
                      setSelectedValue={0}
                      onChangeFunction={(e) => handleChange(e, "unitId")}
                      isDisabled={isreadOnly}
                    />
                  )}
                </div>
              </div>
              <div className="row mb-8">
                <div className="col-md-2">
                  <GlobalLabel
                    required
                    value={intl.formatMessage({ id: "LABEL.DESCRIPTION" })}
                  />
                </div>
                <div className="col-md-6">
                  {isreadOnly ? (
                    <div
                      className="form-control form-control-lg form-control-solid mb-3 mb-lg-0 readonlyClassName"
                      style={{
                        minHeight: 120,
                        background: "#f9f9f9",
                        border: "1px solid #eee",
                        borderRadius: 4,
                        padding: 8,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: serviceRequestAction?.actionDesc || "",
                      }}
                    />
                  ) : (
                    <JoditEditorComponent
                      onSearchChangeHandler={(e) =>
                        handleChange(e, "actionDesc")
                      }
                      isReadOnly={isreadOnly}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

        <div className="container-fluid px-0 mb-4">
          <div className="row g-9 mb-8">
            <div className="col-xl-12 d-flex justify-content-end">
              <button
                type="button"
                id="kt_modal_new_target_submit"
                className="btn MOD_btn btn-create w-10 pl-5 mx-3"
                onClick={handleSaveAsDraft}
                hidden={
                  statusId != Number(WorkFlowStatusConstant.Draft) &&
                  statusId != 0 &&
                  statusId != undefined
                }
              >
                <BtnLabeltxtMedium2 text={"BUTTON.LABEL.SAVEASDRAFT"} />
              </button>
              <button
                type="submit"
                id="kt_modal_new_target_submit"
                className="btn MOD_btn btn-create w-10 pl-5 mx-3"
                hidden={isreadOnly}
              >
                <BtnLabeltxtMedium2 text={"BUTTON.LABEL.SUBMIT"} />
              </button>
              <button
                type="button"
                id="kt_modal_new_target_cancel"
                className="btn MOD_btn btn-cancel w-10"
                onClick={() => navigate("/end-user/service-request-list")}
              >
                <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
