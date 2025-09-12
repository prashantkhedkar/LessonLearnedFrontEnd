import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../store";
import DataTableMain2, {
  ComponentAndProps,
} from "../../modules/components/dataTable2/DataTableMain";
import { ServiceRequestModel } from "../../models/global/serviceModel";
import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { callDrillDownApi, normalizeTableData } from "./drillDownApiService";
import columns from "../end-user-services/ServiceMyRquestTableConfig.json";
import { useIntl } from "react-intl";
import { DetailLabels } from "../../modules/components/common/formsLabels/detailLabels";

import { Row as DTRow } from "../../models/row";
// Simple table configuration with required properties
const tableConfig = [
  {
    columnName: "LABEL.REQUESTID",
    dataColumnName: "requestNumber",
    sortable: true,
    type: "components",
    className: "cellText",
    componentsIndexes: "0",
    fontAwesome: "",
    isSearchable: true,
    width: "30%",
    "width-ar": "30%",
    style: {
      "padding-right": "7px",
      "padding-left": "7px",
    },
  },
  {
    columnName: "LABEL.SERVICENAME",
    dataColumnName: "serviceName",
    sortable: true,
    type: "",
    className: "cellText",
    fontAwesome: "",
    isSearchable: true,
    width: "20%",
    "width-ar": "20%",
    style: {
      "padding-right": "7px",
      "padding-left": "7px",
    },
  },
  {
    columnName: "LABEL.REQUESTDATE",
    dataColumnName: "requestDate",
    sortable: true,
    type: "",
    className: "cellText",
    fontAwesome: "",
    isSearchable: true,
    width: "15%",
    "width-ar": "15%",
    style: {
      "padding-right": "7px",
      "padding-left": "7px",
    },
  },
  {
    columnName: "LABEL.STATUS",
    dataColumnName: "currentStatus",
    sortable: true,
    type: "",
    className: "cellText",
    fontAwesome: "",
    isSearchable: true,
    width: "15%",
    "width-ar": "15%",
    style: {
      "padding-right": "7px",
      "padding-left": "7px",
    },
  },
  {
    columnName: "LABEL.CREATEDBY",
    dataColumnName: "createdByUserName",
    sortable: true,
    type: "",
    className: "cellText",
    fontAwesome: "",
    isSearchable: true,
    width: "20%",
    "width-ar": "20%",
    style: {
      "padding-right": "7px",
      "padding-left": "7px",
    },
  },
];

interface DrillDownData {
  chartType: string;
  chartTitle: string;
  selectedValue: string;
  selectedLabel: string;
  filterData?: any;
}

const ChartDrillDownPage: FC = () => {
  const location = useLocation();
  const lang = useLang();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tableRef = useRef<any>(null);
  const intl = useIntl();
  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [drillDownInfo, setDrillDownInfo] = useState<DrillDownData | null>(
    null
  );
  const [tableData, setTableData] = useState<ServiceRequestModel[]>([]);

  const [componentsList, setComponentsList] = useState<ComponentAndProps[]>([]);
  // Initialize drill-down data from location state
  useEffect(() => {
    const locationData = location.state as any;
    if (locationData) {
      const drillDownData: DrillDownData = {
        chartType: locationData.chartType,
        chartTitle: locationData.chartTitle,
        selectedValue: locationData.selectedValue,
        selectedLabel: locationData.selectedLabel,
        filterData: locationData.filterData,
      };
      setComponentsList([
        {
          component: ServiceName,
        },
      ]);
      setDrillDownInfo(drillDownData);
      fetchDrillDownData(drillDownData);
    }
  }, []);

  // Fetch drill-down data from API
  const fetchDrillDownData = async (drillDownData: DrillDownData) => {
    setLoading(true);
    try {
      debugger;
      // Build API parameters based on filter data
      const apiParams = buildApiParams(drillDownData);

      // Call API to get filtered data
      const dataSource = `${drillDownData.filterData?.drilldowndataSource}`; // "/ServiceRequest/SearchMyRequestsByFilterWithMonth";
      const result = await callDrillDownApi(dataSource, apiParams, dispatch);

      if (result.statusCode === 200) {
        const resultData = Array.isArray(result.data)
          ? result.data
          : (result.data as any)?.data || [];
        const normalizedData = normalizeTableData(resultData, dataSource);
        setTableData(normalizedData);
      } else {
        console.error("Failed to fetch drill-down data", result);
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching drill-down data:", error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Build API parameters from filter data
  const buildApiParams = (drillDownData: DrillDownData) => {
    const { filterData, selectedValue, selectedLabel } = drillDownData;

    let apiParams: any = {
      pageNumber: 1,
      pageSize: 100,
      sortColumn: "requestDate",
      sortDirection: "desc",
    };
    debugger;
    if (filterData?.filterType) {
      switch (filterData.filterType) {
        case "monthly":
          apiParams = {
            ...apiParams,
            filterType: filterData.filterType,
            filterValue: filterData.filterValue,
            // month: filterData.month,
            // monthIndex: filterData.monthIndex,
            roleName: filterData.activeRoleName,
            requestType: filterData.requestType,
            dataSource: filterData.chartDataSource,
          };
          break;

        case "servicecategory": debugger;
          // Filter by specific service category
          apiParams = {
            ...apiParams,
            filterType: "byServiceCategory",
            serviceName: filterData.serviceName,
            serviceId: filterData.serviceValue,
            filterValue: filterData.filterValue,
            roleName: filterData.activeRoleName,
            requestType: filterData.requestType,
            dataSource: filterData.chartDataSource,
          };
          break;

        case "servicename": debugger;
          // Filter by specific service category
          apiParams = {
            ...apiParams,
            filterType: "byServiceName",
            serviceName: filterData.serviceName,
            serviceId: filterData.serviceValue,
            filterValue: filterData.filterValue,
            roleName: filterData.activeRoleName,
            requestType: filterData.requestType,
            dataSource: filterData.chartDataSource,
          };
          break;

        case "percentopenrequestbyservice": debugger;
          // Filter by specific service category
          apiParams = {
            ...apiParams,
            filterType: "percentopenrequestbyservice",
            serviceName: filterData.serviceName,
            serviceId: filterData.serviceValue,
            filterValue: filterData.filterValue,
            roleName: filterData.activeRoleName,
            requestType: filterData.requestType,
            dataSource: filterData.chartDataSource,
          };
          break;

        case "priority":
          // Filter by priority level
          apiParams = {
            ...apiParams,
            filterType: filterData.filterType,
            filterValue: filterData.filterValue,
            // month: filterData.month,
            // monthIndex: filterData.monthIndex,
            roleName: filterData.activeRoleName,
            requestType: filterData.requestType,
            dataSource: filterData.chartDataSource,
          };
          break;

        case "unit":
          // Filter by requesting unit
          apiParams = {
            ...apiParams,
            filterType: filterData.filterType,
            filterValue: filterData.filterValue,
            // month: filterData.month,
            // monthIndex: filterData.monthIndex,
            roleName: filterData.activeRoleName,
            requestType: filterData.requestType,
            dataSource: filterData.chartDataSource,
            // unitName: filterData.unitName,
            // unitId: filterData.unitValue,
          };
          break;

        case "fulfillmentUnit":
          // Filter by fulfillment unit
          apiParams = {
            ...apiParams,
            filterType: "byFulfillmentUnit",
            fulfillmentUnit: filterData.fulfillmentUnit,
            fulfillmentUnitId: filterData.unitValue,
          };
          break;

        case "closedByMonth":
          // Filter closed requests by specific month
          apiParams = {
            ...apiParams,
            filterType: "byClosedMonth",
            month: filterData.month,
            monthIndex: filterData.monthIndex,
            status: "closed",
            startDate: calculateMonthStartDate(filterData.monthIndex),
            endDate: calculateMonthEndDate(filterData.monthIndex),
          };
          break;

        case "widgets":
          // Enhanced widget filtering with comprehensive criteria
          apiParams = {
            ...apiParams,
            filterType: "byWidget",
            filterValue: selectedLabel,
            statusId: filterData.statusId || filterData.status,
            statusName: filterData.statusName,
            searchText: filterData.searchText || "",
            userRole: filterData.userRole,
            roleName: filterData.activeRoleName,

            // Include date range if available
            dateFrom: filterData.dateRange?.startDate,
            dateTo: filterData.dateRange?.endDate,

            // Additional search criteria from widget data
            ...filterData.searchCriteria,
            widgetCriteria: filterData.widgetData,

            // Enhanced widget metadata for better filtering
            widgetTitle: filterData.widgetTitle,
            widgetName: filterData.widgetName,
            category: filterData.category || "status",
          };
          break;

        default:
          apiParams = {
            ...apiParams,
            filterType: "generic",
            category: filterData.category || selectedValue,
            value: filterData.value || selectedValue,
          };
      }
    } else {
      // Fallback for simple chart types
      apiParams = {
        ...apiParams,
        filterType: "generic",
        filter: selectedValue,
      };
    }

    return apiParams;
  };

  // Helper functions for date calculations
  const calculateMonthStartDate = (monthIndex: number): string => {
    const now = new Date();
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - monthIndex),
      1
    );
    return targetDate.toISOString().split("T")[0];
  };

  const calculateMonthEndDate = (monthIndex: number): string => {
    const now = new Date();
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - monthIndex) + 1,
      0
    );
    return targetDate.toISOString().split("T")[0];
  };

  const calculateAgingMinDays = (agingPeriod: string): number => {
    // Parse aging period and return minimum days
    const periods: { [key: string]: number } = {
      "0-7 days": 0,
      "8-15 days": 8,
      "16-30 days": 16,
      "31-60 days": 31,
      "60+ days": 61,
    };
    return periods[agingPeriod] || 0;
  };

  const calculateAgingMaxDays = (agingPeriod: string): number => {
    // Parse aging period and return maximum days
    const periods: { [key: string]: number } = {
      "0-7 days": 7,
      "8-15 days": 15,
      "16-30 days": 30,
      "31-60 days": 60,
      "60+ days": 999,
    };
    return periods[agingPeriod] || 999;
  };

  // Handle table data fetching (for pagination, sorting, search)
  const fetchServiceRequests = useCallback(
    (
      pageNumber?: number,
      pageSize?: number,
      sortColumn?: string,
      sortDirection?: string,
      searchText?: string,
      useSpinner?: boolean,
      isExcel?: boolean
    ) => {
      if (!tableData.length) return;
      if (isExcel && tableRef.current)
        tableRef.current.setExcelDataStatus("loading");

      // Set loading state
      if (useSpinner && tableRef.current) {
        tableRef.current.setIsLoading(true);
      }

      // Filter data based on search text
      let filteredData = [...tableData];
      if (searchText && typeof searchText === "string" && searchText.trim()) {
        const searchLower = searchText.toLowerCase();
        filteredData = tableData.filter((row: any) =>
          Object.values(row).some(
            (value: any) =>
              value &&
              typeof value === "string" &&
              value.toLowerCase().includes(searchLower)
          )
        );
      }

      // Sort data
      if (sortColumn && sortDirection) {
        filteredData.sort((a: any, b: any) => {
          let aVal = a[sortColumn] || "";
          let bVal = b[sortColumn] || "";

          // Handle dates
          if (
            sortColumn &&
            typeof sortColumn === "string" &&
            sortColumn.toLowerCase().includes("date")
          ) {
            const aDate = new Date(aVal);
            const bDate = new Date(bVal);
            if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
              return sortDirection === "asc"
                ? aDate.getTime() - bDate.getTime()
                : bDate.getTime() - aDate.getTime();
            }
          }

          // Handle numbers
          if (typeof aVal === "number" && typeof bVal === "number") {
            return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
          }

          // Handle strings - ensure values are converted to strings safely
          const aStr = (aVal || "").toString().toLowerCase();
          const bStr = (bVal || "").toString().toLowerCase();
          return sortDirection === "asc"
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        });
      }

      // Apply pagination
      const page = pageNumber || 1;
      const size = pageSize || 10;
      const startIndex = (page - 1) * size;
      const paginatedData = filteredData.slice(startIndex, startIndex + size);

      // Update table
      if (!isExcel) {
        if (tableRef.current) {
          tableRef.current.setData(paginatedData);
          tableRef.current.setTotalRows(filteredData.length);
          tableRef.current.setIsLoading(false);
          tableRef.current.setIsError(false);
        }
      } else {
        if (paginatedData) tableRef.current?.setExcelData(paginatedData);
        tableRef.current?.setExcelDataStatus("completed");
      }
    },
    [tableData]
  );

  // Trigger initial data load when table data is ready
  useEffect(() => {
    if (tableData.length > 0 && tableRef.current) {
      setTimeout(() => {
        fetchServiceRequests(1, 10, "requestDate", "desc", "", false);
      }, 100);
    }
  }, [tableData, fetchServiceRequests]);

  const handleBackToDashboard = () => {
    navigate("/fms-dashboard");
  };

  function ServiceName(props: { row: DTRow; editStatus: string }) {
    const navigate = useNavigate();
    const intl = useIntl();
    let cssPropName = "";
    if (props.row.priority == "عالي" || props.row.priority == "High") {
      cssPropName = "High";
    } else if (
      props.row.priority == "متوسط" ||
      props.row.priority == "Medium"
    ) {
      cssPropName = "Medium";
    } else if (props.row.priority == "منخفض" || props.row.priority == "Low") {
      cssPropName = "Low";
    }
    return (
      <>
        {
          <div className="col col-auto">
            {
              <>
                <DetailLabels
                  text={props.row.priority!}
                  customClassName={`${cssPropName.toLowerCase()}-priority-ar`}
                  style={{ width: "60px", margin: "0 10px" }}
                />

                <DetailLabels text={props.row.requestNumber!} />

                <div
                  style={{
                    borderLeft: "1px solid #ccc",
                    height: "20px",
                    margin: "0 10px",
                    display: "inline-block",
                  }}
                ></div>

                <DetailLabels text={props.row.requestTitle!} />
              </>
            }
          </div>
        }
      </>
    );
  }
  const onCellClick = (cell: any, row: any) => {
    console.log("Cell clicked:", cell, row);
  };

  // Loading state
  if (!drillDownInfo || loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "200px" }}
          >
            <div>{intl.formatMessage({ id: "NOTIFICATION.LOADING" })}</div>
          </div>
        </div>
      </div>
    );
  }

  // Get table configuration string
  const finalTableConfig = JSON.stringify(tableConfig);

  return (
    <div className="card">
      <div className="card-header">
        <div className="row w-100 pt-3">
          <div className="col-md-10">
            <h3 className="card-title mb-0">
              {drillDownInfo.chartTitle}
            </h3>
          </div>
          <div className="col-md-2">
            <div style={{ textAlign: "left", cursor: "pointer" }}>
              <button
                className="btn btn-sm fw-bold roudButton text-gold align-self-start mb-3"
                onClick={handleBackToDashboard}
              >
                <span className="text ps-2">
                  {intl.formatMessage({ id: "HOMEPAGE.BACK.TO.DOMAIN" })}
                </span>{" "}
                {lang == "en" ? (
                  <FontAwesomeIcon icon={faArrowLeft} color="text-gold" />
                ) : (
                  <FontAwesomeIcon icon={faArrowLeft} color="text-gold" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        <Row>
          <Col>
            <DataTableMain2
              displaySearchBar={false}
              lang={lang}
              tableConfig={finalTableConfig}
              paginationServer={true}
              getData={fetchServiceRequests}
              ref={(el) => {
                tableRef.current = el;
              }}
              componentsList={componentsList}
              defaultPageSize={10}
              paginationDefaultPage={1}
              selectableRows={false}
              exportExcel={tableData && tableData.length > 0 ? true : false}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ChartDrillDownPage;
