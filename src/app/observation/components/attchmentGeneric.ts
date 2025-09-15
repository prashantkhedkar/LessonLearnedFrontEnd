import { TRUE } from "sass";
import CommonConstant from "../../helper/_constant/common.constant";

export interface IAttachment {
  id: number;
  moduleId?: string;
  fileName?: string;
  fileType?: string;
  docUrl?: string;
  itemId?: number;
  file64Bytes?: string;
  fileSize: number;
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
  file?:any;
}

export interface IAttachmentMediaCenter {
  moduleId: string;
  moduleTypeId: number;
  unitId: string;
  fileName: string;
  fileType: string;
  applicationId: number;
  id?: number;
  componentId?: number;
  draftId?: string; //Internal ID for managing draft attachments which do not have module id
  docUrl?: string;
  createdOn?: string;
  createdBy?: string;
  updatedOn?: string;
  updatedBy?: string;
  isActive?: boolean;
  chunkFileReferenceGuid: string;
  sectionId?: number;
}


export interface ITaskAttachments {
  id: number | 0;

  taskId: number | 0;
  isActive?: boolean;
  taskGuid?: string;
  attachmentDescription: string
  fileSize: number;
  attachment: IAttachment;
  number?: number
  otherId?: string
  file?


}

export interface RequestAttachment {

  id: number | 0,
  requestID: number | 0,
  title: string,
  fileName: string,
  fileBase64: string
}


export interface RequestAttachmentList {

  id: number | 0,
  title: string,
  fileName: string,

}

// Generic Object used with UserAttachmentUploadButton 
export interface validateTotalFilesToUploadProp {
  maxAllowedUploadLimit: number,
  totalUploaded: number,
  validationMessage: string, //Custom Message should be provided by module consuming this property
  fileName: string,
  action: string,
}
export interface TagResponse{
  id:number
  name:string
  nameadd:string
}

export interface IAttachmentDb{
  id: number
  attachmentTitle: string
  fileName: string
  fileBase64: string
  fileBytes: string,
  attachmentType?:string
}