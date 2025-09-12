import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Form,
  Badge,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faBan,
  faUnlock,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import useAccommodation from "../../hooks/useAccommodation";
import CountWidgetList from "../../modules/components/CountWidget/CountWidgetList";
import AccommodationSearchFilters from "./components/AccommodationSearchFilters";
import AccommodationForm from "./components/AccommodationForm";
import AccommodationDetails from "./components/AccommodationDetails";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
  DetailLabels,
} from "../../modules/components/common/formsLabels/detailLabels";
import DataTableMain2, {
  ComponentAndProps,
} from "../../modules/components/dataTable2/DataTableMain";
import { Row as DTRow } from "../../models/row";
import { useLang } from "../../../_metronic/i18n/Metronici18n";
import {
  AccommodationModel,
  AccommodationCreateUpdateModel,
  AccommodationSearchModel,
  DEFAULT_ACCOMMODATION_FORM,
} from "../../models/accommodation/accommodationModels";
import tableColumns from "./AccommodationListConfig.json";
import { useIntl } from "react-intl";
import { GlobalLabel } from "../../modules/components/common/label/LabelCategory";

import {
  AccommodationStatus,
  AccommodationType,
} from "../../helper/_constant/accomodationStatus";

const RoomManagementPage: React.FC = () => {
  const [accommodationState, accommodationActions] = useAccommodation();
  const lang = useLang();
  const tableRef = useRef<any>(null);
  const intl = useIntl();

  // Create the table config directly as a string
  const finalTableConfig = JSON.stringify(tableColumns);

  // Local state for UI
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] =
    useState<AccommodationModel | null>(null);
  const [formData, setFormData] = useState<AccommodationCreateUpdateModel>(
    DEFAULT_ACCOMMODATION_FORM
  );
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [componentsList, setComponentsList] = useState<ComponentAndProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Set up table components
  useEffect(() => {
    const components = [
      {
        component: ViewItem,
      },
      {
        component: EditItem,
      },
      {
        component: BlockUnblockItem,
      },
      {
        component: DeleteItem,
      },
      {
        component: AccommodationTypeItem,
      },
      {
        component: StatusItem,
      },
    ];

    setComponentsList(components);
  }, []);

  // Action component functions
  function AccommodationTypeItem(props: { row: DTRow }) {
    // Try to get accommodation from state first
    let accommodation = accommodationState.accommodations.find(
      (acc) => acc.accommodationId === props.row.id
    );

    // If not found in state, use row data directly
    if (!accommodation) {
      const rowAsAccommodation = props.row as any;
      if (rowAsAccommodation.accommodationId) {
        accommodation = rowAsAccommodation as AccommodationModel;
      }
    }

    // Get type details with colors and icons
    const getTypeDetails = (type: string, accommodationType: string) => {
      const lowerType = type?.toLowerCase() || "";
      switch (lowerType) {
        case "26":
          return {
            text: accommodationType,
            icon: "fas fa-user",
            bgColor: "#e3f2fd",
            textColor: "#0d47a1",
            borderColor: "#bbdefb",
          };
        case "27":
          return {
            text: accommodationType,
            icon: "fas fa-users",
            bgColor: "#f3e5f5",
            textColor: "#4a148c",
            borderColor: "#ce93d8",
          };
        case "28":
          return {
            text: accommodationType,
            icon: "fas fa-crown",
            bgColor: "#fff8e1",
            textColor: "#e65100",
            borderColor: "#ffcc02",
          };
        case "29":
          return {
            text: accommodationType,
            icon: "fas fa-home",
            bgColor: "#e8f5e8",
            textColor: "#2e7d32",
            borderColor: "#a5d6a7",
          };
        default:
          return {
            text: type || "Unknown",
            icon: "fas fa-question-circle",
            bgColor: "#f5f5f5",
            textColor: "#757575",
            borderColor: "#e0e0e0",
          };
      }
    };

    if (!accommodation) {
      const unknownType = getTypeDetails("", "");
      return (
        <div className="col col-auto px-2">
          <Badge
            style={{
              backgroundColor: unknownType.bgColor,
              color: unknownType.textColor,
              border: `1px solid ${unknownType.borderColor}`,
              fontSize: "0.75rem",
              fontWeight: "500",
              padding: "0.4rem 0.6rem",
              borderRadius: "0.375rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <i className={unknownType.icon} style={{ fontSize: "0.7rem" }}></i>
            {unknownType.text}
          </Badge>
        </div>
      );
    }

    const typeDetails = getTypeDetails(
      accommodation.accommodationTypeId.toString(),
      accommodation.accommodationType
    );

    return (
      <div className="col col-auto px-2">
        <Badge
          style={{
            backgroundColor: typeDetails.bgColor,
            color: typeDetails.textColor,
            border: `1px solid ${typeDetails.borderColor}`,
            fontSize: "0.75rem",
            fontWeight: "500",
            padding: "0.4rem 0.6rem",
            borderRadius: "0.375rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            minWidth: "80px",
            justifyContent: "center",
          }}
        >
          <i className={typeDetails.icon} style={{ fontSize: "0.7rem" }}></i>
          {typeDetails.text}
        </Badge>
      </div>
    );
  }

  function ViewItem(props: { row: DTRow }) {
    console.log("ViewItem rendered for row:", props.row.id);
    return (
      <div className="col col-auto px-2">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip">
              <div className="tooltip-text">
                {" "}
                {intl.formatMessage({
                  id: "LABEL.VIEW",
                })}
              </div>
            </Tooltip>
          }
        >
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              // Try to get accommodation from state first
              let accommodation = accommodationState.accommodations.find(
                (acc) => acc.accommodationId === props.row.id
              );

              // If not found in state, use row data directly
              if (!accommodation) {
                const rowAsAccommodation = props.row as any;
                console.log("Row data:", rowAsAccommodation);
                if (rowAsAccommodation.accommodationId) {
                  accommodation = rowAsAccommodation as AccommodationModel;
                  console.log(
                    "Using accommodation from row data:",
                    accommodation
                  );
                }
              }

              console.log("ViewItem - found accommodation:", accommodation);
              if (accommodation) {
                console.log("Setting selectedAccommodation and opening modal");
                setSelectedAccommodation(accommodation);
                setShowDetailsModal(true);
                console.log("Modal state should now be true");
              } else {
                console.error("Accommodation not found for ID:", props.row.id);
                console.error("Row props:", props.row);
              }
            }}
          >
            <FontAwesomeIcon
              icon={faEye}
              size="lg"
              color="rgb(128, 128, 128)"
            />
          </div>
        </OverlayTrigger>
      </div>
    );
  }

  function EditItem(props: { row: DTRow }) {
    return (
      <div className="col col-auto px-2">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip">
              <div className="tooltip-text">
                {intl.formatMessage({
                  id: "LABEL.EDIT",
                })}
              </div>
            </Tooltip>
          }
        >
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              console.log("EditItem clicked, row:", props.row);
              console.log(
                "Current accommodations:",
                accommodationState.accommodations
              );

              // Try to use the row data directly if it contains the accommodation info
              const rowAsAccommodation = props.row as any;

              // First try to find from the state
              let accommodation = accommodationState.accommodations.find(
                (acc) => acc.accommodationId === props.row.id
              );

              // If not found in state, use the row data directly
              if (!accommodation && rowAsAccommodation.accommodationId) {
                accommodation = rowAsAccommodation as AccommodationModel;
              }

              console.log("Found accommodation:", accommodation);
              if (accommodation) {
                handleEdit(accommodation);
              } else {
                console.error("Accommodation not found for ID:", props.row.id);
                console.error(
                  "Available accommodations:",
                  accommodationState.accommodations
                );
              }
            }}
          >
            <FontAwesomeIcon
              icon={faEdit}
              size="lg"
              color="rgb(128, 128, 128)"
            />
          </div>
        </OverlayTrigger>
      </div>
    );
  }

  function StatusItem(props: { row: DTRow }) {
    // Try to get accommodation from state first
    let accommodation = accommodationState.accommodations.find(
      (acc) => acc.accommodationId === props.row.id
    );

    // If not found in state, use row data directly
    if (!accommodation) {
      const rowAsAccommodation = props.row as any;
      if (rowAsAccommodation.accommodationId) {
        accommodation = rowAsAccommodation as AccommodationModel;
      }
    }

    // Get status details with icons
    const getStatusDetails = (status: number, availabilityStatus: string) => {
      switch (status) {
        case 23:
          return {
            text: availabilityStatus,
            icon: "fas fa-check-circle",
            bgColor: "#d1e7dd",
            textColor: "#198754",
            borderColor: "#badbcc",
          };
        case 24:
          return {
            text: availabilityStatus,
            icon: "fas fa-user",
            bgColor: "#cff4fc",
            textColor: "#055160",
            borderColor: "#0dcaf0",
          };
        case 25:
          return {
            text: availabilityStatus,
            icon: "fas fa-ban",
            bgColor: "#f8d7da",
            textColor: "#dc3545",
            borderColor: "#f5c2c7",
          };
        default:
          return {
            text: "Unknown",
            icon: "fas fa-question-circle",
            bgColor: "#e9ecef",
            textColor: "#495057",
            borderColor: "#dee2e6",
          };
      }
    };

    if (!accommodation) {
      const unknownStatus = getStatusDetails(0, "");
      return (
        <div className="col col-auto px-2">
          <Badge
            style={{
              backgroundColor: unknownStatus.bgColor,
              color: unknownStatus.textColor,
              border: `1px solid ${unknownStatus.borderColor}`,
              fontSize: "0.75rem",
              fontWeight: "500",
              padding: "0.4rem 0.6rem",
              borderRadius: "0.375rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <i
              className={unknownStatus.icon}
              style={{ fontSize: "0.7rem" }}
            ></i>
            {unknownStatus.text}
          </Badge>
        </div>
      );
    }

    const statusDetails = getStatusDetails(
      accommodation.availabilityStatusId,
      accommodation.availabilityStatus
    );

    return (
      <div className="col col-auto px-2">
        <Badge
          style={{
            backgroundColor: statusDetails.bgColor,
            color: statusDetails.textColor,
            border: `1px solid ${statusDetails.borderColor}`,
            fontSize: "0.75rem",
            fontWeight: "500",
            padding: "0.4rem 0.6rem",
            borderRadius: "0.375rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            minWidth: "85px",
            justifyContent: "center",
          }}
        >
          <i className={statusDetails.icon} style={{ fontSize: "0.7rem" }}></i>
          {statusDetails.text}
        </Badge>
      </div>
    );
  }

  function BlockUnblockItem(props: { row: DTRow }) {
    // Try to get accommodation from state first
    let accommodation = accommodationState.accommodations.find(
      (acc) => acc.accommodationId === props.row.id
    );

    // If not found in state, use row data directly
    if (!accommodation) {
      const rowAsAccommodation = props.row as any;
      if (rowAsAccommodation.accommodationId) {
        accommodation = rowAsAccommodation as AccommodationModel;
      }
    }

    // console.log("BlockUnblockItem - accommodation found:", accommodation);
    // console.log(
    //   "BlockUnblockItem - availabilityStatus:",
    //   accommodation?.availabilityStatus
    // );

    if (!accommodation) {
      return null;
    }

    const isBlocked = accommodation.availabilityStatusId === 25; // 25 is blocked status

    // console.log(
    //   "BlockUnblockItem - isBlocked:",
    //   isBlocked,
    //   "for accommodation:",
    //   accommodation.roomName
    // );

    return (
      <div className="col col-auto px-2">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip">
              <div className="tooltip-text">
                {isBlocked
                  ? intl.formatMessage({
                      id: "LABEL.UNBLOCKROOM",
                    })
                  : intl.formatMessage({
                      id: "LABEL.BLOCKROOM",
                    })}
              </div>
            </Tooltip>
          }
        >
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (accommodation) {
                setSelectedAccommodation(accommodation);
                setReason("");
                if (isBlocked) {
                  setShowUnblockModal(true);
                } else {
                  setShowBlockModal(true);
                }
              }
            }}
          >
            <FontAwesomeIcon
              icon={isBlocked ? faUnlock : faBan}
              size="lg"
              color={
                isBlocked ? "rgba(97, 97, 97, 0.60)" : "rgb(128, 128, 128)"
              }
            />
          </div>
        </OverlayTrigger>
      </div>
    );
  }

  function DeleteItem(props: { row: DTRow }) {
    return (
      <div className="col col-auto px-2" hidden>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip">
              <div className="tooltip-text">
                {intl.formatMessage({
                  id: "LABEL.DELETE",
                })}
              </div>
            </Tooltip>
          }
        >
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              const accommodation = accommodationState.accommodations.find(
                (acc) => acc.accommodationId === props.row.id
              );
              if (accommodation) {
                handleDeleteConfirm(accommodation);
              }
            }}
          >
            <FontAwesomeIcon
              icon={faTrash}
              size="lg"
              color="rgba(97, 97, 97, 0.60)"
            />
          </div>
        </OverlayTrigger>
      </div>
    );
  }

  // Data fetching function for DataTableMain2
  const fetchAccommodations = async (
    pageNumber?: number,
    pageSize?: number,
    sortColumn?: string,
    sortDirection?: string,
    searchText?: string,
    useSpinner?: boolean
  ) => {
    console.log("fetchAccommodations called with params:", {
      pageNumber,
      pageSize,
      sortColumn,
      sortDirection,
      searchText,
    });

    if (useSpinner && tableRef.current) tableRef.current.setIsLoading(true);

    const searchParams: Partial<AccommodationSearchModel> = {
      pageNumber: pageNumber || 1,
      pageSize: pageSize || 10,
      sortBy: sortColumn || "",
      sortDirection: sortDirection || "asc",
      searchText: searchText || "",
    };

    try {
      await accommodationActions.loadAccommodations(searchParams);

      if (tableRef.current) {
        if (
          accommodationState.accommodations &&
          accommodationState.accommodations.length > 0
        ) {
          // Map accommodation data to include id field for DataTableMain2
          const mappedData = accommodationState.accommodations.map((acc) => {
            console.log("Mapping accommodation:", acc);
            const mapped = {
              ...acc,
              id: acc.accommodationId, // Map accommodationId to id for row identification
              // Ensure all needed fields are present
              accommodationId: acc.accommodationId,
              roomName: acc.roomName,
              availabilityStatus: acc.availabilityStatus,
              accommodationType: acc.accommodationType,
              location: acc.location,
              // Format date if needed
              createdDate: acc.createdDate
                ? new Date(acc.createdDate).toLocaleDateString()
                : "",
              updatedDate: acc.updatedDate
                ? new Date(acc.updatedDate).toLocaleDateString()
                : "",
            };
            console.log("Mapped data for table:", mapped);
            return mapped;
          });

          tableRef.current.setData(mappedData);
          tableRef.current.setTotalRows(accommodationState.totalCount || 0);
        } else {
          tableRef.current.setData([]);
          tableRef.current.setTotalRows(0);
        }
      }

      if (useSpinner && tableRef.current) {
        tableRef.current.setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      if (tableRef.current) {
        tableRef.current.setData([]);
        tableRef.current.setTotalRows(0);
        if (useSpinner) {
          tableRef.current.setIsLoading(false);
        }
      }
    }
  };

  // Load statistics and initial data on component mount
  useEffect(() => {
    accommodationActions.loadStats();
    // Load initial accommodation data with a slight delay to ensure table ref is ready
    // setTimeout(() => {
    //   fetchAccommodations(1, 10, "createdDate", "desc", "", true);
    // }, 100);
  }, []);

  // Update table data when accommodations change
  useEffect(() => {
    // console.log(
    //   "Accommodations data updated:",
    //   accommodationState.accommodations
    // );
    // console.log("Total count:", accommodationState.totalCount);

    if (tableRef.current && accommodationState.accommodations) {
      const mappedData = accommodationState.accommodations.map((acc) => ({
        ...acc,
        id: acc.accommodationId,
        createdDate: acc.createdDate
          ? new Date(acc.createdDate).toLocaleDateString()
          : "",
        updatedDate: acc.updatedDate
          ? new Date(acc.updatedDate).toLocaleDateString()
          : "",
      }));

      console.log("Mapped data for table:", mappedData);

      // Force table update
      tableRef.current.setData(mappedData);
      tableRef.current.setTotalRows(accommodationState.totalCount || 0);

      // Force table re-render by updating the loading state
      if (tableRef.current.setIsLoading) {
        tableRef.current.setIsLoading(false);
      }
    }
  }, [
    accommodationState.accommodations,
    accommodationState.totalCount,
    accommodationState.loading,
  ]);

  // Handle search
  const handleSearch = (searchParams: Partial<AccommodationSearchModel>) => {
    accommodationActions.loadAccommodations({
      ...accommodationState.searchParams,
      ...searchParams,
      pageNumber: 1, // Reset to first page when searching
    });
  };

  // Default sort column and direction for draft list
  const draftDefaultSortColumn = "createdDate"; // Change as needed
  const draftDefaultSortDirection = "desc"; // or "desc"

  let inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    var value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value.length > 2) {
      //SeachApi(value, currentPage);
      fetchAccommodations(
        1,
        1000,
        draftDefaultSortColumn,
        draftDefaultSortDirection,
        value,
        true
      );
    } else if (value.length === 0) {
      fetchAccommodations(
        1,
        10,
        draftDefaultSortColumn,
        draftDefaultSortDirection,
        "",
        true
      );
    }
  };
  // Handle create accommodation
  const handleCreate = () => {
    setFormData(DEFAULT_ACCOMMODATION_FORM);
    setShowCreateModal(true);
  };

  // Handle edit accommodation
  const handleEdit = (accommodation: AccommodationModel) => {
    console.log("handleEdit called with accommodation:", accommodation);
    setSelectedAccommodation(accommodation);
    setFormData({
      accommodationType: accommodation.accommodationType,
      location: accommodation.location,
      availabilityStatus: accommodation.availabilityStatus,
      roomCapacity: accommodation.roomCapacity,
      remarks: accommodation.remarks || "",
      roomName: accommodation.roomName,
      buildingName: accommodation.buildingName || "",

      availabilityStartDate: accommodation.availabilityStartDate || new Date(),
      availabilityEndDate: accommodation.availabilityEndDate,
      unitId: accommodation.unitId,
      availabilityStatusId: accommodation.availabilityStatusId,
      accommodationTypeId: accommodation.accommodationTypeId,
    });
    console.log("Setting showEditModal to true");
    setShowEditModal(true);
  };

  // Handle view details
  const handleViewDetails = (accommodation: AccommodationModel) => {
    setSelectedAccommodation(accommodation);
    setShowDetailsModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (accommodation: AccommodationModel) => {
    setSelectedAccommodation(accommodation);
    setShowDeleteModal(true);
  };

  // Handle form submit for create
  const handleCreateSubmit = async (data: AccommodationCreateUpdateModel) => {
    const result = await accommodationActions.createAccommodation(data);

    if (result) {
      setShowCreateModal(false);
      // Reload the table data to show the new accommodation
      await reloadTableData();
      // Show success message or toast
      toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
    } else {
      toast.error(intl.formatMessage({ id: "MESSAGE.ERROR.MESSAGE" }));
    }
  };

  // Handle form submit for edit
  const handleEditSubmit = async (data: AccommodationCreateUpdateModel) => {
    if (selectedAccommodation) {
      const result = await accommodationActions.updateAccommodation(
        selectedAccommodation.accommodationId,
        data
      );
      if (result) {
        setShowEditModal(false);
        setSelectedAccommodation(null);
        // Reload the table data to show the updated accommodation
        await reloadTableData();
        // Show success message or toast
        toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
      } else {
        toast.error(intl.formatMessage({ id: "MESSAGE.ERROR.MESSAGE" }));
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedAccommodation) {
      const result = await accommodationActions.deleteAccommodation(
        selectedAccommodation.accommodationId
      );
      if (result) {
        setShowDeleteModal(false);
        setSelectedAccommodation(null);
        // Reload the table data to remove the deleted accommodation
        await reloadTableData();
        // Show success message or toast
      }
    }
  };

  // Utility function to reload table data
  const reloadTableData = async () => {
    try {
      console.log("🔄 Reloading table data...");

      // Force reload by calling the hook action directly with fresh parameters
      const currentParams = accommodationState.searchParams || {};
      const searchParams: Partial<AccommodationSearchModel> = {
        pageNumber: currentParams.pageNumber || 1,
        pageSize: currentParams.pageSize || 10,
        sortBy: currentParams.sortBy || "createdDate",
        sortDirection: currentParams.sortDirection || "desc",
      };

      // Use the accommodationActions to reload data instead of fetchAccommodations
      await accommodationActions.loadAccommodations(searchParams);

      // Also reload stats to update the count widgets
      accommodationActions.loadStats();

      console.log("✅ Table data reloaded successfully");
    } catch (error) {
      console.error("❌ Error reloading table data:", error);
    }
  };

  // Handle block/unblock
  const handleBlock = async (
    accommodation: AccommodationModel,
    reason: string
  ) => {
    try {
      const result = await accommodationActions.blockAccommodation(
        accommodation.accommodationId,
        reason
      );

      if (result) {
        toast.success(
          intl.formatMessage({ id: "LABEL.ACCOMODATION.BLOCKMESSAGE" })
        );
        // Add a small delay to ensure the backend has processed the change
        setTimeout(async () => {
          await reloadTableData();
        }, 500);
      }
    } catch (error) {
      toast.error(intl.formatMessage({ id: "MESSAGE.ERROR.MESSAGE" }));
    }
  };

  const handleUnblock = async (
    accommodation: AccommodationModel,
    reason: string
  ) => {
    try {
      console.log("🔓 Unblocking accommodation:", accommodation.roomName);

      const result = await accommodationActions.unblockAccommodation(
        accommodation.accommodationId,
        reason
      );

      if (result) {
        toast.success(
          intl.formatMessage({ id: "LABEL.ACCOMODATION.UNBLOCKMESSAGE" })
        );

        // Add a small delay to ensure the backend has processed the change
        setTimeout(async () => {
          await reloadTableData();
        }, 500);
      }
    } catch (error) {
      toast.error(intl.formatMessage({ id: "MESSAGE.ERROR.MESSAGE" }));
    }
  };

  // Handle block/unblock modal actions
  const handleBlockConfirm = async () => {
    if (selectedAccommodation && reason.trim()) {
      setProcessing(true);
      try {
        console.log(
          "🚫 Starting block process for:",
          selectedAccommodation.roomName
        );
        await handleBlock(selectedAccommodation, reason);

        // Close modal and reset state
        setShowBlockModal(false);
        setSelectedAccommodation(null);
        setReason("");
        console.log("✅ Room blocked successfully and modal closed");
      } catch (error) {
        console.error("❌ Error blocking room:", error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleUnblockConfirm = async () => {
    if (selectedAccommodation && reason.trim()) {
      setProcessing(true);
      try {
        console.log(
          "🔓 Starting unblock process for:",
          selectedAccommodation.roomName
        );
        await handleUnblock(selectedAccommodation, reason);

        // Close modal and reset state
        setShowUnblockModal(false);
        setSelectedAccommodation(null);
        setReason("");
        console.log("✅ Room unblocked successfully and modal closed");
      } catch (error) {
        console.error("❌ Error unblocking room:", error);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="d-flex flex-column">
        <div className="d-flex flex-wrap flex-stack mb-6">
          <h1 className="navbar-header-breadcrumb-page">
            {intl.formatMessage({ id: "LABEL.ACCOMODATION.ROOMMANAGEMENT" })}
          </h1>
        </div>

        {/* Error Alert */}
        {/* {accommodationState.error && (
          <Alert
            variant="danger"
            dismissible
            onClose={accommodationActions.clearError}
          >
            {accommodationState.error}
          </Alert>
        )} */}

        {/* Statistics Cards */}
        {accommodationState.stats && (
          <>
            <Row className="mb-6">
              <Col>
                <CountWidgetList
                  widgets={[
                    {
                      name: "مجموع الغرف",
                      count: accommodationState.stats.totalRooms,
                      iconName: "faHome",
                      iconColor: "#0d6efd",
                      iconBgColor: "#e7f3ff",
                      iconFilled: true,
                    },
                    {
                      name: "متوفر",
                      count: accommodationState.stats.availableRooms,
                      iconName: "faCheckCircle",
                      iconColor: "#198754",
                      iconBgColor: "#d1e7dd",
                      iconFilled: true,
                    },
                    {
                      name: "مشغول",
                      count: accommodationState.stats.occupiedRooms,
                      iconName: "faUser",
                      iconColor: "#0dcaf0",
                      iconBgColor: "#cff4fc",
                      iconFilled: true,
                    },
                    {
                      name: "محجوب",
                      count: accommodationState.stats.blockedRooms,
                      iconName: "faBan",
                      iconColor: "#dc3545",
                      iconBgColor: "#f8d7da",
                      iconFilled: true,
                    },
                    {
                      name: "نسبة الاشغال",
                      count: `${accommodationState.stats.occupancyRate.toFixed(
                        1
                      )}%`,
                      iconName: "faChartPie",
                      iconColor: "#6c757d",
                      iconBgColor: "#e9ecef",
                      iconFilled: true,
                    },
                  ]}
                  scrollable={false}
                />
              </Col>
            </Row>
            <Row className="mb-6">
              <Col></Col>
            </Row>
          </>
        )}

        {!accommodationState.stats && (
          <Row className="mb-6">
            <Col>
              <div className="text-center text-muted">
                <i className="fas fa-spinner fa-spin"></i> Loading statistics...
              </div>
            </Col>
          </Row>
        )}
        <div className="search-container p-4 mb-5">
          <div className="row g-0">
            <div className="col-md-11">
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
                onClick={handleCreate}
                disabled={accommodationState.submitting}
              >
                <FontAwesomeIcon color={""} size="1x" icon={faPlus} />
                <BtnLabeltxtMedium2
                  text={"LABEL.ACCOMODATION.ADD"}
                  isI18nKey={true}
                />{" "}
              </button>
            </div>
          </div>
        </div>
        {/* Main Content */}

        {/* Data Table */}
        <DataTableMain2
          displaySearchBar={false}
          lang={lang}
          tableConfig={finalTableConfig}
          paginationServer
          getData={fetchAccommodations}
          ref={tableRef}
          componentsList={componentsList}
        />
      </div>

      {/* Create Modal */}
      <AccommodationForm
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSave={handleCreateSubmit}
        loading={accommodationState.submitting}
      />

      {/* Edit Modal */}
      <AccommodationForm
        show={showEditModal}
        onHide={() => {
          console.log("Edit modal closing");
          setShowEditModal(false);
        }}
        accommodation={selectedAccommodation}
        onSave={handleEditSubmit}
        loading={accommodationState.submitting}
      />

      {/* Debug info */}
      {/* {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            background: "white",
            padding: "10px",
            border: "1px solid #ccc",
            zIndex: 9999,
          }}
        >
          <div>showEditModal: {showEditModal.toString()}</div>
          <div>showDetailsModal: {showDetailsModal.toString()}</div>
          <div>
            selectedAccommodation:{" "}
            {selectedAccommodation ? selectedAccommodation.roomName : "null"}
          </div>
          <div>
            accommodations count: {accommodationState.accommodations.length}
          </div>
        </div>
      )} */}

      {/* Details Modal */}
      {selectedAccommodation && (
        <AccommodationDetails
          show={showDetailsModal}
          onHide={() => {
            console.log("Details modal closing");
            setShowDetailsModal(false);
            setSelectedAccommodation(null);
          }}
          accommodation={selectedAccommodation}
          onEdit={(accommodation) => {
            setShowDetailsModal(false);
            handleEdit(accommodation);
          }}
        />
      )}

      {/* Test Modal for debugging */}
      <Modal
        show={showDetailsModal && !selectedAccommodation}
        onHide={() => setShowDetailsModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Debug: No Accommodation Selected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            The details modal was triggered but no accommodation was selected.
          </p>
          <p>
            This indicates an issue with data retrieval in the ViewItem
            component.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this accommodation?</p>
          {selectedAccommodation && (
            <div className="bg-light p-3 rounded">
              <strong>Room:</strong> {selectedAccommodation.roomName}
              <br />
              <strong>Type:</strong> {selectedAccommodation.accommodationType}
              <br />
              <strong>Location:</strong> {selectedAccommodation.location}
            </div>
          )}
          <p className="text-danger mt-3">
            <i className="fas fa-exclamation-triangle"></i>
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={accommodationState.deleting}
          >
            {accommodationState.deleting && (
              <Spinner animation="border" size="sm" className="me-2" />
            )}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Block Modal */}
      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {intl.formatMessage({ id: "LABEL.ACCOMODATION.BLOCKACCOMODATION" })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {" "}
            {intl.formatMessage({ id: "LABEL.ACCOMODATION.BLOCKCONFIRMATION" })}
          </p>
          {selectedAccommodation && (
            <>
              <div className="bg-light p-3 rounded mb-3">
                <div className="row">
                  <div className="col-md-4">
                    <div className="fs-6 fw-semibold">
                      <GlobalLabel
                        value={intl.formatMessage({
                          id: "LABEL.ACCOMODATION.ROOMNAME",
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-8 fv-row">
                    <DetailLabels
                      isI18nKey={false}
                      text={selectedAccommodation.roomName}
                      customClassName="lbl-txt-semibold-1"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="fs-6 fw-semibold">
                      <GlobalLabel
                        value={intl.formatMessage({
                          id: "LABEL.ACCOMODATION.ACCOMODATIONLOCATION",
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-8 fv-row">
                    <DetailLabels
                      isI18nKey={false}
                      text={selectedAccommodation.location}
                      customClassName="lbl-txt-semibold-1"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          <br></br>
          <Form.Group>
            <Form.Label>
              {" "}
              {intl.formatMessage({
                id: "LABEL.ACCOMODATION.BLOCKREASON",
              })}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={intl.formatMessage({
                id: "LABEL.ACCOMODATION.BLOCKREASON.PH",
              })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            onClick={handleBlockConfirm}
            disabled={!reason.trim() || processing}
            className="btn MOD_btn btn-create w-10 pl-5 mx-3"
          >
            <BtnLabeltxtMedium2
              text={intl.formatMessage({
                id: "LABEL.UPDATE",
              })}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowBlockModal(false)}
            className="btn MOD_btn btn-cancel w-10 pl-5 mx-3"
          >
            <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
          </button>
        </Modal.Footer>
      </Modal>

      {/* Unblock Modal */}
      <Modal show={showUnblockModal} onHide={() => setShowUnblockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {" "}
            {intl.formatMessage({
              id: "LABEL.ACCOMODATION.UNBLOCKACCOMODATION",
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {" "}
            {intl.formatMessage({
              id: "LABEL.ACCOMODATION.UNBLOCKCONFIRMATION",
            })}
          </p>
          {selectedAccommodation && (
            <div className="bg-light p-3 rounded mb-3">
              <>
                <div className="row">
                  <div className="col-md-4">
                    <div className="fs-6 fw-semibold">
                      <GlobalLabel
                        value={intl.formatMessage({
                          id: "LABEL.ACCOMODATION.ROOMNAME",
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-8 fv-row">
                    <DetailLabels
                      isI18nKey={false}
                      text={selectedAccommodation.roomName}
                      customClassName="lbl-txt-semibold-1"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="fs-6 fw-semibold">
                      <GlobalLabel
                        value={intl.formatMessage({
                          id: "LABEL.ACCOMODATION.ACCOMODATIONLOCATION",
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-8 fv-row">
                    <DetailLabels
                      isI18nKey={false}
                      text={selectedAccommodation.location}
                      customClassName="lbl-txt-semibold-1"
                    />
                  </div>
                </div>
              </>
            </div>
          )}
          <Form.Group>
            <Form.Label>
              {" "}
              {intl.formatMessage({
                id: "LABEL.ACCOMODATION.UNBLOCKREASON",
              })}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={intl.formatMessage({
                id: "LABEL.ACCOMODATION.UNBLOCKREASON.PH",
              })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            onClick={handleUnblockConfirm}
            disabled={!reason.trim() || processing}
            className="btn MOD_btn btn-create w-10 pl-5 mx-3"
          >
            <BtnLabeltxtMedium2
              text={intl.formatMessage({
                id: "LABEL.UPDATE",
              })}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowUnblockModal(false)}
            className="btn MOD_btn btn-cancel w-10 pl-5 mx-3"
          >
            <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RoomManagementPage;
