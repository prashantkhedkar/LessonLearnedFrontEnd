export interface FieldGroupMappingModel {
    mappingId?: number;
    fieldId: number; // Parent field grouping ID
    componentFieldId: number; // Selected field ID  
    displayOrder?: number;
    isRequired?: boolean;
    placeholder?: string;
    fieldDescription?: string;
    fieldLabel?: string;
    attributes?: string;
    createdBy?: number;
    createdAt?: Date;
    updatedBy?: number;
    updatedAt?: Date;
}