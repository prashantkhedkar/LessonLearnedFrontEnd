import { DynamicFieldModel } from "../../modules/components/dynamicFields/utils/types";
import { SelectedFieldModel } from "./fieldMasterModel";
import { IAttachmentMediaCenter } from "./globalGeneric";
import { UnitModel } from "./unitModel";

export interface ServiceModel {
  serviceId?: number;
  serviceName: string;
  serviceCode?: string;
  categoryId: number;
  serviceUserType?: number;
  serviceDescription: string;
  requestorUnitId?: number;
  fulfilmentUnitId?: number;
  serviceAccess?: UnitModel;
  serviceFormEntities?: ServiceFormEntitiesMappingModel[];
  serviceFormUnits?: ServiceFormUnits[];
  status?: number;
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
  serviceEntityFields?: ServiceEntityFieldMappingModel[];
}

export interface ServiceCategoryModel {
  id?: number;
  categoryId?: number;
  categoryNameEn?: string;
  categoryNameAr?: string;
  categoryColor?: string;
  categoryIconName?: string;
  isActive: string;
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
}

export interface ServiceCategoryCrudModel {
  categoryId?: number;
  categoryNameEn?: string;
  categoryNameAr?: string;
  categoryColor?: string;
  categoryIconName?: string;
  isActive: boolean;
  description?: string;
}

export interface CategoryWithServiceCountModel {
  categoryId?: number;
  categoryNameEn?: string;
  categoryNameAr?: string;
  categoryColor?: string;
  categoryIconName?: string;
  serviceCount: number;
  description?: string;
}

export interface IUnitDetailModel {
  userId?: number;
  userName?: string;
  unitId?: number;
  unitName?: string;
  unitNameAr?: string;
  displayName?: string;
  militaryNumber?: string;
  rankName?: string;
  type?: string;
  parentUnitId?: string;
  id?: number;
}

export interface ServiceFormUnits {
  id: number;
  serviceId?: number;
  entityTypeId?: number;
  unitId: number;
  unit?: IUnitDetailModel;
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
  draftGuid?: number;
  label?: string;
}

export interface ServiceFormEntitiesMappingModel {
  id?: number;
  serviceId: number;
  entityTypeId?: number;
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
}

export interface ServiceEntityFieldMappingModel {
  mappingId?: number;
  serviceId?: number;
  serviceFormEntityId?: number;
  fieldId: number;
  displayOrder: number;
  isRequired: boolean;
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
}

export interface AdminSetupServiceModel {
  serviceId: number;
  entityId: number;
  serviceEntityFields?: ServiceEntityFieldMappingModel[];
  serviceFormUnits?: ServiceFormUnits[];
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
}

export interface IServiceFormUnitsModel {
  id: number | 0;
  description: string;
  DraftGuid: number;
  isActive: boolean;
}

export interface ServiceRequestModel {
  requestId: number;
  requestNumber: number;
  serviceId?: number;
  serviceName?: string;
  requestedBy: number;
  requestDate?: Date;
  requestType: number;
  requestingUnitId?: number;
  currentStepId: number;
  statusId: number;
  feedbackStatus?: number;
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
  serviceRequestDetails: DynamicFieldModel[];
  serviceRequestAttachment?: IRequestAttachment[];
  completionDate?: string;
}

export interface ServiceRequestSearchModel {
  pageNumber: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: string;
}

export interface ServiceRequestFilterModel {
  categoryId?: number;
  requestDateFrom?: Date;
  requestDateTo?: Date;
  statusId?: number;
  serviceId?: number;
}

export interface ServiceWorkflowActionSearchModel {
  serviceId: number;
  entityId: number;
  statusId: number;
  currentStepId: number;
  requestId: number;
}

export interface IRequestAttachment {
  requestId: number;
  description: string;
  docPath: string;
  attachment: IAttachmentMediaCenter;
  isActive?: boolean;
  createdOn?: string;
  createdBy?: number;
  // Edit Mode All Pages
  updatedOn?: string;
  updatedBy?: number;
  index?: number;
  draftId?: string;
}

export interface ServiceEntitiesMaster {
  entityId: number;
  entityNameEn: string;
  entityNameAr: string;
  description?: string;
  displayOrder: number;
  isDefault?: boolean;
  isActive: boolean;
  isMultiselectUnit: boolean;
}

export interface ServiceRequestUnits {
  id: number;
  unitId: number;
  unitName: string;
  unitType: number;
}

export interface ServiceEntityAndFormMasterDto {
  entityId: number;
  entityNameEn: string;
  entityNameAr: string;
  description?: string;
  displayOrder: number;
  isDefault?: boolean;
  isActive: boolean;
  isMultiselectUnit: boolean;
  loggedInUserUnitId: string;
  serviceRequestUnitId: string;
}