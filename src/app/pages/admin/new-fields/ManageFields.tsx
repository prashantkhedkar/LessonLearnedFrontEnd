import { BtnLabelCanceltxtMedium2, BtnLabeltxtMedium2, DetailLabels } from "../../../modules/components/common/formsLabels/detailLabels"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { DynamicFieldModel, FormTypes, ManageAttributeConfigForNewFieldModel, ServiceFieldOption, FieldMaster } from "../../../modules/components/dynamicFields/utils/types"
import { FieldMasterModel } from "../../../models/global/fieldMasterModel"
import { FieldGroupMappingModel } from "../../../models/global/FieldGroupMappingModel"
import { unwrapResult } from "@reduxjs/toolkit"
import { useAppDispatch } from "../../../../store"
import { GetFieldConfigDetails, GetFieldConfigDetailsFromService, SaveFieldWithOptions, SaveFieldWithOptionsForService, SaveFieldGrouping, GetFieldGroupMappings } from "../../../modules/services/adminSlice"
import { writeToBrowserConsole } from "../../../modules/utils/common"
import { ManageFieldsUIConfig } from "./ManageFieldsUIConfig"
import DynamicFields from "../../../modules/components/dynamicFields/DynamicFields"
import { OptionsManager } from "./components/OptionsManager"
import { useIntl } from "react-intl"
import { toast } from "react-toastify";
import SquarLoader from "../../../../app/modules/components/animation/SquarLoader";
import AutoCompleteMultiSelectLookupForFieldGrouping from "../../../modules/components/autocomplete/AutoCompleteMultiSelectLookupForFieldGrouping";
import DragDropComponentForFieldGrouping from "../../../modules/components/dragdrop/DragDropComponentForFieldGrouping";

type ManageFieldsProps = {
    onClose: () => void;
    fieldToEdit?: FieldMasterModel | null;
    isEditMode?: boolean;
    serviceId?: number;
    entityId?: number;
};
export const ManageFields = ({ onClose, fieldToEdit, isEditMode = false, serviceId, entityId }: ManageFieldsProps) => {
    const [fields, setFields] = useState(ManageFieldsUIConfig);
    const formHook = useForm({ mode: "onChange" });
    const [submittedData, setSubmittedData] = useState<FieldMaster | null>(null);
    const dispatch = useAppDispatch();
    const [apiFields, setApiFields] = useState<ManageAttributeConfigForNewFieldModel[]>([]);
    const [attributeFields, setAttributeFields] = useState<DynamicFieldModel[]>([]);
    const [selectedFieldType, setSelectedFieldType] = useState<number | null>(null);
    const [customOptions, setCustomOptions] = useState<ServiceFieldOption[]>([]);
    const [showOptionsManager, setShowOptionsManager] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    // Field Grouping specific states
    const [selectedFieldsForGrouping, setSelectedFieldsForGrouping] = useState<FieldGroupMappingModel[]>([]);
    const [tempSelectedFields, setTempSelectedFields] = useState<FieldGroupMappingModel[]>([]);
    const [showFieldGrouping, setShowFieldGrouping] = useState(false);

    const intl = useIntl();

    useEffect(() => {
        // Only run API call once when component mounts or when edit mode changes
        // Prevent multiple calls with loading state
        if (isLoadingConfig) return;

        let isCancelled = false;

        const loadFieldConfiguration = async () => {
            if (isCancelled) return;

            setIsLoadingConfig(true);

            try {
                let result;

                // Bifurcation logic based on the calling component:
                // 1. If called from ManageCustomFields (no serviceId/entityId) - use GetFieldConfigDetails
                // 2. If called from AdminFormDynamicTemplate (with serviceId/entityId) - use GetFieldConfigDetailsFromService

                if (isEditMode && fieldToEdit?.fieldTypeId) {
                    if (serviceId && entityId) {
                        // Called from AdminFormDynamicTemplate for editing an existing field
                        console.log('ManageFields: Loading field config for service context (AdminFormDynamicTemplate), fieldId:', fieldToEdit.fieldId);
                        result = await dispatch(GetFieldConfigDetailsFromService({ fieldId: fieldToEdit.fieldId ? fieldToEdit.fieldId : 0, serviceId, entityId }));
                    } else {
                        // Called from ManageCustomFields for editing an existing field
                        console.log('ManageFields: Loading field config for admin context (ManageCustomFields), fieldTypeId:', fieldToEdit.fieldId);
                        result = await dispatch(GetFieldConfigDetails({ fieldId: fieldToEdit.fieldId }));
                    }
                } else if (!isEditMode) {
                    // Create mode - determine API based on context
                    if (serviceId && entityId) {
                        console.log('ManageFields: Loading field config for service context create mode (AdminFormDynamicTemplate)');
                        result = await dispatch(GetFieldConfigDetails({}));
                    } else {
                        console.log('ManageFields: Loading field config for admin context create mode (ManageCustomFields)');
                        result = await dispatch(GetFieldConfigDetails({}));
                    }
                } else {
                    console.log('ManageFields: Skipping API call - edit mode but no fieldTypeId');
                    setIsLoadingConfig(false);
                    return; // Don't make API call if in edit mode but no fieldTypeId
                }

                if (isCancelled) {
                    setIsLoadingConfig(false);
                    return; // Prevent state updates if component unmounted
                }

                const originalPromiseResult = unwrapResult(result);
                if (originalPromiseResult.statusCode === 200) {
                    const responseData = originalPromiseResult.data as ManageAttributeConfigForNewFieldModel[];
                    setApiFields(responseData);

                    // If in edit mode, handle field options and options manager
                    if (isEditMode) {
                        // Check if this field type requires options manager
                        const isDropdownOrRadioOrAutoComplete = fieldToEdit?.fieldTypeId === FormTypes.dropdownlist ||
                            fieldToEdit?.fieldTypeId === FormTypes.radiogroup ||
                            fieldToEdit?.fieldTypeId === FormTypes.autocompletedropdownlist;

                        if (isDropdownOrRadioOrAutoComplete) {
                            setShowOptionsManager(true);
                        } else {
                            setShowOptionsManager(false);
                        }

                        // If we have field options in the response, set them
                        if (responseData.length > 0 && responseData[0].fieldOptions) {
                            const fieldOptions = responseData[0].fieldOptions;
                            if (fieldOptions && fieldOptions.length > 0) {
                                // Convert from API format to UI format if needed
                                const convertedOptions: ServiceFieldOption[] = fieldOptions.map(opt => ({
                                    label: opt.label || '',
                                    value: opt.value || 0,
                                    fieldId: opt.fieldId || 0,
                                    isDefault: opt.isDefault || false
                                }));

                                setCustomOptions(convertedOptions);
                            }
                        }
                    }

                    const options: ServiceFieldOption[] = responseData.map(item => ({
                        label: item.fieldTypeName,
                        value: item.fieldTypeId,
                        fieldId: item.fieldTypeId
                    }));

                    const updateFields = ManageFieldsUIConfig.map(field => {
                        if (field.fieldTypeId === FormTypes.dropdownlist) {
                            return {
                                ...field,
                                placeholder: intl.formatMessage({ id: field.placeholder }),
                                serviceFieldOption: options
                            }
                        }
                        return {
                            ...field,
                            placeholder: intl.formatMessage({ id: field.placeholder })
                        };
                    });
                    setFields(updateFields);
                }
            } catch (rejectedValueOrSerializedError) {
                if (!isCancelled) {
                    writeToBrowserConsole(rejectedValueOrSerializedError);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingConfig(false);
                }
            }
        };

        loadFieldConfiguration();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isCancelled = true;
        };
    }, [isEditMode, fieldToEdit?.fieldTypeId, serviceId, entityId]); // Include serviceId and entityId to determine API usage

    // useEffect to populate form when in edit mode
    useEffect(() => {
        if (isEditMode && fieldToEdit && apiFields.length > 0) {
            // Set the field type
            setSelectedFieldType(fieldToEdit.fieldTypeId || null);

            // Set form values for editing using the existing field data
            formHook.setValue('FieldType', fieldToEdit.fieldTypeId?.toString() || '');
            formHook.setValue('fieldName', fieldToEdit.fieldLabel || '');
            formHook.setValue('fieldDescription', fieldToEdit.fieldDescription || fieldToEdit.placeholder || '');

            // Check if this is a dropdown or radio group field type
            const isDropdownOrRadioOrAutoComplete = fieldToEdit.fieldTypeId === FormTypes.dropdownlist ||
                fieldToEdit.fieldTypeId === FormTypes.radiogroup ||
                fieldToEdit.fieldTypeId === FormTypes.autocompletedropdownlist;

            // Check if this is field grouping
            const isFieldGrouping = fieldToEdit.fieldTypeId === FormTypes.fieldgrouping;

            // Parse existing attributes from the field data
            let existingAttributes: any = {};
            try {
                if (fieldToEdit.attributes && typeof fieldToEdit.attributes === 'string') {
                    existingAttributes = JSON.parse(fieldToEdit.attributes);
                }
            } catch (error) {
                console.warn('Failed to parse existing attributes:', error);
                existingAttributes = {};
            }

            // Load fieldOptions if they exist (check if field has fieldOptions property)
            if (isDropdownOrRadioOrAutoComplete) {
                // DON'T set showOptionsManager here as it might be already set by the first useEffect
                // Only set it if it's not already true
                setShowOptionsManager(prev => prev || true);

                // Check if fieldOptions exist in the field data (may not be in the type but could be in runtime data)
                const fieldWithOptions = fieldToEdit as any;
                if (fieldWithOptions.fieldOptions && Array.isArray(fieldWithOptions.fieldOptions)) {
                    setCustomOptions(fieldWithOptions.fieldOptions);
                    formHook.setValue('fieldOptions' as any, fieldWithOptions.fieldOptions);
                }
            }

            // Handle field grouping in edit mode
            if (isFieldGrouping) {
                setShowOptionsManager(false);
                setShowFieldGrouping(true);

                // Load existing field group mappings from the database
                if (fieldToEdit.fieldId) {
                    dispatch(GetFieldGroupMappings({ fieldId: fieldToEdit.fieldId }))
                        .then(unwrapResult)
                        .then((response) => {
                            if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
                                // Convert FieldGroupMappingDto[] to FieldGroupMappingModel[] for UI compatibility
                                const selectedFields: FieldGroupMappingModel[] = response.data.map((mapping: any) => ({
                                    mappingId: mapping.mappingId,
                                    fieldId: mapping.fieldId || 0,
                                    componentFieldId: mapping.componentFieldId,
                                    displayOrder: mapping.displayOrder || 0,
                                    isRequired: mapping.isRequired || false,
                                    fieldLabel: mapping.fieldLabel || `Field ${mapping.componentFieldId}`,
                                    placeholder: mapping.placeholder || '',
                                    fieldDescription: mapping.fieldDescription || '',
                                    attributes: mapping.attributes || ''
                                }));
                                setSelectedFieldsForGrouping(selectedFields);
                            }
                        })
                        .catch((error) => {
                            console.warn('Failed to load field group mappings:', error);
                        });
                }

                // The availableFieldsForGrouping will be loaded by the AutoCompleteMultiSelectLookupForFieldGrouping component
                // from the GetAllCustomFieldsFromFieldMaster API, so we don't need to set it here
                // setAvailableFieldsForGrouping([]);
            }

            // Get the field type configuration from API to understand the structure
            const matchedApiField = apiFields.find(f => f.fieldTypeId === fieldToEdit.fieldTypeId);
            const attributeTemplate = matchedApiField?.attributes;

            const fieldsToShow: DynamicFieldModel[] = [];

            // Always add options configuration field for dropdown/radio/autocomplete in edit mode
            if (isDropdownOrRadioOrAutoComplete) {
                const optionsConfigField: DynamicFieldModel = {
                    mappingId: 'options-config',
                    fieldKey: 'optionsConfiguration',
                    serviceId: '',
                    fieldTypeId: FormTypes.text,
                    fieldId: 999,
                    fieldLabel: `${fieldToEdit.fieldTypeId === FormTypes.dropdownlist ? 'Dropdown' : fieldToEdit.fieldTypeId === FormTypes.radiogroup ? 'Radio Group' : 'AutoComplete'} Options`,
                    isRequired: false,
                    serviceFieldOption: [],
                    attributes: {},
                    defaultValue: '',
                };
                fieldsToShow.push(optionsConfigField);
            }

            if (attributeTemplate && Array.isArray(attributeTemplate)) {
                // Generate attribute fields using the template but populate with existing values
                const generatedFields: DynamicFieldModel[] = attributeTemplate.map((attr, idx) => {
                    let fieldTypeId = FormTypes.text;
                    switch (attr.type) {
                        case "number":
                            fieldTypeId = FormTypes.number;
                            break;
                        case "time":
                            fieldTypeId = FormTypes.time;
                            break;
                        case "textbox":
                            fieldTypeId = FormTypes.text;
                            break;
                        case "checkboxSingle":
                            fieldTypeId = FormTypes.checkbox;
                            break;
                        case "dropdown":
                            fieldTypeId = FormTypes.dropdownlist;
                            break;
                        default:
                            fieldTypeId = FormTypes.text;
                    }

                    // Use existing value if available, otherwise use template default
                    const existingValue = existingAttributes[attr.attributeName];
                    const valueToUse = existingValue !== undefined ? existingValue : attr.defaultValue;

                    const attrObj: any = {};
                    attrObj[attr.attributeName] = String(valueToUse || '');

                    // Include maxAllowedValue for text-based fields if available
                    if (attr.maxAllowedValue && (fieldTypeId === FormTypes.text || fieldTypeId === FormTypes.number)) {
                        // For text fields, use maxLength; for numeric fields, use maxValue
                        if (attrObj.maxValue && fieldTypeId === FormTypes.number) {
                            attrObj.maxValue = attr.maxAllowedValue;
                        }

                        if (attrObj.maxLength && fieldTypeId === FormTypes.text) {
                            attrObj.maxLength = attr.maxAllowedValue;
                        }

                        // For text fields, use maxLength; for numeric fields, use maxValue
                        if (attrObj.minValue && fieldTypeId === FormTypes.number) {
                            attrObj.minValue = attr.maxAllowedValue;
                        }

                        if (attrObj.minLength && fieldTypeId === FormTypes.text) {
                            {
                                attrObj.minLength = attr.maxAllowedValue;
                            }
                        }
                    }
                    
                    return {
                        mappingId: '',
                        fieldKey: attr.attributeName,
                        serviceId: '',
                        fieldTypeId,
                        fieldId: idx + 1000,
                        fieldLabel: intl.formatMessage({ id: attr.i18nKey }) || attr.attributeName,
                        isRequired: attr.isRequired ? attr.isRequired : false,
                        serviceFieldOption: [],
                        attributes: attrObj,
                        defaultValue: valueToUse || '',
                    };
                });

                // Filter out hidden fields for UI display
                const visibleFields = generatedFields.filter((field, idx) => !attributeTemplate[idx].hidden);
                fieldsToShow.push(...visibleFields);

                // Set form values for all attributes (both visible and hidden)
                attributeTemplate.forEach(attr => {
                    const existingValue = existingAttributes[attr.attributeName];
                    const valueToSet = existingValue !== undefined ? existingValue : attr.defaultValue;

                    if (valueToSet !== undefined && valueToSet !== null && valueToSet !== '') {
                        formHook.setValue(attr.attributeName as any, valueToSet);
                    }
                });
            }

            // Always set the fieldsToShow (even if it only contains the options configuration field)
            setAttributeFields(fieldsToShow);
        }
    }, [isEditMode, fieldToEdit, apiFields]);

    const handleBeforeDropDownList = (event: any, field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel) => {
        // Prevent field type changes when in edit mode
        if (isEditMode) {
            return;
        }

        const selectedValue = event?.target?.value;
        const matchedApiField = apiFields.find(f => f.fieldTypeId === Number(selectedValue));
        const attributes = matchedApiField?.attributes;

        // Reset all applicable states except setApiFields and setFields
        setAttributeFields([]);
        setSelectedFieldType(null);
        setCustomOptions([]);
        setShowOptionsManager(false);
        setSubmittedData(null);

        // Reset field grouping states
        setShowFieldGrouping(false);
        setSelectedFieldsForGrouping([]);
        setTempSelectedFields([]);
        // setAvailableFieldsForGrouping([]);

        // Reset form values
        formHook.reset();

        // Store selected field type and preserve the dropdown value
        setSelectedFieldType(Number(selectedValue));

        // Set the FieldType value back after reset to preserve the selection
        formHook.setValue('FieldType', selectedValue);

        // Check if this is a dropdown or radio group field type
        const isDropdownOrRadioOrAutoComplete = Number(selectedValue) === Number(FormTypes.dropdownlist) || Number(selectedValue) === Number(FormTypes.radiogroup) || Number(selectedValue) === Number(FormTypes.autocompletedropdownlist);

        // Check if this is field grouping
        const isFieldGrouping = Number(selectedValue) === Number(FormTypes.fieldgrouping);

        if (isDropdownOrRadioOrAutoComplete) {
            // For dropdown, radio group, and autocomplete - show options manager AND attributes
            setShowOptionsManager(true);

            // Process attributes for these field types
            const fieldsToShow: DynamicFieldModel[] = [];

            // Always add the options configuration field first
            const optionsConfigField: DynamicFieldModel = {
                mappingId: 'options-config',
                fieldKey: 'optionsConfiguration',
                serviceId: '',
                fieldTypeId: FormTypes.text, // This will be handled specially
                fieldId: 999,
                fieldLabel: `${Number(selectedValue) === Number(FormTypes.dropdownlist) ? 'Dropdown' : Number(selectedValue) === Number(FormTypes.radiogroup) ? 'Radio Group' : 'AutoComplete'} Options`,
                isRequired: false,
                serviceFieldOption: [],
                attributes: {},
                defaultValue: '',
            };
            fieldsToShow.push(optionsConfigField);

            // Add regular attributes if they exist
            if (attributes && Array.isArray(attributes)) {
                const generatedFields: DynamicFieldModel[] = attributes.map((attr, idx) => {
                    let fieldTypeId = FormTypes.text;
                    switch (attr.type) {
                        case "number":
                            fieldTypeId = FormTypes.number;
                            break;
                        case "time":
                            fieldTypeId = FormTypes.time;
                            break;
                        case "textbox":
                            fieldTypeId = FormTypes.text;
                            break;
                        case "checkboxSingle":
                            fieldTypeId = FormTypes.checkbox;
                            break;
                        case "dropdown":
                            fieldTypeId = FormTypes.dropdownlist;
                            break;
                        default:
                            fieldTypeId = FormTypes.text;
                    }

                    const attrObj: any = {};
                    attrObj[attr.attributeName] = String(attr.attributeValue);

                    return {
                        mappingId: '',
                        fieldKey: attr.attributeName,
                        serviceId: '',
                        fieldTypeId,
                        fieldId: idx + 1000, // Offset to avoid conflicts with options config field
                        fieldLabel: intl.formatMessage({ id: attr.i18nKey }) || attr.attributeName,
                        fieldValue: String(attr.attributeValue), // Show attributeValue in the UI
                        isRequired: attr.isRequired ? attr.isRequired : false,
                        serviceFieldOption: [],
                        attributes: attrObj,
                        defaultValue: attr.defaultValue,
                    };
                });

                // Filter out hidden fields for UI display and add them to fieldsToShow
                const visibleFields = generatedFields.filter((field, idx) => !attributes[idx].hidden);
                fieldsToShow.push(...visibleFields);

                // Set default values for all generated fields (both hidden and visible)
                generatedFields.forEach(field => {
                    if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== "") {
                        formHook.setValue(field.fieldKey as any, field.defaultValue);
                    }
                });

                // Set values for hidden fields so they're included in form submission
                attributes.forEach(attr => {
                    if (attr.hidden && attr.attributeValue !== undefined && attr.attributeValue !== null && attr.attributeValue !== "") {
                        formHook.setValue(attr.attributeName as any, attr.attributeValue);
                    }
                });
            }

            setAttributeFields(fieldsToShow);
        } else if (isFieldGrouping) {
            // For field grouping - show custom UI components
            setShowOptionsManager(false);
            setShowFieldGrouping(true);

            // Reset field grouping states
            setSelectedFieldsForGrouping([]);
            setTempSelectedFields([]);

            // The availableFieldsForGrouping will be loaded by the AutoCompleteMultiSelectLookupForFieldGrouping component
            // from the GetAllCustomFieldsFromFieldMaster API, so we don't need to set it here
            // setAvailableFieldsForGrouping([]);

            // Set empty attribute fields since we'll use custom components
            setAttributeFields([]);
        } else {
            // For other field types, show regular attributes only
            setShowOptionsManager(false);
            
            if (attributes && Array.isArray(attributes)) {
                const generatedFields: DynamicFieldModel[] = attributes.map((attr, idx) => {
                    let fieldTypeId = FormTypes.text;
                    switch (attr.type) {
                        case "number":
                            fieldTypeId = FormTypes.number;
                            break;
                        case "time":
                            fieldTypeId = FormTypes.time;
                            break;
                        case "textbox":
                            fieldTypeId = FormTypes.text;
                            break;
                        case "checkboxSingle":
                            fieldTypeId = FormTypes.checkbox;
                            break;
                        default:
                            fieldTypeId = FormTypes.text;
                    }

                    const attrObj: any = {};
                    attrObj[attr.attributeName] = String(attr.attributeValue);
                    
                    // Include maxAllowedValue for text-based fields if available
                    if (attr.maxAllowedValue && (fieldTypeId === FormTypes.text || fieldTypeId === FormTypes.number)) {
                        // For text fields, use maxLength; for numeric fields, use maxValue
                        if (attrObj.maxValue && fieldTypeId === FormTypes.number) {
                            attrObj.maxValue = attr.maxAllowedValue;
                        }

                        if (attrObj.maxLength && fieldTypeId === FormTypes.text) {
                            attrObj.maxLength = attr.maxAllowedValue;
                        }

                        // For text fields, use maxLength; for numeric fields, use maxValue
                        if (attrObj.minValue && fieldTypeId === FormTypes.number) {
                            attrObj.minValue = attr.maxAllowedValue;
                        }

                        if (attrObj.minLength && fieldTypeId === FormTypes.text) {
                            {
                                attrObj.minLength = attr.maxAllowedValue;
                            }
                        }
                    }

                    return {
                        mappingId: '',
                        fieldKey: attr.attributeName,
                        serviceId: '',
                        fieldTypeId,
                        fieldId: idx,
                        fieldLabel: intl.formatMessage({ id: attr.i18nKey }) || attr.attributeName,
                        fieldValue: String(attr.attributeValue), // Show attributeValue in the UI
                        isRequired: attr.isRequired ? attr.isRequired : false,
                        serviceFieldOption: [],
                        attributes: attrObj,
                        defaultValue: attr.defaultValue,
                    };
                });

                // Filter out hidden fields for UI display
                const visibleFields = generatedFields.filter((field, idx) => !attributes[idx].hidden);
                setAttributeFields(visibleFields);

                // Set default values for all generated fields (both hidden and visible)
                generatedFields.forEach(field => {
                    if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== "") {
                        formHook.setValue(field.fieldKey as any, field.defaultValue);
                    }
                });

                // Set values for hidden fields so they're included in form submission
                attributes.forEach(attr => {
                    if (attr.hidden && attr.attributeValue !== undefined && attr.attributeValue !== null && attr.attributeValue !== "") {
                        formHook.setValue(attr.attributeName as any, attr.attributeValue);
                    }
                });
            } else {
                setAttributeFields([]);
            }
        }

        return true;
    };

    const handleOptionsChange = (options: ServiceFieldOption[]) => {
        setCustomOptions(options);
        // Update form data with the options
        formHook.setValue('fieldOptions' as any, options);
    };

    const getFieldTypeLabel = (fieldTypeId: number): 'dropdown' | 'radiogroup' => {
        if (fieldTypeId === FormTypes.dropdownlist) return 'dropdown';
        if (fieldTypeId === FormTypes.radiogroup) return 'radiogroup';
        if (fieldTypeId === FormTypes.autocompletedropdownlist) return 'dropdown'; // AutoComplete behaves like dropdown
        return 'dropdown'; // Default fallback
    };

    // Handler for adding selected fields to the grouping
    const handleAddFieldsToGrouping = (selectedItems: FieldGroupMappingModel[]) => {
        if (!selectedItems || selectedItems.length === 0) {
            return;
        }

        const currentCount = selectedFieldsForGrouping.length;
        const newItemsCount = selectedItems.length;

        if (currentCount + newItemsCount <= 5) {
            // Filter duplicates and add new items
            const itemsToAdd = selectedItems
                .filter(newItem =>
                    !selectedFieldsForGrouping.some(existing =>
                        existing.componentFieldId === newItem.componentFieldId
                    )
                )
                .map((item, index) => ({
                    ...item, // Preserve all existing properties from FieldGroupMappingModel
                    displayOrder: selectedFieldsForGrouping.length + index + 1,
                }));

            if (itemsToAdd.length > 0) {
                const updatedFields = [...selectedFieldsForGrouping, ...itemsToAdd];
                setSelectedFieldsForGrouping(updatedFields);

                // Clear temporary selections
                setTempSelectedFields([]);

                // Show success message
                //toast.success(intl.formatMessage({ id: 'FIELD.GROUPING.FIELDS.ADDED.SUCCESS' }));
            } else {
                toast.warning(intl.formatMessage({ id: 'FIELD.GROUPING.ALREADY.SELECTED' }));
            }
        } else {
            const remainingSlots = 5 - currentCount;
            toast.error(intl.formatMessage({
                id: 'FIELD.GROUPING.CANNOT.ADD.FIELDS'
            }, {
                newItemsCount,
                remainingSlots
            }));
        }
    };

    // Handler for reordering fields in the grouping
    const handleFieldGroupingOrderChange = (reorderedItems: FieldGroupMappingModel[]) => {
        setSelectedFieldsForGrouping(reorderedItems);
    };

    const onSubmit = (data, event) => {
        event?.preventDefault();
        event?.stopPropagation();

        // Handle attributes and fieldOptions based on field type
        const isDropdownOrRadioOrAutoComplete = Number(data.FieldType) === Number(FormTypes.dropdownlist) || Number(data.FieldType) === Number(FormTypes.radiogroup) || Number(data.FieldType) === Number(FormTypes.autocompletedropdownlist);
        const isFieldGrouping = Number(data.FieldType) === Number(FormTypes.fieldgrouping);

        if (isDropdownOrRadioOrAutoComplete && (!customOptions || customOptions.length === 0)) {
            const fieldTypeName = Number(data.FieldType) === FormTypes.dropdownlist
                ? 'Dropdown'
                : Number(data.FieldType) === FormTypes.radiogroup
                    ? 'Radio Group'
                    : 'AutoComplete';
            toast.error(`${fieldTypeName} ${intl.formatMessage({ id: "FIELD.OPTIONS.MANDATORY" })}. ${intl.formatMessage({ id: "LABEL.ADDOPTION" })}.`);
            return;
        };

        // Validate field grouping requirements
        if (isFieldGrouping) {
            // Validate that at least one field is selected
            if (!selectedFieldsForGrouping || selectedFieldsForGrouping.length === 0) {
                toast.error(intl.formatMessage({ id: 'FIELD.GROUPING.NO.FIELDS.REQUIRED' }));
                return;
            }
        }

        // Validate maxLength > minLength for applicable field types
        const fieldTypeId = Number(data.FieldType);
        const isFieldTypeWithLengthValidation = fieldTypeId === FormTypes.text ||
            fieldTypeId === FormTypes.texteditor ||
            fieldTypeId === FormTypes.number ||
            fieldTypeId === FormTypes.decimal ||
            fieldTypeId === FormTypes.textarea;

        if (isFieldTypeWithLengthValidation) {
            const maxLength = data.maxLength ? Number(data.maxLength) : null;
            const minLength = data.minLength ? Number(data.minLength) : null;
            if (maxLength !== null && minLength !== null && maxLength <= minLength) {
                toast.error(intl.formatMessage({ id: "VALIDATION.MAX_LENGTH_GREATER_THAN_MIN_LENGTH" }));
                return;
            }

            const maxValue = data.maxValue ? Number(data.maxValue) : null;
            const minValue = data.minValue ? Number(data.minValue) : null;
            if (maxValue !== null && minValue !== null && maxValue <= minValue) {
                toast.error(intl.formatMessage({ id: "VALIDATION.MAX_VALUE_GREATER_THAN_MIN_LENGTH" }));
                return;
            }
        }

        // Clean fieldDescription from HTML tags
        const stripHtml = (html: string) => {
            if (!html) return '';
            const tmp = document.createElement('DIV');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        };

        // Create FieldMaster object according to the new structure
        const fieldMaster: FieldMaster = {
            FieldLabel: data.fieldName || '',
            FieldLabelAr: data.fieldName || '', // Using same value for Arabic label
            FieldTypeId: data.FieldType || '',
            IsRequired: true, // true by default
            DisplayOrder: isEditMode ? (fieldToEdit?.displayOrder || 0) : 0, // preserve existing order in edit mode
            IsActive: true, // 1
            Placeholder: stripHtml(data.fieldDescription || ''),
            FieldDescription: stripHtml(data.fieldDescription || ''),
            EntityId: isEditMode ? (fieldToEdit?.entityId || 0) : 0, // preserve existing entityId in edit mode
        };

        // If in edit mode, include the fieldId and guid to identify the field being updated
        if (isEditMode && fieldToEdit) {
            (fieldMaster as any).FieldId = fieldToEdit.fieldId;
            (fieldMaster as any).Guid = fieldToEdit.guid;
        }

        if (isDropdownOrRadioOrAutoComplete && customOptions.length > 0) {
            // For dropdown, radio group, and autocomplete fields, include fieldOptions
            fieldMaster.fieldOptions = customOptions;

            // Collect regular attributes from form data (excluding options configuration)
            const attributes: any = {};
            const matchedApiField = apiFields.find(f => f.fieldTypeId === Number(data.FieldType));

            if (matchedApiField?.attributes) {
                // Collect all attributes from the API response
                matchedApiField.attributes.forEach(attr => {
                    const fieldValue = data[attr.attributeName];
                    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                        attributes[attr.attributeName] = fieldValue;
                    }
                });
            }

            fieldMaster.Attributes = JSON.stringify(attributes);
        } else if (isFieldGrouping) {
            // For field grouping, store custom attributes
            const attributes: any = {
                selectedFields: JSON.stringify(selectedFieldsForGrouping)
            };

            // Also collect any API attributes if they exist
            const matchedApiField = apiFields.find(f => f.fieldTypeId === Number(data.FieldType));
            if (matchedApiField?.attributes) {
                matchedApiField.attributes.forEach(attr => {
                    const fieldValue = data[attr.attributeName];
                    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                        attributes[attr.attributeName] = fieldValue;
                    }
                });
            }

            fieldMaster.Attributes = JSON.stringify(attributes);
        } else {
            // For other field types, collect attributes from form data
            const attributes: any = {};

            // Get the matched API field to access all attributes (including hidden ones)
            const matchedApiField = apiFields.find(f => f.fieldTypeId === Number(data.FieldType));

            if (matchedApiField?.attributes) {
                // Collect all attributes from the API response
                matchedApiField.attributes.forEach(attr => {
                    const fieldValue = data[attr.attributeName];
                    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                        attributes[attr.attributeName] = fieldValue;
                    }
                });
            }

            fieldMaster.Attributes = JSON.stringify(attributes);
        }

        // Save to server using the appropriate thunk API
        if (isFieldGrouping) {
            // For field grouping, use the new SaveFieldGrouping API
            // selectedFieldsForGrouping is already FieldGroupMappingModel[]
            const selectedFieldMappings: FieldGroupMappingModel[] = selectedFieldsForGrouping.map((field, index) => ({
                ...field,
                displayOrder: index + 1
            }));
            fieldMaster.Attributes = undefined;

            console.log('ManageFields: Using SaveFieldGrouping API', { fieldMaster, selectedFieldMappings });

            dispatch(SaveFieldGrouping({ fieldMasterData: fieldMaster, selectedFields: selectedFieldMappings }))
                .then(unwrapResult)
                .then((response) => {
                    if (response.statusCode === 200) {
                        console.log('Field grouping saved successfully:', response.data);

                        // Show success message
                        toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));

                        // Close modal on success
                        onClose();
                    } else {
                        const operation = 'saving field grouping';
                        console.error(`Error ${operation}:`, response.message);
                        toast.error(`${intl.formatMessage({ id: "LABEL.ERROR" })} ${operation}: ${response.message}`);
                        onClose();
                    }
                })
                .catch((error) => {
                    const operation = 'saving field grouping';
                    console.error(`Error ${operation}:`, error);

                    // Handle network or other unexpected errors
                    let errorMessage = `Error ${operation}`;

                    if (error?.message) {
                        errorMessage = error.message;
                    } else if (error?.error) {
                        try {
                            const parsedError = JSON.parse(error.error);
                            if (parsedError?.message) {
                                errorMessage = parsedError.message;
                            }
                        } catch (parseError) {
                            console.warn('Could not parse error message:', parseError);
                        }
                    }

                    toast.error(errorMessage);
                    onClose();
                });
        } else {
            // For regular fields, use existing logic
            // Use SaveFieldWithOptionsForService only when we have both serviceId and entityId (service context)
            // Always use SaveFieldWithOptions when no serviceId/entityId (admin context)
            const saveAction = (serviceId && entityId)
                ? SaveFieldWithOptionsForService({ submittedData: fieldMaster, serviceId, entityId })
                : SaveFieldWithOptions({ submittedData: fieldMaster });

            console.log('ManageFields: Using API:', serviceId && entityId ? 'SaveFieldWithOptionsForService' : 'SaveFieldWithOptions',
                { isEditMode, serviceId, entityId });

            dispatch(saveAction)
                .then(unwrapResult)
                .then((response) => {
                    if (response.statusCode === 200) {
                        // Check if it's a duplicate validation message
                        if (response.message === "Duplicate validation failed.") {
                            // This is a business validation failure, show the duplicate message
                            toast.error(response.data);
                            return; // Don't close modal, let user fix the issue
                        }

                        // Success - handle response
                        const operation = isEditMode ? 'updated' : 'created';
                        console.log(`Field ${operation} successfully:`, response.data);
                        setSubmittedData(fieldMaster);

                        // Show success message
                        toast.success(intl.formatMessage({
                            id: isEditMode ? "MESSAGE.UPDATE.SUCCESS" : "MESSAGE.SAVE.SUCCESS"
                        }));

                        // Close modal on success
                        onClose();
                    } else {
                        // Handle other error responses
                        const operation = isEditMode ? 'updating' : 'saving';
                        console.error(`Error ${operation} field:`, response.message);
                        toast.error(`${intl.formatMessage({ id: "LABEL.ERROR" })} ${operation}: ${response.message}`);
                        onClose();
                    }
                })
                .catch((error) => {
                    const operation = isEditMode ? 'updating' : 'saving';
                    console.error(`Error ${operation} field:`, error);

                    // Handle network or other unexpected errors
                    let errorMessage = `Error ${operation} field`;

                    if (error?.message) {
                        errorMessage = error.message;
                    } else if (error?.error) {
                        try {
                            const parsedError = JSON.parse(error.error);
                            if (parsedError?.message) {
                                errorMessage = parsedError.message;
                            }
                        } catch (parseError) {
                            console.warn('Could not parse error message:', parseError);
                        }
                    }

                    toast.error(errorMessage);
                    onClose();
                });

            setSubmittedData(fieldMaster);
        }
    };

    return (
        <>
            {isLoadingConfig && (
                <div className="text-center p-3">
                    <SquarLoader />
                </div>
            )}

            <div className="container mt-4">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isLoadingConfig) { // Prevent submission during loading
                        formHook.handleSubmit(onSubmit)(e);
                    }
                }} autoComplete="off">
                    <div className="row">
                        {
                            fields.map((field, idx) => (
                                <div className="col-md-12 mb-3" key={idx}>
                                    <DynamicFields
                                        divClass="form-group"
                                        containerClass="row"
                                        headerClass="col-md-2"
                                        inputClass="col-md-10"
                                        formHook={formHook}
                                        formControl={field}
                                        customHandlers={
                                            // Don't pass custom handlers for FieldType in edit mode to prevent any interaction
                                            (isEditMode && field.fieldKey === 'FieldType')
                                                ? undefined
                                                : {
                                                    onChangeDropDownList: handleBeforeDropDownList
                                                }
                                        }
                                        readonly={isEditMode && field.fieldKey === 'FieldType'}
                                    />
                                </div>
                            ))
                        }
                    </div>

                    <div className="row">
                        <div className="col-md-12 mb-3">
                            {
                                attributeFields && attributeFields.length > 0 && attributeFields.map((attrField, idx) => {
                                    return (
                                        <div className="col-md-12 mb-3" key={attrField.fieldKey}>
                                            {/* Special handling for options configuration field */}
                                            {attrField.fieldKey === 'optionsConfiguration' && showOptionsManager ? (
                                                <OptionsManager
                                                    key={`options-manager-${selectedFieldType}`}
                                                    initialOptions={customOptions}
                                                    onOptionsChange={handleOptionsChange}
                                                    fieldType={getFieldTypeLabel(selectedFieldType || 0)}
                                                    isEditMode={isEditMode}
                                                />
                                            ) : attrField.fieldKey === 'optionsConfiguration' ? (
                                                <div style={{ padding: '10px', border: '1px solid red', color: 'red' }}>
                                                    OptionsManager should be here but showOptionsManager is false (Debug: showOptionsManager={String(showOptionsManager)}, selectedFieldType={selectedFieldType})
                                                </div>
                                            ) : (
                                                <DynamicFields
                                                    divClass="form-group"
                                                    containerClass="row"
                                                    headerClass="col-md-2"
                                                    inputClass="col-md-10"
                                                    formHook={formHook}
                                                    formControl={attrField}
                                                    readonly={false}
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>

                    {/* Field Grouping UI */}
                    {showFieldGrouping && (
                        <div className="row">
                            <div className="col-md-12 mb-3">
                                <div className="form-group mt-3">
                                    <div className="row">
                                        <div className="col-md-2">
                                            <DetailLabels text={intl.formatMessage({ id: "LABEL.SELECT.FIELDS" })} isI18nKey={true} isRequired={true} />
                                        </div>
                                        <div className="col-md-10">
                                            <AutoCompleteMultiSelectLookupForFieldGrouping
                                                id="field-grouping-autocomplete"
                                                selectedValue={tempSelectedFields}
                                                onSearchChangeHandler={setTempSelectedFields}
                                                placeholder={intl.formatMessage({ id: "LABEL.SEARCH" })}
                                                isMultiSelect={true}
                                                readOnly={false}
                                                onAddSelected={handleAddFieldsToGrouping}
                                                maxSelections={5}
                                                excludeItems={selectedFieldsForGrouping}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group mt-3">
                                    <div className="row">
                                        <div className="col-md-2">

                                        </div>
                                        <div className="col-md-10">
                                            <DragDropComponentForFieldGrouping
                                                items={selectedFieldsForGrouping}
                                                onItemsChange={handleFieldGroupingOrderChange}
                                                maxItems={5}
                                                title={intl.formatMessage({ id: "LABEL.SEARCH" })}
                                                readOnly={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="row">
                        <div className="col-12 d-flex justify-content-end">
                            <button
                                type="submit"
                                className="btn MOD_btn btn-create w-10 pl-5 mx-3"
                                disabled={isLoadingConfig}
                            >
                                <BtnLabeltxtMedium2 text={isEditMode ? "BUTTON.LABEL.UPDATE" : "BUTTON.LABEL.SUBMIT"} />
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary mx-3"
                                onClick={() => {
                                    onClose();
                                }}
                            >
                                <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default ManageFields;