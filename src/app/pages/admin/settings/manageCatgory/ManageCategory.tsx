import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as MuiIcons from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryForm from "./CategoryForm";
import { Category, sampleCategories } from "./sampleData";
import { toast } from "react-toastify";
import DataTableMain2, {
  ComponentAndProps,
} from "../../../../modules/components/dataTable2/DataTableMain";
import { useLang } from "../../../../../_metronic/i18n/Metronici18n";
import columns from "./CategoryListConfig.json";
import { useAppDispatch } from "../../../../../store";
import { GetServiceCategoryList } from "../../../../modules/services/adminSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import RenderFontAwesome from "../../../../modules/utils/RenderFontAwesome";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { Row as DTRow } from "../../../../models/row";
import { ServiceCategoryCrudModel } from "../../../../models/global/serviceModel";
import {
  BtnLabeltxtMedium2,
  HeaderLabels,
} from "../../../../modules/components/common/formsLabels/detailLabels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Flow from "../../workflowcharts/Flow";
import ApiWorkflowWrapper from "../../workflowcharts/ApiWorkflowWrapper";

export const ManageCategory: React.FC = () => {
  const lang = useLang();
  const intl = useIntl();
  const finalTableConfig = JSON.stringify(columns);
  const tableRef = useRef<any>(null);
  const dispatch = useAppDispatch();
  const [componentsList, setComponentsList] = useState<ComponentAndProps[]>([]);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategoryCrudModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Load categories when component mounts
  // useEffect(() => {
  //     fetchServiceCategoryList();
  // }, []);

  useEffect(() => {
    setComponentsList([
      {
        component: ViewItem,
      },
      {
        component: EditItem,
      },
    ]);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
  };

  const handleEdit = (category: ServiceCategoryCrudModel) => {
    setSelectedCategory(category);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  const handleAddOrUpdate = () => {
    if (searchTerm) {
      //SeachApi(value, currentPage);
      fetchServiceCategoryList(
        1,
        1000,
        draftDefaultSortColumn,
        draftDefaultSortDirection,
        searchTerm,
        true
      );
    } else {
      fetchServiceCategoryList();
    }
    // Use generic function with custom message directly
  };

  // Default sort column and direction for draft list
  const draftDefaultSortColumn = "createdDate"; // Change as needed
  const draftDefaultSortDirection = "desc"; // or "desc"

  const fetchServiceCategoryList = (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean,
    isExcel?: boolean
  ) => {
    if (isExcel && tableRef.current)
      tableRef.current.setExcelDataStatus("loading");

    if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

    setLoading(true);
    // Only pass allowed params for published list
    dispatch(
      GetServiceCategoryList({
        pageNumber: pageNumber ? pageNumber : 1,
        pageSize: pageSize ? pageSize : 10,
        sortColumn: sortColumn || draftDefaultSortColumn,
        sortDirection: sortDirection || draftDefaultSortDirection,
        searchTerm: searchText || "",
      })
    )
      .then(unwrapResult)
      .then((orginalPromiseResult) => {
        if (orginalPromiseResult.statusCode === 200) {
          if (!isExcel) {
            if (tableRef.current) {
              if (orginalPromiseResult.data.data) {
                tableRef.current.setData(orginalPromiseResult.data.data);
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
            if (orginalPromiseResult.data.data)
              tableRef.current?.setExcelData(orginalPromiseResult.data.data);
            tableRef.current?.setExcelDataStatus("completed");
          }
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

  const renderIcon = (iconName: string) => {
    const IconComponent = (MuiIcons as any)[iconName];
    return IconComponent ? <IconComponent fontSize="medium" /> : null;
  };

  let inputHandler = (e) => {
    var value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value.length > 2) {
      //SeachApi(value, currentPage);
      fetchServiceCategoryList(
        1,
        1000,
        draftDefaultSortColumn,
        draftDefaultSortDirection,
        value,
        true
      );
    } else if (value.length === 0) {
      fetchServiceCategoryList(
        1,
        10,
        draftDefaultSortColumn,
        draftDefaultSortDirection,
        "",
        true
      );
    }
  };

  function EditItem(props: { row: DTRow }) {
    const navigate = useNavigate();
    const intl = useIntl();

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
                    onClick={() => {
                      // Create Category object from DTRow data
                      const rowData = props.row as any; // Type assertion to access dynamic properties
                      const categoryObject: ServiceCategoryCrudModel = {
                        categoryId: rowData.categoryId || 0,
                        categoryNameAr: rowData.categoryName || "",
                        categoryIconName: rowData.categoryIconName || "",
                        description: rowData.description || "",
                        isActive:
                          rowData.isActive !== undefined
                            ? rowData.isActive
                            : true,
                        categoryColor: rowData.categoryColor || "#b48f53", // Default color if not provided
                      };
                      handleEdit(categoryObject);
                    }}
                    //   onClick={() =>
                    //     navigate("/admin-dashboard/edit-services", {
                    //       state: {
                    //         serviceId: props.row.serviceId,
                    //         isReadOnly,
                    //         isPublish: isPublished,
                    //         statusId: props.row.statusId,
                    //         currentTabView: props.currentTabView,
                    //       },
                    //     })
                    // }
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
                    navigate("/admin-dashboard/edit-services", {
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

  return (
    <Box>
      <div className="search-container p-4 mb-5">
        <div className="row g-0">
          <div className="col-md-11">
            {/* <div className='me-9'>
                            <AdminMetSearch
                                apiCallType={ApiCallType.AdminServiceDashboard}
                            /></div> */}

            <div
              data-kt-search-element="form"
              className="position-relative golder-border-1"
              style={{ width: "95%" }}
            >
              <input
                type="text"
                className={`form-control form-control-flush search-input ${
                  lang === "ar" ? "ps-12" : "pe-12"
                }`}
                name="search"
                placeholder={intl.formatMessage({ id: "LABEL.SEARCH" })}
                data-kt-search-element="input"
                onChange={inputHandler}
                value={searchTerm}
                autoComplete="off"
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              <span>
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  size="5x"
                  color="#afaba4"
                  className={`text-gold fs-2 text-lg-1 position-absolute top-50 ${
                    lang === "ar" ? "start-0 ms-4" : "end-0 me-4"
                  } translate-middle-y`}
                />
                <i
                  color="#afaba4"
                  className={`fa-magnifying-glass text-gold fs-2 text-lg-1 position-absolute top-50 ${
                    lang === "ar" ? "start-0 ms-4" : "end-0 me-4"
                  } translate-middle-y`}
                ></i>
              </span>
              <span
                className={`position-absolute top-50 ${
                  lang === "ar" ? "start-3 ms-1" : "end-3 me-1"
                } translate-middle-y lh-0 d-none`}
                data-kt-search-element="spinner"
              >
                <span className="spinner-border h-25px w-25px align-middle text-gray-400" />
              </span>
              <span
                className={`btn btn-flush btn-active-color-primary position-absolute top-50 ${
                  lang === "ar" ? "start-3 ms-1" : "end-3"
                } translate-middle-y lh-0 d-none`}
                data-kt-search-element="clear"
              >
                {/* <FontAwesomeIcon
                icon={faXmark}
                size="2xl"
                color="#afaba4"
                className={lang === "ar" ? "ms-2" : "me-2"}
              /> */}
                <i className="fa-xmark" color="#afaba4"></i>
              </span>
            </div>
          </div>
          <div className="col-md-1 d-flex justify-content-end align-items-center">
            <button
              id="kt_modal_new_target_create_new"
              className="btn MOD_btn btn-create w-10 pl-5"
              onClick={handleOpen}
            >
              <FontAwesomeIcon color={""} size="1x" icon={faPlus} />
              <BtnLabeltxtMedium2
                text={"BUTTON.LABEL.NEWCATEGORY"}
                isI18nKey={true}
              />{" "}
            </button>
          </div>
        </div>
      </div>

      <>
        {/* <div style={{ height: "500px", width: "100%" }}>
         
          <ApiWorkflowWrapper workflowId={1}  />
        </div> */}
        <DataTableMain2
          displaySearchBar={false}
          lang={lang}
          tableConfig={finalTableConfig}
          // onCellClick={onCellClick}
          paginationServer
          getData={fetchServiceCategoryList}
          ref={tableRef}
          componentsList={componentsList}
          exportExcel
        />
      </>

      <Modal
        className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
        backdrop="static"
        keyboard={false}
        centered
        size="lg"
        animation={false}
        enforceFocus={false}
        dialogClassName="modal-dialog-scrollable"
        aria-labelledby="contained-modal-title-vcenter"
        show={open}
        onHide={handleClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {/* {"selectedCategory==>" + !selectedCategory} */}
            {/* {selectedCategory ? "تعديل الفئة" : "إضافة فئة جديدة"} */}
            <HeaderLabels
              text={
                selectedCategory
                  ? "LABEL.EDITSERVICECATEGORY"
                  : "LABEL.ADDNEWCATEGORY"
              }
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CategoryForm
            onClose={handleClose}
            onSubmit={handleAddOrUpdate}
            initialData={selectedCategory}
          />
        </Modal.Body>
      </Modal>
    </Box>
  );
};
