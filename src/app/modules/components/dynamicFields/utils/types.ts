import { UseFormReturn } from "react-hook-form";
import { IRequestAttachment } from "../../../../models/global/serviceModel";

export enum FormTypes {
  text = 1,
  dropdownlist = 2,
  texteditor = 3,
  checkbox = 4,
  radiogroup = 5,
  date = 7,
  number = 8,
  time = 9,
  email = 10,
  url = 11,
  decimal = 12,
  textarea = 13,
  autocompletedropdownlist = 14,
  linebreak = 15,
  fieldgrouping = 16,
  selectrooms = 17,
}

export type ServiceFieldAttribute = {
  minLength?: string;
  maxLength?: string;
  minValue?: string;
  maxValue?: string;
  minDate?: string;
  maxDate?: string;
  defaultValue?: string;
  defaultOption?: string;
  allowSearch?: string;
  dateFormat?: string;
  isMultiSelect?: string;
  orientation?: string;
  labelPosition?: string;
  regexValidation?: string;
  decimalPlaces?: string;
  allowSubmitWithoutValidation?: string;
  autoGenerateFunctionValue?: string;
  allowFutureDate?: boolean;
  placeholder?: string;
  isMultiselectDropDown?: boolean;
};

export type ServiceFieldOption = {
  label: string;
  value: string | number | boolean;
  fieldId: number;
  isDefault?: boolean;
};

export type FormModel = {
  [key: string]: number | string | boolean | Date | Object | [];
};

export type DynamicFieldModel = {
  // ServiceFieldMapping.MappingID
  mappingId: string;

  fieldKey: string;

  // ServiceFieldMapping.ServiceID
  serviceId: string;

  // FieldTypeMaster.FieldTypeId
  fieldTypeId: number;

  // FieldMaster.FieldLabel
  fieldId: number;

  // FieldMaster.FieldLabel
  fieldLabel: string;

  fieldValue?: string | number | boolean | Date | Object | [];

  // ServiceFieldOption
  serviceFieldOption: ServiceFieldOption[]; // If dropdown or CheckboxGroup

  // ServiceFieldMapping.Isrequired
  isRequired: boolean;

  // ServiceFieldMapping.IsVisible
  isVisible?: boolean;

  // ServiceFieldMapping.DisplayOrder
  displayOrder?: number;

  // ServiceFieldMapping.defaultValue
  defaultValue?: string | boolean | false;

  // ServiceFieldMapping.Placeholder
  placeholder?: string;

  // Attributes
  attributes?: ServiceFieldAttribute;

  entityId?: number;

  // Field group for nested fields
  fieldGroup?: DynamicFieldModel[];
};

export type IFormProps<T extends FormModel = FormModel> = {
  divClass: string;
  headerClass: string;
  containerClass: string;
  inputClass: string;
  formControl: DynamicFieldModel | ManageAttributeConfigForNewFieldModel;
  formHook: UseFormReturn<T>;
  readonly: boolean;
  isDisabled?: boolean;
  customHandlers?: {
    onChangeDate?: (
      value: string | Date,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeDate?: (
      value: string | Date,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeTime?: (
      value: string | Date,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeTime?: (
      value: string | Date,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeEmail?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeEmail?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeNumber?: (
      value: number,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeNumber?: (
      value: number,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeText?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeText?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;
    onBlurInputText?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeTextArea?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeTextArea?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;
    onBlurTextArea?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeTextEditor?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeTextEditor?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;
    onBlurTextEditor?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeRadioGroup?: (
      value: ServiceFieldOption[],
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeRadioGroup?: (
      value: ServiceFieldOption[],
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeCheckboxGroup?: (
      value: ServiceFieldOption[],
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeCheckboxGroup?: (
      value: ServiceFieldOption[],
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeCheckbox?: (
      value: ServiceFieldOption,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeChangeCheckbox?: (
      value: ServiceFieldOption,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeDropDownList?: (
      value: ServiceFieldOption[],
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeDropDownList?: (
      value: ServiceFieldOption[],
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    onChangeAutoDropDownList?: (
      value: ServiceFieldOption[],
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => void;
    onBeforeAutoDropDownList?: (
      value: ServiceFieldOption[],
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    // Decimal field handlers
    onBeforeChangeDecimal?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;
    onBlurInputDecimal?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;

    // URL field handlers
    onBeforeChangeURL?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;
    onBlurInputURL?: (
      value: string,
      field: DynamicFieldModel | ManageAttributeConfigForNewFieldModel
    ) => boolean | string;
  };
};

// Model for dynamic form API payload
export interface DynamicFormFieldPayload {
  fieldId: string;
  fieldValue: string | boolean | Array<string | number>;
  serviceEntityId: string;
}

export interface DynamicFormSubmitPayload {
  serviceId: number;
  requestId?: number;
  requestType: number;
  statusId?: number;
  draftGuid?: string;
  currentStepId: number;
  entityId: number;
  actionId?: number;
  unitId?: number;
  attachments?: IRequestAttachment[];
  formData: DynamicFormFieldPayload[];
}

export interface AttributeConfig {
  attributeValue: number | string;
  attributeName: string;
  type: string;
  i18nKey?: string;
  hidden?: boolean;
  isRequired?: boolean;
  defaultValue?: string;
  maxAllowedValue?: string;
}

export interface ManageAttributeConfigForNewFieldModel {
  fieldKey: string;
  fieldTypeId: FormTypes;
  fieldTypeName: string;
  serviceFieldOption?: any[];
  description?: string;
  attributes?: AttributeConfig[];
  placeholder?: string;
  isRequired?: boolean;
  fieldOptions?: ServiceFieldOption[];
}

// FieldMaster model matching the C# entity structure
export interface FieldMaster {
  FieldId?: number; // Auto generated field from database
  FieldLabel: string; // fieldName
  FieldLabelAr: string; // fieldName (Arabic)
  FieldTypeId: string; // "FieldType"
  IsRequired?: boolean; // true by default
  DisplayOrder?: number; // handled from .net api pass 0 from react
  IsActive?: boolean; // 1
  Placeholder?: string; // fieldDescription
  FieldDescription?: string; // fieldDescription
  EntityId?: number; // 0
  Attributes?: string; // JSON String
  fieldOptions?: ServiceFieldOption[]; // For dropdown and radio group fields
  fieldGroup?: DynamicFieldModel[]; // For field grouping
}
