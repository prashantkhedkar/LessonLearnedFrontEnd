import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { useLang } from "../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../store";
import DataTableMain2, { ComponentAndProps } from "../../modules/components/dataTable2/DataTableMain";
import columns from "./ObservationsTableConfig.json";
import { useEffect, useRef, useState } from "react";
import { Row as DTRow } from "../../models/row";
import { unwrapResult } from "@reduxjs/toolkit";
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
import { AdminMetSearch } from "../../modules/components/metSearch/AdminMetSearch";
import { ApiCallType } from "../../helper/_constant/apiCallType.constant";
import {
  generateUUID,
  writeToBrowserConsole,
} from "../../modules/utils/common";
import DropdownList from "../../modules/components/dropdown/DropdownList";
import dayjs from "dayjs";
import { MUIDatePicker } from "../../modules/components/datePicker/MUIDatePicker";
import { toast } from "react-toastify";
import { ArticleSearchModel } from "../models/observationModel";
import { deleteObservation, fetchObservations } from "../../modules/services/observationSlice";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { ILookup } from "../../models/global/globalGeneric";
import { StatusModel } from "../../models/global/statusModel";
import { GetLookupValues, fetchStatuses } from "../../modules/services/globalSlice";
import { ActionType } from "../../modules/auth/core/_rbacModels";
import { useRBAC } from "../../modules/auth/core/rbac";

export default function ObservationList() {
  const intl = useIntl();
  const lang = useLang();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const finalTableConfig = JSON.stringify(columns);
  const tableRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [componentsList, setComponentsList] = useState<ComponentAndProps[]>([]);
  const [componentsListMyRequest, setComponentsListMyRequest] = useState<ComponentAndProps[]>([]);
  const [observationId, setObservationId] = useState<number>(0);
  const [typeOptions, setTypeOptions] = useState<ILookup[]>([]);
  const [statuses, setStatuses] = useState<StatusModel[]>([]);
  const rbac = useRBAC();
  const location = useLocation();
  const state = location.state as {
    tab: number;
  };
  const [tabInit, setTabInit] = useState(0);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [filters, setFilters] = useState<ArticleSearchModel>();

  useEffect(() => {
    setComponentsListMyRequest([
      {
        component: ServiceName,
      },
      {
        component: EditItem,
      },
      {
        component: DeleteItem,
      }
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


    dispatch(GetLookupValues({ lookupType: "ObservationType" }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          const response: ILookup[] = originalPromiseResult.data;
          setTypeOptions(response);
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
      });

    // Load Observation Level options
    dispatch(fetchStatuses())
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          const response: StatusModel[] = originalPromiseResult.data;
          setStatuses(response);
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
      });
  }, []);

  // Default sort column and direction for draft list
  const draftDefaultSortColumn = "updatedAt"; // Change as needed
  const draftDefaultSortDirection = "asc"; // or "desc"

  const fetchObservationList = (
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

    let formDataObject: ArticleSearchModel = {
      pageNumber: pageNumber ? pageNumber : 1,
      pageSize: pageSize ? pageSize : 10,
    };
    const hasFilters = filters != undefined || filters != null;

    dispatch(
      fetchObservations({
        pageNumber: pageNumber ? pageNumber : 1,
        pageSize: pageSize ? pageSize : 10,
        observationType:
          hasFilters && filters.observationType
            ? filters.observationType
            : undefined,
        status:
          hasFilters && filters.status
            ? filters.status
            : undefined,
        dateFrom:
          hasFilters && filters.dateFrom
            ? dayjs(filters.dateFrom).format("YYYY-MM-DD")
            : undefined,
        dateTo:
          hasFilters && filters.dateTo
            ? dayjs(filters.dateTo).format("YYYY-MM-DD")
            : undefined,
      })
    )
      .then(unwrapResult)
      .then((orginalPromiseResult) => {
        if (orginalPromiseResult.statusCode === 200) {
          if (tableRef.current) {
            if (orginalPromiseResult.data.items.length > 0) {
              const formattedData = orginalPromiseResult.data.items;
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
    fetchObservationList(
      1,
      10,
      draftDefaultSortColumn,
      draftDefaultSortDirection,
      "",
      true,
      false
    );
  };

  const onCellClick = () => { };

  const handleClear = () => {
    setFilters(undefined);
    fetchObservationList(
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

    const updatedItem: ArticleSearchModel = { ...filters! };
    if (fieldName == "observationType") updatedItem!.observationType = e;
    if (fieldName == "status") updatedItem!.status = e;
    if (fieldName == "dateFrom") {
      updatedItem!.dateFrom = e;
      updatedItem!.dateTo = undefined;
    }
    if (fieldName == "dateTo") updatedItem!.dateTo = e;
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
                        navigate("/observation/new", {
                          state: {
                            observationId: props.row.id
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
                {Number(props.row.status) == 1 && (
              //  rbac.hasAction(ActionType.DELETE) && (
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
                          handleDelete(props.row)
                        }
                      >
                        <i className="2xl fa fa-light fa-trash fa-xl" />
                      </div>
                    </OverlayTrigger>
                  </div>
                 // )
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
    
    return (
      <>
        {
          <div className="col col-auto">
            {
              <>            
                <DetailLabels text={props.row.observationNumber!} />
                <div
                  style={{
                    borderLeft: "1px solid #ccc",
                    height: "20px",
                    margin: "0 10px",
                    display: "inline-block",
                  }}
                ></div>
                <DetailLabels text={props.row.observationTitle!} />
              </>
            }
          </div>
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

  const handleDelete = (row) => {
    setShowModalDelete(true);
    setObservationId(row.id);
  };

  const handleDeleteItem = () => {
    if (observationId === null) return;

    dispatch(deleteObservation({ articleId: Number(observationId) }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        const { statusCode, data, message } = originalPromiseResult;

        if (statusCode === 200) {
          if (message === "Deleted") {
            setShowModalDelete(false);
            handleClear();

            toast.success(
              intl.formatMessage({ id: "MESSAGE.REQUEST.DELETED.SUCCESS" })
            );
          } else {
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

  const handleAddNewObservation = () => {
    navigate("/observation/new");
  }

  const handleTabChange = (tabIndex: number) => {
    setTabInit(tabIndex);
    const updatedItem: ArticleSearchModel = { ...filters! };
    if(tabIndex==0) updatedItem.status = 1;
    if(tabIndex==1) updatedItem.status = 0;
    if(tabIndex==2) updatedItem.status = 0;
    setFilters(updatedItem);
  }
  return (
    <>
      <Row className="mb-4">
        <Col>
          <CountWidgetList
            widgets={[]}
            scrollable={false}
          //filterByStatusId={handleFilterByStatusId}
          ></CountWidgetList>
        </Col>
      </Row>
      <div className="search-container p-4">
        <Row>
          <Col className="col-11">
            <AdminMetSearch
              apiCallType={ApiCallType.ObservationList}
            ></AdminMetSearch>
          </Col>
          <Col className="col-md-1 ps-14">
        
            <button
              type="button"
              className="btn-add-icon mt-2"
              onClick={() => setShowAdvanced((prev) => !prev)}
              aria-label="Show Advanced Search"
            >
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
              dataKey="id"
              dataValue={lang === "ar" ? "label" : "labelEn"}
              defaultText={intl.formatMessage({ id: "PLACEHOLDER.SELECT.TYPE" })}
              value={filters?.observationType ? filters?.observationType : 0}
              rtl={true}
              data={typeOptions}
              key={generateUUID()}
              setSelectedValue={(e) => handleChange(e, "observationType")}
            />
          </Col>
          <Col>
            <DropdownList
              key={"statusId"}
              dataKey="statusId"
              dataValue={lang === "ar" ? "statusNameAr" : "statusNameEn"}
              defaultText={intl.formatMessage({ id: "LABEL.NEXTSTATUS" })}
              value={filters?.status ? filters?.status : 0}
              data={statuses}
              setSelectedValue={(e) => handleChange(e, "status")}
            />
          </Col>
        </Row>
        <Row className="row search-container1 py-4" hidden={!showAdvanced}>
          <Col>
            <MUIDatePicker
              placeholder={intl.formatMessage({
                id: "LABEL.FROM",
              })}
              value={filters?.dateFrom ? new Date(filters?.dateFrom!) : undefined}
              onDateChange={(newDate) =>
                handleChange(newDate, "dateFrom")
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
              value={filters?.dateTo ? new Date(filters?.dateTo!) : undefined}
              onDateChange={(newDate) => handleChange(newDate, "dateTo")}
              key={generateUUID()}
              minDate={filters?.dateFrom!? new Date(filters?.dateFrom!) : undefined}
              id={""}
            />
          </Col>
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
      <div className="d-flex justify-content-between align-items-center">
        <div style={tabListStyle} className="mb-3 mt-5">
          <button
            onClick={() => handleTabChange(0)}
            style={tabInit == 0 ? activeTabStyle : TabStyle}
          >
            {intl.formatMessage({ id: "LABEL.DRAFT" })}
          </button>
          <button
            onClick={() => handleTabChange(1)}
            style={tabInit == 1 ? activeTabStyle : TabStyle}
          >
            {intl.formatMessage({ id: "LABEL.INPROGRESS" })}
          </button>
          <button
            onClick={() => handleTabChange(2)}
            style={tabInit == 2 ? activeTabStyle : TabStyle}
          >
            {intl.formatMessage({ id: "LABEL.MYACTIONS" })}
          </button>
        </div>
        <div>
          
          {rbac.hasAction(ActionType.ADD) && (
          <button
            onClick={handleAddNewObservation}
            className="btn MOD_btn btn-create min-w-75px w-100 align-self-end"
          >
            <FontAwesomeIcon color={""} size="1x" icon={faPlus} />
            {intl.formatMessage({ id: "BUTTON.LABEL.ADD" })}
          </button>
          )}
        </div>
      </div>

      <div style={{ display: tabInit === 0 ? "block" : "none" }}>
        {JSON.stringify(fetchObservationList)}
        {tabInit === 0 && (
          <DataTableMain2
            displaySearchBar={false}
            lang={lang}
            tableConfig={finalTableConfig}
            onCellClick={onCellClick}
            paginationServer
            getData={fetchObservationList}
            ref={tableRef}
            componentsList={componentsList}
            key={"table0"}
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
            getData={fetchObservationList}
            ref={tableRef}
            componentsList={componentsList}
            key={"table1"}
          />
        )}
      </div>
      <div style={{ display: tabInit === 2 ? "block" : "none" }}>
        {tabInit === 2 && (
          <DataTableMain2
            displaySearchBar={false}
            lang={lang}
            tableConfig={finalTableConfig}
            onCellClick={onCellClick}
            paginationServer
            getData={fetchObservationList}
            ref={tableRef}
            componentsList={componentsList}
            key={"table2"}
          />
        )}
      </div>

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
                onClick={() => handleDeleteItem()}
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
 