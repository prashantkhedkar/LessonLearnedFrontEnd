import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import { Column } from "./Column";
import {
  FieldLayout,
  FieldMasterModel,
} from "../../../models/global/fieldMasterModel";
import { Modal } from "react-bootstrap";
import { HeaderLabels, LabelTextSemibold2 } from "../common/formsLabels/detailLabels";
import { ManageFields } from "../../../pages/admin/new-fields/ManageFields";
import { generateUUID } from "../../utils/common";
import { useIntl } from "react-intl";
import { FormTypes } from "../dynamicFields/utils/types";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  padding: 24px 0;
  background: #fdf8f0;
  border-radius: 12px;
  min-height: 400px;
`;

// Add a styled component for restricted fields
export const RestrictedFieldItem = styled.div`
  background: #ece6dc;
  color: #333;
  border-radius: 6px;
  margin-bottom: 12px;
  padding: 6px 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  opacity: 0.85;
`;

// Styled component for column 1 fields (white background, similar style)
export const ColumnOneFieldItem = styled.div`
  background: #fff;
  color: #333;
  border-radius: 6px;
  margin-bottom: 12px;
  padding: 6px 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  opacity: 0.85;
`;

type Props = {
  initialData: FieldLayout;
  setSelectedFields: any;
  restrictedFieldIds?: number[];
  readOnly?: boolean;
  onSaveBeforeAddingNewField?: () => Promise<boolean>;
  onRefreshFields?: () => void;
  onDragEnd?: (fieldsToSave: any[]) => Promise<boolean>;
  serviceId?: number;
  entityId?: number;
};

export default function DragDropComponent({
  initialData,
  setSelectedFields,
  restrictedFieldIds = [],
  readOnly = false,
  onSaveBeforeAddingNewField,
  onRefreshFields,
  onDragEnd: onDragEndCallback,
  serviceId,
  entityId,
}: Props) {
  const [state, setState] = useState(initialData);
  const [showAddField, setShowAddField] = useState(false);
  const [showEditField, setShowEditField] = useState(false);
  const [editingField, setEditingField] = useState<FieldMasterModel | null>(null);
  const intl = useIntl();
  useEffect(() => {
    setState(initialData);
  }, [initialData]);

  const onDragEnd = async (result: any) => {
    if (readOnly) return;
    const { destination, source, draggableId } = result;
    // Restrict dragging for restricted fieldIds
    if (restrictedFieldIds.includes(Number(draggableId))) {
      return;
    }

    if (
      source.droppableId === "2" &&
      ((destination && destination.droppableId === "1") || !destination)
    ) {
      const start = state.columns.find((x) => x.id === source.droppableId);
      if (!start) return;
      const draggedField = start.fields[source.index];
      if ((draggedField?.fieldTypeId ?? 0) == FormTypes.linebreak) {
        const newFields = Array.from(start.fields);
        newFields.splice(source.index, 1);
        const newStart = { ...start, fields: newFields };
        const newState = {
          ...state,
          columns: state.columnOrder.map((colId) => {
            if (colId === start.id) return newStart;
            return state.columns.find((x) => x.id === colId)!;
          }),
        };
        setState(newState);
        const orderedArray: FieldMasterModel[] = [];
        newState.columns
          .filter((column) => column.id == "2")[0]
          .fields.forEach((field, index) => {
            const item = {
              fieldId: field.fieldId,
              isRequired: field.isRequired,
              displayOrder: index + 1,
              entityId: field.entityId,
              placeholder: field.placeholder,
              fieldDescription: field.fieldDescription,
              attributes: field.attributes,
            };
            orderedArray.push(item);
          });
        setSelectedFields(orderedArray);

        // Call the save API if callback is provided
        if (onDragEndCallback && orderedArray.length >= 0) {
          try {
            await onDragEndCallback(orderedArray);
          } catch (error) {
            console.log("Error saving fields after drag:", error);
          }
        }
        return;
      }
    }

    if (!destination) {
      return;
    }

    // Prevent reordering within column 1 (id === "1")
    if (source.droppableId === "1" && destination.droppableId === "1") {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = state.columns.find((x) => x.id === source.droppableId);
    const finish = state.columns.find((x) => x.id === destination.droppableId);

    if (!start || !finish) return;

    if (finish.id === "2") {
      // Use unique variable names to avoid redeclaration
      const finishFields2 = finish.fields;
      let lastRestrictedIdx2 = -1;
      if (restrictedFieldIds.length > 0) {
        for (let i = 0; i < finishFields2.length; i++) {
          const fieldId = finishFields2[i].fieldId;
          if (
            typeof fieldId === "number" &&
            restrictedFieldIds.includes(fieldId)
          ) {
            lastRestrictedIdx2 = i;
          }
        }
      }
      const finishFields = finish.fields;
      let lastRestrictedIdx = -1;
      for (let i = 0; i < finishFields.length; i++) {
        const fieldId = finishFields[i].fieldId;
        if (
          typeof fieldId === "number" &&
          restrictedFieldIds.includes(fieldId)
        ) {
          lastRestrictedIdx = i;
        }
      }

      // 1) If moving from column 1 to column 2
      if (start.id !== finish.id) {
        // Only allow dropping after the last restricted field
        let insertIndex = destination.index;
        if (insertIndex <= lastRestrictedIdx2) {
          insertIndex = lastRestrictedIdx2 + 1;
        }

        const draggedField = start.fields[source.index];
        if (!draggedField) return;

        if ((draggedField.fieldTypeId ?? 0) == FormTypes.linebreak) {
          const finishFieldIds2 = Array.from(finish.fields);
          const newGuid =
            typeof window !== "undefined" && generateUUID
              ? generateUUID()
              : typeof generateUUID !== "undefined"
                ? generateUUID()
                : Math.random().toString(36).substring(2);
          finishFieldIds2.splice(insertIndex, 0, {
            ...draggedField,
            guid: newGuid,
            isRequired: false,
            displayOrder: 0,
          });
          const newFinish = { ...finish, fields: finishFieldIds2 };
          const newState = {
            ...state,
            columns: state.columnOrder.map((colId) => {
              if (colId === finish.id) return newFinish;
              return state.columns.find((x) => x.id === colId)!;
            }),
          };
          setState(newState);
          const orderedArray: FieldMasterModel[] = [];
          newState.columns
            .filter((column) => column.id == "2")[0]
            .fields.forEach((field, index) => {
              const item = {
                fieldId: field.fieldId,
                isRequired: field.isRequired,
                displayOrder: index + 1,
                entityId: field.entityId,
                placeholder: field.placeholder,
                fieldDescription: field.fieldDescription,
                attributes: field.attributes,
              };
              orderedArray.push(item);
            });
          setSelectedFields(orderedArray);

          // Call the save API if callback is provided (custom field drag)
          if (onDragEndCallback && orderedArray.length >= 0) {
            try {
              await onDragEndCallback(orderedArray);
            } catch (error) {
              console.log("Error saving fields after drag:", error);
            }
          }
          return;
        }

        const startFieldIds = Array.from(start.fields);
        startFieldIds.splice(source.index, 1);
        const newStart = { ...start, fields: startFieldIds };
        const finishFieldIds2 = Array.from(finish.fields);
        finishFieldIds2.splice(insertIndex, 0, {
          ...draggedField,
          isRequired: false,
          displayOrder: 0,
        });
        const newFinish = { ...finish, fields: finishFieldIds2 };
        const newState = {
          ...state,
          columns: state.columnOrder.map((colId) => {
            if (colId === start.id) return newStart;
            if (colId === finish.id) return newFinish;
            return state.columns.find((x) => x.id === colId)!;
          }),
        };
        setState(newState);
        const orderedArray: FieldMasterModel[] = [];
        newState.columns
          .filter((column) => column.id == "2")[0]
          .fields.forEach((field, index) => {
            const item = {
              fieldId: field.fieldId,
              isRequired: field.isRequired,
              displayOrder: index + 1,
              entityId: field.entityId,
              placeholder: field.placeholder,
              fieldDescription: field.fieldDescription,
              attributes: field.attributes,
            };
            orderedArray.push(item);
          });
        setSelectedFields(orderedArray);

        // Call the save API if callback is provided (normal field drag)
        if (onDragEndCallback && orderedArray.length >= 0) {
          try {
            await onDragEndCallback(orderedArray);
          } catch (error) {
            console.log("Error saving fields after drag:", error);
          }
        }
        return;
      }
      // 2) If moving within Column 2, handle both restricted and unrestricted cases
      if (start.id === finish.id && finish.id === "2") {
        // If there are restricted fields, only allow reordering among non-restricted items
        if (restrictedFieldIds.length > 0) {
          const draggedField = start.fields[source.index];
          if (
            typeof draggedField.fieldId === "number" &&
            restrictedFieldIds.includes(draggedField.fieldId)
          ) {
            return;
          }
          if (destination.index <= lastRestrictedIdx2) {
            return;
          }
          const nonRestrictedFields = start.fields.slice(
            lastRestrictedIdx2 + 1
          );
          const nonRestrictedSourceIdx =
            source.index - (lastRestrictedIdx2 + 1);
          const nonRestrictedDestIdx =
            destination.index - (lastRestrictedIdx2 + 1);
          if (nonRestrictedSourceIdx < 0 || nonRestrictedDestIdx < 0) {
            return;
          }
          const updatedNonRestricted = Array.from(nonRestrictedFields);
          const [removed] = updatedNonRestricted.splice(
            nonRestrictedSourceIdx,
            1
          );
          updatedNonRestricted.splice(nonRestrictedDestIdx, 0, removed);
          const newFields = [
            ...start.fields.slice(0, lastRestrictedIdx2 + 1),
            ...updatedNonRestricted,
          ];
          const newStart = { ...start, fields: newFields };
          const newState = {
            ...state,
            columns: state.columnOrder.map((colId) => {
              if (colId === start.id) return newStart;
              return state.columns.find((x) => x.id === colId)!;
            }),
          };
          setState(newState);
          const orderedArray: FieldMasterModel[] = [];
          newState.columns
            .filter((column) => column.id == "2")[0]
            .fields.forEach((field, index) => {
              const item = {
                fieldId: field.fieldId,
                isRequired: field.isRequired,
                displayOrder: index + 1,
                entityId: field.entityId,
                placeholder: field.placeholder,
                fieldDescription: field.fieldDescription,
                attributes: field.attributes,
              };
              orderedArray.push(item);
            });
          setSelectedFields(orderedArray);

          // Call the save API if callback is provided (restricted field reorder)
          if (onDragEndCallback && orderedArray.length >= 0) {
            try {
              await onDragEndCallback(orderedArray);
            } catch (error) {
              console.log("Error saving fields after drag:", error);
            }
          }
          return;
        } else {
          // No restricted fields: allow normal reordering in column 2
          const newFields = Array.from(start.fields);
          const [removed] = newFields.splice(source.index, 1);
          newFields.splice(destination.index, 0, removed);
          const newStart = { ...start, fields: newFields };
          const newState = {
            ...state,
            columns: state.columnOrder.map((colId) => {
              if (colId === start.id) return newStart;
              return state.columns.find((x) => x.id === colId)!;
            }),
          };
          setState(newState);
          const orderedArray: FieldMasterModel[] = [];
          newState.columns
            .filter((column) => column.id == "2")[0]
            .fields.forEach((field, index) => {
              const item = {
                fieldId: field.fieldId,
                isRequired: field.isRequired,
                displayOrder: index + 1,
                entityId: field.entityId,
                placeholder: field.placeholder,
                fieldDescription: field.fieldDescription,
                attributes: field.attributes,
              };
              orderedArray.push(item);
            });
          setSelectedFields(orderedArray);

          // Call the save API if callback is provided (unrestricted field reorder)
          if (onDragEndCallback && orderedArray.length >= 0) {
            try {
              await onDragEndCallback(orderedArray);
            } catch (error) {
              console.log("Error saving fields after drag:", error);
            }
          }
          return;
        }
      }
    }

    const startFieldIds = Array.from(start!.fields);
    startFieldIds.splice(source.index, 1);

    const newStart = {
      ...start,
      fields: startFieldIds,
    };

    const draggedField = state.fields.find(
      (f) => f.fieldId === Number(draggableId)
    );
    if (!draggedField) return;
    const finishFieldIds = Array.from(finish!.fields);
    // When dragging from Column 1 to Column 2, set isRequired to false by default
    finishFieldIds.splice(destination.index, 0, {
      ...draggedField,
      isRequired: false,
      displayOrder: 0,
    });
    const newFinish = {
      ...finish,
      fields: finishFieldIds,
    };

    const newState = {
      ...state,
      columns: state.columnOrder.map((colId) => {
        if (colId === start.id) return newStart;
        if (colId === finish.id) return newFinish;
        return state.columns.find((x) => x.id === colId)!;
      }),
    };

    setState(newState);
    const orderedArray: FieldMasterModel[] = [];
    newState.columns
      .filter((column) => column.id == "2")[0]
      .fields.forEach((field, index) => {
        const item = {
          fieldId: field.fieldId,
          isRequired: field.isRequired,
          displayOrder: index + 1,
          entityId: field.entityId, // include entityId if present
          placeholder: field.placeholder,
          fieldDescription: field.fieldDescription,
          attributes: field.attributes,
        };
        orderedArray.push(item);
      });

    setSelectedFields(orderedArray);

    // Call the save API if callback is provided
    if (onDragEndCallback && orderedArray.length >= 0) {
      try {
        await onDragEndCallback(orderedArray);
      } catch (error) {
        console.log("Error saving fields after drag:", error);
      }
    }
  };

  const handleEditField = (field: FieldMasterModel) => {
    setEditingField(field);
    setShowEditField(true);
  };

  const toggleCheckbox = (fieldId: number, required: boolean) => {
    // Update isRequired for the field and preserve the correct displayOrder
    const column = state.columns.find((column) => column.id == "2");
    if (!column) return;

    // Map through fields, update isRequired, preserve displayOrder
    const updatedFields = column.fields.map((field) => {
      if (field.fieldId === fieldId) {
        return { ...field, isRequired: required };
      }
      return field;
    });

    // Update the column with new fields
    const updatedColumn = { ...column, fields: updatedFields };

    // Update the state to reflect the change
    const newState = {
      ...state,
      columns: state.columns.map((col) => {
        if (col.id === "2") return updatedColumn;
        return col;
      }),
    };
    setState(newState);

    // Rebuild orderedArray with correct displayOrder
    const orderedArray: FieldMasterModel[] = updatedFields.map(
      (field, index) => ({
        fieldId: field.fieldId,
        isRequired: field.isRequired,
        displayOrder: index + 1,
        entityId: field.entityId, // include entityId if present
        placeholder: field.placeholder,
        fieldDescription: field.fieldDescription,
        attributes: field.attributes,
      })
    );
    setSelectedFields(orderedArray);
  };

  return (
    <>
      {/* {
        "readOnly : " + JSON.stringify(readOnly)
      } */}
      {readOnly ? (
        <Container>
          <div className="row w-100 m-0">
            {/* First column (left) */}
            {state.columns && state.columns[0] && (
              <div className="col-6">
                <span className="lbl-txt-semibold-1" style={{ padding: "8px" }}>
                  {intl.formatMessage({ id: state.columns[0].title })}
                </span>

                <div style={{ maxHeight: 800, overflowY: "auto" }}>
                  <Column
                    column={state.columns[0]}
                    fields={state.columns[0].fields as FieldMasterModel[]}
                    toggleCheckbox={toggleCheckbox}
                    restrictedFieldIds={restrictedFieldIds}
                    readOnly={true}
                    onEditField={handleEditField}
                  />
                </div>
              </div>
            )}
            {/* Last column (right) */}
            {state.columns && state.columns[1] && (
              <div className="col-6">
                {/* <h3 style={{ padding: "8px" }}>{state.columns[1].title}222</h3> */}
                <div className="row">
                  <div className="col-6">
                    <span
                      className="lbl-txt-semibold-1"
                      style={{ padding: "8px" }}
                    >
                      {intl.formatMessage({ id: state.columns[1].title })}
                    </span>
                  </div>
                  <div className="col-6 text-end ">
                    <span
                      className="lbl-txt-semibold-1"
                      style={{ padding: "8px 8px 8px 18px" }}
                    >
                      {intl.formatMessage({ id: "LABEL.MENDETORY" })}
                    </span>
                  </div>
                </div>
                <div style={{ maxHeight: 800, overflowY: "auto" }}>
                  <Column
                    column={state.columns[1]}
                    fields={state.columns[1].fields as FieldMasterModel[]}
                    toggleCheckbox={toggleCheckbox}
                    restrictedFieldIds={restrictedFieldIds}
                    readOnly={true}
                    onEditField={handleEditField}
                  />
                </div>
              </div>
            )}
          </div>
        </Container>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Container>
            <div className="row w-100 m-0">
              {/* First column (left) */}
              {state.columns && state.columns[0] && (
                <div
                  className="col"
                  style={{ borderLeft: "1px solid #E0C59A" }}
                >
                  <span
                    className="lbl-txt-semibold-1"
                    style={{ padding: "8px" }}
                  >
                    {intl.formatMessage({ id: state.columns[0].title })}
                  </span>
                  <div style={{ maxHeight: 800, overflowY: "auto" }}>
                    <Column
                      column={state.columns[0]}
                      fields={state.columns[0].fields as FieldMasterModel[]}
                      toggleCheckbox={toggleCheckbox}
                      restrictedFieldIds={restrictedFieldIds}
                      readOnly={false}
                      onEditField={handleEditField}
                    />
                  </div>
                </div>
              )}
              {/* Middle column (spacer) */}
              <div className="col-3 d-flex align-items-center justify-content-center">
                <button
                  id="add-new-field-button"
                  type="button"
                  style={{
                    // width: '100%',
                    borderRadius: 8,
                    background: "rgb(253, 248, 240)",
                    border: "1px solid #B7945A",
                    boxShadow: "0 1px 2px rgba(6, 25, 56, 0.05)",
                    padding: "8px 20px",
                    textAlign: "center",
                    // fontFamily: "Frutiger LT Arabic, Arial, sans-serif",
                    fontWeight: 700,
                    color: "#1F2937",
                    fontSize: 14,
                    lineHeight: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={async (e) => {
                    e.preventDefault();

                    // Call onSaveBeforeAddingNewField if provided
                    if (onSaveBeforeAddingNewField) {
                      const saveResult = await onSaveBeforeAddingNewField();
                      setShowAddField(true);
                    }
                  }}
                >
                  <LabelTextSemibold2 text={intl.formatMessage({ id: "LABEL.ADDNEWFIELDS" })} />
                </button>
              </div>
              {/* Last column (right) */}
              {state.columns && state.columns[1] && (
                <div
                  className="col"
                  style={{ borderRight: "1px solid #E0C59A" }}
                >
                  <div className="row">
                    <div className="col-6">
                      <span
                        className="lbl-txt-semibold-1"
                        style={{ padding: "8px" }}
                      >
                        {intl.formatMessage({ id: state.columns[1].title })}
                      </span>
                    </div>
                    <div className="col-6 text-end ">
                      <span
                        className="lbl-txt-semibold-1"
                        style={{ padding: "8px 8px 8px 18px" }}
                      >
                        {intl.formatMessage({ id: "LABEL.MENDETORY" })}
                      </span>
                    </div>
                  </div>

                  <div style={{ maxHeight: 800, overflowY: "auto" }}>
                    <Column
                      column={state.columns[1]}
                      fields={state.columns[1].fields as FieldMasterModel[]}
                      toggleCheckbox={toggleCheckbox}
                      restrictedFieldIds={restrictedFieldIds}
                      readOnly={false}
                      onEditField={handleEditField}
                    />
                  </div>
                </div>
              )}
            </div>
          </Container>
        </DragDropContext>
      )}

      <Modal
        className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
        backdrop="static"
        size="xl"
        show={showAddField}
        onHide={() => setShowAddField(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <HeaderLabels text={"BUTTON.LABEL.ADDFIELD"} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManageFields
            onClose={() => {
              setShowAddField(false);
              if (onRefreshFields) {
                onRefreshFields();
              }
            }}
            serviceId={serviceId}
            entityId={entityId}
          />
        </Modal.Body>
      </Modal>

      <Modal
        className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
        backdrop="static"
        size="xl"
        show={showEditField}
        onHide={() => {
          setShowEditField(false);
          setEditingField(null);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <HeaderLabels text={"LABEL.EDITFIELD"} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManageFields
            fieldToEdit={editingField}
            isEditMode={true}
            onClose={() => {
              setShowEditField(false);
              setEditingField(null);
              if (onRefreshFields) {
                onRefreshFields();
              }
            }}
            serviceId={serviceId}
            entityId={entityId}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
