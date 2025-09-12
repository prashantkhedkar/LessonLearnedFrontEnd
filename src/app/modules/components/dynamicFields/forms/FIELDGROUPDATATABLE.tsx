import { useMemo, useState, useEffect } from "react";
import { FormModel, IFormProps, DynamicFieldModel, FormTypes, ManageAttributeConfigForNewFieldModel } from "../utils/types";
import { FieldPath, RegisterOptions, useForm, UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";
import { BtnLabelCanceltxtMedium2, BtnLabeltxtMedium2, DetailLabels, ErrorLabel, HeaderLabels, InfoLabels } from "../../common/formsLabels/detailLabels";
import DynamicFields from "../DynamicFields";
import { Modal } from "react-bootstrap";
import { generateUUID } from "../../../utils/common";

interface FieldGroupDataTableProps<T extends FormModel> extends IFormProps<T> {
    formControl: DynamicFieldModel | ManageAttributeConfigForNewFieldModel;
}

/**
 * FIELDGROUPDATATABLE Component
 * 
 * This component manages a data table with dynamic fields and provides structured output data.
 * 
 * Data Structure Output:
 * The component outputs data in the following structured format to maintain row boundaries:
 * {
 *   totalRows: number,           // Total number of rows in the table
 *   columnsPerRow: number,       // Number of columns (fields) per row
 *   rows: [                     // Array of row objects
 *     {
 *       rowIndex: number,        // 0-based index of the row
 *       rowId: string,           // Unique identifier for the row
 *       fields: [                // Array of field objects for this row
 *         {
 *           fieldId: string,     // Field identifier
 *           fieldValue: any      // Field value (sanitized)
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * This structure allows consumers to easily distinguish between rows and columns,
 * unlike the previous flattened array approach.
 */
export const FIELDGROUPDATATABLE = <T extends FormModel>({
    divClass,
    containerClass,
    inputClass,
    headerClass,
    formControl,
    formHook,
    customHandlers,
    readonly
}: FieldGroupDataTableProps<T>) => {
    const [validatorSchema, setValidatorSchema] = useState<RegisterOptions<T, FieldPath<T>>>({});
    const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
    const fieldKey = formControl.fieldKey as FieldPath<T>;
    const intl = useIntl();

    // State for table data and column definitions
    const [tableData, setTableData] = useState<any[]>([]);
    const [columnDefinitions, setColumnDefinitions] = useState<DynamicFieldModel[]>([]);

    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<string | null>(null);

    // Form hook for table rows validation - using any type to avoid TypeScript issues
    const tableFormHook: UseFormReturn<any> = useForm<any>({
        mode: "onChange",
        defaultValues: {}
    });

    // Get field label based on the type of formControl
    const getFieldLabel = () => {
        if ('fieldLabel' in formControl && formControl.fieldLabel) {
            return formControl.fieldLabel;
        } else if ('fieldTypeName' in formControl && formControl.fieldTypeName) {
            return formControl.fieldTypeName;
        } else if ('description' in formControl && formControl.description) {
            return formControl.description;
        }
        return 'Field Group Data Table';
    };

    const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

    // Initialize field value and register with parent form
    useMemo(() => {
        // Set initial value from fieldValue if available
        if (fieldValue !== undefined && formHook.getValues(fieldKey) === undefined) {
            formHook.setValue(fieldKey, fieldValue as any);
        }
        // Also set defaultValue if no fieldValue and field has defaultValue
        else if (fieldValue === undefined && 'defaultValue' in formControl && formControl.defaultValue !== undefined && formControl.defaultValue !== null && formControl.defaultValue !== "" && formHook.getValues(fieldKey) === undefined) {
            formHook.setValue(fieldKey, formControl.defaultValue as any);
        }
        // Initialize with empty array if no value exists
        else if (formHook.getValues(fieldKey) === undefined) {
            formHook.setValue(fieldKey, [] as any);
        }
    }, [fieldValue, fieldKey, formHook, formControl]);

    // Sync tableData with parent form whenever it changes
    useEffect(() => {
        // Transform tableData into row-wise structure to maintain row boundaries
        const transformedTableData = tableData.map((row, rowIndex) => {
            // Convert each row into an array of field objects
            const rowFields: Array<{ fieldId: string, fieldValue: any }> = [];

            columnDefinitions.forEach(col => {
                const value = row[col.fieldKey];
                let sanitizedValue = value;

                // Sanitize the value to ensure no DOM references or circular references
                if (value !== null && value !== undefined && typeof value === 'object') {
                    // Check if it's a DOM element
                    if (value.nodeType) {
                        console.warn('DOM element detected in table data, using default value instead');
                        sanitizedValue = getDefaultValueForFieldType(col.fieldTypeId);
                    }
                    // Check if it's an event object with target property
                    else if (value.target && value.type) {
                        // Extract the actual value from the event object
                        sanitizedValue = value.target.value !== undefined ? value.target.value :
                            value.target.checked !== undefined ? value.target.checked :
                                getDefaultValueForFieldType(col.fieldTypeId);
                    }
                    // Check for circular references
                    else {
                        try {
                            JSON.stringify(value);
                            sanitizedValue = value;
                        } catch (e) {
                            console.warn('Circular reference detected in table data, using default value instead');
                            sanitizedValue = getDefaultValueForFieldType(col.fieldTypeId);
                        }
                    }
                }

                // Add the field to the row array
                rowFields.push({
                    fieldId: String(col.fieldId),
                    fieldValue: sanitizedValue
                });
            });

            // Return row data with row metadata
            return {
                rowIndex: rowIndex,
                rowId: row.id,
                fields: rowFields
            };
        });

        // Structure data to preserve row boundaries instead of flattening
        const structuredData = {
            totalRows: transformedTableData.length,
            columnsPerRow: columnDefinitions.length,
            rows: transformedTableData
        };

        // Only update if the data has actually changed to prevent unnecessary re-renders
        const currentValue = formHook.getValues(fieldKey);
        if (JSON.stringify(currentValue) !== JSON.stringify(structuredData)) {
            formHook.setValue(fieldKey, structuredData as any);
        }
    }, [tableData, columnDefinitions, formHook, fieldKey]);

    // Initialize table data and columns from formControl.fieldGroup or from a JSON string in fieldValue
    useEffect(() => {
        if ('fieldGroup' in formControl && formControl.fieldGroup && Array.isArray(formControl.fieldGroup)) {
            console.log('FIELDGROUPDATATABLE: Processing fieldGroup:', formControl.fieldGroup);

            // Filter out unsupported field types (linebreak and fieldgrouping)
            const supportedColumns = formControl.fieldGroup.filter(
                (field: any) => field.fieldTypeId !== FormTypes.linebreak &&
                    field.fieldTypeId !== FormTypes.fieldgrouping
            ).map((field: any, index: number) => ({
                mappingId: field.fieldId ? String(field.fieldId) : String(index),
                fieldKey: field.guid || `field_${field.fieldId || index}`,
                serviceId: "",
                fieldId: field.fieldId || index,
                fieldTypeId: field.fieldTypeId,
                fieldLabel: field.fieldLabel || field.fieldLabelAr,
                serviceFieldOption: field.fieldOptions || [],
                isRequired: field.isRequired || false,
                defaultValue: field.fieldValue || "",
                placeholder: field.placeholder || "",
                attributes: typeof field.attributes === 'string' ? JSON.parse(field.attributes || '{}') : (field.attributes || {}),
                fieldDescription: field.fieldDescription || "",
                fieldValue: field.fieldValue
            } as DynamicFieldModel));

            setColumnDefinitions(supportedColumns);
            // If formControl.fieldValue contains JSON structured data, parse and populate tableData from it
            let initializedFromFieldValue = false;
            if (fieldValue !== undefined && fieldValue !== null) {
                try {
                    const parsed = typeof fieldValue === 'string' ? JSON.parse(fieldValue) : fieldValue;
                    // Support two shapes: { rows: [...] } or { fieldValue: { rows: [...] } }
                    const structured = (parsed && parsed.rows && Array.isArray(parsed.rows)) ? parsed : (parsed && parsed.fieldValue && parsed.fieldValue.rows && Array.isArray(parsed.fieldValue.rows) ? parsed.fieldValue : null);
                    if (structured) {
                        const parsedRows = structured.rows.map((r: any, idx: number) => {
                            const rowId = r.rowId || `row_parsed_${idx}_${Date.now()}`;
                            const rowObj: any = { id: rowId };

                            // For each column pick the matching field value from parsed row.fields
                            supportedColumns.forEach(col => {
                                const fieldMatch = (r.fields || []).find((f: any) => String(f.fieldId) === String(col.fieldId));
                                const value = fieldMatch ? fieldMatch.fieldValue : getDefaultValueForFieldType(col.fieldTypeId);
                                rowObj[col.fieldKey] = value;

                                // register cell in tableFormHook
                                const cellKey = `${rowId}_${col.fieldKey}`;
                                tableFormHook.setValue(cellKey as any, value);
                            });

                            return rowObj;
                        });

                        if (parsedRows.length > 0) {
                            setTableData(parsedRows);
                            // Ensure parent form value reflects the structured data (use resolved structured shape)
                            formHook.setValue(formControl.fieldKey as FieldPath<T>, structured as any);
                            initializedFromFieldValue = true;
                        }
                    }
                } catch (e) {
                    console.warn('FIELDGROUPDATATABLE: Failed to parse fieldValue JSON, falling back to default initialization', e);
                }
            }

            // Initialize with one empty row if no data exists from fieldValue and there are columns
            if (!initializedFromFieldValue && tableData.length === 0 && supportedColumns.length > 0) {
                const newRowId = `row_${Date.now()}_${Math.random()}`;
                const newRow = {
                    id: newRowId,
                    ...supportedColumns.reduce((acc, col) => {
                        acc[col.fieldKey] = getDefaultValueForFieldType(col.fieldTypeId);
                        return acc;
                    }, {} as any)
                };

                const initialData = [newRow];
                setTableData(initialData);

                // Register form fields for the new row
                supportedColumns.forEach(col => {
                    const fieldKey = `${newRowId}_${col.fieldKey}`;
                    tableFormHook.setValue(fieldKey as any, getDefaultValueForFieldType(col.fieldTypeId));
                });

                // Update parent form with initial data in structured format
                const initialStructuredData = {
                    totalRows: 1,
                    columnsPerRow: supportedColumns.length,
                    rows: [{
                        rowIndex: 0,
                        rowId: newRowId,
                        fields: supportedColumns.map(col => ({
                            fieldId: String(col.fieldId),
                            fieldValue: getDefaultValueForFieldType(col.fieldTypeId)
                        }))
                    }]
                };
                formHook.setValue(formControl.fieldKey as FieldPath<T>, initialStructuredData as any);
            }
        } else {
            console.warn('FIELDGROUPDATATABLE: No fieldGroup found in formControl', formControl);
            setColumnDefinitions([]);
            setTableData([]);
        }
    }, ['fieldGroup' in formControl ? formControl.fieldGroup : null, fieldValue]);

    // Set up validation schema for the group
    useMemo(() => {
        let schema: RegisterOptions<T, FieldPath<T>> = {};

        for (const [key, value] of Object.entries(formControl)) {
            switch (key) {
                case 'isRequired':
                    if (value) {
                        schema.required = `${intl.formatMessage({ id: "LABEL.REQUIRED" })}`;
                        schema.validate = {
                            tableDataRequired: (value: any) => {
                                if (!value || typeof value !== 'object' || !value.rows || !Array.isArray(value.rows) || value.rows.length === 0) {
                                    return `${intl.formatMessage({ id: "LABEL.REQUIRED" })}`;
                                }
                                // Check if at least one field in any row has meaningful data
                                const hasData = value.rows.some((row: any) =>
                                    row.fields && Array.isArray(row.fields) &&
                                    row.fields.some((field: any) =>
                                        field.fieldValue !== '' &&
                                        field.fieldValue !== null &&
                                        field.fieldValue !== undefined &&
                                        (typeof field.fieldValue !== 'string' || field.fieldValue.trim() !== '')
                                    )
                                );
                                if (!hasData) {
                                    return `${intl.formatMessage({ id: "LABEL.REQUIRED" })}`;
                                }
                                return true;
                            },
                            tableDataValidation: (value: any) => {
                                if (!value || typeof value !== 'object' || !value.rows || !Array.isArray(value.rows)) return true;

                                // The value now has structured data with rows array
                                for (const row of value.rows) {
                                    if (!row.fields || !Array.isArray(row.fields)) continue;

                                    // Check each required field in this row
                                    for (const col of columnDefinitions) {
                                        if (col.isRequired) {
                                            const fieldData = row.fields.find((field: any) =>
                                                String(field.fieldId) === String(col.fieldId)
                                            );

                                            if (!fieldData ||
                                                fieldData.fieldValue === '' ||
                                                fieldData.fieldValue === null ||
                                                fieldData.fieldValue === undefined ||
                                                (typeof fieldData.fieldValue === 'string' && fieldData.fieldValue.trim() === '')) {
                                                return `Row ${row.rowIndex + 1}: ${col.fieldLabel} is required`;
                                            }
                                        }
                                    }
                                }
                                return true;
                            }
                        };
                    }
                    break;
            }
        }

        setValidatorSchema(schema);
    }, [formControl, intl, columnDefinitions]);

    // Get default value based on field type
    const getDefaultValueForFieldType = (fieldTypeId: number): any => {
        switch (fieldTypeId) {
            case FormTypes.text:
            case FormTypes.textarea:
            case FormTypes.texteditor:
            case FormTypes.email:
            case FormTypes.url:
                return '';
            case FormTypes.number:
            case FormTypes.decimal:
                return 0;
            case FormTypes.checkbox:
                return false;
            case FormTypes.dropdownlist:
            case FormTypes.radiogroup:
            case FormTypes.autocompletedropdownlist:
                return '';
            case FormTypes.date:
            case FormTypes.time:
                return null;
            default:
                return '';
        }
    };

    // Add new row to the table
    const addNewRow = () => {
        // Check if we've reached the maximum limit of 10 rows
        if (tableData.length >= 10) {
            console.warn('Maximum of 10 rows allowed');
            return;
        }

        const newRowId = `row_${Date.now()}_${Math.random()}`;
        const newRow = {
            id: newRowId,
            ...columnDefinitions.reduce((acc, col) => {
                acc[col.fieldKey] = getDefaultValueForFieldType(col.fieldTypeId);
                return acc;
            }, {} as any)
        };

        const updatedData = [...tableData, newRow];
        setTableData(updatedData);

        // Register form fields for the new row
        columnDefinitions.forEach(col => {
            const fieldKey = `${newRowId}_${col.fieldKey}`;
            tableFormHook.setValue(fieldKey as any, getDefaultValueForFieldType(col.fieldTypeId));
        });

        // Update parent form with new table data
        formHook.setValue(formControl.fieldKey as FieldPath<T>, updatedData as any, {
            shouldValidate: true,
            shouldDirty: true
        });
    };

    // Show delete confirmation modal
    const showDeleteConfirmation = (rowId: string) => {
        setRowToDelete(rowId);
        setShowDeleteModal(true);
    };

    // Confirm delete row
    const confirmDeleteRow = () => {
        if (rowToDelete) {
            const updatedData = tableData.filter(row => row.id !== rowToDelete);
            setTableData(updatedData);

            // Unregister form fields for the removed row
            columnDefinitions.forEach(col => {
                const fieldKey = `${rowToDelete}_${col.fieldKey}`;
                tableFormHook.unregister(fieldKey as any);
            });

            // Update parent form with updated table data
            formHook.setValue(formControl.fieldKey as FieldPath<T>, updatedData as any, {
                shouldValidate: true,
                shouldDirty: true
            });
        }

        setShowDeleteModal(false);
        setRowToDelete(null);
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setRowToDelete(null);
    };

    // Update field value in table data
    const updateFieldValue = (rowId: string, fieldKey: string, value: any) => {
        // Sanitize the value to ensure no DOM references
        let sanitizedValue = value;
        if (value !== null && value !== undefined && typeof value === 'object') {
            // Check if it's a DOM element
            if (value.nodeType) {
                console.warn('DOM element detected in table data, using default value instead');
                const columnDef = columnDefinitions.find(col => col.fieldKey === fieldKey);
                sanitizedValue = columnDef ? getDefaultValueForFieldType(columnDef.fieldTypeId) : '';
            }
            // Check for circular references
            else {
                try {
                    JSON.stringify(value);
                    sanitizedValue = value;
                } catch (e) {
                    console.warn('Circular reference detected in table data, using default value instead');
                    const columnDef = columnDefinitions.find(col => col.fieldKey === fieldKey);
                    sanitizedValue = columnDef ? getDefaultValueForFieldType(columnDef.fieldTypeId) : '';
                }
            }
        }

        const updatedData = tableData.map(row =>
            row.id === rowId
                ? { ...row, [fieldKey]: sanitizedValue }
                : row
        );

        setTableData(updatedData);

        // Update parent form with updated table data and trigger validation
        formHook.setValue(formControl.fieldKey as FieldPath<T>, updatedData as any, {
            shouldValidate: true,
            shouldDirty: true
        });
    };

    // Create custom handlers for table cells
    const createCellCustomHandlers = (rowId: string, fieldKey: string) => {
        return {
            onChangeText: (event: any) => {
                const value = event?.target?.value || event;
                updateFieldValue(rowId, fieldKey, typeof value === 'string' ? value : '');
            },
            onChangeNumber: (event: any) => {
                const value = event?.target?.value || event;
                updateFieldValue(rowId, fieldKey, typeof value === 'number' ? value : (typeof value === 'string' ? Number(value) || 0 : 0));
            },
            onChangeEmail: (event: any) => {
                const value = event?.target?.value || event;
                updateFieldValue(rowId, fieldKey, typeof value === 'string' ? value : '');
            },
            onChangeTextArea: (event: any) => {
                const value = event?.target?.value || event;
                updateFieldValue(rowId, fieldKey, typeof value === 'string' ? value : '');
            },
            onChangeTextEditor: (event: any) => {
                const value = event?.target?.value || event;
                updateFieldValue(rowId, fieldKey, typeof value === 'string' ? value : '');
            },
            onChangeDropDownList: (value: any) => {
                // For dropdown, value might be an object with value property
                const cleanValue = value?.value !== undefined ? value.value : value;
                updateFieldValue(rowId, fieldKey, cleanValue);
            },
            onChangeRadioGroup: (value: any) => {
                const cleanValue = value?.target?.value || value;
                updateFieldValue(rowId, fieldKey, cleanValue);
            },
            onChangeCheckbox: (event: any) => {
                const value = event?.target?.checked !== undefined ? event.target.checked : event;
                updateFieldValue(rowId, fieldKey, Boolean(value));
            },
            onChangeAutoDropDownList: (value: any) => {
                // For autocomplete dropdown, extract the actual value
                const cleanValue = Array.isArray(value) ? value.map(item => item?.value || item) : (value?.value || value);
                updateFieldValue(rowId, fieldKey, cleanValue);
            },
            onChangeDate: (value: any) => {
                // Date value should be a date string or null
                updateFieldValue(rowId, fieldKey, value);
            },
            onChangeTime: (value: any) => {
                // Time value should be a time string or null
                updateFieldValue(rowId, fieldKey, value);
            },
            // Additional handlers for other field types
            onBeforeChangeTextArea: customHandlers?.onBeforeChangeTextArea,
            onBlurTextArea: customHandlers?.onBlurTextArea,
            // Don't spread customHandlers after our onChange handlers to avoid conflicts
        };
    };

    // Render dynamic fields as table columns
    const renderDataTable = () => {
        if (columnDefinitions.length === 0) {
            return (
                <div className="text-center text-muted p-4">
                    <InfoLabels text={"FIELDGROUP.NO.FIELDS.DEFINED"} isI18nKey={true} />
                </div>
            );
        }

        return (
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            {columnDefinitions.map((col) => (
                                <th key={col.fieldKey} scope="col">
                                    <DetailLabels text={col.fieldLabel} isI18nKey={false} isRequired={col.isRequired} />
                                </th>
                            ))}
                            <th scope="col" style={{ width: '100px' }}>
                                <DetailLabels text={"LABEL.ACTIONS"} isI18nKey={true} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row) => (
                            <tr key={row.id}>
                                {columnDefinitions.map((col) => (
                                    <td key={`${row.id}_${col.fieldKey}`}>
                                        {renderColumnField(row, col)}
                                    </td>
                                ))}
                                {!readonly && (
                                    <td>
                                        <button
                                            type="button"
                                            id="kt_modal_new_target_cancel_2"
                                            className="btn-close"
                                            onClick={() => showDeleteConfirmation(row.id)}>
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!readonly && (
                    <div className="text-end mt-3">
                        <button
                            type="button"
                            id="kt_modal_new_target_cancel_1"
                            className="btn MOD_btn btn-create btnSave"
                            onClick={addNewRow}
                            disabled={tableData.length >= 10}
                            title={tableData.length >= 10 ? "Maximum of 10 rows allowed" : ""}>
                            <i className="fas fa-plus me-1"></i>
                            <BtnLabeltxtMedium2
                                isI18nKey={true}
                                text={"LABEL.ADD.ROW"}
                            />
                        </button>
                        {tableData.length >= 10 && (
                            <div className="text-muted mt-1 small">
                                <InfoLabels text={"Maximum of 10 rows allowed"} isI18nKey={false} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Render individual field in table column
    const renderColumnField = (row: any, columnDef: DynamicFieldModel) => {
        const cellFieldKey = `${row.id}_${columnDef.fieldKey}`;

        // Create a temporary form control for the cell
        const cellFormControl: DynamicFieldModel = {
            ...columnDef,
            fieldKey: cellFieldKey,
            fieldValue: row[columnDef.fieldKey]
        };

        return (
            <div style={{ minWidth: '200px' }}>
                <DynamicFields
                    divClass=""
                    containerClass="mb-0"
                    headerClass="d-none"
                    inputClass=""
                    formHook={tableFormHook}
                    formControl={cellFormControl}
                    customHandlers={createCellCustomHandlers(row.id, columnDef.fieldKey)}
                    readonly={readonly}
                    isDisabled={readonly}
                />
            </div>
        );
    };

    return (
        <div className={`${divClass}`}>
            <div className={containerClass}>
                {/* Group Header */}
                <div className={`${headerClass}`}>
                    <InfoLabels text={getFieldLabel()} isI18nKey={false} isRequired={(formControl.isRequired) as boolean} />
                </div>

                {/* Data Table Container */}
                <div className={inputClass}>
                    {/* Hidden field for react-hook-form registration */}
                    <input
                        type="hidden"
                        {...formHook.register(fieldKey, validatorSchema)}
                    />

                    <div className="card border-light">
                        <div className="card-body p-3">
                            {renderDataTable()}
                        </div>
                    </div>

                    {/* Error Display */}
                    {errors && errors[fieldKey] && (
                        <ErrorLabel
                            text={String(errors[fieldKey]?.message || errors[fieldKey] || '')}
                            isI18nKey={false}
                        />
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={cancelDelete} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <HeaderLabels text={"LABEL.CONFIRM.DELETE"} isI18nKey={true} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DetailLabels text={"MESSAGE.CONFIRM.DELETE.ROW"} isI18nKey={true} />
                </Modal.Body>
                <Modal.Footer>
                    <button
                        onClick={confirmDeleteRow}
                        className="btn MOD_btn btn-create w-10 pl-5 mx-3"
                        id={generateUUID()}
                    >
                        <BtnLabeltxtMedium2 text={"LABEL.DELETE"} />
                    </button>
                    <button
                        onClick={cancelDelete}
                        className="btn MOD_btn btn-cancel w-10"
                        id={generateUUID()}
                    >
                        <BtnLabelCanceltxtMedium2 text={"LABEL.CANCEL"} />
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FIELDGROUPDATATABLE;
