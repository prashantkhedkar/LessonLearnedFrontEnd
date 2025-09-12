import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { requests } from "../../helper/axiosInterceptor";
import { initialGlobalState } from "../../models/stateManagement/globalState";
import { responseType } from "../../models/global/responseResult";
import {
  AttachmentFolderInfoDuplicateCheckModel,
  IAttachment,
  IAttachmentFileInfoDuplicateCheckModel,
  IAttachmentInitializeSharepoint,
  IAttachmentMediaCenter,
  IAttachmentSharepoint,
  IJPUserGroup,
  IPageLog,
  IRoleAcces,
  ITimelineActivitySaveModel,
  IUpdateUserAttachmentFileSystemModel,
  IUserCommentModel,
  IUserGroupParams,
  UserAttachmentFileSystemSearch,
} from "../../models/global/globalGeneric";

import {
  AddUpdatePersonModel,
} from "../../models/global/personModel";
import {
  IUnitSearchModel,
  UnitModel,
} from "../../models/global/unitModel";
import { DynamicFormSubmitPayload } from "../components/dynamicFields/utils/types";
// Redux Thunk Action
//Get User Access
export const fetchUserAccessAsync = createAsyncThunk<any, { moduleId: any }>(
  "fetchUserAccessAsync",
  async (moduleId, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Generic/GetUserAccess?moduleId=${moduleId.moduleId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchUserRolesAccessAsync = createAsyncThunk<any>(
  "fetchUserRolesAccessAsync",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>("/Generic/GetUserRoles");
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Redux Thunk Action
export const fetchLookupAsync = createAsyncThunk<any>(
  "fetchLookupAsync",
  async (servicetype, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/admin/GetLookupValues`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const addUserCommentsAsync = createAsyncThunk<
  any,
  { formDataObject: IUserCommentModel }
>("addUserCommentsAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(`/Generic/SaveUserComments`, {
      ...formDataObject,
    });
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const deleteUserCommentsAsync = createAsyncThunk<
  any,
  { formDataObject: IUserCommentModel }
>("deleteUserCommentsAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(`/Generic/DeleteUserComments`, {
      ...formDataObject,
    });
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchUserCommentsListAsync = createAsyncThunk<
  any,
  { recordId: number; lang: string; moduleTypeId: number }
>(
  "fetchUserCommentsListAsync",
  async ({ recordId, lang, moduleTypeId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Generic/GetUserComments?recordId=${recordId}&lang=${lang}&moduleTypeId=${moduleTypeId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchUserActivityListAsync = createAsyncThunk<
  any,
  {
    recordId: number;
    lang: string;
    moduleTypeId: number;
    userId: string;
    topNth: number;
  }
>(
  "fetchUserActivityListAsync",
  async ({ recordId, lang, moduleTypeId, userId, topNth }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Generic/GetUserActivity?recordId=${recordId}&lang=${lang}&moduleTypeId=${moduleTypeId}&userId=${userId}&topNth=${topNth}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const uploadAttachmentChunkItemAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>("uploadAttachmentChunkItemAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post(
      `/Generic/UploadAttachmentChunks`,
      formDataObject.formData,
      {
        params: {
          fileName: formDataObject.draftId,
        },
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const uploadAttachmentChunkCompleteItemAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>(
  "uploadAttachmentChunkCompleteItemAsync",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post(
        `/Generic/UploadAttachmentChunksComplete`,
        formDataObject
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const deleteAttachmentChunkItemAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>("deleteAttachmentChunkItemAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post(
      `/Generic/DeleteAttachmentChunk`,
      formDataObject
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const addAttachmentItemAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachmentMediaCenter }
>("addAttachmentItemAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post(`/Generic/AddAttachment`, formDataObject);
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const downloadAttachmentItemAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>("GetAttachment", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post(`/Generic/GetAttachment`, formDataObject);
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const deleteAttachmentAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>("deleteAttachmentAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post("/Generic/DeleteAttachment", formDataObject);
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchAttachmentListAsync = createAsyncThunk<any, { recordId: string, moduleTypeId: any, draftId: string}>(
  "fetchAttachmentListAsync",
  async ({ recordId, moduleTypeId, draftId }, thunkApi) => {

    try {
      return await requests.get<responseType>(
        `/Generic/GetAttachmentList?recordId=${recordId}&moduleTypeId=${moduleTypeId}&draftId=${draftId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error });
    }
  }
);


export const downloadAttachmentAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>("downloadAttachmentAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post(`/Generic/DownloadAttachment`, formDataObject);
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const insertPageLog = createAsyncThunk<
  any,
  { formDataObject: IPageLog }
>("addUserCommentsAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(`/Generic/InsertPageLog`, {
      ...formDataObject,
    });
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const uploadAttachmentChunkSharePointItemAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>(
  "uploadAttachmentChunkSharePointItemAsync",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post(
        process.env.REACT_APP_API_SHAREPOINT_UPLOAD_URL_INPROGRESS_API!,
        formDataObject.formData,
        {
          params: {
            fileName: formDataObject.draftId,
            chunkSize: formDataObject.chunkFileSize,
          },
          headers: {
            "Content-Type": "application/json",
          },
          custom: {
            mediaCenterURL: true,
          },
          baseURL: process.env.REACT_APP_API_SHAREPOINT,
        }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const uploadAttachmentChunkCompleteSharepointItemAsync =
  createAsyncThunk<any, { formDataObject: IAttachmentSharepoint }>(
    "uploadAttachmentChunkCompleteSharepointItemAsync",
    async ({ formDataObject }, thunkApi) => {
      try {
        return await requests.post(
          process.env.REACT_APP_API_SHAREPOINT_UPLOAD_URL_COMPLETE_API!,
          formDataObject,
          {
            custom: {
              mediaCenterURL: true,
            },
            baseURL: process.env.REACT_APP_API_SHAREPOINT,
          }
        );
      } catch (error: any) {
        console.log(error);
        return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
      }
    }
  );

export const uploadAttachmentChunkInitializeFolderSharepointItemAsync =
  createAsyncThunk<any, { formDataObject: IAttachmentInitializeSharepoint }>(
    "uploadAttachmentChunkInitializeFolderSharepointItemAsync",
    async ({ formDataObject }, thunkApi) => {
      try {
        return await requests.post(
          process.env.REACT_APP_API_SHAREPOINT_INITIALIZE_FOLDER_API!,
          formDataObject,
          {
            custom: {
              mediaCenterURL: true,
            },
            baseURL: process.env.REACT_APP_API_SHAREPOINT,
          }
        );
      } catch (error: any) {
        console.log(error);
        return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
      }
    }
  );

export const uploadAttachmentChunkCreateFolderSharepointItemAsync =
  createAsyncThunk<any, { formDataObject: IAttachmentSharepoint }>(
    "uploadAttachmentChunkCreateFolderSharepointItemAsync",
    async ({ formDataObject }, thunkApi) => {
      try {
        return await requests.post(
          process.env.REACT_APP_API_SHAREPOINT_CREATE_FOLDER_API!,
          formDataObject,
          {
            custom: {
              mediaCenterURL: true,
            },
            baseURL: process.env.REACT_APP_API_SHAREPOINT,
          }
        );
      } catch (error: any) {
        console.log(error);
        return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
      }
    }
  );

export const uploadAttachmentChunkDeleteFolderSharepointItemAsync =
  createAsyncThunk<any, { formDataObject: IAttachmentSharepoint }>(
    "uploadAttachmentChunkDeleteFolderSharepointItemAsync",
    async ({ formDataObject }, thunkApi) => {
      try {
        return await requests.post(
          process.env.REACT_APP_API_SHAREPOINT_DELETE_FOLDER_API!,
          formDataObject,
          {
            custom: {
              mediaCenterURL: true,
            },
            baseURL: process.env.REACT_APP_API_SHAREPOINT,
          }
        );
      } catch (error: any) {
        console.log(error);
        return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
      }
    }
  );

export const generateUniqueGuidAsync = createAsyncThunk<any>(
  "Generic/generateUniqueGuidAsync",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Generic/GenerateUniqueGuid`);
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const uploadAttachmentChunkMediaCenterItemAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>(
  "uploadAttachmentChunkMediaCenterItemAsync",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post(
        process.env.REACT_APP_API_MEDIACENTER_UPLOAD_URL_INPROGRESS_API!,
        formDataObject.formData,
        {
          params: {
            fileName: formDataObject.draftId,
            chunkSize: formDataObject.chunkFileSize,
          },
          headers: {
            "Content-Type": "application/json",
          },
          custom: {
            mediaCenterURL: true,
          },
          baseURL: process.env.REACT_APP_API_MEDIACENTER,
        }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const uploadAttachmentChunkCompleteMediaCenterItemAsync =
  createAsyncThunk<any, { formDataObject: IAttachmentMediaCenter }>(
    "uploadAttachmentChunkCompleteMediaCenterItemAsync",
    async ({ formDataObject }, thunkApi) => {
      try {
        return await requests.post(
          process.env.REACT_APP_API_MEDIACENTER_UPLOAD_URL_COMPLETE_API!,
          formDataObject,
          {
            custom: {
              mediaCenterURL: true,
            },
            baseURL: process.env.REACT_APP_API_MEDIACENTER,
          }
        );
      } catch (error: any) {
        console.log(error);
        return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
      }
    }
  );

export const addMediaCenterAttachmentAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachmentMediaCenter }
>(
  "generic/addMediaCenterAttachmentAsync",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        "/generic/AddMediaCenterAttachment",
        formDataObject
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const duplicateAttachmentInModuleCheckModelAsync = createAsyncThunk<
  any,
  { duplicateFileCheckModel: IAttachmentFileInfoDuplicateCheckModel }
>(
  "generic/duplicateAttachmentInModuleCheckModelAsync",
  async ({ duplicateFileCheckModel }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/generic/CheckForDuplicateAttachments`,
        { ...duplicateFileCheckModel }
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const duplicateFileInModuleCheckModelAsync = createAsyncThunk<
  any,
  { duplicateFileCheckModel: IAttachmentFileInfoDuplicateCheckModel }
>(
  "generic/duplicateFileInModuleCheckModelAsync",
  async ({ duplicateFileCheckModel }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/generic/CheckForDuplicateFiles`,
        { ...duplicateFileCheckModel }
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchGlobalSearchAsync = createAsyncThunk<
  any,
  {
    searchText: string;
    fromDate: string;
    endDate: string;
    lang: string;
    showMoreType: string;
    pageNumber: number;
    rowsPerPage: number;
  }
>(
  "fetchGlobalSearchAsync",
  async (
    {
      searchText,
      fromDate,
      endDate,
      lang,
      showMoreType,
      pageNumber,
      rowsPerPage,
    },
    thunkApi
  ) => {
    try {
      return await requests.get<responseType>(
        `/Generic/GetGlobalSearchList?searchText=${searchText}&fromDate=${fromDate}&endDate=${endDate}&lang=${lang}&showMoreType=${showMoreType}&pageNumber=${pageNumber}&rowsPerPage=${rowsPerPage}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchGlobalJPNotifications = createAsyncThunk<
  any,
  {
    lang: string;
    pageNumber: number;
    rowsPerPage: number;
    unitId: string;
    notificationCategoryId: number;
  }
>(
  "fetchGlobalJPNotifications",
  async (
    { lang, pageNumber, rowsPerPage, unitId, notificationCategoryId },
    thunkApi
  ) => {
    try {
      return await requests.get<responseType>(
        `/Generic/GetAllJPNotifications?lang=${lang}&pageNumber=${pageNumber}&rowsPerPage=${rowsPerPage}&unitId=${unitId}&notificationCategoryId=${notificationCategoryId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);


export const Notification_MakeAllRead = createAsyncThunk<
  any,
  { unitId; type: string }
>("Generic/Notification_MakeAllRead", async ({ unitId, type }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Generic/Notification_MakeAllRead?unitId=${unitId}&type=${type}`
    );
  } catch (error: any) {
    return { statusCode: 400, data: {} };
  }
});


export const UpdateNotificationStatus_delete = createAsyncThunk<
  any,
  { notificationId: string; moduleTypeId: number }
>(
  "UpdateNotificationStatus_delete",
  async ({ notificationId, moduleTypeId }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        "/Generic/UpdateNotificationStatus_delete",
        {},
        {
          params: {
            notificationId: notificationId,
            moduleTypeId: moduleTypeId,
          },
        }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const updateNotificationStatus = createAsyncThunk<
  any,
  { notificationId: string; moduleTypeId: number }
>(
  "updateNotificationStatusAsync",
  async ({ notificationId, moduleTypeId }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        "/Generic/UpdateNotificationStatus",
        {},
        {
          params: {
            notificationId: notificationId,
            moduleTypeId: moduleTypeId,
          },
        }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const addUpdateAssignee = createAsyncThunk<
  any,
  { formDataObject: AddUpdatePersonModel }
>("addUpdateAssignee", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(`/Generic/AddUpdateAssignee`, {
      ...formDataObject,
    });
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const getEmployeePhotoFromMod = createAsyncThunk<any>(
  "fetchEmployeePhotoFromMod",
  async (_, thunkApi) => {
    try {
      return await requests.customGet<responseType>(
        "/Integration/GetEmployeePhotoFromMod",
        {
          responseType: "blob",
        }
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchSubUnitsAsync = createAsyncThunk<any, { mainUnitId: string }>(
  "generic/fetchSubUnitsAsync",
  async ({ mainUnitId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Generic/GetSubUnits?mainUnitId=${mainUnitId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchUnitListAsync = createAsyncThunk<
  any,
  { formDataObject: IUnitSearchModel }
>("integration/fetchUnitListAsync", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>("/integration/GetUnitDetail", {
      ...formDataObject,
    });
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});


export const addUpdateUnit = createAsyncThunk<
  any,
  { formDataObject: UnitModel }
>("addUpdateUnit", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(`/Admin/AddUpdateUnit`, {
      ...formDataObject,
    });
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});


export const saveAttachmentsOnChunkCompletionAsync = createAsyncThunk<
  any,
  { formDataObject: IAttachment }
>(
  "generic/saveAttachmentsOnChunkCompletionAsync",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Generic/SaveAttachmentsOnChunkCompletion`,
        { ...formDataObject }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchAllProjectAttachmentAsync = createAsyncThunk<
  any,
  { formDataObject: UserAttachmentFileSystemSearch }
>(
  "generic/fetchAllProjectAttachmentAsync",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        "/generic/GetModuleAttachmentFiles",
        { ...formDataObject }
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);


export const fetchMainUnitListAsync = createAsyncThunk<
  any,
  { pageNumber: number; rowsPerPage: number }
>(
  "integration/fetchMainUnitListAsync",
  async ({ pageNumber, rowsPerPage }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Integration/GetMainUnitDetail?limit=${rowsPerPage}&offset=${pageNumber}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchUnitDetailByUnitIdAsync = createAsyncThunk<
  any,
  { unitId: number }
>("integration/fetchMainUnitListAsync", async ({ unitId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Integration/GetUnitDetailByUnitId?unitId=${unitId}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchSubUnitListAsync = createAsyncThunk<
  any,
  { pageNumber: number; rowsPerPage: number; mainUnitId: number }
>(
  "integration/fetchSubUnitListAsync",
  async ({ pageNumber, rowsPerPage, mainUnitId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Integration/GetSubUnits?limit=${rowsPerPage}&offset=${pageNumber}&unitId=${mainUnitId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);



export const GetServiceRequestList = createAsyncThunk<any>
  ("GetServiceRequestList",
    async (_, thunkApi) => {
      try {
        return await requests.get<responseType>(`/Admin/GetServiceRequestList`);
      } catch (error: any) {
        console.log(error);
        return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
      }
    });

export const SearchByWildCardText = createAsyncThunk<any, { searchText: string, page: number, pageSize: number, statusId?: string, dateFilter?: string, serviceCategoryId?: number }>(
  '/Admin/SearchByWildCardText',
  async ({ searchText, page, pageSize, statusId, dateFilter, serviceCategoryId }, thunkApi) => {
    try {
      let url = `/Admin/SearchByWildCardText?searchText=${encodeURIComponent(searchText)}&page=${page}&pageSize=${pageSize}`;
      if (dateFilter) url += `&dateFilter=${encodeURIComponent(dateFilter)}`;
      if (serviceCategoryId) url += `&serviceCategoryId=${serviceCategoryId}`;
      if (statusId) url += `&statusId=${encodeURIComponent(statusId)}`;
      return await requests.get<responseType>(url);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error });
    }
  }
);

export const fetchActionsByRecommendationId = createAsyncThunk<
  any,
  { recommendationId: number | string }
>(
  'Generic/GetActionsByRecommendationId',
  async ({ recommendationId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Generic/GetActionsByRecommendationId?recommendationId=${recommendationId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const saveActionForRecommendation = createAsyncThunk<
  any,
  { 
    recommendationId: number | string,
    actionData: {
      id?: number,
      text: string,
      status: string,
      timestamp?: string
    }
  }
>(
  'Generic/SaveActionForRecommendation',
  async ({ recommendationId, actionData }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Generic/SaveActionForRecommendation`,
        {
          recommendationId,
          ...actionData
        }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);



// Create Redux Slice
export const globalSlice = createSlice({
  name: "globalservice",
  initialState: initialGlobalState,
  reducers: {
    updateUploadProgress: (state, action) => {
      if (action.payload.action === "init") {
        state.uploadProgress = action.payload.data;
      }

      if (action.payload.action === "update") {
        state.uploadProgress = action.payload.data;
      }
    },
    updateCopy: (state, action) => {
      state.allowCopyKey = action.payload;
    },
    updateUserRoleAccess: (state, action) => {
      state.userRoleAccess = action.payload.data as IRoleAcces[];
    },
    IsVisibleDragNDropPopupModel: (state, action) => {
      state.IsVisibleDragNDropPopupModel = action.payload;
    },
    updateDragNDropUploadProgressStatus: (state, action) => {
      state.IsdragNdropInProgress = action.payload;
    },
    refreshGridAfterTotalUploadComplete: (state, action) => {
      state.ShouldRefreshGridWhenTotalUploadComplete = action.payload;
    },
    atleastOneFileWasUploadedInSharedFile: (state, action) => {
      state.AtleastOneFileWasUploadedInSharedFile = action.payload;
    },
    updateUserAttachmentFileSystem: (state, action) => {
      if (action.payload.action === "init") {
        state.userAttachmentFileSystem = action.payload.data;
      }

      if (action.payload.action === "new") {
        state.userAttachmentFileSystem.push(action.payload.data);
      }


    },
    updateUserAttachment: (state, action) => {
      if (action.payload.action === "init") {
        state.userAttachment = action.payload.data;
      }

      if (action.payload.action === "new") {
        state.userAttachment.push(action.payload.data);
      }

      if (action.payload.action === "del") {
        const toDelete = action.payload.data as IAttachment[]; // List of Checked Items
        toDelete.map((pItem: IAttachment) => {
          state.userAttachment
            .filter((cItem) => pItem.draftId! === cItem.draftId)
            .map((item) => {
              item.isActive = false;
            });
        });
      }

      if (action.payload.action === "update") {
        const toUpdate = action.payload.data as IAttachment; // Single Item
        if (state.userAttachment && state.userAttachment.length > 0) {
          state.userAttachment
            .filter((uItem) => uItem.fileName === toUpdate.fileName)
            .map((item) => {
              item.docGUID = toUpdate.docGUID;
              item.itemId = toUpdate.itemId;
              item.docUrl = toUpdate.docUrl;
              item.docTitle = toUpdate.docTitle;
            });
        }
      }
    },
    updateUserCommentList: (state, action) => {
      if (action.payload.sortOrder === "desc") {
        state.userComments = action.payload.data;
        state.userComments.reverse();
      }

      if (action.payload.sortOrder === "asc") {
        state.userComments = action.payload.data;
        state.userComments.reverse();
      }

      if (action.payload.sortOrder === "") {
        state.userComments = action.payload.data;
      }
    },
    updateUserActivityList: (state, action) => {
      state.userActivity = action.payload;
    },
    updateUserTimelineActivityList: (state, action) => {
      state.userTimelineActivity = action.payload;
    },
    updateProfileAvatar: (state, action) => {
      state.profileAvatar = action.payload;
    },
    updateUnitLogo: (state, action) => {
      state.unitLogo = action.payload;
    },
    updateUserAttachmentGridPageNumber: (state, action) => {
      state.userAttachmentGridPageNumber = action.payload.page;
    },
    showNotificationPopup: (state, action) => {
      state.showNotification = action.payload;
    },
    isSourceHeader: (state, action) => {
      state.isHeader = action.payload;
    },
    setTheme: (state, action) => {
      state.activeTheme = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLookupAsync.fulfilled, (state, action) => {
      state.viewLookups = action.payload.data;
    });
    builder.addCase(addUserCommentsAsync.fulfilled, (state) => {
      state.submissionStatus = "Success";
    });
    builder.addCase(addUserCommentsAsync.rejected, (state) => { });

    builder.addCase(deleteUserCommentsAsync.fulfilled, (state) => {
      state.submissionStatus = "Success";
    });
    builder.addCase(deleteUserCommentsAsync.rejected, (state) => { });

    builder.addCase(addAttachmentItemAsync.fulfilled, (state) => {
      state.submissionStatus = "Success";
    });
    builder.addCase(addAttachmentItemAsync.rejected, (state) => { });
    builder.addCase(deleteAttachmentAsync.fulfilled, (state) => {
      state.submissionStatus = "Success";
    });
    // builder.addCase(fetchAttachmentListAsync.fulfilled, (state, action) => {
    //   state.userAttachment = action.payload.data;
    // });
    builder.addCase(downloadAttachmentAsync.fulfilled, (state) => { });
    builder.addCase(fetchUserAccessAsync.fulfilled, (state, action) => {
      state.userAccess = action.payload.data;
    });
    builder.addCase(fetchUserRolesAccessAsync.fulfilled, (state, action) => {
      // Check if action.payload.data.eventDate is a Date object
      // if (action.payload.data && action.payload.data.eventDate instanceof Date) {
      //
      //   action.payload.data.eventDate = action.payload.data.eventDate.toISOString();
      // }
      state.userRoleAccess = action.payload.data;
    });
  },
});

export const globalActions = globalSlice.actions;
