import { IAttachment, IJPUserGroup, ILookup } from "./global/globalGeneric";
import { IUserDetail } from "./global/userModel";
import { Name, Unit } from "./global/personModel";

export interface Row {
  id: number;
  createdDate: string;
  statusId?: number;
  observationNumber?: string;
  docUrl?: string;
  attachmentId: number;
  createdBy?: number;
  observationTitle?: string;
  progress: string;
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
    createdDate: "",
    attachmentId: 0,
    progress: "",
  };

  return emptyRow;
}
