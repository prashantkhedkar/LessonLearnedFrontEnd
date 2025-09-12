import useIntl from "react-intl/src/components/useIntl";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAppDispatch } from "../../../../../store";
import {
  AdminSetupServiceModel,
  ServiceEntityFieldMappingModel,
  ServiceFormUnits,
} from "../../../../models/global/serviceModel";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Modal } from "react-bootstrap";
import UnitTreeView from "../../../../modules/components/unitTreeView/UnitTreeView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  BtnLabelCanceltxtMedium2,
  HeaderLabels,
} from "../../../../modules/components/common/formsLabels/detailLabels";
import {
  AddUpdateAdminSetupServiceFormDetails,
  AddUpdateAdminSetupUnitDetails,
  DeleteServiceUnit,
  GetMappedFieldsForEntityAndService,
  GetMappedUnitsForEntityAndService,
  GetServiceEntitiesMaster,
  PreviewAdminSetupServiceFormDetails,
} from "../../../../modules/services/adminSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  generateUUID,
  writeToBrowserConsole,
} from "../../../../modules/utils/common";
import {
  FieldLayout,
  FieldMasterModel,
} from "../../../../models/global/fieldMasterModel";
import DragDropComponent from "../../../../modules/components/dragdrop/DragDropComponent";
import { DynamicFieldModel, FormTypes } from "../../../../modules/components/dynamicFields/utils/types";
import DynamicFields from "../../../../modules/components/dynamicFields/DynamicFields";
import { ServiceEntitiesMaster } from "../../../../models/global/ServiceEntitiesMaster";

type props = {
  entityId: number;
  serviceId: number;
  onSuccess?: () => void; // Add optional onSuccess prop
  readOnly?: boolean;
};
export const AdminFormDynamicTemplate = forwardRef((props: props, ref) => {
  const { entityId, serviceId, onSuccess, readOnly } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [predefinedFields, setPredefinedFields] = useState<any>();
  const [isMultiselectUnit, setIsMultiselectUnit] = useState<boolean>(false);
  const [selectedFields, setSelectedFields] = useState<ServiceEntityFieldMappingModel[]>([]);
  const {
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AdminSetupServiceModel>();
  const useFormHook = useForm({
    defaultValues: {},
    mode: "all",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
  });

  const [previewDynamicFieldModal, setPreviewDynamicFieldModal] = useState<
    DynamicFieldModel[]
  >([]);
  const [show, setShow] = useState<boolean>(false);

  const [showUnitPopup, setShowUnitPopup] = useState(false);
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  const [serviceUnits, setServiceUnits] = useState<any[]>([]);
  const [serviceFormUnits, setServiceFormUnits] = useState<any[]>([]);

  useEffect(() => {
    dispatch(GetServiceEntitiesMaster())
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          const response = originalPromiseResult.data as ServiceEntitiesMaster[];
          // Find entity by entityId and set isMultiselectUnit
          const matchedEntity = response.find(e => e.entityId === entityId);
          setIsMultiselectUnit(matchedEntity?.isMultiselectUnit ?? false);
        }
      });
  }, []);

  // Handler for selecting units
  const onUnitSelect = (obj, action: any) => {
    try {
      setServiceFormUnits([]);
      setServiceUnits(obj);
      let selectedUnits: number[] = [];
      let newServiceFormUnits: any[] = [];

      obj.map((item) => {
        selectedUnits.push(Number(item.value));
        let _unit: any[] = [];
        _unit.push({
          entityTypeId: entityId,
          unitId: item.value,
          id: item.id ? item.id : 0,
          label: item.label,
        });
        newServiceFormUnits.push(..._unit);
      });

      setServiceFormUnits(newServiceFormUnits);
      setSelectedUnitIds(selectedUnits);

      // Pass the new units directly to avoid state update delay
      handleUnitModalClose(newServiceFormUnits);
    } catch (error) {
      writeToBrowserConsole("onUnitSelect >> error >> " + error);
    }
  };

  // Function to save unit details only
  const saveUnitDetails = async (unitsToSave?: any[]) => {
    try {
      const unitsData = unitsToSave || serviceFormUnits;

      if (unitsData.length === 0) {
        // No units to save, just close the modal
        return true;
      }

      let formDataObject: AdminSetupServiceModel = {
        serviceId: serviceId,
        entityId: entityId,
        serviceFormUnits: unitsData,
        serviceEntityFields: [], // Empty array since we're only saving units
      };

      const result = await dispatch(
        AddUpdateAdminSetupUnitDetails({ formDataObject })
      ).then(unwrapResult);

      if (result.statusCode === 200) {
        toast.success(intl.formatMessage({ id: "UNIT.SAVED.SUCCESSFULLY" }));
        return true;
      } else {
        toast.error(intl.formatMessage({ id: "UNIT.SAVED.FAILED" }));
        return false;
      }
    } catch (error) {
      writeToBrowserConsole("Save unit details error: " + error);
      toast.error(intl.formatMessage({ id: "UNIT.SAVED.FAILED" }));
      return false;
    }

    setShowUnitPopup(false);
  };

  // Handle modal close - save units if any changes were made
  const handleUnitModalClose = async (unitsToSave?: any[]) => {
    const success = await saveUnitDetails(unitsToSave);
    if (success) {
      setShowUnitPopup(false);
    }
  };

  // Handler for removing a unit
  async function handleRemove(e: any, unitId: number, id: number) {
    
    e.preventDefault();
    // You may want to add a confirmation dialog here as in the original
    let filteredItem: any[] = [];
    filteredItem = serviceFormUnits.filter((item) => item.unitId !== unitId);
    setServiceFormUnits(filteredItem);
    let selectedUnits: number[] = [];
    filteredItem.map((item) => {
      selectedUnits.push(Number(item.unitId));
    });
    setSelectedUnitIds(selectedUnits);
    let selectedServiceUnits: any[] = [];
    filteredItem.map((item) => {
      selectedServiceUnits.push({ value: item.unitId, label: item.label });
    });
    setServiceUnits(selectedServiceUnits);

    //let unitData: any[] = serviceFormUnits.filter((item) => (item.id > 0 && item.unitId !== unitId) || (item.id == 0 && item.));

    deleteServiceUnit(id, unitId, serviceId);
  }

  // Toggle unit search modal
  const toggleUnitSearchVisibility = (e: any, data: boolean) => {
    e.preventDefault();
    setShowUnitPopup(data);
  };

  // Configurable columns per row
  const dynamicColumnsPerRow = 2; // Change this to set dynamic fields columns

  const [restrictedFieldIds, setRestrictedFieldIds] = useState<number[]>([]);

  useEffect(() => {
    if (entityId == 0 || serviceId == 0) {
      return;
    }
    dispatch(GetMappedUnitsForEntityAndService({ entityId, serviceId }))
      .then(unwrapResult)
      .then(async (originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          const serviceFormUnits =
            originalPromiseResult.data as ServiceFormUnits[];
          if (serviceFormUnits && serviceFormUnits.length > 0) {
            const unitPromises = serviceFormUnits.map(async (unit) => {
              return {
                value: unit.unitId,
                label: unit.unit?.unitName,
                typeId: unit.entityTypeId,
                id: unit.unitId, // unit.Id
              };
            });

            const formattedUnits = await Promise.all(unitPromises);
            setServiceUnits(formattedUnits);

            const unitIds = serviceFormUnits.map((unit) => unit.unit?.unitId!);
            setSelectedUnitIds(unitIds);

            setServiceFormUnits(serviceFormUnits);
          }
        }
      });

    getMappedFieldsForEntityAndService();
    // Fetch predefined fields for the entity and service
  }, []);

  const getMappedFieldsForEntityAndService = () => {
    if (entityId == 0 || serviceId == 0) {
      return;
    }

    dispatch(GetMappedFieldsForEntityAndService({ entityId, serviceId }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          const responseData = originalPromiseResult.data as FieldMasterModel[];

          const column2Fields = responseData
            .filter((field) => field.isSelected === true)
            .map((field) => {
              if ((field.fieldTypeId ?? 0) == FormTypes.linebreak) {
                return { ...field, guid: generateUUID() };
              }
              return field;
            });

          const column1Fields = responseData.filter(
            (field) => !field.isSelected
          );

          const restrictedFields = column2Fields.filter(
            (field) =>
              (field.entityId ?? -1) > 0 && (field.fieldTypeId ?? 0) < FormTypes.linebreak
          );
          const userDraggableFields = column2Fields.filter(
            (field) => field.entityId === 0 || (field.fieldTypeId ?? 0) == FormTypes.linebreak
          );

          const allColumn2Fields = [
            ...restrictedFields,
            ...userDraggableFields,
          ];

          const fieldSet: FieldLayout = {
            fields: responseData,
            columns: [
              {
                id: "1",
                title: "LABEL.FIELDLIST",
                showRequiredCheckbox: false,
                fields: column1Fields,
              },
              {
                id: "2",
                title: "LABEL.SELECTEDFIELDS",
                showRequiredCheckbox: true,
                fields: allColumn2Fields,
              },
            ],
            columnOrder: ["1", "2"],
          };
          setPredefinedFields(fieldSet);

          const restrictedFieldIds = restrictedFields
            .map((field) => field.fieldId)
            .filter((id): id is number => id !== undefined);
          setRestrictedFieldIds(restrictedFieldIds);

          setSelectedFields(
            column2Fields
              .filter(
                (field) =>
                  field.fieldId !== undefined && field.entityId !== undefined
              )
              .map((field, idx) => ({
                fieldId: field.fieldId as number,
                isRequired: field.isRequired,
                displayOrder: idx + 1,
                entityId: entityId as number,
                placeholder: field.placeholder,
                fieldDescription: field.fieldDescription,
                attributes: field.attributes,
              }))
          );
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

  // Dynamic fields grid
  // Show both DB and local preview (if any)
  const dynamicFieldRows = chunkArray(
    previewDynamicFieldModal,
    dynamicColumnsPerRow
  );

  const renderDynamicFieldsForPreview = (
    <div className="container-fluid px-0">
      {/* DB fields preview */}
      {dynamicFieldRows.length > 0 && (
        <>
          {dynamicFieldRows.map((row, rowIdx) => (
            <div className="row" key={"db-" + rowIdx}>
              {row.map((formControl) => {
                const isFullWidth = (formControl.fieldTypeId ?? 0) == FormTypes.texteditor || (formControl.fieldTypeId ?? 0) == FormTypes.textarea || (formControl.fieldTypeId ?? 0) == FormTypes.linebreak || (formControl.fieldTypeId ?? 0) == FormTypes.selectrooms || (formControl.fieldTypeId ?? 0) == FormTypes.fieldgrouping;
                const columnClass = isFullWidth
                  ? "col-md-12"
                  : `col-md-${12 / dynamicColumnsPerRow}`;

                return (
                  <div
                    className={`${columnClass} mb-3`}
                    key={formControl.fieldKey}
                  >
                    <DynamicFields
                      divClass=""
                      containerClass="row"
                      headerClass="col-md-4"
                      inputClass="col-md-8"
                      formHook={useFormHook}
                      formControl={formControl}
                      customHandlers={{}}
                      readonly={true}
                      isDisabled={false}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      {dynamicFieldRows.length === 0 && (
        <div className="row">
          <div className="col-12">No fields to preview.</div>
        </div>
      )}
    </div>
  );

  function hasAtleastOneUserFieldInColumn2() {
    if (selectedFields.length === 0) {
      toast.error(intl.formatMessage({ id: "ATLEAST.ONE.DRAGGABLE.ITEM.REQUIRED" }));
      return false;
    } else {
      return true;
    }
  }

  function hasAtleastOneUnitSelected() {
    if (serviceFormUnits.length === 0) {
      toast.error(intl.formatMessage({ id: "LABEL.ATLEAST.ONE.UNIT.SELECTED" }));
      return false;
    }

    return true;
  }

  const onSubmit: SubmitHandler<AdminSetupServiceModel> = async (data) => {
    try {
      // if (serviceFormUnits.length === 0) {
      //   toast.error(intl.formatMessage({ id: "LABEL.ATLEAST.ONE.UNIT.SELECTED" }));
      //   throw new Error(intl.formatMessage({ id: "LABEL.ATLEAST.ONE.UNIT.SELECTED" }));
      // }

      // if (!hasAtleastOneUserFieldInColumn2()) {
      //   return false;
      // }

      const fieldsToSubmit = [
        ...selectedFields.map((f, idx) => ({
          ...f,
          serviceFormEntityId: entityId as number,
        })),
      ];

      let formDataObject: AdminSetupServiceModel = {
        serviceId: serviceId,
        serviceEntityFields: fieldsToSubmit,
        serviceFormUnits: serviceFormUnits,
        entityId: entityId,
      };

      const result = await dispatch(
        AddUpdateAdminSetupServiceFormDetails({ formDataObject })
      ).then(unwrapResult);

      if (result.statusCode === 200) {
        toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
        reset();
        if (onSuccess) onSuccess(); // Move to next step if handler provided
        return true;
      } else {
        throw new Error("Failed to save admin form");
      }
    } catch (error) {
      writeToBrowserConsole("Admin form submission error: " + error);
      return false;
    }
  };

  const onSaveAsDraft: SubmitHandler<AdminSetupServiceModel> = async (data) => {
    try {
      // if (!hasAtleastOneUserFieldInColumn2()) {
      //   toast.error(intl.formatMessage({ id: "ATLEAST.ONE.DRAGGABLE.ITEM.REQUIRED" }));
      //   return false;
      // }

      const fieldsToSubmit = [
        ...selectedFields.map((f, idx) => ({
          ...f,
          serviceFormEntityId: entityId as number,
        })),
      ];

      let formDataObject: AdminSetupServiceModel = {
        serviceId: serviceId,
        entityId: entityId,
        serviceEntityFields: fieldsToSubmit,
        serviceFormUnits: serviceFormUnits,
      };

      const result = await dispatch(
        AddUpdateAdminSetupServiceFormDetails({ formDataObject })
      ).then(unwrapResult);

      if (result.statusCode === 200) {
        toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
        reset();
        return true; // Success
      } else {
        throw new Error("Failed to save service as draft");
      }
    } catch (error) {
      writeToBrowserConsole("Save as draft error: " + error);
      return false;
    }
  };

  // Save fields after drag and reload
  const saveFieldsAndReload = async (fieldsToSave: any[]) => {
    try {
      const fieldsToSubmit = fieldsToSave.map((f, idx) => ({
        fieldId: f.fieldId,
        isRequired: f.isRequired,
        displayOrder: idx + 1,
        entityId: entityId as number,
        serviceFormEntityId: entityId as number,
        placeholder: f.placeholder,
        fieldDescription: f.fieldDescription,
        attributes: f.attributes,
      }));

      let formDataObject: AdminSetupServiceModel = {
        serviceId: serviceId,
        entityId: entityId,
        serviceEntityFields: fieldsToSubmit,
        serviceFormUnits: serviceFormUnits,
      };

      const result = await dispatch(
        AddUpdateAdminSetupServiceFormDetails({ formDataObject })
      ).then(unwrapResult);

      if (result.statusCode === 200) {
        // Reload the fields after successful save
        getMappedFieldsForEntityAndService();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      writeToBrowserConsole("Save fields and reload error: " + error);
      return false;
    }
  };

  // Silent save as draft for back button - no validation or toast messages
  const onSilentSaveAsDraft: SubmitHandler<AdminSetupServiceModel> = async (data) => {
    try {
      // Skip validation for silent save
      const fieldsToSubmit = [
        ...selectedFields.map((f, idx) => ({
          ...f,
          serviceFormEntityId: entityId as number,
        })),
      ];

      let formDataObject: AdminSetupServiceModel = {
        serviceId: serviceId,
        entityId: entityId,
        serviceEntityFields: fieldsToSubmit,
        serviceFormUnits: serviceFormUnits,
      };

      const result = await dispatch(
        AddUpdateAdminSetupServiceFormDetails({ formDataObject })
      ).then(unwrapResult);

      if (result.statusCode === 200) {
        // Silent save - no toast or reset
        toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      writeToBrowserConsole("Silent save as draft error: " + error);
      return false;
    }
  };

  const onSaveBeforeAddingNewField: SubmitHandler<
    AdminSetupServiceModel
  > = async (data) => {
    try {
      const fieldsToSubmit = [
        ...selectedFields.map((f, idx) => ({
          ...f,
          serviceFormEntityId: entityId as number,
        })),
      ];

      let formDataObject: AdminSetupServiceModel = {
        serviceId: serviceId,
        entityId: entityId,
        serviceEntityFields: fieldsToSubmit,
        serviceFormUnits: serviceFormUnits,
      };
      console.log(
        "Form Data Saved as Draft: ",
        JSON.stringify(formDataObject, null, 2)
      );

      const result = await dispatch(
        AddUpdateAdminSetupServiceFormDetails({ formDataObject })
      ).then(unwrapResult);

      if (result.statusCode === 200) {
        reset();
        return true; // Success
      } else {
        throw new Error("Failed to save service as draft");
      }
    } catch (error) {
      writeToBrowserConsole("Save as draft error: " + error);
      return false;
    }
  };

  const onPreview: SubmitHandler<AdminSetupServiceModel> = (data) => {
    if (!hasAtleastOneUserFieldInColumn2()) {
      return;
    }

    const fieldsToSubmit = [
      ...selectedFields.map((f, idx) => ({
        ...f,
        serviceFormEntityId: entityId as number,
      })),
    ];

    let formDataObject: AdminSetupServiceModel = {
      serviceId: serviceId,
      serviceEntityFields: fieldsToSubmit,
      entityId: entityId,
    };

    dispatch(PreviewAdminSetupServiceFormDetails({ formDataObject }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          var modelData = originalPromiseResult.data as DynamicFieldModel[];
          if (modelData) {
            setPreviewDynamicFieldModal(modelData);
            togglePreviewMode();
          }
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
      });
  };

  const deleteServiceUnit = (id: number, unitId: number, serviceId: number) => {
    dispatch(DeleteServiceUnit({ id, unitId, serviceId, entityId: entityId }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          ///
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
      });
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      return new Promise((resolve) => {
        handleSubmit(
          async (data) => {
            const result = await onSubmit(data);
            resolve(result);
          },
          (errors) => {
            // Form validation failed
            console.log("Admin form validation errors:", errors);
            resolve(false);
          }
        )();
      });
    },
    saveAsDraft: () => {
      return new Promise((resolve) => {
        handleSubmit(
          async (data) => {
            const result = await onSilentSaveAsDraft(data);
            resolve(result);
          },
          (errors) => {
            // For silent save, don't log errors as they're expected
            resolve(false);
          }
        )();
      });
    },
    togglePreviewMode: () => {
      handleSubmit(onPreview)();
    },
    validate: () => {
      // Check if form has validation errors and at least one field is selected
      return (
        Object.keys(errors).length === 0 &&
        hasAtleastOneUserFieldInColumn2() &&
        hasAtleastOneUnitSelected()
      );
    },
    validateUnit: () => {
      // Check if form has validation errors
      return Object.keys(errors).length === 0 && serviceFormUnits.length > 0;
    },
  }));

  return (
    <>
      <div
        className="settings-unit-list-header card my-5 px-0"
        id="unitListHeader"
      >
        {/* Header */}
        {serviceFormUnits && serviceFormUnits.length > 0 && (
          <div className="mt-0  p-2  ">
            <div className="d-flex justify-content-between px-4">
              <div className="">
                <span className="font-bold-1">
                  {" "}
                  {intl.formatMessage({ id: "LABEL.UNITNAME" })}
                </span>
              </div>
              <div className="">
                <span className="font-bold-1">
                  {" "}
                  {intl.formatMessage({ id: "LABEL.ACTION" })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* List Items */}
        {serviceFormUnits &&
          serviceFormUnits.map((item, idx) => {
            const isLast = idx === serviceFormUnits.length - 1;
            return (
              <div
                className={`d-flex justify-content-between px-5 py-2  ${isLast ? "settings-user-item-last" : "settings-user-item"
                  }`}
              >
                <div className="">
                  <span className="font-1">
                    {item.unit?.unitName || item.label}
                  </span>
                </div>
                <div className="">
                  {!readOnly && (
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={(e) => handleRemove(e, item.unitId, item.id)}
                      disabled={!!readOnly}
                      style={
                        readOnly ? { pointerEvents: "none", opacity: 0.5 } : {}
                      }
                    ></button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* --- Unit List Footer --- */}
      {!readOnly && (
        <div className="d-flex gap-4 flex-column pt-5" id="unitListFooter">
          <button
            type="button"
            onClick={(e) => toggleUnitSearchVisibility(e, true)}
            className="btn MOD_btn btn-cancel min-w-75px w-100 align-self-end px-6"
          >
            <FontAwesomeIcon icon={faPlus} size="lg" color="var(--text-2)" />
            <BtnLabelCanceltxtMedium2
              text={intl.formatMessage({ id: "BUTTON.LABEL.ADD" })}
            />
          </button>
        </div>
      )}

      {!readOnly && serviceFormUnits && serviceFormUnits.length === 0 && (
        <div className={"error"}>{intl.formatMessage({ id: "LABEL.ATLEAST.ONE.UNIT.SELECTED" })}</div>
      )}

      {/* ...existing code... */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Drag & Drop Menu Section For Admin */}
        <div className="row g-9 mb-8 mt-1">
          <div className="col-md-12 fv-row fv-plugins-icon-container">
            {predefinedFields !== undefined && (
              <DragDropComponent
                initialData={predefinedFields!}
                setSelectedFields={setSelectedFields}
                restrictedFieldIds={restrictedFieldIds}
                readOnly={readOnly}
                onSaveBeforeAddingNewField={async () => {
                  return new Promise<boolean>((resolve) => {
                    handleSubmit(
                      async (data) => {
                        const result = await onSaveBeforeAddingNewField(data);
                        resolve(result as boolean);
                      },
                      (errors) => {
                        console.log("Admin form validation errors:", errors);
                        resolve(false);
                      }
                    )();
                  });
                }}
                onRefreshFields={getMappedFieldsForEntityAndService}
                onDragEnd={saveFieldsAndReload}
                serviceId={serviceId}
                entityId={entityId}
              />
            )}
          </div>
        </div>

        {/* --- Unit Modal --- */}
        <Modal
          id="searchUnitModal"
          className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
          size="xl"
          show={showUnitPopup}
          onHide={() => setShowUnitPopup(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <HeaderLabels text={"MOD.GLOBAL.MODAL.TITLE.SEARCHUNIT"} />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <UnitTreeView
              onUnitSelect={onUnitSelect}
              selectedUnitIds={selectedUnitIds}
              selectedUnitList={serviceUnits}
              isSingleSelection={!isMultiselectUnit}
            />
          </Modal.Body>
        </Modal>

        {/* ...existing code for preview modal... */}
        <Modal
          size="xl"
          show={show}
          onHide={togglePreviewMode}
          backdrop="static"
        >
          <Modal.Header closeButton={false}>
            <Modal.Title>
              {intl.formatMessage({ id: "LABEL.PREVIEW" })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{renderDynamicFieldsForPreview}</Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              className="btn MOD_btn btn-cancel w-10"
              onClick={togglePreviewMode}
            >
              {intl.formatMessage({ id: "BUTTON.LABEL.CLOSE" })}
            </button>
          </Modal.Footer>
        </Modal>
      </form>
    </>
  );
});
