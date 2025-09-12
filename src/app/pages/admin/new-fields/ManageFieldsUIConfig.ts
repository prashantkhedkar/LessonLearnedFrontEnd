import { DynamicFieldModel, FormTypes } from "../../../modules/components/dynamicFields/utils/types";

export const ManageFieldsUIConfig: DynamicFieldModel[] = [
	{
		mappingId: "1",
		fieldKey: "FieldType",
		serviceId: "",
		fieldTypeId: FormTypes.dropdownlist,
		fieldId: 1,
		fieldLabel: `LABEL.FIELDTYPE`,
		serviceFieldOption: [],
		isRequired: true,
		defaultValue: "",
		placeholder: `LABEL.FIELDTYPE`,
		attributes: { maxLength: "50", placeholder: `Field Type` },
	},
	{
		mappingId: "2",
		fieldKey: "fieldName",
		serviceId: "6",
		fieldId: 2,
		fieldTypeId: FormTypes.text,
		fieldLabel: `LABEL.FIELDTITLE`,
		serviceFieldOption: [],
		isRequired: true,
		defaultValue: "",
		placeholder: `LABEL.FIELDTITLE`,
		attributes: { maxLength: "50", placeholder: `Field Title` },
	},
	{
		mappingId: "3",
		fieldKey: "fieldDescription",
		serviceId: "",
		fieldId: 3,
		fieldTypeId: FormTypes.texteditor,
		fieldLabel: `LABEL.FIELDDESCRIPTION`,
		serviceFieldOption: [],
		isRequired: true,
		defaultValue: "",
		placeholder: `LABEL.FIELDDESCRIPTION`,
		attributes: { maxLength: "50", placeholder: `Field Description` },
	}
]