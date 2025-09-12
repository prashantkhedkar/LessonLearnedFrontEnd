import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { requests } from "../../helper/axiosInterceptor";
import { initialGlobalState } from "../../models/stateManagement/globalState";
import { responseType } from "../../models/global/responseResult";
import { initServiceRequestState } from "../../models/stateManagement/serviceRequestState";
import {
  ServiceRequestSearchModel,
  ServiceWorkflowActionSearchModel,
} from "../../models/global/serviceModel";

import { DynamicFormSubmitPayload } from "../components/dynamicFields/utils/types";
import { ITimelineActivitySaveModel } from "../../models/global/globalGeneric";

// Redux Thunk Action

export const GetServiceFieldsByServiceId = createAsyncThunk<
  any,
  { serviceId: number; entityId: number }
>(
  "ServiceRequest/GetServiceFieldsByServiceId",
  async ({ serviceId, entityId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/ServiceRequest/GetServiceFieldsByServiceId?serviceId=${serviceId}&entityId=${entityId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetServiceFieldsByEntityId = createAsyncThunk<
  any,
  { entityId: number }
>(
  "ServiceRequest/GetServiceFieldsByEntityId",
  async ({ entityId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/ServiceRequest/GetServiceFieldsByEntityId?entityId=${entityId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Mock API to submit dynamic form data
export const SubmitServiceTemplateForm = createAsyncThunk<
  any,
  { formDataObject: DynamicFormSubmitPayload }
>(
  "ServiceRequest/SubmitServiceTemplateForm",
  async ({ formDataObject }, thunkApi) => {
    try {
      // Simulate a POST request to a mock endpoint
      // In real usage, replace '/Mock/SubmitDynamicForm' with your actual API endpoint
      return await requests.post<responseType>(
        "/ServiceRequest/SubmitServiceTemplateForm",
        { ...formDataObject }
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetUserSubmittedDataByServiceId = createAsyncThunk<
  any,
  { serviceId: number }
>(
  "ServiceRequest/GetUserSubmittedDataByServiceId",
  async ({ serviceId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/ServiceRequest/GetUserSubmittedDataByService?serviceId=${serviceId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetServiceRequestDetailsByRequestId = createAsyncThunk<
  any,
  { serviceId: number; requestId: number; entityId: number }
>(
  "ServiceRequest/GetServiceRequestsByServiceId",
  async ({ serviceId, requestId, entityId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/ServiceRequest/GetServiceRequestDetailsByRequestId?serviceId=${serviceId}&requestId=${requestId}&entityId=${entityId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetServiceRequestsByUser = createAsyncThunk<
  any,
  { formDataObject: ServiceRequestSearchModel }
>(
  "ServiceRequest/GetServiceRequestsByUser",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/ServiceRequest/GetServiceRequestsByUser`,
        { ...formDataObject }
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const saveTimelineActivity = createAsyncThunk<
  any,
  { formDataObject: ITimelineActivitySaveModel }
>("saveTimelineActivity", async ({ formDataObject }, thunkApi) => {
  try {
    return await requests.post<responseType>(
      `/ServiceRequest/SaveTimelineActivity`,
      { ...formDataObject }
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const getTimelineActivityByRequestId = createAsyncThunk<
  any,
  { requestId: number }
>("getTimelineActivityByRequestId", async ({ requestId }, thunkApi) => {
  try {
    return await requests.get<responseType>(
      `/ServiceRequest/GetTimelineActivityByRequestId?requestId=${requestId}`
    );
  } catch (error: any) {
    console.log(error);
    return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
  }
});

export const FilterServiceCategoryDashboard = createAsyncThunk<
  any,
  { searchText: string; page: number; pageSize: number }
>(
  "/ServiceRequest/FilterServiceCategoryDashboard",
  async ({ searchText, page, pageSize }, thunkApi) => {
    try {
      let url = `/ServiceRequest/FilterServiceCategoryDashboard?searchText=${encodeURIComponent(
        searchText
      )}&page=${page}&pageSize=${pageSize}`;
      return await requests.get<responseType>(url);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error });
    }
  }
);

export const FilterServiceListDashboard = createAsyncThunk<
  any,
  { searchText: string; page: number; pageSize: number }
>(
  "/ServiceRequest/FilterServiceListDashboard",
  async ({ searchText, page, pageSize }, thunkApi) => {
    try {
      let url = `/ServiceRequest/FilterServiceListDashboard?searchText=${encodeURIComponent(
        searchText
      )}&page=${page}&pageSize=${pageSize}`;
      return await requests.get<responseType>(url);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error });
    }
  }
);

export const GetServiceWorkflowActionsByEntity = createAsyncThunk<
  any,
  { formDataObject: ServiceWorkflowActionSearchModel }
>(
  "ServiceRequest/GetServiceWorkflowActionsByEntity",
  async ({ formDataObject }, thunkApi) => {
    try {
      return await requests.post<responseType>(
        `/ServiceRequest/GetServiceWorkflowActionsByEntity`,
        { ...formDataObject }
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const FilterServiceCategoryList = createAsyncThunk<
  any,
  {
    searchText: string;
    page: number;
    pageSize: number;
    serviceCategoryId?: number;
  }
>(
  "/ServiceRequest/FilterServiceCategoryList",
  async ({ searchText, page, pageSize, serviceCategoryId }, thunkApi) => {
    try {
      const params = new URLSearchParams({
        searchText: searchText ? searchText.trim() : "",
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (serviceCategoryId) {
        params.append("serviceCategoryId", serviceCategoryId.toString());
      }

      let url = `/ServiceRequest/FilterServiceCategoryList?${params.toString()}`;
      return await requests.get<responseType>(url);
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error });
    }
  }
);

export const GetServiceRequestDetailsByServiceId = createAsyncThunk<
  any,
  { requestId: number; serviceId: number }
>(
  "ServiceRequest/GetServiceRequestsByServiceId",
  async ({ requestId, serviceId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/ServiceRequest/GetServiceRequestDetailsByServiceId?requestId=${requestId}&serviceId=${serviceId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const DeleteServiceRequestByServiceId = createAsyncThunk<
  any,
  { requestId: number; serviceId: number }
>(
  "ServiceRequest/deleteServiceRequestByRequestId",
  async ({ requestId, serviceId }, thunkApi) => {
    try {
      return await requests.delete<responseType>(
        `/ServiceRequest/deleteServiceRequestByRequestId?requestId=${requestId}&serviceId=${serviceId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchServiceListByCategoriesAndUserRole = createAsyncThunk<
  any,
  { pageNumber: number; pageSize: number; categoryId: number }
>(
  "fetchServiceListByCategoriesAndUserRole",
  async ({ pageNumber, pageSize, categoryId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/ServiceRequest/GetServiceListByCategoryAndUserRole?pageNumber=${pageNumber}&pageSize=${pageSize}&categoryId=${categoryId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const GetMappedUnitsByEntityTypeAndService = createAsyncThunk<
  any,
  { serviceId: number; entityId: number }
>(
  "GetMappedUnitsByEntityTypeAndService",
  async ({ serviceId, entityId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/ServiceRequest/GetMappedUnitsByEntityTypeAndService?serviceId=${serviceId}&entityId=${entityId}`
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchServiceCountByStatus = createAsyncThunk<any>(
  "fetchServiceCountByStatus",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        "/ServiceRequest/GetServiceCountByStatus"
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const searchRequestsByFilter = createAsyncThunk<
  any,
  {
    searchText: string;
    page: number;
    pageSize: number;
    statusId: string;
    dateFrom?: string;
    dateTo?: string;
    serviceCategoryId?: number;
    serviceId?: number;
  }
>(
  "ServiceRequest/searchMyRequestsByFilter",
  async (
    {
      searchText,
      page,
      pageSize,
      statusId,
      dateFrom,
      dateTo,
      serviceCategoryId,
      serviceId,
    },
    thunkApi
  ) => {
    try {
      const params = new URLSearchParams({
        searchText: searchText ? searchText.trim() : "",
        page: page.toString(),
        pageSize: pageSize.toString(),
        statusId,
      });

      if (dateFrom) {
        params.append("dateFrom", dateFrom);
      }

      if (dateTo) {
        params.append("dateTo", dateTo);
      }

      if (serviceCategoryId) {
        params.append("serviceCategoryId", serviceCategoryId.toString());
      }

      if (serviceId) {
        params.append("serviceId", serviceId.toString());
      }

      return await requests.get<responseType>(
        `/ServiceRequest/searchMyRequestsByFilter?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const searchActionRequestsByFilter = createAsyncThunk<
  any,
  {
    searchText: string;
    page: number;
    pageSize: number;
    statusId: string;
    dateFrom?: string;
    dateTo?: string;
    serviceCategoryId?: number;
    serviceId?: number;
  }
>(
  "ServiceRequest/searchActionRequestsByFilter",
  async (
    {
      searchText,
      page,
      pageSize,
      statusId,
      dateFrom,
      dateTo,
      serviceCategoryId,
      serviceId,
    },
    thunkApi
  ) => {
    try {
      const params = new URLSearchParams({
        searchText: searchText ? searchText.trim() : "",
        page: page.toString(),
        pageSize: pageSize.toString(),
        statusId,
      });

      if (dateFrom) {
        params.append("dateFrom", dateFrom);
      }

      if (dateTo) {
        params.append("dateTo", dateTo);
      }

      if (serviceCategoryId) {
        params.append("serviceCategoryId", serviceCategoryId.toString());
      }

      if (serviceId) {
        params.append("serviceId", serviceId.toString());
      }

      return await requests.get<responseType>(
        `/ServiceRequest/searchActionRequestsByFilter?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchPublishedServices = createAsyncThunk<any>(
  "fetchPublishedServices",
  async (_, thunkApi) => {
    try {
      return await requests.get<responseType>(
        "/ServiceRequest/GetPublishedServices"
      );
    } catch (error: any) {
      console.log(error);
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const fetchWorkflowStepsByRequestId = createAsyncThunk<
  any,
  { serviceId: Number; requestId: Number }
>(
  "fetchWorkflowStepsByRequestId",
  async ({ serviceId, requestId }, thunkApi) => {
    try {
      return await requests.get<responseType>(
        `/ServiceRequest/GetWorkflowStepsByRequestId?serviceId=${serviceId}&requestId=${requestId}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

export const searchMyRequestsByFilterWithMonth = createAsyncThunk<
  any,
  {
    searchText: string;
    page: number;
    pageSize: number;
    // monthFilter: string;
    drillDownSource: string;
    userRole: string;
    dataSource: string;
    filterType: string;
    filterValue: string;
  }
>(
  "ServiceRequest/searchMyRequestsByFilterWithMonth",
  async (
    {
      searchText,
      page,
      pageSize,
      // monthFilter,
      drillDownSource,
      userRole,
      dataSource,
      filterType,
      filterValue,
    },
    thunkApi
  ) => {
    
    try {
      const params = new URLSearchParams({
        searchText: searchText ? searchText.trim() : "",
        page: page.toString(),
        pageSize: pageSize.toString(),
        // monthFilter,
        drillDownSource,
        userRole,
        dataSource,
        filterType,
        filterValue,
      });

      return await requests.get<responseType>(
        `/ServiceRequest/${drillDownSource}?${params.toString()}`
      );
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: JSON.stringify(error) });
    }
  }
);

// Create Redux Slice
export const serviceRequestSlice = createSlice({
  name: "serviceRequestservice",
  initialState: initServiceRequestState,
  reducers: {},
});

export const serviceActions = serviceRequestSlice.actions;
