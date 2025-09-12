export interface FieldTypeMasterModel {
    fieldTypeId?: number;
    fieldTypeName?: string;
    description?: string;
    attributes?: FieldAttributes;
    isActive?: boolean;
}



export interface FieldAttributes {
    minLength? : number;
    maxLength? : number;
    minValue? : number;
    maxValue? : number;
    regularExpression? : string;
    placeHolder? : string;
}

