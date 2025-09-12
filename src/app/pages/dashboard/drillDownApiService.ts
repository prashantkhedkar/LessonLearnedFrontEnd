import { searchMyRequestsByFilterWithMonth } from "../../modules/services/serviceRequestSlice";
import { unwrapResult } from "@reduxjs/toolkit";

/**
 * Service mapping for drill-down API calls based on data sources
 * This maps chart data sources to appropriate API endpoints with proper filtering
 */

export interface DrillDownApiParams {
  filterType: string;
  [key: string]: any;
}

export interface DrillDownApiResult {
  statusCode: number;
  data: any[];
  message?: string;
}

/**
 * Maps data sources to their corresponding API calls with proper filtering
 */
export const drillDownApiMapping: {
  [key: string]: (
    params: DrillDownApiParams,
    dispatch: any
  ) => Promise<DrillDownApiResult>;
} = {

  // Monthly request data APIs
  SearchMyRequestsByFilterWithMonth: async (params, dispatch) => {
    

    const apiParams = {
      page: params.pageNumber || 1,
      pageSize: params.pageSize || 100,
      searchText: "",
      monthFilter: params.month || "",
      drillDownSource: "SearchMyRequestsByFilterWithMonth",
      userRole: params.roleName || "",
      dataSource: params.dataSource || "",
      filterType: params.filterType,
      filterValue: params.filterValue,
    };

    const result = await dispatch(searchMyRequestsByFilterWithMonth(apiParams));
    return unwrapResult(result);
  },
};

/**
 * Generic function to call the appropriate API based on data source
 */
export const callDrillDownApi = async (
  dataSource: string,
  params: DrillDownApiParams,
  dispatch: any
): Promise<DrillDownApiResult> => {
  console.log(`Calling drill-down API for data source: ${dataSource}`, params);

  const apiFunction = drillDownApiMapping[dataSource];
  
  if (apiFunction) {
    try {
      const result = await apiFunction(params, dispatch);
      console.log(`API result for ${dataSource}:`, result);
      return result;
    } catch (error) {
      console.error(`Error calling API for data source ${dataSource}:`, error);
      throw error;
    }
  } else {
    // Enhanced fallback with better parameter mapping for widget data
    console.warn(
      `No specific API mapping found for data source: ${dataSource}, using generic API`
    );

    // Enhanced parameter mapping for widget and other data types
    const fallbackParams = {
      page: params.pageNumber || 1,
      pageSize: params.pageSize || 100,
      searchText: params.searchText || params.category || params.value || "",
      drillDownSource: params.drillDownSource,
      userRole: params.userRole,
      dataSource: params.chartDataSource,
      filterType: params.filterType,
      filterValue: params.filterValue,
    };

    const result = await dispatch(
      searchMyRequestsByFilterWithMonth(fallbackParams)
    );
    return unwrapResult(result);
  }
};

/**
 * Helper function to build unified table data structure
 * Ensures consistent data format regardless of data source
 */
export const normalizeTableData = (
  rawData: any[],
  dataSource: string
): any[] => {
  if (!Array.isArray(rawData)) {
    return [];
  }

  // Apply data source specific normalization if needed
  return rawData.map((item) => ({
    requestNumber: item.requestNumber || item.id || "",
    serviceName: item.serviceName || item.service || "",
    currentStatus: item.currentStatus || item.status || "",
    priority: item.priority || "",
    requestDate: item.requestDate || item.createdDate || "",
    requestedBy: item.requestedBy || item.createdBy || "",
    assignedTo: item.assignedTo || item.assignedUser || "",
    // Add any other fields that might be needed
    ...item,
  }));
};
