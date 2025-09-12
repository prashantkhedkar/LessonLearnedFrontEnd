import { IAttachment, IJPUserGroup, ILookup } from "./global/globalGeneric";
import { IUserDetail } from "./global/userModel";
import { Name, Unit } from "./global/personModel";

export interface Row {
  id: number;
  createdDate: string;
  unitNameAR?: string;
  [key: number]: string;
  progress: string;
  serviceId: number;
  serviceName?: string;
  serviceUserType?: string;
  serviceCode?: string;
  serviceStatus?: string;
  statusId?: number;

  requestId?: number;
  requestNumber?: string;
  docUrl?: string;
  attachmentId: number;
  categoryId: number;
  currentStepId?: number;
  requestTitle?: string;
  priority?: string;
  createdBy?: number;
  serviceRequestCurrentStepId?: number;
  serviceRequestStatusId?: number;
  serviceRequestId?: number;
  actionBy?: string;
}

export interface MyObject {
  lookupName: string;
  lookupNameAr: string;
  lookupCode: string | null;
  lookupType: string | null;
  lookupId: number | null;
  colorCode: string | null;
  imageUrl: string | null;
}

export function createEmptyRow(): Row {
  const emptyMyObject: MyObject = {
    lookupName: "",
    lookupNameAr: "",
    lookupCode: null,
    lookupType: null,
    lookupId: null,
    colorCode: null,
    imageUrl: null,
  };

  const emptyILookup: ILookup = {
    id: 0,
    lookupName: "",
    lookupNameAr: "",
    lookupCode: "",
    lookupType: "",
    lookupId: 0,
    colorCode: "",
    imageUrl: "",
    orderBy: 0,
    bgColorCode: "",
    isActive: null,
  };

  const emptyIUserDetail: IUserDetail = {
    userId: 0,
    unitId: 0,
    nameEn: "",
    nameAr: "",
    displayName: "",
    userName: "",
    militaryNumber: "",
    displayNameAr: "",
  };

  const emptyName: Name = {
    ar: "",
    en: "",
  };

  const emptyUnit: Unit = {
    id: "",
    ar: "",
    en: "",
  };

  const emptyRow: Row = {
    id: 0,
    serviceId: 0,
    createdDate: "",
    progress: "",
    requestId: 0,
    attachmentId: 0,
    categoryId: 0,
  };

  return emptyRow;
}
