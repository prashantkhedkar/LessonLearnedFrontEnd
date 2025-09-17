import { TRUE } from "sass";
import CommonConstant from "../../helper/_constant/common.constant";
import { IUserDetail } from "./userModel";

// GLOBAL GENERIC WILL CONTAIN DATA SHARED ACROSS MULTIPLE MODULES
export interface ILookup {
  id: number;
  lookupName: string;
  lookupNameAr: string;
  lookupType: string;
  lookupId: number;
  colorCode: string | null;
  imageUrl: string | null;
  lookupCode: string | null;
  orderBy: number;
  bgColorCode: string | null;
  isActive: boolean | null;
}

export interface IUnits {
  value: number;
  label: string;
}
export const UnitInitValue: IUnits = {
  value: 0,
  label: "",
};

export interface IUserCommentModel {
  id: number;
  recordId: number;
  moduleTypeId: number;
  createdBy?: string;
  createdOn?: string;
  durationSinceLastPostedComment?: string;
  durationSinceLastActivity?: string;
  postedComment: string;
  userPictureUrl?: string;
  userCommentSubmissionStatus?: string;
  createdByUsername?: string;
  createdByUsernameAr?: string;
  createdDate?: string;
  updatedDate?: string;
  updatedBy?: string;
  isAllowDelete?: boolean;
  createdByUserGender?: string;
}

export interface IUserActivityModel {
  id: number;
  moduleTypeId: number;
  displayNameEn: string;
  displayNameAr: string;
  durationSinceLastActivity?: string;
  durationSinceLastPostedComment?: string;
  notificationType: string;
  headerText: string;
  bodyText: string;
  createdBy: string;
  lang: string;
  activityDate?: Date;
  activitySeriesCancelStatus?: boolean;
  activityOccurrenceCancelStatus?: boolean;
  gender?: string;
  totalRowCount?: number;
}

export interface IAttachment {
  id: number;
  moduleId?: string;
  fileName?: string;
  fileType?: string;
  docUrl?: string;
  itemId?: number;
  file64Bytes?: string;
  fileSize?: number;
  docGUID?: string;
  createdOn?: string;
  createdBy?: string;
  updatedOn?: string;
  updatedBy?: string;
  isActive?: boolean;
  formFile?: any;
  formData?: any;
  folderURL?: string;
  createdByEmailAddress?: string;
  draftId?: string; //Internal ID for managing draft attachments which do not have module id
  moduleTypeId?: number | undefined;
  isAllowDelete?: boolean;
  chunkFileReferenceGuid?: string;
  chunkFileSize?: number;
  chunkFileTempPath?: string;
  sectionId?: number;
  componentId?: number;
  storageServer?: string;
  contentType?: number;
  sharing?: number;
  overwriteExistingFile?: boolean;
  folderId?: number;
  currentShareFileIndex?: number;
  totalNumberOfUploadedFiles?: number;
  docTitle?: string;
}

export interface IUserAccess {
  moduleId?: number;
  moduleName?: string;
  isAdd?: boolean;
  isEdit?: string;
  isView?: string;
  isDelete?: number;
}

export interface IRoleAcces {
  roleName: string;
  moduleName: string;
  userId: number;
  unit: IUnit;
  actions: IRole[];
}

export interface IUnit {
  MainUntId: number;
  unitId: number;
  unitName: string;
}

export interface IRole {
  actionName: string;
}

export interface IUnits {
  value: number;
  label: string;
}

export interface LegendItem {
  color: string;
  description: string;
}

export interface IPageLog {
  username: string;
  pageName: string;
}

export interface IAttachmentMediaCenter {
  moduleId: string;
  moduleTypeId: number;
  applicationId:number;
  fileName: string;
  fileType: string;
  id: number;
  draftId?: string; //Internal ID for managing draft attachments which do not have module id
  docUrl?: string;
  createdOn?: string;
  createdBy?: string;
  updatedOn?: string;
  updatedBy?: string;
  isActive?: boolean;
  chunkFileReferenceGuid: string;
  fileDescription:string;
  unitId?: string;
}

// {  "chunkFileReferenceGuid": "string",  "fileName": "string",  "jpModule": 1,  "dbRecordId": 0,  "uploadedBy": "string",  "folderURL": "string"}
export interface IAttachmentSharepoint {
  chunkFileReferenceGuid: string;
  fileName: string; //filename with extension
  jpModule: number; //moduleTypeId
  dbRecordId: number; //moduleId
  uploadedBy: string;
  folderURL: string;
  ownerId?: string;
  docTitle?: string;
}

export interface IAttachmentInitializeSharepoint {
  jpModule: number;
  uniqueGuid: string;
  userName: string;
}

// Generic Object used with UserAttachmentUploadButton
export interface validateTotalFilesToUploadProp {
  maxAllowedUploadLimit: number;
  totalUploaded: number;
  validationMessage: string; //Custom Message should be provided by module consuming this property
  fileName: string;
  action: string;
}

export interface IAttachmentFileInfoDuplicateCheckModel {
  fileName: string;
  moduleTypeId: number;
  moduleId: number;
  draftId?: string;
}
export const attachmentFileInfoDuplicateCheckInitialValue: IAttachmentFileInfoDuplicateCheckModel =
{
  fileName: "",
  moduleTypeId: 0,
  moduleId: 0,
  draftId: "",
};

export interface IUserAttachmentFileInfoDuplicateCheckModel {
  fileName: string;
  moduleTypeId: number;
  moduleId: number;
  draftId: string;
  path: string;
}

export const userAttachmentFileInfoDuplicateCheckInitialValue: IUserAttachmentFileInfoDuplicateCheckModel =
{
  fileName: "",
  moduleTypeId: 0,
  moduleId: 0,
  draftId: "",
  path: "",
};

export interface IEmployeePhotoModel {
  uNumber: string;
}

export interface IUserAttachmentResponseModel {
  data: IUserAttachmentDataResponseModel;
  success: boolean;
  responseCode: number;
  message: string;
}

export interface IUserAttachmentDataResponseModel {
  itemID: number;
  docGUID: string;
  docUrl: string;
}

export interface UserAttachmentFileSystemSearch {
  pageNumber: number;
  rowsPerPage: number;
  searchByParams: string;
  sortColumnWithDirection: string;
  searchCategory: string;
  path?: string;
  draftId?: string;
  projectId?: number;
}

export const userAttachmentSearchInitValue: UserAttachmentFileSystemSearch = {
  pageNumber: 1,
  rowsPerPage: CommonConstant.ROWS_PER_PAGE,
  searchByParams: "",
  sortColumnWithDirection: "Modified ASC",
  searchCategory: "",
  path: "",
};

export interface UserAttachmentFileSystemReq {
  folderUrl: string;
}

export interface UserAttachmentFileSystemSerachReq {
  fileName: string;
}

export interface IUpdateUserAttachmentFileSystemModel {
  id: number;
  moduleId: number;
  docUrl: string;
  docGuid?: string;
  itemID: number;
  fileType: string;
  name: string;
  contentType: number;
  sharing: number;
  message: string;
  isActive: boolean;
  chunkFileReferenceGUID: string;
  fileSize: number;
  draftId: string;
  moduleTypeId?: number;
}
export const updateShareFilesModel: IUpdateUserAttachmentFileSystemModel = {
  id: 0,
  moduleId: 0,
  docUrl: "",
  docGuid: "",
  itemID: 0,
  name: "",
  contentType: 0,
  sharing: 0,
  message: "",
  isActive: false,
  chunkFileReferenceGUID: "",
  fileSize: 0,
  draftId: "",
  fileType: "",
};

export interface AttachmentFolderInfoDuplicateCheckModel {
  moduleId: number;
  path: string;
  folderName: string;
  draftId: string;
  moduleTypeId?: number;
}

export interface ApplicationLinkCategory {
  id?: number;
  categoryNameAr: string;
  categoryNameEn: string;
  active: boolean;
  iconName: string;
}

export const ApplicationLinkCategoryInitialValue: ApplicationLinkCategory = {
  id: 0,
  categoryNameAr: "",
  categoryNameEn: "",
  active: true,
  iconName: "",
};

export interface Countries {
  id?: number;
  nameAr: string;
  nameEn: string;
  code: boolean;
}

export interface IJPUserGroup {
  groupId?: number;
  groupName: string;
  groupMembers: IUserDetail[];
}

export const jpUserGroupInitialValue: IJPUserGroup = {
  groupId: 0,
  groupName: "",
  groupMembers: [],
};

export interface IUserGroupParams {
  lang?: string | "";
  pageNumber: number | 1;
  rowsPerPage: number | 10;
  searchByParams?: string | "";
  sortColumnWithDirection?: string;
}

export const userGroupParamsInitialValue: IUserGroupParams = {
  pageNumber: 1,
  rowsPerPage: CommonConstant.ROWS_PER_PAGE,
  searchByParams: "",
  sortColumnWithDirection: "CreatedTimestamp desc",
};

export interface IApplicationLinkCategoryParams {
  lang?: string | "";
  pageNumber: number | 1;
  rowsPerPage: number | 10;
  searchByParams?: string | "";
  sortColumnWithDirection?: string;
}

export const applicationLinkCategoryParamsInitialValue: IApplicationLinkCategoryParams =
{
  pageNumber: 1,
  rowsPerPage: CommonConstant.ROWS_PER_PAGE,
  searchByParams: "",
  sortColumnWithDirection: "CreatedOn desc",
};

export interface IApplicationLinkParams {
  lang?: string | "";
  pageNumber: number | 1;
  rowsPerPage: number | 10;
  searchByParams?: string | "";
  sortColumnWithDirection?: string;
}

export const applicationLinkParamsInitialValue: IApplicationLinkParams = {
  pageNumber: 1,
  rowsPerPage: CommonConstant.ROWS_PER_PAGE,
  searchByParams: "",
  sortColumnWithDirection: "CreatedOn desc",
};

export interface ISuggestionLinkParams {
  lang?: string | "";
  pageNumber: number | 1;
  rowsPerPage: number | 10;
  searchByParams?: string | "";
  sortColumnWithDirection?: string;
}

export const suggestionSearchParamsInitialValue: ISuggestionLinkParams = {
  pageNumber: 1,
  rowsPerPage: CommonConstant.ROWS_PER_PAGE,
  searchByParams: "",
  sortColumnWithDirection: "createdtimestamp DESC",
};

export interface IMeeting {
  id: number;
  meetingId: number;
  notificationHeader: string;
  // notificationBodyEn?: string;
  // notificationBodyAr: string;
  // notificationType: string;
  meetingSubject: string;
  roomName: string;
  meetingDate: string;
  meetingStartTime: string;
  meetingEndTime: string;
  // EndDate: string;
  meetingIn: string;
}

// New for FMS
export interface IRequestActivityLogsModel {
  timelineId: number;
  date: string;
  time: number;
  description: string;
  createdBy: string;
  entityId?: number;
  serviceId?: number;
}

export interface ITimelineActivitySaveModel {
  actionDetails : string;
  requestId: number;
  actionId: number;
  stepId?:number;
  previousStatus? : number;
  newStatus? : number;
  logType?: number;
  entityId: number;
}

export interface ITimelineActivityRetrieveModel {
  entityId: number;
  serviceId: number;
}

export interface StepperModel {
    stepId? : number;
    stepOrder : number;  
    stepName : string;  
}