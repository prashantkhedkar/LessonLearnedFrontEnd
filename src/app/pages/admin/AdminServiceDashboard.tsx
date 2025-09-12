import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useLang } from "../../../_metronic/i18n/Metronici18n";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useLocation, useNavigate } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  fetchAdminStatisticTileData,
  fetchServiceCategories,
  GetServiceCategoriesDraftList,
  GetServiceCategoriesPublishedList,
  SearchByWildCardText,
} from "../../modules/services/adminSlice";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
  DetailLabels,
  LabelTitleSemibold1,
} from "../../modules/components/common/formsLabels/detailLabels";
import DataTableMain2, {
  ComponentAndProps,
} from "../../modules/components/dataTable2/DataTableMain";
import draftColumns from "./AdminServiceDashboardConfig.json";
import publishColumns from "./AdminServiceDashboardPublishedConfig.json";
import { Row as DTRow } from "../../models/row";
import {
  generateUUID,
  writeToBrowserConsole,
} from "../../modules/utils/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faPlus,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import CountWidgetList from "../../modules/components/CountWidget/CountWidgetList";
import { AdminMetSearch } from "../../modules/components/metSearch/AdminMetSearch";
import "./AdminServiceDashboard.css";
import DropdownList from "../../modules/components/dropdown/DropdownList";
import { MUIDatePicker } from "../../modules/components/datePicker/MUIDatePicker";
import dayjs from "dayjs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import RenderFontAwesome from "../../modules/utils/RenderFontAwesome";
import { ServiceStatus } from "../../helper/_constant/serviceStatus";
import { ServiceCategoryModel } from "../../models/global/serviceModel";
import { ApiCallType } from "../../helper/_constant/apiCallType.constant";
import { fetchUserRolesAccessAsync, globalActions } from "../../modules/services/globalSlice";
import { IRoleAcces } from "../../models/global/globalGeneric";
import { useAuth } from "../../modules/auth";

// TileDataModel interface
export interface TileDataModel {
  name: string;
  count: string;
  iconName: string;
  iconFilled?: boolean;
  iconBgColor: string;
  iconColor: string;
  statusId?: number[];
}
function AdminServiceDashboard() {
  const intl = useIntl();
  const lang = useLang();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tableRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTabView, setCurrentTabView] = useState("draft-view");
  const finalPublishTableConfig = JSON.stringify(publishColumns);
  const finalDraftTableConfig = JSON.stringify(draftColumns);

  const [showExtraInput, setShowExtraInput] = useState<boolean>(false);
  const [selectedDropDownValue, setSelectedDropDownValue] = useState("");
  const [categories, setCategories] = useState<ServiceCategoryModel[]>([]);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<any>(null);
  const [componentsList, setComponentsList] = useState<ComponentAndProps[]>([]);
  const [tileData, setTileData] = useState<TileDataModel[]>([]);
  const [isTileClicked, setIsTileClicked] = useState<boolean>(false);
  const location = useLocation();
  const [tileStatusId, setTileStatusId] = useState<string>("");
  const { userRoleAccess } = useAppSelector((s) => s.globalgeneric);
  const { auth } = useAuth();

  useEffect(() => {
    if (!userRoleAccess || userRoleAccess.length == 0) {
      dispatch(fetchUserRolesAccessAsync())
        .then(unwrapResult)
        .then((orginalPromiseResult) => {
          if (orginalPromiseResult.statusCode === 200) {

            if (orginalPromiseResult.data) {
              const authorizedRole = orginalPromiseResult.data as IRoleAcces[];
              dispatch(globalActions.updateUserRoleAccess(authorizedRole));
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

  // Fetch tile data from API
  useEffect(() => {
    dispatch(fetchAdminStatisticTileData())
      .then(unwrapResult)
      .then((result) => {
        if (result.statusCode === 200) {
          setTileData(result.data);
        }
      })
      .catch((err) => {
        writeToBrowserConsole(err);
      });
  }, [dispatch]);

  useEffect(() => {
    var output = location.state
      ? JSON.parse(JSON.stringify(location.state)).currentTabView
      : "draft-view";
    setCurrentTabView(output);

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

    if (output == "draft-view") {
      fetchDraftServices();
    } else {
      fetchPublishedServices();
    }
  }, []);

  useEffect(() => {
    if (currentTabView == "submitted-view") {
      setComponentsList([
        {
          component: ServiceName,
          props: { editStatus: "submitted-view" },
        },
        {
          component: ViewItem,
          props: {
            editStatus: "submitted-view",
            currentTabView: currentTabView,
          },
        },
        {
          component: EditItem,
          props: {
            editStatus: "submitted-view",
            currentTabView: currentTabView,
          },
        },
      ]);
    } else {
      setComponentsList([
        {
          component: ServiceName,
          props: { editStatus: "draft-view" },
        },
        {
          component: ViewItem,
          props: { editStatus: "draft-view", currentTabView: currentTabView },
        },
        {
          component: EditItem,
          props: { editStatus: "draft-view", currentTabView: currentTabView },
        },
      ]);
    }
  }, [currentTabView]);

  useEffect(() => {
    if (isTileClicked) {
      handleSearch();
    }
    setIsTileClicked(false);
    setTileStatusId("");
  }, [isTileClicked]);

  // Default sort column and direction for draft list
  const draftDefaultSortColumn = "updatedAt"; // Change as needed
  const draftDefaultSortDirection = "desc"; // or "desc"

  const fetchPublishedServices = (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean
  ) => {
    if (isTileClicked)
      return tableRef;

    if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

    setLoading(true);
    // Only pass allowed params for published list
    dispatch(
      GetServiceCategoriesPublishedList({
        pageNumber: pageNumber ? pageNumber : 1,
        pageSize: pageSize ? pageSize : 10,
        sortColumn: sortColumn || draftDefaultSortColumn,
        sortDirection: sortDirection || draftDefaultSortDirection,
      })
    )
      .then(unwrapResult)
      .then((orginalPromiseResult) => {
        if (orginalPromiseResult.statusCode === 200) {
          if (tableRef.current) {
            if (orginalPromiseResult.data.data) {
              // Format the updatedAt date field to YYYY/MM/DD format
              const formattedData = orginalPromiseResult.data.data.map(
                (item: any) => ({
                  ...item,
                  publishedDate: item.publishedDate
                    ? dayjs(item.publishedDate).format("YYYY/MM/DD")
                    : item.publishedDate,
                  updatedAt: item.updatedAt
                    ? dayjs(item.updatedAt).format("YYYY/MM/DD")
                    : item.updatedAt,
                })
              );
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
      .catch((error) => {
        console.error("fetching data error");
        setLoading(false);
      });
  };

  const fetchDraftServices = (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean
  ) => {
    if (isTileClicked)
      return tableRef;

    if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

    setLoading(true);
    dispatch(
      GetServiceCategoriesDraftList({
        pageNumber: pageNumber ? pageNumber : 1,
        pageSize: pageSize ? pageSize : 10,
        sortColumn: sortColumn || draftDefaultSortColumn,
        sortDirection: sortDirection || draftDefaultSortDirection,
      })
    )
      .then(unwrapResult)
      .then((orginalPromiseResult) => {
        if (orginalPromiseResult.statusCode === 200) {
          if (tableRef.current) {
            if (orginalPromiseResult.data.data) {
              // Format the updatedAt date field to YYYY/MM/DD format
              const formattedData = orginalPromiseResult.data.data.map(
                (item: any) => ({
                  ...item,
                  updatedAt: item.updatedAt
                    ? dayjs(item.updatedAt).format("YYYY/MM/DD")
                    : item.updatedAt,
                })
              );
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
      .catch((error) => {
        console.error("fetching data error");
        setLoading(false);
      });
  };

  const handleAddNewService = () => {
    navigate("/admin-dashboard/new-services");
  };

  const onCellClick = (row: DTRow, clickedColumn: string) => { };

  const handleSearch = () => {
    const hasFilters = selectedDropDownValue || lastUpdatedDate || isTileClicked;

    if (hasFilters) {
      if (tableRef.current) tableRef.current.setIsLoading(true);

      setLoading(true);

      const statusId = isTileClicked
        ? tileStatusId
        : currentTabView === "draft-view"
          ? String(ServiceStatus.Draft)
          : `${ServiceStatus.Active},${ServiceStatus.Inactive}`;

      dispatch(
        SearchByWildCardText({
          page: 1,
          pageSize: 10,
          statusId,
          searchText: "",
          dateFilter: lastUpdatedDate
            ? dayjs(lastUpdatedDate).format("YYYY-MM-DD")
            : undefined,
          serviceCategoryId: selectedDropDownValue
            ? Number(selectedDropDownValue)
            : undefined,
        })
      )
        .then(unwrapResult)
        .then((orginalPromiseResult) => {
          if (orginalPromiseResult.statusCode === 200) {
            if (tableRef.current) {

              if (orginalPromiseResult.data) {
                // Format the updatedAt date field to YYYY/MM/DD format
                const formattedData =
                  orginalPromiseResult.data.wildCardSearchTextDto.map(
                    (item: any) => ({
                      ...item,
                      serviceId: item.id,
                      serviceName: item.title,
                      serviceCode: item.serviceCode,
                      statusId: item.statusId,
                      lookupName: item.lookupName,
                      lastUpdatedBy: item.lastUpdatedBy,
                      updatedAt: item.updatedAt
                        ? dayjs(item.updatedAt).format("YYYY/MM/DD")
                        : item.updatedAt,
                    })
                  );
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
      if (currentTabView == "draft-view") {
        fetchDraftServices(
          1,
          10,
          draftDefaultSortColumn,
          draftDefaultSortDirection,
          "",
          true
        );
      } else {
        fetchPublishedServices(
          1,
          10,
          draftDefaultSortColumn,
          draftDefaultSortDirection,
          "",
          true
        );
      }
    }
  };

  const handleClear = () => {
    setSelectedDropDownValue("");
    setLastUpdatedDate(null);

    if (currentTabView == "draft-view") {
      fetchDraftServices(
        1,
        10,
        draftDefaultSortColumn,
        draftDefaultSortDirection,
        "",
        true
      );
    } else {
      fetchPublishedServices(
        1,
        10,
        draftDefaultSortColumn,
        draftDefaultSortDirection,
        "",
        true
      );
    }
  };

  const handleFilterByStatusId = (statusId: string) => {
    setCurrentTabView("");
    // Split the statusId string into array of numbers
    const statusIdArr = statusId.split(",").map((id) => Number(id));

    // Check for draft status
    if (statusIdArr.includes(ServiceStatus.Draft)) {
      setCurrentTabView("draft-view");
    }

    // Check for active or inactive status
    if (statusIdArr.includes(ServiceStatus.Active) || statusIdArr.includes(ServiceStatus.Inactive)) {
      setCurrentTabView("submitted-view");
    }

    setIsTileClicked(true);
    setTileStatusId(statusId);
  };

  return (
    <div className="d-flex gap-8 flex-column">
      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 mt-4">
          <CountWidgetList
            widgets={tileData}
            scrollable={false}
            filterByStatusId={handleFilterByStatusId}
          ></CountWidgetList>
        </div>
      </div>
      <div className="row">
        {/* {"auth " + JSON.stringify(auth?.userName) + " | role: " + JSON.stringify(userRoleAccess)} */}
        <div className="col-lg-12 col-md-12 col-sm-12">
          <div className="card">
            <div className="card-body p-8">
              <ul className="nav nav-tabs nav-line-tabs ">
                <li className="nav-item col-auto">
                  <a
                    className={
                      currentTabView === "submitted-view"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    data-bs-toggle="tab"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setCurrentTabView("submitted-view");
                    }}
                    href="#kt_tab_pane_5"
                  >
                    <LabelTitleSemibold1
                      text={"LABEL.SUBMITTED"}
                      style={{ cursor: "pointer" }}
                    />
                  </a>
                </li>
                <li className="nav-item col-auto">
                  <a
                    className={
                      currentTabView === "draft-view"
                        ? "nav-link active"
                        : "nav-link"
                    }
                    data-bs-toggle="tab"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setCurrentTabView("draft-view");
                    }}
                    href="#kt_tab_pane_4"
                  >
                    <LabelTitleSemibold1
                      text={"LABEL.DRAFT"}
                      style={{ cursor: "pointer" }}
                    />
                  </a>
                </li>
              </ul>

              {/* Search and filter row */}
              <div className="search-container p-4 mt-5">
                <div className="row ">
                  <div className="col-md-11">
                    <AdminMetSearch
                      statusId={
                        currentTabView === "draft-view"
                          ? String(ServiceStatus.Draft)
                          : `${ServiceStatus.Active},${ServiceStatus.Inactive}`
                      }
                      categoryId={
                        selectedDropDownValue
                          ? Number(selectedDropDownValue)
                          : undefined
                      }
                      date={
                        lastUpdatedDate
                          ? dayjs(lastUpdatedDate).format("YYYY-MM-DD")
                          : undefined
                      }
                      apiCallType={ApiCallType.AdminServiceDashboard}
                    />
                  </div>
                  <div className="col-md-1 ps-14">
                    <button
                      type="button"
                      className="btn-add-icon mt-2"
                      onClick={() => setShowExtraInput((prev) => !prev)}
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
                  </div>
                </div>
                {showExtraInput && (
                  <>
                    <div className={`row px-2`}>
                      <div className="col-md-6">
                        <DropdownList
                          dataKey="categoryId"
                          dataValue={
                            lang === "ar" ? "categoryNameAr" : "categoryNameEn"
                          }
                          defaultText={intl.formatMessage({
                            id: "LABEL.SERVICECATEGORY",
                          })}
                          value={selectedDropDownValue}
                          rtl={true}
                          data={categories}
                          key={generateUUID()}
                          setSelectedValue={setSelectedDropDownValue}
                        />
                      </div>
                      <div className="col-md-6">
                        <div
                          className={
                            lang == "ar" ? "datepicker-rtl" : "datepicker-ltr"
                          }
                        >
                          <MUIDatePicker
                            placeholder={intl.formatMessage({
                              id: "LABEL.ADMIN.SEARCH.DATE",
                            })}
                            value={lastUpdatedDate}
                            onDateChange={(newDate) =>
                              setLastUpdatedDate(newDate)
                            }
                            key={generateUUID()}
                            id={""}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`row mt-2 search-container`}
                      aria-hidden={!showExtraInput}
                    >
                      <div
                        className="col-md-6 fv-row fv-plugins-icon-container"
                        id="admin-search-button-section"
                      >
                        <div className="d-flex gap-2 mx-2">
                          <button
                            type="button"
                            id="kt_modal_new_target_Search"
                            className="btn MOD_btn btn-create"
                            style={{ minWidth: 120 }}
                            onClick={handleSearch}
                          >
                            <BtnLabeltxtMedium2
                              text={"LABEL.SEARCH"}
                              isI18nKey={true}
                            />
                          </button>
                          <button
                            type="button"
                            id="kt_modal_new_target_clear"
                            className="btn MOD_btn btn-cancel"
                            style={{ minWidth: 120 }}
                            onClick={handleClear}
                          >
                            <BtnLabelCanceltxtMedium2 text={"LABEL.CLEAR"} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="row">
                <div className="col-lg-12 col-md-12 col-sm-12 mt-6 d-flex align-items-center justify-content-end">
                  <button
                    id="kt_modal_new_target_create_new"
                    className="btn MOD_btn btn-create w-10 pl-5"
                    onClick={handleAddNewService}
                  >
                    <FontAwesomeIcon color={""} size="1x" icon={faPlus} />
                    <BtnLabeltxtMedium2
                      text={"BUTTON.LABEL.NEWSERVICE"}
                      isI18nKey={true}
                    />{" "}
                  </button>
                </div>
              </div>

              <div className="tab-content pt-5 mt-1" id="myTabContent">
                <div
                  className={
                    currentTabView === "submitted-view"
                      ? "tab-pane fade show active"
                      : "tab-pane fade"
                  }
                  id="kt_tab_pane_5"
                  role="tabpanel"
                >
                  <div className="ws-page-chart" id={"submitted-view"}>
                    {currentTabView == "submitted-view" && (
                      <>
                        <DataTableMain2
                          displaySearchBar={false}
                          lang={lang}
                          tableConfig={finalPublishTableConfig}
                          onCellClick={onCellClick}
                          paginationServer
                          getData={fetchPublishedServices}
                          ref={tableRef}
                          componentsList={componentsList}
                        />
                      </>
                    )}
                  </div>
                </div>
                <div
                  className={
                    currentTabView === "draft-view"
                      ? "tab-pane fade show active"
                      : "tab-pane fade"
                  }
                  id="kt_tab_pane_4"
                  role="tabpanel"
                >
                  <div className="ws-page-chart" id={"draft-view"}>
                    {currentTabView == "draft-view" && (
                      <>
                        <DataTableMain2
                          displaySearchBar={false}
                          lang={lang}
                          tableConfig={finalDraftTableConfig}
                          onCellClick={onCellClick}
                          paginationServer
                          getData={fetchDraftServices}
                          ref={tableRef}
                          componentsList={componentsList}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditItem(props: {
  row: DTRow;
  editStatus: string;
  currentTabView?: string;
}) {
  const navigate = useNavigate();
  const intl = useIntl();
  const isPublished = props.row.statusId == ServiceStatus.Active;
  const isReadOnly = props.row.statusId == ServiceStatus.Active || false;

  return (
    <>
      {
        <>
          {
            <div className="col col-auto px-2">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip">
                    <div className="tooltip-text">
                      {intl.formatMessage({ id: "TOOLTIP.EDIT" })}
                    </div>
                  </Tooltip>
                }
              >
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/admin-dashboard/services-details", {
                      state: {
                        serviceId: props.row.serviceId,
                        isReadOnly,
                        isPublish: isPublished,
                        statusId: props.row.statusId,
                        currentTabView: props.currentTabView,
                      },
                    })
                  }
                >
                  <i className="2xl fa fa-light fa-edit fa-xl" />
                </div>
              </OverlayTrigger>
            </div>
          }
        </>
      }
    </>
  );
}

function ViewItem(props: {
  row: DTRow;
  editStatus: string;
  currentTabView?: string;
}) {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <>
      {
        <div className="col col-auto px-2">
          {
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip">
                  <div className="tooltip-text">
                    {intl.formatMessage({ id: "TOOLTIP.VIEW" })}
                  </div>
                </Tooltip>
              }
            >
              <div
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate("/admin-dashboard/services-details", {
                    state: {
                      serviceId: props.row.serviceId,
                      isReadOnly: true,
                      statusId: props.row.statusId,
                      currentTabView: props.currentTabView,
                    },
                  })
                }
              >
                <RenderFontAwesome
                  marginInlineStart="3px"
                  display
                  size="lg"
                  icon={"faEye"}
                />
              </div>
            </OverlayTrigger>
          }
        </div>
      }
    </>
  );
}

function ServiceName(props: { row: DTRow; editStatus: string }) {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <>
      {
        <div className="col col-auto">
          {
            <>
              <DetailLabels
                text={props.row.serviceStatus!}
                customClassName={
                  (props.row.statusId == ServiceStatus.Draft && "draft-ar") ||
                  (props.row.statusId == ServiceStatus.Active && "active-ar") ||
                  "draft-ar"
                }
                style={{ margin: "0 10px" }}
              />

              <DetailLabels text={props.row.serviceCode!} />

              <div
                style={{
                  borderLeft: "1px solid #ccc",
                  height: "20px",
                  margin: "0 10px",
                  display: "inline-block",
                }}
              ></div>

              <DetailLabels text={props.row.serviceName!} />
            </>
          }
        </div>
      }
    </>
  );
}

export default AdminServiceDashboard;
