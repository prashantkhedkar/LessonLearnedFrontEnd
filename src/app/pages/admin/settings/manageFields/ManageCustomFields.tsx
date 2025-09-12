import React, { useRef, useState, useEffect } from 'react';
import {
    Box
} from '@mui/material';
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as MuiIcons from '@mui/icons-material';
import DataTableMain2, { ComponentAndProps } from '../../../../modules/components/dataTable2/DataTableMain';
import { useLang } from '../../../../../_metronic/i18n/Metronici18n';
import columns from "./FieldListConfig.json";
import { useAppDispatch } from '../../../../../store';
import { unwrapResult } from "@reduxjs/toolkit";
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Row as DTRow } from '../../../../models/row';
import { FieldMasterModel } from '../../../../models/global/fieldMasterModel';
import { BtnLabeltxtMedium2, HeaderLabels } from '../../../../modules/components/common/formsLabels/detailLabels';
import { ManageFields } from "../../../../pages/admin/new-fields/ManageFields"
import { getAllFieldMasterData, checkAndDeleteFieldFromFieldMaster } from '../../../../modules/services/adminSlice';
import ConfirmDeleteModal from "../../../../modules/components/confirmDialog/ConfirmDeleteModal";
import { toast } from 'react-toastify';
import { writeToBrowserConsole } from '../../../../modules/utils/common';

export const ManageCustomFields: React.FC = () => {
    const lang = useLang();
    const intl = useIntl();
    const finalTableConfig = JSON.stringify(columns);
    const tableRef = useRef<any>(null);
    const dispatch = useAppDispatch();
    const [componentsList, setComponentsList] = useState<ComponentAndProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddField, setShowAddField] = useState(false);
    const [showEditField, setShowEditField] = useState(false);
    const [editingField, setEditingField] = useState<FieldMasterModel | null>(null);

    const [showDeleteField, setShowDeleteField] = useState(false);
    const [deleteField, setDeleteField] = useState<FieldMasterModel | null>(null);

    useEffect(() => {
        setComponentsList([
            {
                component: EditItem,
            },
            {
                component: DeleteItem,
            },
        ]);
    }, []);

    const handleAddField = () => {
        setShowAddField(true);
        setEditingField(null);
    };

    const handleEditField = (field: FieldMasterModel) => {
        setEditingField(field);
        setShowEditField(true);
    };

    const handleDeleteField = (field: FieldMasterModel) => {
        setDeleteField(field);
        setShowDeleteField(true);
    };

    const handleCloseAddField = () => {
        setShowAddField(false);
        setEditingField(null);
        // Refresh the grid data after adding a field
        fetchFieldMasterList(1, 10, draftDefaultSortColumn, draftDefaultSortDirection, "", true);
    };

    const handleCloseEditField = () => {
        setShowEditField(false);
        setEditingField(null);
        // Refresh the grid data after editing a field
        fetchFieldMasterList(1, 10, draftDefaultSortColumn, draftDefaultSortDirection, "", true);
    };

    // Default sort column and direction for draft list
    const draftDefaultSortColumn = "updatedDate"; // Change as needed
    const draftDefaultSortDirection = "desc"; // or "desc"

    const fetchFieldMasterList = (
        pageNumber?: number,
        pageSize?: number,
        sortColumn?: string,
        sortDirection?: string,
        searchText?: string,
        useSpinner?: boolean
    ) => {
        if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

        setLoading(true);

        // Only pass allowed params for published list
        dispatch(
            getAllFieldMasterData({
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
                    if (tableRef.current) {
                        if (orginalPromiseResult.data.data) {
                            // Format the updatedAt date field to YYYY/MM/DD format
                            const formattedData = orginalPromiseResult.data.data.map(
                                (item: any) => ({
                                    ...item,
                                    createdDate: item.createdDate
                                        ? dayjs(item.createdDate).format("YYYY/MM/DD")
                                        : item.createdDate,
                                    updatedDate: item.updatedDate
                                        ? dayjs(item.updatedDate).format("YYYY/MM/DD")
                                        : item.updatedDate,
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

    const renderIcon = (iconName: string) => {
        const IconComponent = (MuiIcons as any)[iconName];
        return IconComponent ? <IconComponent fontSize="medium" /> : null;
    };

    let inputHandler = (e) => {
        var value = e.target.value.toLowerCase();
        setSearchTerm(value);
        if (value.length > 2) {
            //SeachApi(value, currentPage);
            fetchFieldMasterList(1, 1000, draftDefaultSortColumn, draftDefaultSortDirection, value, true);
        }
        else if (value.length === 0) {
            fetchFieldMasterList(1, 10, draftDefaultSortColumn, draftDefaultSortDirection, "", true);
        }
    };

    function DeleteItem(props: { row: DTRow }) {
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
                                                {intl.formatMessage({ id: "TOOLTIP.DELETE" })}
                                            </div>
                                        </Tooltip>
                                    }
                                >
                                    <div
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            // Create FieldMasterModel object from DTRow data
                                            const rowData = props.row as any; // Type assertion to access dynamic properties
                                            const fieldObject: FieldMasterModel = {
                                                fieldId: rowData.fieldId || 0,
                                                fieldLabel: rowData.fieldLabel || rowData.fieldLabelAr || '',
                                                fieldLabelAr: rowData.fieldLabelAr || '',
                                                fieldTypeId: rowData.fieldTypeId || 0,
                                                fieldTypeName: rowData.fieldTypeName || '',
                                                isRequired: rowData.isRequired !== undefined ? rowData.isRequired : true,
                                                displayOrder: rowData.displayOrder || 0,
                                                isActive: rowData.isActive !== undefined ? rowData.isActive : true,
                                                placeholder: rowData.placeholder || '',
                                                fieldDescription: rowData.fieldDescription || rowData.placeholder || '',
                                                attributes: rowData.attributes || '',
                                                entityId: rowData.entityId || 0,
                                                createdBy: rowData.createdBy || 0,
                                                createdDate: rowData.createdDate,
                                                updatedBy: rowData.updatedBy || 0,
                                                updatedDate: rowData.updatedDate,
                                                isSelected: false,
                                                guid: rowData.guid || ''
                                            };
                                            handleDeleteField(fieldObject);
                                        }}
                                    >
                                        <i className="2xl fa fa-light fa-trash fa-xl" />
                                    </div>
                                </OverlayTrigger>
                            </div>
                        }
                    </>
                }
            </>
        );
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
                                            // Create FieldMasterModel object from DTRow data
                                            const rowData = props.row as any; // Type assertion to access dynamic properties
                                            const fieldObject: FieldMasterModel = {
                                                fieldId: rowData.fieldId || 0,
                                                fieldLabel: rowData.fieldLabel || rowData.fieldLabelAr || '',
                                                fieldLabelAr: rowData.fieldLabelAr || '',
                                                fieldTypeId: rowData.fieldTypeId || 0,
                                                fieldTypeName: rowData.fieldTypeName || '',
                                                isRequired: rowData.isRequired !== undefined ? rowData.isRequired : true,
                                                displayOrder: rowData.displayOrder || 0,
                                                isActive: rowData.isActive !== undefined ? rowData.isActive : true,
                                                placeholder: rowData.placeholder || '',
                                                fieldDescription: rowData.fieldDescription || rowData.placeholder || '',
                                                attributes: rowData.attributes || '',
                                                entityId: rowData.entityId || 0,
                                                createdBy: rowData.createdBy || 0,
                                                createdDate: rowData.createdDate,
                                                updatedBy: rowData.updatedBy || 0,
                                                updatedDate: rowData.updatedDate,
                                                isSelected: false,
                                                guid: rowData.guid || ''
                                            };
                                            handleEditField(fieldObject);
                                        }}
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
    };

    const handleDeleteStep = () => {
        if (!deleteField?.fieldId || !deleteField?.fieldTypeId) {
            toast.error("Invalid field data");
            return;
        }

        dispatch(checkAndDeleteFieldFromFieldMaster({
            fieldId: deleteField.fieldId,
            fieldTypeId: deleteField.fieldTypeId
        }))
            .then(unwrapResult)
            .then((originalPromiseResult) => {
                if (originalPromiseResult.statusCode === 200) {
                    toast.success(
                        intl.formatMessage({
                            id: "MESSAGE.FIELD.DELETED",
                        })
                    );
                    // Refresh the grid data after successful deletion
                    fetchFieldMasterList(1, 10, draftDefaultSortColumn, draftDefaultSortDirection, "", true);
                } else {
                    toast.error(
                        intl.formatMessage({
                            id: "MESSAGE.FIELD.INUSE",
                        })
                    );
                }
            })
            .catch((rejectedValueOrSerializedError) => {
                toast.error(
                    intl.formatMessage({
                        id: "MESSAGE.FIELD.INUSE",
                    })
                );
                writeToBrowserConsole(rejectedValueOrSerializedError);
            });
        setShowDeleteField(false);
    };

    return (
        <Box>
            <div className='search-container p-4 mb-5'  >
                <div className="row g-0">
                    <div className="col-md-11">
                        <div
                            data-kt-search-element="form"
                            className="position-relative-nop golder-border-1"
                            style={{ width: "95%" }}
                        >
                            <input
                                type="text"
                                className={`form-control form-control-flush search-input ${lang === "ar" ? "ps-12" : "pe-12"
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
                                <i color="#afaba4" className={`fa-magnifying-glass text-gold fs-2 text-lg-1 position-absolute top-50 ${lang === "ar" ? "start-0 ms-4" : "end-0 me-4"} translate-middle-y`}></i>
                            </span>
                            <span
                                className={`position-absolute top-50 ${lang === "ar" ? "start-3 ms-1" : "end-3 me-1"
                                    } translate-middle-y lh-0 d-none`}
                                data-kt-search-element="spinner"
                            >
                                <span className="spinner-border h-25px w-25px align-middle text-gray-400" />
                            </span>
                            <span
                                className={`btn btn-flush btn-active-color-primary position-absolute top-50 ${lang === "ar" ? "start-3 ms-1" : "end-3"
                                    } translate-middle-y lh-0 d-none`}
                                data-kt-search-element="clear"
                            >
                                <i className="fa-xmark" color="#afaba4"></i>
                            </span>
                        </div>

                    </div>
                    <div className="col-md-1 d-flex justify-content-end align-items-center">
                        <button className='btn MOD_btn btn-create'
                            type="button"
                            onClick={handleAddField}
                        >
                            <i className="fas fa-plus"></i>
                            <BtnLabeltxtMedium2
                                text={"BUTTON.LABEL.ADDFIELD"}
                                isI18nKey={true}
                            />
                        </button>
                    </div>
                </div>
            </div>
            <>
                <DataTableMain2
                    displaySearchBar={false}
                    lang={lang}
                    tableConfig={finalTableConfig}
                    paginationServer
                    getData={fetchFieldMasterList}
                    ref={tableRef}
                    componentsList={componentsList}
                />
            </>

            <Modal
                className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
                backdrop="static"
                size="xl"
                show={showAddField}
                onHide={handleCloseAddField}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <HeaderLabels text={"BUTTON.LABEL.ADDFIELD"} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ManageFields
                        onClose={handleCloseAddField}
                    />
                </Modal.Body>
            </Modal>

            <Modal
                className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
                backdrop="static"
                size="xl"
                show={showEditField}
                onHide={handleCloseEditField}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <HeaderLabels text={"LABEL.EDITFIELD"} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ManageFields
                        fieldToEdit={editingField}
                        isEditMode={true}
                        onClose={handleCloseEditField}
                    />
                </Modal.Body>
            </Modal>

            <Modal
                className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
                centered
                backdrop="static"
                keyboard={false}
                show={showDeleteField}
                size={"sm"}
                onHide={() => setShowDeleteField(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <HeaderLabels text={""} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ConfirmDeleteModal
                        setShow={setShowDeleteField}
                        onConfirm={handleDeleteStep}
                    ></ConfirmDeleteModal>
                </Modal.Body>
            </Modal>
        </Box>
    );
};


