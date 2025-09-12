export interface FieldMasterModel {
    fieldId?: number;
    fieldLabel?: string;
    fieldLabelAr?: string;
    fieldTypeId?: number;
    fieldTypeName?: string;
    entityId?: number;
    isRequired: boolean;
    displayOrder: number;
    isActive?: boolean;
    placeholder?: string;
    fieldDescription?: string;
    attributes?: string;
    createdBy?: number;
    createdDate?: Date;
    updatedBy?: number
    updatedDate?: Date;
    isSelected?: boolean;
    guid?: string;
}

export interface FieldLayout {
    //fields : {fieldId: string; fieldLabel: string; fieldLabelAr: string; fieldTypeName}[];
    fields: FieldMasterModel[];
    columns: { id: string; title: string; showRequiredCheckbox: boolean; fields: FieldMasterModel[] }[];
    columnOrder: string[];
}

export interface SelectedFieldModel {
    displayOrder?: number;
    fieldId: number;
    isRequired: boolean;
}

export interface FieldTypeMasterModel {
    fieldId?: number;
    fieldLabel?: string;
    fieldLabelAr?: string;
    fieldDescription?: string;
    fieldTypeId?: number;
    isActive?: boolean;
}