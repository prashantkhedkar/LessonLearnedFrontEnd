import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { requests } from "../../helper/axiosInterceptor";
import { initialGlobalState } from "../../models/stateManagement/globalState";
import { responseType } from "../../models/global/responseResult";
import { initAdminState } from "../../models/stateManagement/adminState";
import {
  AdminSetupServiceModel,
  ServiceCategoryCrudModel,
  ServiceCategoryModel,
  ServiceModel,
  ServiceEntityFieldMappingModel,
} from "../../models/global/serviceModel";
import { FieldGroupMappingModel } from "../../models/global/FieldGroupMappingModel";
import { FieldMasterModel } from "../../models/global/fieldMasterModel";
import {
  ActionMasterModel,
  WorkflowStepModel,
} from "../../models/global/serviceWorkflow";
import { StatusModel } from "../../models/global/statusModel";

// Redux Thunk Action
export const fetchFieldTypeMasterData = createAsyncThunk<any>(
  "fetchFieldTypeMasterData",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Admin/GetFieldTypeMasterData`);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const addUpdateFieldMaster = createAsyncThunk<
  any,
  { formDataObject: FieldMasterModel }
>("addUpdateFieldMaster", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(`/Admin/AddUpdateFieldMaster`, {
      ...formDataObject,
    });
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchFieldMasterData = createAsyncThunk<any>(
  "fetchFieldMasterData",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Admin/GetFieldMasterData`);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchServiceCategories = createAsyncThunk<any>(
  "fetchServiceCategories",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Admin/GetServiceCategories`);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);
export const isServiceDuplicate = createAsyncThunk<
  any,
  { serviceName: string; serviceId: number }
>("isServiceDuplicate", async ({ serviceName, serviceId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Admin/isServiceDuplicate?serviceName=${serviceName}&serviceId=${serviceId}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const AddUpdateServiceFormDetails = createAsyncThunk<
  any,
  { formDataObject: ServiceModel }
>("AddUpdateServiceFormDetails", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      `/Admin/AddUpdateServiceFormDetails`,
      {
        ...formDataObject,
      }
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const AddUpdateAdminSetupServiceFormDetails = createAsyncThunk<
  any,
  { formDataObject: AdminSetupServiceModel }
>(
  "AddUpdateAdminSetupServiceFormDetails",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Admin/AddUpdateAdminSetupServiceFormDetails`,
        {
          ...formDataObject,
        }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const PreviewAdminSetupServiceFormDetails = createAsyncThunk<
  any,
  { formDataObject: AdminSetupServiceModel }
>(
  "GetServiceFieldsByServiceIdInPreview",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Admin/GetServiceFieldsByServiceIdInPreview`,
        {
          ...formDataObject,
        }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetMappedFieldsForEntityAndService = createAsyncThunk<
  any,
  { serviceId: number; entityId: number }
>(
  "GetMappedFieldsForEntityAndService",
  async ({ serviceId, entityId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetMappedFieldsForEntityAndService?serviceId=${serviceId}&entityId=${entityId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);
export const GetMappedUnitsForEntityAndService = createAsyncThunk<
  any,
  { serviceId: number; entityId: number }
>(
  "GetMappedUnitsForEntityAndService",
  async ({ serviceId, entityId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetMappedUnitsForEntityAndService?serviceId=${serviceId}&entityId=${entityId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetLookupValues = createAsyncThunk<any, { lookupType?: string }>(
  "GetLookupValues",
  async ({ lookupType }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/MasterData/GetMasterLookups?lookupType=${lookupType}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetFieldConfigDetails = createAsyncThunk<
  any,
  { fieldId?: number }
>("GetFieldConfigDetails", async ({ fieldId }, thunkApi) => {
  try {
    const url = fieldId
      ? `/Admin/GetFieldConfigDetails?fieldId=${fieldId}`
      : `/Admin/GetFieldConfigDetails`;
    return await requests.get<responseType>(url);
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const GetFieldConfigDetailsFromService = createAsyncThunk<
  any,
  { serviceId: number; entityId: number; fieldId: number }
>(
  "GetFieldConfigDetailsFromService",
  async ({ fieldId, serviceId, entityId }, thunkApi) => {
    try {
      const url = fieldId
        ? `/Admin/GetFieldConfigDetailsFromService?fieldId=${fieldId}&serviceId=${serviceId}&entityId=${entityId}`
        : `/Admin/GetFieldConfigDetailsFromService`;
      return await requests.get<responseType>(url);
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetServiceList = createAsyncThunk<any>(
  "GetServiceList",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Admin/GetServiceList`);
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetServiceFieldsByServiceId = createAsyncThunk<
  any,
  { serviceId: number; entityId: number }
>(
  "Admin/GetServiceFieldsByServiceId",
  async ({ serviceId, entityId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetServiceFieldsByServiceId?serviceId=${serviceId}&entityTypeId=${entityId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetFieldTypeMasterList = createAsyncThunk<any>(
  "Admin/GetFieldTypeMasterList",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Admin/GetFieldTypeMasterList`);
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const DeleteServiceEntityFieldMappings = createAsyncThunk<
  any,
  { serviceId: number; entityId: number }
>(
  "Admin/DeleteServiceEntityFieldMappings",
  async ({ serviceId, entityId }, thunkApi) => {
    try {
      return await requests.delete<responseType>(
        `/Admin/DeleteServiceEntityFieldMappings?serviceId=${serviceId}&entityTypeId=${entityId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const DeleteServiceUnit = createAsyncThunk<
  any,
  { id: number; unitId: number; serviceId: number, entityId: number }
>("Admin/DeleteServiceUnit", async ({ id, unitId, serviceId, entityId }, thunkApi) => {
  try {
    return await requests.delete<responseType>(
      `/Admin/DeleteServiceUnit?fKeyUnitId=${id}&unitId=${unitId}&serviceid=${serviceId}&entityId=${entityId}`
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const AddUpdateAdminSetupUnitDetails = createAsyncThunk<
  any,
  { formDataObject: AdminSetupServiceModel }
>("AddUpdateAdminSetupUnitDetails", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      `/Admin/AddUpdateAdminSetupUnitDetails`,
      formDataObject
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const GetServiceEntitiesMaster = createAsyncThunk<any>(
  "GetServiceEntitiesMaster",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetServiceEntitiesMaster`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchStatuses = createAsyncThunk<any>(
  "fetchStatuses",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(`/Admin/GetActionStatuses`);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchServiceFormEntities = createAsyncThunk<
  any,
  { serviceId: Number, requestId?: Number }
>("fetchServiceFormEntities", async ({ serviceId, requestId = 0 }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Admin/GetEntitiesByServiceId?serviceId=${serviceId}&requestId=${requestId}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const AddUpdateWorkflowStepAndActions = createAsyncThunk<
  any,
  { formDataObject: WorkflowStepModel }
>("AddUpdateWorkflowStepAndActions", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      `/Admin/AddUpdateWorkStepAndActions`,
      {
        ...formDataObject,
      }
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchWorkflowStepsByServiceId = createAsyncThunk<
  any,
  { serviceId: Number, requestId: Number }
>("fetchWorkflowStepsByServiceId", async ({ serviceId, requestId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Admin/GetWorkflowStepsByServiceId?serviceId=${serviceId}&requestId=${requestId}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const CheckIfEntityExistsForService = createAsyncThunk<
  any,
  { serviceId: number; entityId: number }
>(
  "CheckIfEntityExistsForService",
  async ({ serviceId, entityId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/CheckIfEntityExistsForService?serviceId=${serviceId}&entityId=${entityId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetServiceCategoriesDraftList = createAsyncThunk<
  any,
  {
    pageNumber: number;
    pageSize: number;
    sortColumn: string;
    sortDirection: string;
  }
>(
  "GetServiceCategoriesDraftList",
  async ({ pageNumber, pageSize, sortColumn, sortDirection }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetServiceCategoriesDraftList?pageNumber=${pageNumber}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetServiceCategoriesPublishedList = createAsyncThunk<
  any,
  {
    pageNumber: number;
    pageSize: number;
    sortColumn: string;
    sortDirection: string;
  }
>(
  "GetServiceCategoriesPublishedList",
  async ({ pageNumber, pageSize, sortColumn, sortDirection }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetServiceCategoriesPublishedList?pageNumber=${pageNumber}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetServiceDetailsByServiceId = createAsyncThunk<
  any,
  { serviceId: number }
>("GetServiceDetailsByServiceId", async ({ serviceId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Admin/GetServiceDetailsByServiceId?serviceId=${serviceId}`
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchCategoryListWithServiceCount = createAsyncThunk<any>(
  "fetchCategoryListWithServiceCount",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetCategoryListWithServiceCount`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchServiceListByCategories = createAsyncThunk<
  any,
  { pageNumber: number; pageSize: number; categoryId: number }
>(
  "GetServiceListByCategories",
  async ({ pageNumber, pageSize, categoryId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetServiceListByCategories?pageNumber=${pageNumber}&pageSize=${pageSize}&categoryId=${categoryId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetStepperEntitiesByServiceId = createAsyncThunk<
  any,
  { serviceId: number }
>("GetStepperEntitiesByServiceId", async ({ serviceId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Admin/GetStepperEntitiesByServiceId?serviceId=${serviceId}`
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const deleteWorkflowStepAndReorder = createAsyncThunk<
  any,
  { serviceId: number; stepId: number }
>("CheckIfEntityExistsForService", async ({ serviceId, stepId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/Admin/DeleteWorkflowStepAndReorder?serviceId=${serviceId}&stepId=${stepId}`
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const checkIfStepExists = createAsyncThunk<any, { stepName: string }>(
  "CheckIfStepExists",
  async ({ stepName }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/CheckIfStepExists?stepName=${stepName}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const UpdateServiceFormDetails = createAsyncThunk<
  any,
  { formDataObject: any }
>("UpdateServiceFormDetails", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      `/Admin/UpdateServiceFormDetails`,
      {
        ...formDataObject,
      }
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const AddUpdateWorkflowStepAction = createAsyncThunk<
  any,
  { formDataObject: ActionMasterModel }
>("AddEditWorkflowStepActions", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      `/Admin/AddUpdateWorkflowStepAction`,
      {
        ...formDataObject,
      }
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchAllWorkflowStepActions = createAsyncThunk<any>(
  "fetchAllWorkflowStepActions",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetAllWorkflowStepActions`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const AddUpdateWorkflowStatus = createAsyncThunk<
  any,
  { formDataObject: StatusModel }
>("AddUpdateStatusMaster", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(`/Admin/AddUpdateWorkflowStatus`, {
      ...formDataObject,
    });
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

// Async thunk to fetch tile data from API
export const fetchAdminStatisticTileData = createAsyncThunk<any>(
  "Admin/FetchAdminStatisticTileData",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/FetchAdminStatisticTileData`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Async thunk to fetch master dashboard tile data from API
export const fetchMasterDashboardTileData = createAsyncThunk<
  any,
  { userRole?: string }
>("Admin/FetchMasterStatisticTileData", async ({ userRole }, thunkApi) => {
  try {
    const params = userRole ? `?userRole=${encodeURIComponent(userRole)}` : "";
    return await requests.get<responseType>(
      `/Admin/FetchMasterStatisticTileData${params}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});
export const fetchPercentCompletionofOpenRequestsByServiceData =
  createAsyncThunk<any, { userRole?: string }>(
    "Admin/FetchPercentCompletionofOpenRequestsByServiceData",
    async ({ userRole }, thunkApi) => {
      try {
        const params = userRole
          ? `?userRole=${encodeURIComponent(userRole)}`
          : "";
        return await requests.get<responseType>(
          `/Admin/FetchPercentCompletionofOpenRequestsByServiceData${params}`
        );
      } catch (error: any) {
        return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
      }
    }
  );
export const fetchInProgressRequestByUnitData = createAsyncThunk<
  any,
  { userRole?: string }
>("Admin/GetTopNthRequestsByUnits", async ({ userRole }, thunkApi) => {
  try {
    const params = userRole
      ? `?topN=10&lang=en&userRole=${encodeURIComponent(userRole)}`
      : "?topN=10&lang=en";
    return await requests.get<responseType>(
      `/Admin/GetTopNthRequestsByUnits${params}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchMasterDashboardTilePriorityData = createAsyncThunk<
  any,
  { userRole?: string }
>(
  "Admin/FetchMasterDashboardTilePriorityData",
  async ({ userRole }, thunkApi) => {
    try {
      const params = userRole
        ? `?userRole=${encodeURIComponent(userRole)}`
        : "";
      return await requests.get<responseType>(
        `/Admin/FetchMasterDashboardTilePriorityData${params}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchLastSixMonthsRequestsByServiceChart = createAsyncThunk<
  any,
  { userRole?: string }
>(
  "Admin/GetLastSixMonthsRequestsByServiceChart",
  async ({ userRole }, thunkApi) => {
    try {
      const params = userRole
        ? `?userRole=${encodeURIComponent(userRole)}`
        : "";
      return await requests.get<responseType>(
        `/Admin/GetLastSixMonthsRequestsByServiceChart${params}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchFotificationByRoles = createAsyncThunk<
  any,
  {
    pageNumber: number;
    pageSize: number;
    unreadOnly: boolean;
    userRole?: string;
  }
>(
  "Notification/GetNotificationsStats",
  async ({ pageNumber, pageSize, unreadOnly, userRole }, thunkApi) => {
    try {
      const params = userRole
        ? `?userRole=${encodeURIComponent(userRole)}`
        : "";
      return await requests.get<responseType>(
        `Notification/GetNotificationsStats?pageNumber=${pageNumber}&pageSize=${pageSize}&unreadOnly=${unreadOnly}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchLastSixMonthsRequestsByMonthChart = createAsyncThunk<
  any,
  { userRole?: string }
>(
  "Admin/GetLastSixMonthsRequestsByMonthChart",
  async ({ userRole }, thunkApi) => {
    try {
      const params = userRole
        ? `?userRole=${encodeURIComponent(userRole)}`
        : "";
      return await requests.get<responseType>(
        `/Admin/GetLastSixMonthsRequestsByMonthChart${params}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchTopRequestsByUnits = createAsyncThunk<
  any,
  { topN?: number; lang?: string }
>(
  "Admin/GetTopRequestsByUnits",
  async ({ topN = 10, lang = "en" }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetTopRequestsByUnits?topN=${topN}&lang=${lang}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchTotalRequestsByFulfillmentUnits = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/GetTotalRequestsByFulfillmentUnits",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/GetTotalRequestsByFulfillmentUnits?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchTotalRequestsByUnitsGroupedByMonths = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/GetTotalRequestsByUnitsGroupedByMonths",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/GetTotalRequestsByUnitsGroupedByMonths?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchLastSixMonthsInProgressRequestsChart = createAsyncThunk<
  any,
  { userRole?: string }
>(
  "Admin/GetLastSixMonthsInProgressRequestsChart",
  async ({ userRole }, thunkApi) => {
    try {
      const params = userRole
        ? `?userRole=${encodeURIComponent(userRole)}`
        : "";
      return await requests.get<responseType>(
        `/Admin/GetLastSixMonthsInProgressRequestsChart${params}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchTopNthRequestsByServiceCategories = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/fetchTopNthRequestsByServiceCategories",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/FetchTopNthRequestsByServiceCategories?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchTotalRequestsByPriority = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/GetTotalRequestsByPriority",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/GetTotalRequestsByPriority?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchLastSixMonthsClosedRequestsChart = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/GetLastSixMonthsClosedRequestsChart",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/GetLastSixMonthsClosedRequestsChart?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchLastSixMonthsReceivedRequestsChart = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/GetLastSixMonthsReceivedRequestsChart",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/GetLastSixMonthsReceivedRequestsChart?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const SearchByWildCardText = createAsyncThunk<
  any,
  {
    searchText: string;
    page: number;
    pageSize: number;
    statusId: string;
    dateFilter?: string;
    serviceCategoryId?: number;
  }
>(
  "Admin/SearchByWildCardText",
  async (
    { searchText, page, pageSize, statusId, dateFilter, serviceCategoryId },
    thunkApi
  ) => {
    try {
      const params = new URLSearchParams({
        searchText: searchText ? searchText.trim() : "",
        page: page.toString(),
        pageSize: pageSize.toString(),
        statusId,
      });

      if (dateFilter) {
        params.append("dateFilter", dateFilter);
      }

      if (serviceCategoryId) {
        params.append("serviceCategoryId", serviceCategoryId.toString());
      }

      return await requests.get<responseType>(
        `/Admin/SearchByWildCardText?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const AddUpdateServiceCategory = createAsyncThunk<
  any,
  { formDataObject: ServiceCategoryCrudModel }
>("AddUpdateServiceCategory", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      `/Admin/AddUpdateServiceCategory`,
      {
        ...formDataObject,
      }
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const GetServiceCategoryList = createAsyncThunk<
  any,
  {
    pageNumber: number;
    pageSize: number;
    sortColumn: string;
    sortDirection: string;
    searchTerm: string;
  }
>(
  "GetServiceCategoryList",
  async (
    { pageNumber, pageSize, sortColumn, sortDirection, searchTerm },
    thunkApi
  ) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetServiceCategoryList?pageNumber=${pageNumber}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDirection=${sortDirection}&searchTerm=${searchTerm}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Add new thunk for saving field with options
export const SaveFieldWithOptions = createAsyncThunk<
  any,
  { submittedData: any }
>("SaveFieldWithOptions", async ({ submittedData }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      `/Admin/SaveFieldWithOptions`,
      submittedData
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

// Add new thunk for saving field with options for service (edit mode)
export const SaveFieldWithOptionsForService = createAsyncThunk<
  any,
  { submittedData: any; serviceId: number; entityId: number }
>(
  "SaveFieldWithOptionsForService",
  async ({ submittedData, serviceId, entityId }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Admin/SaveFieldWithOptionsForService?serviceId=${serviceId}&entityId=${entityId}`,
        submittedData
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// New thunk for saving field grouping (selected fields with group name)
export const SaveFieldGrouping = createAsyncThunk<
  any,
  { fieldMasterData: any; selectedFields: FieldGroupMappingModel[] }
>(
  "SaveFieldGrouping",
  async ({ fieldMasterData, selectedFields }, thunkApi) => {
    try {
      const formDataObject = {
        fieldMasterDto: fieldMasterData,
        selectedFields,
      };
      return await requests.post<responseType>(
        `/Admin/SaveFieldGrouping`,
        formDataObject
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Thunk for getting field group mappings for a specific field
export const GetFieldGroupMappings = createAsyncThunk<any, { fieldId: number }>(
  "GetFieldGroupMappings",
  async ({ fieldId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetFieldGroupMappings?fieldId=${fieldId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchAverageClosureTimeData = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/GetAverageClosureTimeData",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/GetAverageClosureTimeData?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchFeedbackStatisticsData = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/GetFeedbackStatistics",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/GetFeedbackStatistics?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchActionRequiredData = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>("Admin/FetchActionRequired", async ({ lang = "en", userRole }, thunkApi) => {
  try {
    const params = new URLSearchParams({ lang });
    if (userRole) {
      params.append("userRole", userRole);
    }
    return await requests.get<responseType>(
      `/Admin/FetchActionRequired?${params.toString()}`
    );
  } catch (error: any) {
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const fetchNotificationTimelineData = createAsyncThunk<
  any,
  { lang?: string; userRole?: string }
>(
  "Admin/GetNotificationTimelineData",
  async ({ lang = "en", userRole }, thunkApi) => {
    try {
      const params = new URLSearchParams({ lang });
      if (userRole) {
        params.append("userRole", userRole);
      }
      return await requests.get<responseType>(
        `/Admin/GetNotificationTimelineData?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const getAllFieldMasterData = createAsyncThunk<
  any,
  {
    pageNumber: number;
    pageSize: number;
    sortColumn: string;
    sortDirection: string;
    searchTerm: string;
  }
>(
  "getAllFieldMasterData",
  async (
    { pageNumber, pageSize, sortColumn, sortDirection, searchTerm },
    thunkApi
  ) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetAllFieldMasterData?pageNumber=${pageNumber}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDirection=${sortDirection}&searchTerm=${searchTerm}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetWorkflowStepActionDetailsByServiceId = createAsyncThunk<
  any,
  { serviceId: number }
>(
  "Admin/GetWorkflowStepActionDetailsByServiceId",
  async ({ serviceId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetWorkflowStepActionDetailsByServiceId?serviceId=${serviceId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetAllCustomFieldsFromFieldMaster = createAsyncThunk<any, {}>(
  "GetAllCustomFieldsFromFieldMaster",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/Admin/GetAllCustomFieldsFromFieldMaster`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const checkAndDeleteFieldFromFieldMaster = createAsyncThunk<
  any,
  { fieldId: number; fieldTypeId: number }
>(
  "checkAndDeleteFieldFromFieldMaster",
  async ({ fieldId, fieldTypeId }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/Admin/CheckAndDeleteFieldFromFieldMaster`,
        { fieldId, fieldTypeId }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Create Redux Slice
export const adminSlice = createSlice({
  name: "adminservice",
  initialState: initAdminState,
  reducers: {},
});

export const globalActions = adminSlice.actions;
