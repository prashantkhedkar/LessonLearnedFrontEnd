export interface PersonModel {
  id?: number
  , personId: number
  , userId: number
  , email?: string
  , userType: string
  , gradeType: string
  , name: Name
  , workStatus: string
  , militaryNumber: string
  , joiningDate: string
  , position?: Position
  , job?: Job
  , unit: Unit
  , mainUnit: MainUnit
  , nationality: Nationality
  , classification: Classification
  , mobileNumber: string
  , extensionNumber: string
  , totalRowCount?: number
  , userName?: string
  , fullName: Name
  , rank?: string
  , militaryType?: string
  , status?: string
  , gradeWeight?: number
  , gradeId?: number
  , favourites?: []
  , gender?: string
  , lineManager?: LineManager  
  , nextPromotionDate?: string
  , lastPromotionDate?: string  
}

export interface LineManager {
  id: string
  , ar: string
  , en: string
}
export interface Classification {
  ar: string;
  en: string;
}
export const personModelClassificationInitialValue: Classification = {
  ar: "",
  en: "",
};

export interface Job {
  ar: string;
  en: string;
}
export const personModelJobInitialValue: Job = {
  ar: "",
  en: "",
};

export interface Position {
  ar: string;
  en: string;
}
export const personModelPositionInitialValue: Position = {
  ar: "",
  en: "",
};

export interface Unit {
  id: string;
  ar: string;
  en: string;
}
export const personModelUnitInitialValue: Unit = {
  id: "",
  ar: "",
  en: "",
};

export interface MainUnit {
  id: string;
  ar: string;
  en: string;
}
export const personModelMainUnitInitialValue: MainUnit = {
  id: "",
  ar: "",
  en: "",
};

export interface Name {
  ar: string;
  en: string;
}
export const personModelNameInitialValue: Name = {
  ar: "",
  en: "",
};

export interface Nationality {
  ar: string;
  en: string;
}
export const personModelNationalityInitialValue: Nationality = {
  ar: "",
  en: "",
};

export const personGroupMembersModel: PersonGroupMembersModel = {
  groupName: "",
  groupId: 0,
};

export const personModelInitialValue: PersonModel = {
  personId: 0,
  userId: 0,
  email: "",
  userType: "",
  gradeType: "",
  name: personModelNameInitialValue,
  workStatus: "",
  militaryNumber: "",
  joiningDate: "",
  position: personModelPositionInitialValue,
  job: personModelJobInitialValue,
  unit: personModelUnitInitialValue,
  mainUnit: personModelMainUnitInitialValue,
  nationality: personModelNationalityInitialValue,
  classification: personModelClassificationInitialValue,
  mobileNumber: "",
  extensionNumber: "",
  id: 0,
  userName: "",
  fullName: personModelNameInitialValue,
  rank: "",
};

export interface IUserSearchPersonModel {
  militaryNumber: string;
  unumber: string;
  name: string;
  pageNumber: number;
  rowsPerPage: number;
  allowUnitSearch: boolean;
  unitId?: number
}

export interface PersonGroupMemberSharedFileModel {
  displayName: string;
  personId: number;
}

export interface PersonGroupMembersModel {
  groupName: string;
  groupId: number;
}

export interface AddUpdatePersonModel {
  data: PersonModel;
  message: string;
  status: number;
  error: boolean;
}

export const addUpdatePersonModelInitialValue: AddUpdatePersonModel = {
  data: personModelInitialValue,
  message: "",
  status: 0,
  error: false,
};

export interface AddUnitFavRequestModel {
  unitId: number;
  unitName: string;
  isFavourite: boolean;
}
