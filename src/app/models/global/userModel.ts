import { PersonGroupMemberSharedFileModel, PersonGroupMembersModel, PersonModel } from "./personModel"

export interface IUserDetail {
  userId?: number | 0
  , unitId?: number
  , nameEn: string
  , nameAr: string
  , displayName: string
  , displayNameAr: string
  , userName: string
  , militaryNumber: string
  , rankName?: string
  , rowNum?: number
  , totalRowCount?: number
  , gender?: string
  , unitName?: string
  , unitNameAR?: string
  , attendeeDisplayNameWithoutRank?: string
  , rank?: string  
}

export const userDetailInitialValue: IUserDetail = {
  userId: 0,
  unitId: 0,
  nameEn: "",
  nameAr: "",
  displayName: "",
  userName: "",
  militaryNumber: "",
  displayNameAr: ""
}


export interface IUserSearch {
  unitId: string
  , searchText: string
  , lang?: string
}

export interface IUserGroupSearch {
  searchText: string
  moduleTypeId?: number
  , lang?: string
}


export interface IUserTeams {
  unitId: string
  , lang?: string
}


export interface IProjectSearch {
  searchText: string
  , lang?: string
  , isPendingAction: boolean
}

export interface IUserSearchExtraParams {
  unitId: number
  , projectId: number
  , searchText: string
  , excludedUsers?: string
  , meetingEventId: number
}

export interface IUsers {
  userName: string
  , userId: number
}

export interface IUsers {
  userid?: number | 0
  , unitId?: number
  , userName: string
  , displayName: string
  , type?: string
}


export interface IPersonDetailUserGroup {
  groupId?: string;
  groupName?: string;
  groupMembers: PersonModel[];
}

export const personDetailInitialValue: IPersonDetailUserGroup = {
  groupName: ""
  , groupId: ""
  , groupMembers: []
}

export interface IPersonDetailSharedFilesUserGroup {
  groupId?: string;
  groupName?: string;
  groupMembers: PersonGroupMemberSharedFileModel[];
}
export const personDetailSharedFilesUserGroup: IPersonDetailSharedFilesUserGroup = {
  groupName: ""
  , groupId: ""
  , groupMembers: []
}

export interface IMemberOfGroupSearch {
  groupId: string
  , moduleTypeId?: number
  , lang?: string
}
export interface ILeaveApplicationRequest {
  startDate?: string,
  endDate?: string,
  leaveType: string,
  remarks: string,
  approverPersonModel?: IKeyValuePair,
  approverPersonId?: number,
  insideUnitedArabEmirates: boolean,
  internationalTravelDestination?: string,
  mobileNumber: string,
  salaryAdvance: boolean,
  substitutePersonModel?: IKeyValuePair,
  substitutePersonId?: number,
  travelDaysRequired: boolean,
  travelDays?: number
}
export const LeaveApplicationRequestInitialValue: ILeaveApplicationRequest = {
  leaveType: "",
  remarks: "",
  insideUnitedArabEmirates: false,
  mobileNumber: "",
  salaryAdvance: false,
  travelDaysRequired: false
}

export interface IKeyValuePair {
  label?: string;
  labelAr?: string;
  value: number;
}

export interface IPastLeaves {
  id: number,
  code: string
  startDate: string,
  endDate: string,
  duration: string,
  dirId: string,
  remarks: string,
  roadDays: string,
  description: string
}

export interface IPastLeavesTawasul {
  id: number,
  personId:number,
  code: string
  startDate: string,
  endDate: string,
  created:string,
  didRequestTravelDays:string,
  rejectionMessage:string,
  status:string,
  approvedDate:string,
  duration: string,
  description: string
}

export interface EmployeNotifications {
   fullName : string  ,
    dirId :string,
    seq :number,
    sender :string,
    dirCreatedSince :string,
    dirWaitingApprovalSince :string,
    dtpName :string,
    directiveNo :string,
    issueGregorianDate  : string,
}



