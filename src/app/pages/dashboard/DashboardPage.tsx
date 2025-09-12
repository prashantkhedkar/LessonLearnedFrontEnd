/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useState } from "react";
import "./animation.scss";
import { useLang } from "../../../_metronic/i18n/Metronici18n";
import { useNavigate } from "react-router-dom";

import CountWidgetList from "../../modules/components/CountWidget/CountWidgetList";
import { ResponsiveChart } from "../../modules/components/charts/ResponsiveChart";
import {
  getBarChartOption,
  getDonutChartOptions,
} from "../../modules/utils/chart";
import { useAppDispatch, useAppSelector } from "../../../store";
import { unwrapResult } from "@reduxjs/toolkit";
import { IRoleAcces } from "../../models/global/globalGeneric";
import {
  fetchUserRolesAccessAsync,
  globalActions,
} from "../../modules/services/globalSlice";
import {
  fetchLastSixMonthsRequestsByServiceChart,
  fetchTopRequestsByUnits,
  fetchTotalRequestsByFulfillmentUnits,
  fetchTotalRequestsByUnitsGroupedByMonths,
  fetchLastSixMonthsInProgressRequestsChart,
  fetchTotalRequestsByPriority,
  fetchLastSixMonthsClosedRequestsChart,
  fetchLastSixMonthsReceivedRequestsChart,
  fetchMasterDashboardTileData,
  fetchAverageClosureTimeData,
  fetchFeedbackStatisticsData,
  fetchActionRequiredData,
  fetchNotificationTimelineData,
  fetchMasterDashboardTilePriorityData,
  fetchPercentCompletionofOpenRequestsByServiceData,
  fetchInProgressRequestByUnitData,
  fetchTopNthRequestsByServiceCategories,
  fetchLastSixMonthsRequestsByMonthChart,
  fetchFotificationByRoles,
} from "../../modules/services/adminSlice";
import { useAuth } from "../../modules/auth";
import { TileDataModel } from "../admin/AdminServiceDashboard";

// Import JSON configuration and types
import dashboardConfig from "./dashboardConfig.json";
import { DashboardConfig, BoundRowConfig, RowConfig } from "./dashboardTypes";
import {
  ServiceRatingData,
  AverageClosureTimeData,
  ActionRequiredData,
  NotificationTimelineData,
  defaultServiceRatingData,
  defaultAverageClosureTimeData,
  defaultActionRequiredData,
  defaultNotificationTimelineData,
  safeParseServiceRatingData,
  safeParseAverageClosureTimeData,
  safeParseActionRequiredData,
  safeParseNotificationTimelineData,
} from "../../models/dashboard/dashboardDataModels";
import RolesConstant, {
  RolesConstantAr,
} from "../../helper/_constant/roles.constant";
import { Skeleton } from "@mui/material";

/**
 * DashboardPage Component - Unified Role-Based Dashboard
 *
 * This component implements a unified dashboard system that:
 * 1. Uses dashboardConfig.json to define role-based UI layouts and data sources
 * 2. Integrates with fetchUserRolesAccessAsync() API to get user roles
 * 3. Dynamically fetches only required APIs based on role configuration
 * 4. Provides unified role management through getUserRoleManager()
 * 5. Supports multi-role users with tab navigation
 * 6. Optimizes API calls by fetching only data needed for the current role
 *
 * Key Features:
 * - Role-based data fetching: Only APIs required by the role's charts are called
 * - Unified role management: Single function handles all role-related operations
 * - Configuration-driven: Dashboard layout and data sources defined in JSON
 * - Performance optimized: Parallel API calls and role-specific loading
 */

import RatingEvaluation from "../../modules/components/ratingEvaluation/RatingEvaluation";
import AverageClosureTimeChart from "../../modules/components/charts/AverageClosureTimeChart";
import NotificationTimeline from "../../modules/components/charts/NotificationTimeline";
import UpdatesChart from "../../modules/components/charts/UpdatesChart";
import SquarLoader from "../../modules/components/animation/SquarLoader";
import { useIntl } from "react-intl";
import {
  DetailLabels,
  InfoLabels,
  LabelTitleSemibold1,
} from "../../modules/components/common/formsLabels/detailLabels";
import NoRecordsAvailable from "../../modules/components/noRecordsAvailable/NoRecordsAvailable";
import { fetchNotifications } from "../../services/notificationService";

const DashboardPage: FC = () => {
  const lang = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const intl = useIntl();

  const [masterTileData, setMasterTileData] = useState<TileDataModel[]>([]);
  const [subTileData, setSubTileData] = useState<TileDataModel[]>([]);

  // Simulate data loading with timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setDataLoaded(true);
      setIsLoading(false);
    }, 1000); // 1 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  const [closedRequestsInLastNthMonth, setClosedRequestsInLastNthMonth] =
    useState({
      seriesData: [
        {
          name: "",
          data: [],
        },
      ],
      xAxisData: [],
    });
  const [requestReceivedInLastNthMonth, setRequestReceivedInLastNthMonth] =
    useState({
      seriesData: [
        {
          name: "",
          data: [],
        },
      ],
      xAxisData: [],
    });
  const [inProgressRequestByUnitData, setInProgressRequestByUnitData] =
    useState({
      seriesData: [
        {
          name: "",
          data: [],
        },
      ],
      xAxisData: [],
    });
  const [
    getPercentCompletionofOpenRequestsByServiceData,
    setGetPercentCompletionofOpenRequestsByServiceData,
  ] = useState({
    seriesData: [
      {
        name: "",
        data: [],
      },
    ],
    xAxisData: [],
  });
  const [
    getNumberOfRequestCreatedByServiceData,
    setGetNumberOfRequestCreatedByServiceData,
  ] = useState({
    seriesData: [
      {
        name: "",
        data: [],
      },
    ],
    xAxisData: [],
  });
  const [
    getNumberOfRequestCreatedByMonthData,
    setGetNumberOfRequestCreatedByMonthData,
  ] = useState({
    seriesData: [
      {
        name: "",
        data: [],
      },
    ],
    xAxisData: [],
  });
  const [monthlyRequestsByUnitsData, setMonthlyRequestsByUnitsData] = useState({
    seriesData: [
      {
        name: "",
        data: [],
      },
    ],
    xAxisData: [],
  });
  const [highestRequestedUnitData, setHighestRequestedUnitData] = useState({
    seriesData: [
      {
        name: "",
        data: [],
      },
    ],
    xAxisData: [],
  });
  const [fulfillmentUnitsRequestsData, setFulfillmentUnitsRequestsData] =
    useState({
      seriesData: [
        {
          name: "",
          data: [],
        },
      ],
      xAxisData: [],
    });
  const [getInProgressRequestData, setInProgressRequestData] = useState({
    seriesData: [
      {
        name: "",
        data: [],
      },
    ],
    xAxisData: [],
  });
  const [
    getTopNthRequestsByServiceCategories,
    setTopNthRequestsByServiceCategories,
  ] = useState({
    seriesData: [
      {
        name: "",
        data: [],
      },
    ],
    xAxisData: [],
  });
  const [getPriorityData, setPriorityData] = useState([
    { value: 0, name: "High" },
    { value: 0, name: "Medium" },
    { value: 0, name: "Low" },
  ]);

  const [actionRequiredData, setActionRequiredData] =
    useState<ActionRequiredData>(defaultActionRequiredData);
  const [notificationTimelineData, setNotificationTimelineData] =
    useState<NotificationTimelineData>(defaultNotificationTimelineData);

  const [averageClosureTimeData, setAverageClosureTimeData] =
    useState<AverageClosureTimeData>(defaultAverageClosureTimeData);
  const [serviceRatingData, setServiceRatingData] = useState<ServiceRatingData>(
    defaultServiceRatingData
  );

  const { userRoleAccess } = useAppSelector((s) => s.globalgeneric);
  const dispatch = useAppDispatch();
  const { auth } = useAuth();

  let dir = "ltr";

  if (lang.toLowerCase() == "ar") {
    dir = "rtl";
  }

  // Load dashboard configuration from JSON
  const config: DashboardConfig = dashboardConfig as DashboardConfig;

  // Helper function to ensure data is serializable for React Router state
  const makeSerializable = (data: any): any => {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to serialize data for navigation:", error);
      return {};
    }
  };

  // Helper function to safely format messages
  const safeFormatMessage = (
    id: string | undefined | null,
    fallback: string = ""
  ): string => {
    if (!id || typeof id !== "string" || id.trim() === "") {
      return fallback;
    }
    try {
      return intl.formatMessage({ id: id.trim() });
    } catch (error) {
      console.warn(`Failed to format message with id: ${id}`, error);
      return fallback;
    }
  };

  useEffect(() => {
    if (!userRoleAccess || userRoleAccess.length == 0) {
      dispatch(fetchUserRolesAccessAsync())
        .then(unwrapResult)
        .then((orginalPromiseResult) => {
          if (orginalPromiseResult.statusCode === 200) {
            if (orginalPromiseResult.data) {
              const authorizedRole = orginalPromiseResult.data as IRoleAcces[];
              dispatch(
                globalActions.updateUserRoleAccess({ data: authorizedRole })
              );
            }
          } else {
            console.error("fetching data error");
          }
        })
        .catch((error) => {
          console.error("fetching data error");
        });
    }
  }, []);

  // Update active tab when userRoleAccess changes
  useEffect(() => {
    // Reset to first tab when roles change
    setActiveTab(0);
  }, [userRoleAccess]);

  // Initial role fetching effect - ensures roles are available on component mount
  useEffect(() => {
    const initializeRoles = async () => {
      const roleManager = getUserRoleManager();
      await roleManager.ensureRolesAreFetched();
    };

    initializeRoles();
  }, [dispatch]);

  // Optimized function to get required data sources for a specific role from dashboardConfig
  const getRequiredDataSourcesForRole = (roleName: string): Set<string> => {
    const config: DashboardConfig = dashboardConfig as DashboardConfig;
    const roleConfig =
      config.roles[roleName] || config.roles["Requesting Unit"];
    const dataSources = new Set<string>();

    if (!roleConfig || !Array.isArray(roleConfig)) {
      console.warn(`No configuration found for role: ${roleName}`);
      return dataSources;
    }

    // Static and mock data sources that don't require API calls
    const nonApiDataSources = new Set(["static:"]);

    const processDataSource = (dataSource?: string) => {
      if (!dataSource) return;

      const mappedDataSource = config.dataSources[dataSource] || dataSource;

      // Check if this requires an API call
      const isApiDataSource =
        !nonApiDataSources.has(mappedDataSource) &&
        !Array.from(nonApiDataSources).some((prefix) =>
          mappedDataSource.startsWith(prefix)
        );

      if (isApiDataSource) {
        dataSources.add(mappedDataSource);
      }
    };

    // Extract data sources from all chart configurations
    roleConfig.forEach((rowConfig) => {
      // Process all possible chart configurations
      processDataSource(rowConfig.leftChart?.dataSource);
      processDataSource(rowConfig.rightChart?.dataSource);
      processDataSource(rowConfig.chart?.dataSource);
      processDataSource(rowConfig.barChart?.dataSource);
      processDataSource(rowConfig.donutChart?.dataSource);
      processDataSource(rowConfig.timeline?.dataSource);
      processDataSource(rowConfig.updates?.dataSource);
      processDataSource(rowConfig.ratingChart?.dataSource);
      processDataSource(rowConfig.closureTimeChart?.dataSource);

      // Process multiple charts for single-multirow-layout
      if (rowConfig.charts && Array.isArray(rowConfig.charts)) {
        rowConfig.charts.forEach((chartConfig) => {
          processDataSource(chartConfig?.dataSource);
        });
      }
    });

    return dataSources;
  };

  // Centralized API mapping and data fetching system
  const createApiDataFetcher = () => {
    interface ApiMapping {
      api: (userRole?: string) => any;
      setter: (data: any) => void;
      transform: (data: any) => any;
      defaultValue?: any;
    }

    const apiMappings: Record<string, ApiMapping> = {
      inProgressRequestByUnitData: {
        api: (userRole?: string) =>
          dispatch(fetchInProgressRequestByUnitData({ userRole })),
        setter: setInProgressRequestByUnitData,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      fetchPercentCompletionofOpenRequestsByServiceData: {
        api: (userRole?: string) =>
          dispatch(
            fetchPercentCompletionofOpenRequestsByServiceData({ userRole })
          ),
        setter: setGetPercentCompletionofOpenRequestsByServiceData,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      fetchMasterDashboardTileData: {
        api: (userRole?: string) =>
          dispatch(fetchMasterDashboardTileData({ userRole })),
        setter: setMasterTileData,
        transform: (data: any) => data || [],
      },
      fetchMasterDashboardTilePriorityData: {
        api: (userRole?: string) =>
          dispatch(fetchMasterDashboardTilePriorityData({ userRole })),
        setter: setSubTileData,
        transform: (data: any) => data || [],
      },
      getNumberOfRequestCreatedByMonthData: {
        api: (userRole?: string) =>
          dispatch(fetchLastSixMonthsRequestsByMonthChart({ userRole })),
        setter: setGetNumberOfRequestCreatedByMonthData,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      getNumberOfRequestCreatedByServiceData: {
        api: (userRole?: string) =>
          dispatch(fetchLastSixMonthsRequestsByServiceChart({ userRole })),
        setter: setGetNumberOfRequestCreatedByServiceData,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      getHighestRequestedUnitData: {
        api: (userRole?: string) =>
          dispatch(
            fetchTopRequestsByUnits({ topN: 10, lang: lang.toLowerCase() })
          ),
        setter: setHighestRequestedUnitData,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      fulfillmentUnitsRequestsData: {
        api: (userRole?: string) =>
          dispatch(
            fetchTotalRequestsByFulfillmentUnits({
              lang: lang.toLowerCase(),
              userRole,
            })
          ),
        setter: setFulfillmentUnitsRequestsData,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      getInProgressRequestData: {
        api: (userRole?: string) =>
          dispatch(fetchLastSixMonthsInProgressRequestsChart({ userRole })),
        setter: setInProgressRequestData,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      getTopNthRequestsByServiceCategories: {
        api: (userRole?: string) =>
          dispatch(
            fetchTopNthRequestsByServiceCategories({
              lang: lang.toLowerCase(),
              userRole,
            })
          ),
        setter: setTopNthRequestsByServiceCategories,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      getPriorityData: {
        api: (userRole?: string) =>
          dispatch(
            fetchTotalRequestsByPriority({ lang: lang.toLowerCase(), userRole })
          ),
        setter: setPriorityData,
        transform: (data: any) => data?.data || [],
      },
      monthlyRequestsByUnitsData: {
        api: (userRole?: string) =>
          dispatch(
            fetchTotalRequestsByUnitsGroupedByMonths({
              lang: lang.toLowerCase(),
              userRole,
            })
          ),
        setter: setMonthlyRequestsByUnitsData,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      getClosedRequestsData: {
        api: (userRole?: string) =>
          dispatch(
            fetchLastSixMonthsClosedRequestsChart({
              lang: lang.toLowerCase(),
              userRole,
            })
          ),
        setter: setClosedRequestsInLastNthMonth,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      getReceivedRequestsData: {
        api: (userRole?: string) =>
          dispatch(
            fetchLastSixMonthsReceivedRequestsChart({
              lang: lang.toLowerCase(),
              userRole,
            })
          ),
        setter: setRequestReceivedInLastNthMonth,
        transform: (data: any) => ({
          seriesData: data?.seriesData || [],
          xAxisData: data?.xAxisData || [],
        }),
      },
      averageClosureTimeData: {
        api: (userRole?: string) =>
          dispatch(
            fetchAverageClosureTimeData({ lang: lang.toLowerCase(), userRole })
          ),
        setter: setAverageClosureTimeData,
        transform: (data: any) => safeParseAverageClosureTimeData(data),
        defaultValue: defaultAverageClosureTimeData,
      },
      feedbackStatisticsData: {
        api: (userRole?: string) =>
          dispatch(
            fetchFeedbackStatisticsData({ lang: lang.toLowerCase(), userRole })
          ),
        setter: setServiceRatingData,
        transform: (data: any) => safeParseServiceRatingData(data),
        defaultValue: defaultServiceRatingData,
      },
      actionRequiredData: {
        api: (userRole?: string) =>
          dispatch(
            fetchActionRequiredData({ lang: lang.toLowerCase(), userRole })
          ),
        setter: setActionRequiredData,
        transform: (data: any) => safeParseActionRequiredData(data),
        defaultValue: defaultActionRequiredData,
      },
      notificationTimelineData: {
        api: (userRole?: string) =>
          dispatch(
            fetchFotificationByRoles({
              pageNumber: 1,
              pageSize: 10,
              unreadOnly: false,
            })
          ),
        setter: setNotificationTimelineData,
        transform: (data: any) => safeParseNotificationTimelineData(data),
        defaultValue: defaultNotificationTimelineData,
      },
    };

    const fetchDataForSource = async (
      dataSource: string,
      userRole?: string
    ) => {
      const mapping = apiMappings[dataSource];

      if (!mapping) {
        return;
      }

      try {
        const result = await mapping.api(userRole);
        const unwrappedResult = unwrapResult(result);

        if (unwrappedResult.statusCode === 200) {
          const transformedData = mapping.transform(unwrappedResult.data);
          mapping.setter(transformedData);
        } else {
          console.error(`Failed to fetch data for ${dataSource}`);
          if (mapping.defaultValue) {
            mapping.setter(mapping.defaultValue);
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${dataSource}:`, error);
        if (mapping.defaultValue) {
          mapping.setter(mapping.defaultValue);
        }
      }
    };

    return { fetchDataForSource };
  };

  // Optimized function to fetch role-specific data
  const fetchRoleSpecificData = async (roleName: string) => {
    const requiredDataSources = getRequiredDataSourcesForRole(roleName);

    // Fetch only required APIs based on role configuration
    const dataFetcher = createApiDataFetcher();
    const fetchPromises = Array.from(requiredDataSources).map((dataSource) =>
      dataFetcher.fetchDataForSource(dataSource, roleName)
    );

    // Execute all API calls in parallel for better performance
    await Promise.allSettled(fetchPromises);
  };

  // Effect to fetch data when active tab changes
  useEffect(() => {
    const roleManager = getUserRoleManager();
    const activeRoleName = roleManager.getRoleAtIndex(activeTab);
    if (activeRoleName && userRoleAccess && userRoleAccess.length > 0) {
      fetchRoleSpecificData(activeRoleName);
    }
  }, [activeTab, userRoleAccess]);

  // Effect to fetch data when user roles are loaded or language changes
  useEffect(() => {
    const fetchDataWithRoles = async () => {
      const roleManager = getUserRoleManager();

      // Ensure roles are fetched from API if not available
      await roleManager.ensureRolesAreFetched();

      // Now get the primary role (userRoleAccess should be updated by now)
      const currentUserRole = roleManager.getPrimaryRole();
      fetchRoleSpecificData(currentUserRole);
    };

    fetchDataWithRoles();
  }, [dispatch, lang]);

  // Early return if config is not loaded properly
  if (!config || !config.roles || !config.dataSources || !config.staticData) {
    console.error("Dashboard configuration is not properly loaded:", config);
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger">
          </div>
        </div>
      </div>
    );
  }

  // Unified function to manage user roles based on dashboardConfig.json and userRoleAccess
  const getUserRoleManager = () => {
    // Async function to ensure roles are fetched from API if not available
    const ensureRolesAreFetched = async (): Promise<void> => {
      if (!userRoleAccess || userRoleAccess.length === 0) {
        try {
          const result = await dispatch(fetchUserRolesAccessAsync());
          const orginalPromiseResult = unwrapResult(result);
          if (
            orginalPromiseResult.statusCode === 200 &&
            orginalPromiseResult.data
          ) {
            const authorizedRole = orginalPromiseResult.data as IRoleAcces[];
            dispatch(
              globalActions.updateUserRoleAccess({ data: authorizedRole })
            );
          }
        } catch (error) {
          console.warn(
            "Failed to fetch user roles, falling back to Requesting Unit",
            error
          );
        }
      }
    };

    const getAvailableRoles = (): string[] => {
      if (!userRoleAccess || userRoleAccess.length === 0) {
        return [RolesConstant.REQUESTINGUNIT];
      }

      // Get unique role names from userRoleAccess that exist in dashboardConfig
      const userRoleNames = userRoleAccess
        .map((role) => role.roleName?.trim())
        .filter(Boolean);

      const availableRoles = userRoleNames.filter(
        (roleName) => config.roles[roleName as string] !== undefined
      );

      return availableRoles.length > 0
        ? availableRoles
        : [RolesConstant.REQUESTINGUNIT];
    };

    const getPrimaryRole = (): string => {
      const availableRoles = getAvailableRoles();

      if (
        availableRoles.includes(RolesConstant.REQUESTINGUNIT) &&
        availableRoles.length === 1
      ) {
        return RolesConstant.REQUESTINGUNIT;
      }

      // Define role priority based on dashboard config and business logic
      const rolePriority = [
        RolesConstant.FMSADMIN,
        RolesConstant.UNITADMIN,
        RolesConstant.REQUESTINGUNIT,
        RolesConstant.FULFILLMENTUNIT,
        RolesConstant.SECURITYUNIT,
        RolesConstant.SUPPORTINGUNIT,
        RolesConstant.DELEGATIONUNIT,
      ];

      // Return the highest priority role that the user has
      for (const role of rolePriority) {
        if (availableRoles.includes(role)) {
          return role;
        }
      }

      // Return first available role if none match priority
      return availableRoles[0] || RolesConstant.REQUESTINGUNIT;
    };

    const getRoleAtIndex = (index: number): string => {
      const availableRoles = getAvailableRoles();
      return (
        availableRoles[index] ||
        availableRoles[0] ||
        RolesConstant.REQUESTINGUNIT
      );
    };

    const hasMultipleRoles = (): boolean => {
      return getAvailableRoles().length > 1;
    };

    return {
      ensureRolesAreFetched,
      getAvailableRoles,
      getPrimaryRole,
      getRoleAtIndex,
      hasMultipleRoles,
    };
  };

  // Function to normalize role name for ID generation
  const normalizeRoleForId = (roleName: string): string => {
    return roleName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  };

  // Chart click handlers for drill-down functionality
  const handleChartClick = (params: any, chartConfig: any) => {
    // console.log("DashboardPage: Chart clicked", { params, chartConfig });
    const roleManager = getUserRoleManager();
    const activeRoleName = roleManager.getRoleAtIndex(activeTab);

    // Extract relevant data from the click event
    const selectedValue = params.value || params.data?.value || params.name;
    const selectedLabel = params.name || params.data?.name || params.seriesName;
    const dataIndex = params.dataIndex; // Index of clicked data point
    const seriesIndex = params.seriesIndex; // Index of series if multiple series

    // Ensure we have valid click data before proceeding
    if (!selectedValue && !selectedLabel) {
      // console.warn("Invalid chart click data:", params);
      return;
    }

    // Build comprehensive filter data based on chart type and data source
    // Note: Only include serializable data to ensure proper navigation state transfer
    let filterData: any = {
      chartDataSource: chartConfig.dataSource,
      drilldowndataSource: chartConfig.drilldowndataSource,
      activeRoleName: activeRoleName,
      // Extract only serializable data from params instead of the entire object
      clickParams: {
        value: params.value,
        name: params.name,
        dataIndex: params.dataIndex,
        seriesIndex: params.seriesIndex,
        seriesName: params.seriesName,
        data: params.data
          ? {
            value: params.data.value,
            name: params.data.name,
          }
          : null,
      },
      dataIndex: dataIndex,
      seriesIndex: seriesIndex,
      originalChartTitle: safeFormatMessage(chartConfig.title, "Chart Data"),
    };

    // Add data source specific filtering logic
    switch (chartConfig.dataSource) {
      case "numberOfRequestCreatedByMonthData":
      case "getNumberOfRequestCreatedByMonthData":
      case "inProgressRequestData":
      case "getInProgressRequestData":
      case "getReceivedRequestsData":
      case "getClosedRequestsData":
        // For monthly data, filter by specific month
        filterData = {
          ...filterData,
          filterType: "monthly",
          filterValue: selectedLabel,
          month: selectedLabel,
          monthIndex: dataIndex,
          requestType: "created",
          selectedPeriod: selectedLabel,
        };
        break;

      case "getTopNthRequestsByServiceCategories": debugger;
        // For service categories, filter by specific service
        filterData = {
          ...filterData,
          filterType: "servicecategory",
          filterValue: selectedLabel,
          serviceName: selectedLabel,
          serviceValue: selectedValue,
          selectedService: selectedLabel,
        };
        break;

      case "numberOfRequestCreatedByServiceData": debugger;
        // For service categories, filter by specific service
        filterData = {
          ...filterData,
          filterType: "servicename",
          filterValue: selectedLabel,
          serviceName: selectedLabel,
          serviceValue: selectedValue,
          selectedService: selectedLabel,
        };
        break;

      case "priorityData":
      case "getPriorityData":
        // For priority data, filter by priority level
        const selectedValueId = params.data?.id;
        filterData = {
          ...filterData,
          filterType: "priority",
          filterValue: selectedValueId,
          requestType: "created",
          selectedPeriod: selectedLabel,
        };
        break;

      case "inProgressRequestByUnitData":
      case "fulfillmentUnitsRequestsData":
        // For unit data, filter by specific unit
        filterData = {
          ...filterData,
          filterType: "unit",
          filterValue: selectedLabel,
          unitName: selectedLabel,
          unitValue: selectedValue,
          selectedUnit: selectedLabel,
        };
        break;

      case "fulfillmentUnitsRequestsData":
        // For fulfillment units, filter by specific fulfillment unit
        filterData = {
          ...filterData,
          filterType: "fulfillmentUnit",
          filterValue: selectedLabel,
          fulfillmentUnit: selectedLabel,
          unitValue: selectedValue,
          selectedFulfillmentUnit: selectedLabel,
        };
        break;

      case "highestRequestedByServiceData":
        // For service categories, filter by specific service
        filterData = {
          ...filterData,
          filterType: "percentopenrequestbyservice",
          filterValue: selectedLabel,
          serviceName: selectedLabel,
          serviceValue: selectedValue,
          selectedService: selectedLabel,
        };
        break;

      default:
        // Generic filtering for other data sources
        filterData = {
          ...filterData,
          filterType: "generic",
          category: selectedLabel,
          value: selectedValue,
          selectedItem: selectedLabel,
        };
    }

    // Ensure filterData is serializable for React Router state
    const serializableFilterData = makeSerializable(filterData);

    console.log("DashboardPage: Navigating with state:", {
      chartType: chartConfig.type || "bar",
      chartTitle: safeFormatMessage(chartConfig.title, "Chart Details"),
      selectedValue: selectedValue || "Unknown",
      selectedLabel: selectedLabel || "Unknown",
      filterData: serializableFilterData,
    });

    navigate("/fms-dashboard/drill-down", {
      state: {
        chartType: chartConfig.type || "bar",
        chartTitle: safeFormatMessage(chartConfig.title, "Chart Details"),
        selectedValue: selectedValue || "Unknown",
        selectedLabel: selectedLabel || "Unknown",
        filterData: serializableFilterData,
      },
    });
  };


  const handleTilesClick = (params: any, chartConfig: any) => {
    // console.log("DashboardPage: Widget clicked", { params, chartConfig });
    const roleManager = getUserRoleManager();
    const activeRoleName = roleManager.getRoleAtIndex(activeTab);

    // Extract relevant data from the click event
    const selectedValue = params.count || params.name;
    const selectedLabel = params.name;
    const dataIndex = 0; // Index of clicked data point
    const seriesIndex = 0; // Index of series if multiple series

    // Ensure we have valid click data before proceeding
    if (!selectedValue && !selectedLabel) {
      console.warn("Invalid chart click data:", params);
      return;
    }

    let chartDataSourcevalue = "";
    if (params.name === "Low" || params.name === "Medium" || params.name === "High" || params.name === "عالي" || params.name === "متوسط" || params.name === "منخفض") {
      chartConfig.dataSource = "priorityData";
      chartDataSourcevalue = "priorityData";
    }

    else if (params.name === "Total Requests" || params.name === "إجمالي الطلبات") {
      chartConfig.dataSource = "numberOfRequestCreatedByMonthData";
      chartDataSourcevalue = "numberOfRequestCreatedByMonthData";
    }

    else if (params.name === "Open" || params.name === "الطلبات المفتوحة") {
      chartConfig.dataSource = "inProgressRequestData";
      chartDataSourcevalue = "inProgressRequestData";
    }

    else if (params.name === "Closed" || params.name === "الطلبات المغلقة") {
      chartConfig.dataSource = "getClosedRequestsData";
      chartDataSourcevalue = "getClosedRequestsData";
    }

    // Build comprehensive filter data based on chart type and data source
    // Note: Only include serializable data to ensure proper navigation state transfer
    let filterData: any = {
      chartDataSource: chartDataSourcevalue,
      drilldowndataSource: "SearchMyRequestsByFilterWithMonth",
      activeRoleName: activeRoleName,
      // Extract only serializable data from params instead of the entire object
      clickParams: {
        value: params.count,
        name: params.name,
        dataIndex: params.dataIndex,
        seriesIndex: params.seriesIndex,
        seriesName: params.seriesName,
        data: params
          ? {
            value: params.count,
            name: params.name,
          }
          : null,
      },
      dataIndex: dataIndex,
      seriesIndex: seriesIndex,
      originalChartTitle: safeFormatMessage(chartConfig.title, "Chart Data"),
    };

    // Add data source specific filtering logic
    switch (chartConfig.dataSource) {

      case "inProgressRequestData":
      case "getClosedRequestsData":
        // For monthly data, filter by specific month
        filterData = {
          ...filterData,
          filterType: "widgets",
          filterValue: selectedLabel,
          month: selectedLabel,
          monthIndex: dataIndex,
          requestType: "created",
          selectedPeriod: selectedLabel,
        };
        break;

      case "numberOfRequestCreatedByMonthData":
        // For monthly data, filter by specific month
        filterData = {
          ...filterData,
          filterType: "widgets",
          filterValue: "",
          month: selectedLabel,
          monthIndex: dataIndex,
          requestType: "created",
          selectedPeriod: selectedLabel,
        };
        break;

      case "priorityData":
        // For priority data, filter by priority level
        const selectedValueId = params.statusId[0];
        filterData = {
          ...filterData,
          filterType: "priority",
          filterValue: selectedValueId,
          requestType: "created",
          selectedPeriod: selectedLabel,
        };
        break;

      default:
        // Generic filtering for other data sources
        filterData = {
          ...filterData,
          filterType: "generic",
          category: selectedLabel,
          value: selectedValue,
          selectedItem: selectedLabel,
        };
    }

    // Ensure filterData is serializable for React Router state
    const serializableFilterData = makeSerializable(filterData);

    console.log("DashboardPage: Navigating with state:", {
      chartType: chartConfig.type || "bar",
      chartTitle: safeFormatMessage(chartConfig.title, "Chart Details"),
      selectedValue: selectedValue || "Unknown",
      selectedLabel: selectedLabel || "Unknown",
      filterData: serializableFilterData,
    });

    navigate("/fms-dashboard/drill-down", {
      state: {
        chartType: chartConfig.type || "bar",
        chartTitle: safeFormatMessage(chartConfig.title, "Chart Details"),
        selectedValue: selectedValue || "Unknown",
        selectedLabel: selectedLabel || "Unknown",
        filterData: serializableFilterData,
      },
    });
  };

  const handleWidgetClick = (widget: any) => {
    // Ensure we have valid widget data
    if (!widget) {
      console.warn("Invalid widget click data:", widget);
      return;
    }

    // Build widget-specific filter data
    const filterData = {
      widgetData: widget,
      filterType: "widget",
      statusId: widget.statusId || widget.id,
      widgetTitle: intl.formatMessage({ id: widget.title }) || widget.name,
      widgetName: widget.name || intl.formatMessage({ id: widget.title }),
      selectedWidget: intl.formatMessage({ id: widget.title }) || widget.name,
      chartDataSource: "fetchMasterDashboardTileData", // Default data source for widgets
      // Add any other widget properties that might be useful for filtering
      ...widget,
    };

    // Navigate to drill-down page with widget context
    navigate("/fms-dashboard/drill-down", {
      state: {
        chartType: "widgetStats",
        chartTitle:
          intl.formatMessage({ id: widget.title }) || "Widget Details",
        selectedValue:
          widget.statusId || widget.id || widget.value || "Unknown",
        selectedLabel:
          intl.formatMessage({ id: widget.title }) || widget.name || "Unknown",
        filterData: filterData,
      },
    });
  };

  // Unified data source mapper - integrates with dashboardConfig.json and state data
  const getDataSource = (dataSourceName: string, userId?: number) => {
    // Safety check for config
    if (!config || !config.staticData || !config.dataSources) {
      console.warn("Dashboard config is not properly loaded");
      return { seriesData: [], xAxisData: [] };
    }

    // Handle static data references from dashboardConfig.json
    if (dataSourceName.startsWith("static:")) {
      const staticKey = dataSourceName.replace("static:", "");
      const staticData = config.staticData[staticKey] || [];
      return staticData;
    }

    // Get the mapped data source name from config
    const mappedDataSource =
      config.dataSources[dataSourceName] || dataSourceName;

    // Handle static data references after mapping
    if (mappedDataSource.startsWith("static:")) {
      const staticKey = mappedDataSource.replace("static:", "");
      const staticData = config.staticData[staticKey] || [];
      return staticData;
    }

    // Unified state data mapping
    const stateDataSources: { [key: string]: any } = {
      getNumberOfRequestCreatedByServiceData:
        getNumberOfRequestCreatedByServiceData,
      getHighestRequestedUnitData: highestRequestedUnitData,
      fulfillmentUnitsRequestsData: fulfillmentUnitsRequestsData,
      getInProgressRequestData: getInProgressRequestData,
      getTopNthRequestsByServiceCategories:
        getTopNthRequestsByServiceCategories,
      getPriorityData: getPriorityData,
      getClosedRequestsData: closedRequestsInLastNthMonth,
      getReceivedRequestsData: requestReceivedInLastNthMonth,
      actionRequiredData: actionRequiredData,
      notificationTimelineData: notificationTimelineData,
      monthlyRequestsByUnitsData: monthlyRequestsByUnitsData,
      averageClosureTimeData: averageClosureTimeData,
      feedbackStatisticsData: serviceRatingData,
      fetchMasterDashboardTileData: masterTileData,
      fetchMasterDashboardTilePriorityData: subTileData,
      fetchPercentCompletionofOpenRequestsByServiceData:
        getPercentCompletionofOpenRequestsByServiceData,
      inProgressRequestByUnitData: inProgressRequestByUnitData,
      getNumberOfRequestCreatedByMonthData:
        getNumberOfRequestCreatedByMonthData,
    };

    const data = stateDataSources[mappedDataSource];

    // Handle special data types
    if (
      mappedDataSource === "serviceRatingData" ||
      mappedDataSource === "feedbackStatisticsData"
    ) {
      return Array.isArray(data) ? data : defaultServiceRatingData;
    }

    // Provide safe defaults for missing data
    if (!data) {
      console.warn(
        "No data found for:",
        mappedDataSource,
        "Returning default structure"
      );
      // Return appropriate default structure based on data source type
      if (
        mappedDataSource.includes("Data") &&
        !mappedDataSource.includes("Priority") &&
        !mappedDataSource.includes("risk")
      ) {
        return { seriesData: [], xAxisData: [] };
      }
      // For widget stats specifically, return empty array
      if (mappedDataSource === "fetchMasterDashboardTileData") {
        return [];
      }
      return [];
    }

    // Ensure chart data has proper structure
    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (data.seriesData !== undefined || data.xAxisData !== undefined) {
        return {
          seriesData: data.seriesData || [],
          xAxisData: data.xAxisData || [],
        };
      }
    }

    return data;
  };

  // Get chart configuration based on user role and bind with user-specific data
  const getChartsForRole = (
    role: string,
    userId?: number
  ): BoundRowConfig[] => {
    // Safety check for config
    if (!config || !config.roles) {
      console.warn("Dashboard config roles are not properly loaded");
      return [];
    }

    const roleConfig = config.roles[role] || config.roles["Requesting Unit"];

    // Safety check for roleConfig
    if (!roleConfig || !Array.isArray(roleConfig)) {
      console.warn(`No configuration found for role: ${role}`);
      return [];
    }

    // Bind data sources to actual data based on individual chart configurations
    return roleConfig.map((rowConfig: RowConfig) => {
      const boundConfig: any = {
        id: rowConfig.id,
        type: rowConfig.type,
      };

      // Generic function to bind chart data based on individual chart type and dataSource
      const bindChartData = (chartConfig: any) => {
        if (chartConfig && chartConfig.dataSource) {
          return {
            ...chartConfig,
            data: getDataSource(chartConfig.dataSource, userId),
          };
        }
        return chartConfig;
      };

      // Bind data for all possible chart properties based on their individual configurations
      if (rowConfig.leftChart) {
        boundConfig.leftChart = bindChartData(rowConfig.leftChart);
      }

      if (rowConfig.rightChart) {
        boundConfig.rightChart = bindChartData(rowConfig.rightChart);
      }

      if (rowConfig.chart) {
        boundConfig.chart = bindChartData(rowConfig.chart);
      }

      // Bind data for multiple charts in single-multirow-layout
      if (rowConfig.charts && Array.isArray(rowConfig.charts)) {
        boundConfig.charts = rowConfig.charts.map((chartConfig) =>
          bindChartData(chartConfig)
        );
      }

      if (rowConfig.barChart) {
        boundConfig.barChart = bindChartData(rowConfig.barChart);
      }

      if (rowConfig.donutChart) {
        boundConfig.donutChart = bindChartData(rowConfig.donutChart);
      }

      if (rowConfig.timeline) {
        boundConfig.timeline = bindChartData(rowConfig.timeline);
      }

      if (rowConfig.updates) {
        boundConfig.updates = bindChartData(rowConfig.updates);
      }

      if (rowConfig.ratingChart) {
        boundConfig.ratingChart = bindChartData(rowConfig.ratingChart);
      }

      if (rowConfig.closureTimeChart) {
        boundConfig.closureTimeChart = bindChartData(
          rowConfig.closureTimeChart
        );
      }

      return boundConfig as BoundRowConfig;
    });
  };

  // Render skeleton loader for chart components
  const renderChartSkeleton = (
    height: number = 350,
    chartType: string = "default"
  ) => {
    if (chartType === "rating") {
      return (
        <div style={{ padding: "20px" }}>
          <Skeleton
            variant="text"
            width="70%"
            height={30}
            sx={{ marginBottom: "20px" }}
          />
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", marginRight: "15px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Skeleton
                    key={star}
                    variant="circular"
                    width={16}
                    height={16}
                    sx={{ marginRight: "2px" }}
                  />
                ))}
              </div>
              <Skeleton variant="text" width="60px" height={20} />
              <Skeleton
                variant="text"
                width="40px"
                height={16}
                sx={{ marginLeft: "10px" }}
              />
            </div>
          ))}
        </div>
      );
    }

    if (chartType === "averageClosureTime") {
      return (
        <div style={{ padding: "20px" }}>
          <Skeleton
            variant="text"
            width="75%"
            height={30}
            sx={{ marginBottom: "20px", textAlign: "right" }}
          />
          <div style={{ marginTop: "30px" }}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} style={{ marginBottom: "25px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Skeleton variant="text" width="120px" height={16} />
                  <Skeleton variant="text" width="40px" height={16} />
                </div>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={12}
                  sx={{ borderRadius: "6px" }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default chart skeleton (bar/donut charts)
    return (
      <div style={{ padding: "20px" }}>
        <Skeleton
          variant="text"
          width="60%"
          height={30}
          sx={{ marginBottom: "20px" }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={height - 50}
          sx={{ borderRadius: "8px" }}
        />
      </div>
    );
  };

  // Generic chart rendering function based on individual chart configuration
  const renderGenericChart = (chartConfig: any, loading: boolean = false) => {
    if (!chartConfig) return null;

    if (loading) {
      return renderChartSkeleton(chartConfig.height || 350, chartConfig.type);
    }

    // Add error boundary for chart rendering
    try {
      switch (chartConfig.type) {
        case "rating":
          // Ensure data is in the correct format for rating chart
          const ratingData = chartConfig.data || [];
          let validRatingData: any[] = [];

          if (Array.isArray(ratingData) && ratingData.length > 0) {
            validRatingData = ratingData
              .filter(
                (item) =>
                  item &&
                  typeof item === "object" &&
                  ("stars" in item || "star" in item) &&
                  ("percentage" in item || "percent" in item)
              )
              .map((item) => ({
                stars: item.stars || item.star || 0,
                percentage: item.percentage || item.percent || 0,
              }));
          }

          // If no valid data, provide default rating data
          if (validRatingData.length === 0) {
            validRatingData = [
              { stars: 5, percentage: 0 },
              { stars: 4, percentage: 0 },
              { stars: 3, percentage: 0 },
              { stars: 2, percentage: 0 },
              { stars: 1, percentage: 0 },
            ];
          }

          return (
            <RatingEvaluation
              title={intl.formatMessage({ id: chartConfig.title })}
              ratings={validRatingData}
              className="w-100"
            />
          );

        case "averageClosureTime":
          return (
            <AverageClosureTimeChart
              title={intl.formatMessage({ id: chartConfig.title })}
              data={chartConfig.data || []}
              height={chartConfig.height || 350}
              className="chart-half-fit w-100"
            />
          );

        case "notificationTimeline":
          return (
            <NotificationTimeline
              title={intl.formatMessage({ id: chartConfig.title })}
              data={chartConfig.data || []}
              height={chartConfig.height || 350}
              className="chart-half-fit w-100"
              showBorder={true}
              enableClick={true}
            />
          );

        case "widgetStats":
          // Ensure we always pass an array to CountWidgetList
          const widgetData = Array.isArray(chartConfig.data)
            ? chartConfig.data
            : [];

          return (<div style={{ cursor: "pointer" }}> <CountWidgetList widgets={widgetData} scrollable={false} onWidgetClick={(params) => handleTilesClick(params, chartConfig)} /></div>);

        case "donut":
          // Ensure data is in the correct format for donut chart
          const donutData = chartConfig.data || [];
          const validDonutData = Array.isArray(donutData)
            ? donutData.filter(
              (item) =>
                item &&
                typeof item === "object" &&
                "name" in item &&
                "value" in item
            )
            : [];

          // Check if there's no valid data
          if (validDonutData.length === 0) {
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: chartConfig.height || 350,
                  textAlign: "center",
                }}
              >
                <NoRecordsAvailable />
              </div>
            );
          }

          return (
            <ResponsiveChart
              height={chartConfig.height}
              option={getDonutChartOptions(
                intl.formatMessage({ id: chartConfig.title }),
                validDonutData
              )}
              onChartClick={(params) => handleChartClick(params, chartConfig)}
            />
          );

        case "bar":
          // Handle data for bar chart format - API returns { seriesData: [...], xAxisData: [...] }
          const barData = chartConfig.data || {};

          // Check if data is in the expected API format with seriesData and xAxisData
          if (
            barData.seriesData &&
            barData.xAxisData &&
            Array.isArray(barData.seriesData) &&
            Array.isArray(barData.xAxisData)
          ) {
            // Check if there's no data in the series or axes
            const hasData =
              barData.seriesData.length > 0 &&
              barData.xAxisData.length > 0 &&
              barData.seriesData.some(
                (series) => series.data && series.data.length > 0
              );

            if (!hasData) {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: chartConfig.height || 350,
                    textAlign: "center",
                  }}
                >
                  <NoRecordsAvailable />
                </div>
              );
            }

            // Data is already in the correct format for ResponsiveChart
            const transformedBarData = {
              seriesData: barData.seriesData,
              xAxisData: barData.xAxisData,
            };

            return (
              <ResponsiveChart
                height={chartConfig.height}
                option={getBarChartOption(
                  intl.formatMessage({ id: chartConfig.title }),
                  transformedBarData,
                  chartConfig.dataSource,
                  chartConfig.barColor
                )}
                onChartClick={(params) => handleChartClick(params, chartConfig)}
              />
            );
          }

          // Fallback: Check if data is an array (legacy format)
          else if (Array.isArray(barData)) {
            // Check if the array has data
            if (barData.length === 0) {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: chartConfig.height || 350,
                    textAlign: "center",
                  }}
                >
                  <NoRecordsAvailable />
                </div>
              );
            }

            const transformedBarData = {
              xAxisData: barData.map(
                (item: any) => item.name || item.label || ""
              ),
              seriesData: [
                {
                  name:
                    intl.formatMessage({ id: chartConfig.title }) || "Series",
                  data: barData.map((item: any) => item.value || 0),
                },
              ],
            };

            return (
              <ResponsiveChart
                height={chartConfig.height}
                option={getBarChartOption(
                  intl.formatMessage({ id: chartConfig.title }),
                  transformedBarData,
                  chartConfig.dataSource,
                  chartConfig.barColor
                )}
                onChartClick={(params) => handleChartClick(params, chartConfig)}
              />
            );
          }

          // If data format is not recognized or is empty
          else {
            console.warn("Bar chart data format not recognized:", barData);
            return (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: chartConfig.height || 350,
                  textAlign: "center",
                }}
              >
                <NoRecordsAvailable />
              </div>
            );
          }

        case "updates":
          return (
            <UpdatesChart
              title={intl.formatMessage({ id: chartConfig.title })}
              data={chartConfig.data || []}
              height={chartConfig.height || 350}
              className="chart-half-fit w-100"
              showBorder={true}
            />
          );

        default:
          return <div>Unsupported chart type: {chartConfig.type}</div>;
      }
    } catch (error) {
      console.error("Error rendering chart:", error, chartConfig);
      return <div>Error rendering {chartConfig.type} chart</div>;
    }
  };

  // Render chart rows dynamically based on JSON configuration
  const renderChartRows = (roleForRendering?: string) => {
    const roleManager = getUserRoleManager();
    const currentUserRole = roleForRendering || roleManager.getPrimaryRole();
    // Extract userId from auth object - adjust property name based on your AuthModel
    const userId = auth?.userName ? parseInt(auth.userName) || 0 : 0;
    const chartConfigs = getChartsForRole(currentUserRole, userId);

    return chartConfigs.map((config, index) => {
      const rowKey = config.id || `chart-row-${index}`;

      switch (config.type) {
        case "dual-layout":
          return (
            <div className="chart-row" key={rowKey}>
              <div className="chart-half">
                {renderGenericChart(config.leftChart, isLoading)}
              </div>
              <div className="chart-half">
                {renderGenericChart(config.rightChart, isLoading)}
              </div>
            </div>
          );

        case "single-layout":
          return (
            <div className="chart-row" key={rowKey}>
              <div className="chart-full">
                {renderGenericChart(config.chart, isLoading)}
              </div>
            </div>
          );

        case "single-multirow-layout":
          return (
            <div
              className="chart-multirow-container"
              key={rowKey}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                width: "100%",
              }}
            >
              {config.charts &&
                config.charts.map((chartConfig, chartIndex) => (
                  <div
                    className="chart-row"
                    key={`${rowKey}-chart-${chartIndex}`}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        margin: "0 auto",
                      }}
                    >
                      {renderGenericChart(chartConfig, isLoading)}
                    </div>
                  </div>
                ))}
            </div>
          );

        default:
          return <div key={rowKey}>Unsupported layout type: {config.type}</div>;
      }
    });
  };

  // Render dashboard content for a specific role
  const renderDashboardContent = (roleName: string, index: number) => {
    // Only render content for the active tab to avoid loading unnecessary data
    if (activeTab !== index) {
      return null;
    }

    const roleId = normalizeRoleForId(roleName);

    return (
      <div
        key={`dashboard-${roleId}`}
        className="d-flex gap-8 flex-column"
        id={`master-dashboard-page-${roleId}`}
      >
        {renderChartRows(roleName)}
      </div>
    );
  };

  const getArabicRoleNames = (roleNameEn) => {
    if (RolesConstant.FMSADMIN == roleNameEn) {
      return RolesConstantAr.FMSADMIN;
    }

    if (RolesConstant.DELEGATIONUNIT == roleNameEn) {
      return RolesConstantAr.DELEGATIONUNIT;
    }

    if (RolesConstant.FULFILLMENTUNIT == roleNameEn) {
      return RolesConstantAr.FULFILLMENTUNIT;
    }

    if (RolesConstant.REQUESTINGUNIT == roleNameEn) {
      return RolesConstantAr.REQUESTINGUNIT;
    }

    if (RolesConstant.SECURITYUNIT == roleNameEn) {
      return RolesConstantAr.SECURITYUNIT;
    }

    if (RolesConstant.SUPPORTINGUNIT == roleNameEn) {
      return RolesConstantAr.SUPPORTINGUNIT;
    }

    if (RolesConstant.UNITADMIN == roleNameEn) {
      return RolesConstantAr.UNITADMIN;
    }

    return "";
  };

  // Render tab navigation
  const renderTabNavigation = () => {
    const roleManager = getUserRoleManager();
    const roles = roleManager.getAvailableRoles();

    if (roles.length <= 1) {
      return null; // Don't show tabs if there's only one role
    }

    const handleTabClick = (index: number) => {
      setActiveTab(index);
      // Get the current role being switched to
      const currentRole = roles[index];
      // Fetch data for the new role
      fetchRoleSpecificData(currentRole);
      console.log(`Tab switched to role: ${currentRole} (index: ${index})`);
    };

    return (
      <div className="nav nav-tabs nav-line-tabs nav-line-tabs-2x border-transparent fs-6 fw-bolder mb-8">
        {roles.map((roleName, index) => (
          <div className="nav-item" key={`tab-${normalizeRoleForId(roleName)}`}>
            <a
              className={`nav-link text-active-primary pb-4 ${activeTab === index ? "active" : ""
                }`}
              onClick={() => handleTabClick(index)}
              style={{ cursor: "pointer" }}
            >
              <LabelTitleSemibold1
                text={getArabicRoleNames(roleName)}
                isI18nKey={true}
              />
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* {(() => {
        const roleManager = getUserRoleManager();
        const primaryRole = roleManager.getPrimaryRole();
        return `auth ${JSON.stringify(auth?.userName)} | role: ${primaryRole}`;
      })()} */}
      <div className="card">
        <div className="card-body">
          {renderTabNavigation()}
          {/* Only render the active tab's content */}
          {(() => {
            const roleManager = getUserRoleManager();
            const roles = roleManager.getAvailableRoles();
            const activeRoleName = roles[activeTab];
            return activeRoleName
              ? renderDashboardContent(activeRoleName, activeTab)
              : null;
          })()}
        </div>
      </div>
    </>
  );
};

export { DashboardPage };

export default function Loading() {
  return (
    <p>
      <SquarLoader />
    </p>
  );
}
