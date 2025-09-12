import { IAttachment, IAttachmentMediaCenter, ILookup, IMeeting, IRoleAcces, IUserAccess, IUserActivityModel, IUserCommentModel } from "../global/globalGeneric";
import { Row } from "../row";

export interface globalState {
    viewLookups: ILookup[] | null;
    userAttachment: IAttachment[];
    userAttachmentFileSystem: Row[];
    userComments: IUserCommentModel[];
    userActivity: IUserActivityModel[];
    userTimelineActivity: IUserActivityModel[];
    submissionStatus: string | null;
    userAccess: IUserAccess[] | null;
    userRoleAccess: IRoleAcces[];
    allowCopyKey: boolean;
    userAttachmentMediaCenter: IAttachmentMediaCenter[];
    uploadProgress: number;
    profileAvatar: string;
    unitLogo: string;
    ugPageNumber: number;
    tcPageNumber: number;    
    lnkPageNumber: number;
    userAttachmentGridPageNumber: number;
    mRoomPageNumber: number;
    suggPageNumber: number;
    gMRRPageNumber: number;
    appLinkListPageNumber: number;
    IsdragNdropInProgress: boolean;
    IsFileshareLinkingInProgress: boolean;
    ShouldRefreshGridWhenTotalUploadComplete: boolean;
    IsVisibleDragNDropPopupModel: boolean;
    AtleastOneFileWasUploadedInSharedFile?: boolean;
    showNotification : boolean;
    isHeader: boolean;
    activeTheme : string;
    meetingAlerts: IMeeting[];
    adminRoomBookingListPageNumber: number;
}

// INITIAL VALUE SET FOR PROJECT STATE MANAGEMENT
export const initialGlobalState: globalState = {
    viewLookups: null,
    userAttachment: [],
    userComments: [],
    userActivity: [],
    userTimelineActivity: [],
    submissionStatus: null,
    userAccess: [],
    userRoleAccess: [],
    allowCopyKey: false,
    userAttachmentMediaCenter: [],
    uploadProgress: 0,
    profileAvatar: "",
    unitLogo: "",
    userAttachmentFileSystem: [],
    ugPageNumber: 1,
    tcPageNumber: 1,

    lnkPageNumber: 1,

    mRoomPageNumber: 1,
    suggPageNumber: 1,
    gMRRPageNumber: 1,
    userAttachmentGridPageNumber: 1,
    appLinkListPageNumber: 1,

    IsdragNdropInProgress: false,
    IsFileshareLinkingInProgress: false,
    ShouldRefreshGridWhenTotalUploadComplete: false,
    IsVisibleDragNDropPopupModel: false,
    AtleastOneFileWasUploadedInSharedFile: false,
    showNotification: false,
    isHeader: false,
    activeTheme: "",
    meetingAlerts: [],
    adminRoomBookingListPageNumber: 1
}