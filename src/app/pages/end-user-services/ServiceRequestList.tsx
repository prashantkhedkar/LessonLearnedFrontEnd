import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { useLang } from "../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../store";
import DataTableMain2, {
  ComponentAndProps,
} from "../../modules/components/dataTable2/DataTableMain";
import columns from "./ServiceRquestTableConfig.json";
import myRequestColumns from "./ServiceMyRquestTableConfig.json";
import { useEffect, useRef, useState } from "react";

import { Row as DTRow } from "../../models/row";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  ServiceCategoryModel,
  ServiceRequestFilterModel,
  ServiceRequestModel,
  ServiceRequestSearchModel,
} from "../../models/global/serviceModel";
import {
  DeleteServiceRequestByServiceId,
  GetServiceRequestsByUser,
  fetchPublishedServices,
  fetchServiceCountByStatus,
  searchActionRequestsByFilter,
  searchRequestsByFilter,
} from "../../modules/services/serviceRequestSlice";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import CountWidgetList from "../../modules/components/CountWidget/CountWidgetList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
  DetailLabels,
} from "../../modules/components/common/formsLabels/detailLabels";
import RenderFontAwesome from "../../modules/utils/RenderFontAwesome";
import { AdminMetSearch } from "../../modules/components/metSearch/AdminMetSearch";
import { ApiCallType } from "../../helper/_constant/apiCallType.constant";
import { TileDataModel } from "../admin/AdminServiceDashboard";
import {
  generateUUID,
  writeToBrowserConsole,
} from "../../modules/utils/common";
import DropdownList from "../../modules/components/dropdown/DropdownList";
import {
  fetchServiceCategories,
  fetchStatuses,
} from "../../modules/services/adminSlice";
import dayjs from "dayjs";
import { StatusModel } from "../../models/global/statusModel";
import ServiceFeedbackForm from "./forms/ServiceFeedbackForm";
import { WorkFlowStatusConstant } from "../../helper/_constant/workflow.constant";
import { ServiceFeedbackFormModel } from "../../models/global/feedbackModel";
import { MUIDatePicker } from "../../modules/components/datePicker/MUIDatePicker";
import { blue } from "@mui/material/colors";
import { toast } from "react-toastify";

export default function ServiceRequestList() {
  const intl = useIntl();
  const lang = useLang();
  const dispatch = useAppDispatch();
  const finalTableConfig = JSON.stringify(columns);
  const myRequestTableConfig = JSON.stringify(myRequestColumns);
  const tableRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [componentsList, setComponentsList] = useState<ComponentAndProps[]>([]);
  const [componentsListMyRequest, setComponentsListMyRequest] = useState<
    ComponentAndProps[]
  >([]);
  const [tileData, setTileData] = useState<TileDataModel[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryModel[]>([]);
  const [filters, setFilters] = useState<ServiceRequestFilterModel>();
  const [statuses, setStatuses] = useState<StatusModel[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [serviceFeedbackFormModel, setServiceFeedbackFormModel] =
    useState<ServiceFeedbackFormModel | null>(null);

  const location = useLocation();
  const state = location.state as {
    tab: number;
  };
  const [tabInit, setTabInit] = useState(0);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [requestId, setRequestId] = useState();
  const [serviceId, setServiceId] = useState();
  const [requestTitle, setRequestTitle] = useState("");

  useEffect(() => {
    getServiceCount();
    getServiceCategories();
    getStatuses();
    getPublishedServices();

    setComponentsListMyRequest([
      {
        component: ServiceName,
      },
      {
        component: EditItem,
      },
      {
        component: DeleteItem,
      },
      {
        component: FeedBackView,
      },
    ]);

    setComponentsList([
      {
        component: ServiceName,
      },
      {
        component: EditItem,
      },
      {
        component: DeleteItem,
      },
    ]);
  }, []);

  const handleOpenModal = (serviceFeedbackFormModel: any) => {
    setServiceFeedbackFormModel({
      requestId: serviceFeedbackFormModel.requestId,
      serviceName: serviceFeedbackFormModel.serviceName!,
      rating: serviceFeedbackFormModel.feedbackRating,
      comments: "",
      requestNumber: serviceFeedbackFormModel.requestNumber!,
      feedbackStatus: serviceFeedbackFormModel.feedbackStatus,
    });
    setShowFeedbackModal(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal...");
    fetchServiceRequests(
      1,
      10,
      draftDefaultSortColumn,
      draftDefaultSortDirection,
      "",
      true,
      true
    );
    setShowFeedbackModal(false);
  };
  const getServiceCount = () => {
    dispatch(fetchServiceCountByStatus())
      .then(unwrapResult)
      .then((result) => {
        if (result.statusCode === 200) {
          setTileData(result.data);
        }
      })
      .catch((err) => {
        writeToBrowserConsole(err);
      });
  };

  const getServiceCategories = () => {
    dispatch(fetchServiceCategories())
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          const responseData =
            originalPromiseResult.data as ServiceCategoryModel[];
          setCategories(responseData);
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
      });
  };

  const getStatuses = () => {
    try {
      dispatch(fetchStatuses())
        .then((apiResponse) => {
          setStatuses(apiResponse.payload.data);
        })
        .catch((rejectedValueOrSerializedError) => {
          console.log(rejectedValueOrSerializedError);
          return false;
        });
    } catch {}
  };

  const getPublishedServices = () => {
    dispatch(fetchPublishedServices())
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          const responseData = originalPromiseResult.data as any[];
          setServices(responseData);
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
      });
  };

  // Default sort column and direction for draft list
  const draftDefaultSortColumn = "updatedAt"; // Change as needed
  const draftDefaultSortDirection = "asc"; // or "desc"

  const fetchServiceRequests = (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean,
    clearSearch?: boolean
  ) => {
    if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

    setLoading(true);

    let formDataObject: ServiceRequestSearchModel = {
      pageNumber: pageNumber ? pageNumber : 1,
      pageSize: pageSize ? pageSize : 10,
      sortColumn: sortColumn || draftDefaultSortColumn,
      sortDirection: sortDirection || draftDefaultSortDirection,
    };
    const hasFilters = filters != undefined || filters != null;
    // let formDataObject: ServiceRequestSearchModel = {
    //   pageNumber: pageNumber ? pageNumber : 1,
    //   pageSize: pageSize ? pageSize : 10,
    //   sortColumn: sortColumn || draftDefaultSortColumn,
    //   sortDirection: sortDirection || draftDefaultSortDirection
    // }
    // Only pass allowed params for published list
    //dispatch(GetServiceRequestsByUser({ formDataObject: formDataObject }))

    dispatch(
      searchRequestsByFilter({
        page: pageNumber ? pageNumber : 1,
        pageSize: pageSize ? pageSize : 10,
        statusId:
          hasFilters && !clearSearch && filters.statusId
            ? filters.statusId.toString()
            : "",
        searchText: "",
        dateFrom:
          hasFilters && !clearSearch && filters.requestDateFrom
            ? dayjs(filters.requestDateFrom).format("YYYY-MM-DD")
            : undefined,
        dateTo:
          hasFilters && !clearSearch && filters.requestDateTo
            ? dayjs(filters.requestDateTo).format("YYYY-MM-DD")
            : undefined,
        serviceCategoryId:
          hasFilters && !clearSearch && filters.categoryId
            ? Number(filters.categoryId)
            : undefined,
        serviceId:
          hasFilters && filters.serviceId
            ? Number(filters.serviceId)
            : undefined,
      })
    )
      .then(unwrapResult)
      .then((orginalPromiseResult) => {
        if (orginalPromiseResult.statusCode === 200) {
          if (tableRef.current) {
            if (orginalPromiseResult.data.data) {
              const formattedData = orginalPromiseResult.data.data;
              tableRef.current.setData(formattedData);
              tableRef.current.setTotalRows(
                orginalPromiseResult.data.totalCount
              );
            } else {
              tableRef.current.setData([]);
              tableRef.current.setTotalRows(0);
            }
          }

          if (useSpinner && tableRef.current)
            tableRef.current.setIsLoading(false);
        } else {
          console.error("fetching data error");
        }
        setLoading(false);
      })
      .catch(() => {
        console.error("fetching data error");
        setLoading(false);
      });
  };

  const fetchMyActionServiceRequests = (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean,
    clearSearch?: boolean
  ) => {
    if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

    setLoading(true);

    let formDataObject: ServiceRequestSearchModel = {
      pageNumber: pageNumber ? pageNumber : 1,
      pageSize: pageSize ? pageSize : 10,
      sortColumn: sortColumn || draftDefaultSortColumn,
      sortDirection: sortDirection || draftDefaultSortDirection,
    };
    const hasFilters = filters != undefined || filters != null;

    dispatch(
      searchActionRequestsByFilter({
        page: pageNumber ? pageNumber : 1,
        pageSize: pageSize ? pageSize : 10,
        statusId:
          hasFilters && !clearSearch && filters.statusId
            ? filters.statusId.toString()
            : "",
        searchText: "",
        dateFrom:
          hasFilters && !clearSearch && filters.requestDateFrom
            ? dayjs(filters.requestDateFrom).format("YYYY-MM-DD")
            : undefined,
        dateTo:
          hasFilters && !clearSearch && filters.requestDateTo
            ? dayjs(filters.requestDateTo).format("YYYY-MM-DD")
            : undefined,
        serviceCategoryId:
          hasFilters && !clearSearch && filters.categoryId
            ? Number(filters.categoryId)
            : undefined,
        serviceId:
          hasFilters && filters.serviceId
            ? Number(filters.serviceId)
            : undefined,
      })
    )
      .then(unwrapResult)
      .then((orginalPromiseResult) => {
        if (orginalPromiseResult.statusCode === 200) {
          if (tableRef.current) {
            if (orginalPromiseResult.data.data) {
              const formattedData = orginalPromiseResult.data.data;
              tableRef.current.setData(formattedData);
              tableRef.current.setTotalRows(
                orginalPromiseResult.data.totalCount
              );
            } else {
              tableRef.current.setData([]);
              tableRef.current.setTotalRows(0);
            }
          }

          if (useSpinner && tableRef.current)
            tableRef.current.setIsLoading(false);
        } else {
          console.error("fetching data error");
        }
        setLoading(false);
      })
      .catch(() => {
        console.error("fetching data error");
        setLoading(false);
      });
  };

  const handleSearch = () => {
    const hasFilters = filters != undefined || filters != null;

    if (hasFilters) {
      if (tableRef.current) tableRef.current.setIsLoading(true);

      setLoading(true);
      if (tabInit == 0) {
        dispatch(
          searchRequestsByFilter({
            page: 1,
            pageSize: 10,
            statusId: filters.statusId ? filters.statusId.toString() : "",
            searchText: "",
            dateFrom: filters.requestDateFrom
              ? dayjs(filters.requestDateFrom).format("YYYY-MM-DD")
              : undefined,
            dateTo: filters.requestDateTo
              ? dayjs(filters.requestDateTo).format("YYYY-MM-DD")
              : undefined,
            serviceCategoryId: filters.categoryId
              ? Number(filters.categoryId)
              : undefined,
            serviceId: filters.serviceId
              ? Number(filters.serviceId)
              : undefined,
          })
        )
          .then(unwrapResult)
          .then((orginalPromiseResult) => {
            if (orginalPromiseResult.statusCode === 200) {
              if (tableRef.current) {
                if (orginalPromiseResult.data) {
                  // Format the updatedAt date field to YYYY/MM/DD format
                  const formattedData = orginalPromiseResult.data.data;
                  tableRef.current.setData(formattedData);
                  tableRef.current.setTotalRows(
                    orginalPromiseResult.data.totalCount
                  );
                } else {
                  tableRef.current.setData([]);
                  tableRef.current.setTotalRows(0);
                }
              }

              if (tableRef.current) tableRef.current.setIsLoading(false);
            } else {
              console.error("fetching data error");
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("fetching data error");
            setLoading(false);
          });
      } else {
        dispatch(
          searchActionRequestsByFilter({
            page: 1,
            pageSize: 10,
            statusId: filters.statusId ? filters.statusId.toString() : "",
            searchText: "",
            dateFrom: filters.requestDateFrom
              ? dayjs(filters.requestDateFrom).format("YYYY-MM-DD")
              : undefined,
            dateTo: filters.requestDateTo
              ? dayjs(filters.requestDateTo).format("YYYY-MM-DD")
              : undefined,
            serviceCategoryId: filters.categoryId
              ? Number(filters.categoryId)
              : undefined,
            serviceId: filters.serviceId
              ? Number(filters.serviceId)
              : undefined,
          })
        )
          .then(unwrapResult)
          .then((orginalPromiseResult) => {
            if (orginalPromiseResult.statusCode === 200) {
              if (tableRef.current) {
                if (orginalPromiseResult.data) {
                  // Format the updatedAt date field to YYYY/MM/DD format
                  const formattedData = orginalPromiseResult.data.data;
                  tableRef.current.setData(formattedData);
                  tableRef.current.setTotalRows(
                    orginalPromiseResult.data.totalCount
                  );
                } else {
                  tableRef.current.setData([]);
                  tableRef.current.setTotalRows(0);
                }
              }

              if (tableRef.current) tableRef.current.setIsLoading(false);
            } else {
              console.error("fetching data error");
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("fetching data error");
            setLoading(false);
          });
      }
    }
  };

  const onCellClick = () => {};

  const handleClear = () => {
    setFilters(undefined);
    fetchServiceRequests(
      1,
      10,
      draftDefaultSortColumn,
      draftDefaultSortDirection,
      "",
      true,
      true
    );
  };

  const handleChange = (e: any, fieldName: string) => {
    const updatedItem: ServiceRequestFilterModel = { ...filters! };
    if (fieldName == "categoryId") updatedItem!.categoryId = e;
    if (fieldName == "statusId") updatedItem!.statusId = e;
    if (fieldName == "serviceId") updatedItem!.serviceId = e;
    if (fieldName == "requestDateFrom") {
      updatedItem!.requestDateFrom = e;
      updatedItem!.requestDateTo = undefined;
    }
    if (fieldName == "requestDateTo") updatedItem!.requestDateTo = e;
    setFilters(updatedItem);
  };

  function EditItem(props: { row: DTRow }) {
    const navigate = useNavigate();
    const intl = useIntl();

    return (
      <>
        {
          <>
            {
              <>
                <div className="col col-auto">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip">
                        <div className="tooltip-text">
                          {intl.formatMessage({ id: "LABEL.EDIT" })}
                        </div>
                      </Tooltip>
                    }
                  >
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate("/end-user/service-request-form", {
                          state: {
                            serviceId: props.row.serviceId,
                            requestId: props.row.requestId,
                            isReadOnly: false,
                            statusId: props.row.statusId,
                            currentStepId: props.row.currentStepId,
                          },
                        })
                      }
                    >
                      <i className="2xl fa fa-light fa-edit fa-xl" />
                    </div>
                  </OverlayTrigger>
                </div>
              </>
            }
          </>
        }
      </>
    );
  }

  function DeleteItem(props: { row }) {
    const intl = useIntl();

    return (
      <>
        {
          <>
            {
              <>
                {Number(props.row.statusId) == 1 && (
                  <div className="col col-auto">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip">
                          <div className="tooltip-text">
                            {intl.formatMessage({ id: "LABEL.DELETE" })}
                          </div>
                        </Tooltip>
                      }
                    >
                      <div
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          // navigate("/end-user/service-request-form", {
                          //   state: {
                          //     serviceId: props.row.serviceId,
                          //     requestId: props.row.requestId,
                          //     isReadOnly: false,
                          //     statusId: props.row.statusId,
                          //     currentStepId: props.row.currentStepId,
                          //   },
                          // })
                          handleDeleteRequest(props.row)
                        }
                      >
                        <i className="2xl fa fa-light fa-trash fa-xl" />
                      </div>
                    </OverlayTrigger>
                  </div>
                )}
              </>
            }
          </>
        }
      </>
    );
  }

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

  function FeedBackView(props: { row }) {
    const navigate = useNavigate();
    const intl = useIntl();

    return (
      <>
        {
          <>
            {
              <>
                {String(props.row.currentStatus).toLocaleLowerCase() ==
                  "completed" && (
                  <div className="col col-auto">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip">
                          <div className="tooltip-text">
                            {intl.formatMessage({ id: "LABEL.FEEDBACK" })}
                          </div>
                        </Tooltip>
                      }
                    >
                      <div
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenModal(props.row)}
                      >
                        {/* {String(props.row.currentStatus).toLocaleLowerCase()} */}
                        {/* {String(props.row.feedbackStatus).toLocaleLowerCase()} */}
                        <i className="fa-light fa-comment-dots fa-xl" />
                      </div>
                    </OverlayTrigger>
                  </div>
                )}
              </>
            }
          </>
        }
      </>
    );
  }

  const TabStyle = {
    display: "inline-block",
    padding: "12px 24px",
    cursor: "pointer",
    border: "none",
    outline: "none",
    background: "none",

    color: "#555",
    transition: "color 0.2s",
    fontFamily: "FrutigerLTArabic-Roman_0",
    backgroundColor: "transparent",

    fontSize: " 0.875rem",
    fontWeight: "bold",
    borderBottom: "none",
  };

  const activeTabStyle = {
    ...TabStyle,
    color: "rgb(107, 114, 128)",
    borderBottom: "solid #ccc 1px",
    fontWeight: 600,
    boxShadow: "0px 2px 0px 0px #B7945A",
  };

  const tabListStyle = {
    display: "flex",
    bordorBottom: "1px solid #e0e0e0",
    gap: 2,
    marginBottom: "2rem",
  };

  const handleDeleteRequest = (row) => {
    setShowModalDelete(true);
    setServiceId(row.serviceId);
    setRequestId(row.requestId);
    setRequestTitle(row.requestNumber);
  };

  const handleDeleteRequestItem = () => {
    if (requestId === null) return;

    dispatch(
      DeleteServiceRequestByServiceId({
        requestId: Number(requestId),
        serviceId: Number(serviceId),
      })
    )
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        const { statusCode, data, message } = originalPromiseResult;

        if (statusCode === 200) {
          if (message === "Success") {
            setShowModalDelete(false);
            handleClear();

            toast.success(
              intl.formatMessage({ id: "MESSAGE.REQUEST.DELETED.SUCCESS" })
            );
          } else if (message === "Failed") {
            toast.success(intl.formatMessage({ id: "MESSAGE.ERROR.MESSAGE" }));
          }
        }
      })
      .catch((error) => {
        const errMsg =
          error?.message || "Something went wrong while updating the activity.";
        toast.error(errMsg);
        console.error("Update error:", error);
      });
  };

  return (
    <>
      <Row className="mb-4">
        <Col>
          <CountWidgetList
            widgets={tileData}
            scrollable={false}
            //filterByStatusId={handleFilterByStatusId}
          ></CountWidgetList>
        </Col>
      </Row>
      <div className="search-container p-4">
        <Row>
          <Col className="col-11">
            <AdminMetSearch
              statusId={filters?.statusId?.toString()}
              categoryId={filters?.categoryId}
              date={
                filters?.requestDateFrom
                  ? dayjs(filters?.requestDateFrom).format("YYYY-MM-DD")
                  : undefined
              }
              apiCallType={ApiCallType.ServiceListDashboard}
            ></AdminMetSearch>
          </Col>
          <Col className="col-md-1 ps-14">
            <button
              type="button"
              className="btn-add-icon mt-2"
              onClick={() => setShowAdvanced((prev) => !prev)}
              aria-label="Show Advanced Search"
            >
              {/* <FontAwesomeIcon color={"rgb(134, 140, 151)"} size="lg" icon={faFilter} /> */}
              <FontAwesomeIcon
                icon={faFilter}
                size="lg"
                color="#B7945A"
                className="fs-3 px-0 filter-icon-cus"
              />
            </button>
          </Col>
        </Row>
        <Row className="row search-container1 py-4" hidden={!showAdvanced}>
          <Col>
            <DropdownList
              dataKey="categoryId"
              dataValue={lang === "ar" ? "categoryNameAr" : "categoryNameEn"}
              defaultText={intl.formatMessage({
                id: "LABEL.SERVICECATEGORY",
              })}
              value={filters?.categoryId}
              rtl={true}
              data={categories}
              key={generateUUID()}
              setSelectedValue={(e) => handleChange(e, "categoryId")}
            />
          </Col>
          <Col>
            <DropdownList
              key={"statusId"}
              dataKey="statusId"
              dataValue={lang === "ar" ? "statusNameAr" : "statusNameEn"}
              defaultText={intl.formatMessage({ id: "LABEL.NEXTSTATUS" })}
              value={filters?.statusId}
              //data={statuses}
              data={statuses}
              setSelectedValue={(e) => handleChange(e, "statusId")}
            />
          </Col>
        </Row>
        <Row className="row search-container1 py-4" hidden={!showAdvanced}>
          <Col>
            <MUIDatePicker
              placeholder={intl.formatMessage({
                id: "LABEL.FROM",
              })}
              value={filters?.requestDateFrom}
              onDateChange={(newDate) =>
                handleChange(newDate, "requestDateFrom")
              }
              key={generateUUID()}
              id={""}
            />
          </Col>
          <Col>
            <MUIDatePicker
              placeholder={intl.formatMessage({
                id: "LABEL.TO",
              })}
              value={filters?.requestDateTo}
              onDateChange={(newDate) => handleChange(newDate, "requestDateTo")}
              key={generateUUID()}
              minDate={
                filters?.requestDateFrom ? filters?.requestDateFrom : undefined
              }
              id={""}
            />
          </Col>
        </Row>
        <Row className="row search-container1 py-4" hidden={!showAdvanced}>
          <Col>
            <DropdownList
              dataKey="serviceId"
              dataValue={"serviceName"}
              defaultText={intl.formatMessage({
                id: "LABEL.SERVICENAME",
              })}
              value={filters?.serviceId}
              rtl={true}
              data={services}
              key={generateUUID()}
              setSelectedValue={(e) => handleChange(e, "serviceId")}
            />
          </Col>
          <Col></Col>
        </Row>
        <Row className="row search-container1 py-4" hidden={!showAdvanced}>
          <Col className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              id="kt_modal_new_target_Search"
              className="btn MOD_btn btn-create"
              style={{ minWidth: 120 }}
              onClick={handleSearch}
            >
              <BtnLabeltxtMedium2
                text={intl.formatMessage({ id: "LABEL.SEARCH" })}
                isI18nKey={false}
              />
            </button>
            <button
              type="button"
              id="kt_modal_new_target_clear"
              className="btn MOD_btn btn-cancel"
              style={{ minWidth: 120 }}
              onClick={handleClear}
            >
              <BtnLabelCanceltxtMedium2
                text={intl.formatMessage({ id: "LABEL.CLEAR" })}
              />
            </button>
          </Col>
        </Row>{" "}
      </div>

      <div style={tabListStyle} className="mb-3 mt-5">
        <button
          onClick={() => setTabInit(0)}
          style={tabInit == 0 ? activeTabStyle : TabStyle}
        >
          {intl.formatMessage({ id: "LABEL.MYREQUESTS" })}
        </button>
        <button
          onClick={() => setTabInit(1)}
          style={tabInit == 1 ? activeTabStyle : TabStyle}
        >
          {intl.formatMessage({ id: "LABEL.MYACTIONS" })}
        </button>
      </div>
      <div style={{ display: tabInit === 0 ? "block" : "none" }}>
        {tabInit === 0 && (
          <DataTableMain2
            displaySearchBar={false}
            lang={lang}
            tableConfig={myRequestTableConfig}
            onCellClick={onCellClick}
            paginationServer
            getData={fetchServiceRequests}
            ref={tableRef}
            componentsList={componentsListMyRequest}
          />
        )}
      </div>
      <div style={{ display: tabInit === 1 ? "block" : "none" }}>
        {tabInit === 1 && (
          <DataTableMain2
            displaySearchBar={false}
            lang={lang}
            tableConfig={finalTableConfig}
            onCellClick={onCellClick}
            paginationServer
            getData={fetchMyActionServiceRequests}
            ref={tableRef}
            componentsList={componentsList}
          />
        )}
      </div>

      <Row className="mt-4">
        <Col>
          <ServiceFeedbackForm
            show={showFeedbackModal}
            // onHide={() => {
            //   console.log("Edit modal closing");
            //   handleCloseModal(isReload);
            // }}
            onHide={handleCloseModal}
            serviceFeedbackFormModel={serviceFeedbackFormModel!}
          />
        </Col>
      </Row>
      <Modal
        show={showModalDelete}
        onHide={() => setShowModalDelete(false)}
        dialogClassName={"customModal"}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {intl.formatMessage({ id: "LABEL.DELETE" })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <Col className="col-1" />

            <Col className="col-11">
              {intl.formatMessage({ id: "VALIDATION.DELETE.CONFIRM" })}
              {/* :{" "} */}
              {/* <b>{requestTitle}</b> */}
            </Col>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="row pt-2" id="controlPanelProjectSubmission">
            <div className="col-12 d-flex justify-content-center">
              <button
                onClick={() => handleDeleteRequestItem()}
                className={
                  1 != 1
                    ? "btn MOD_btn w-10 pl-5 mx-3 float-start btn-notAllowed"
                    : "btn MOD_btn w-10 pl-5 mx-3 float-start btn-create"
                }
              >
                {intl.formatMessage({ id: "LABEL.YES" })}
              </button>

              <button
                className="btn btn-cancel p-2"
                onClick={() => {
                  setShowModalDelete(false);
                }}
              >
                {intl.formatMessage({ id: "LABEL.NO" })}
              </button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
