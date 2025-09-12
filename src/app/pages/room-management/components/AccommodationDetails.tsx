import React, { useState, useEffect } from "react";
import {
  Modal,
  Row,
  Col,
  Badge,
  Card,
  Alert,
  Spinner,
  Button,
  Tab,
  Nav,
} from "react-bootstrap";
import {
  AccommodationModel,
  AccommodationHistoryModel,
  getStatusColor,
  getStatusIcon,
} from "../../../models/accommodation/accommodationModels";
import { accommodationService } from "../../../services/accommodationService";
import { useIntl } from "react-intl";
import { GlobalLabel } from "../../../modules/components/common/label/LabelCategory";
import {
  BtnLabelCanceltxtMedium2,
  DetailLabels,
} from "../../../modules/components/common/formsLabels/detailLabels";
import dayjs from "dayjs";

interface AccommodationDetailsProps {
  show: boolean;
  onHide: () => void;
  accommodation: AccommodationModel | null;
  onEdit?: (accommodation: AccommodationModel) => void;
}

const AccommodationDetails: React.FC<AccommodationDetailsProps> = ({
  show,
  onHide,
  accommodation,
  onEdit,
}) => {
  const [history, setHistory] = useState<AccommodationHistoryModel[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("details");
  const intl = useIntl();
  const [tabInit, setTabInit] = useState(0);
  // Status color helper functions
  const getStatusBackgroundColor = (status: number) => {
    switch (status) {
      case 1:
        return "#d1e7dd"; // Available - Green
      case 2:
        return "#fff3cd"; // Reserved - Yellow
      case 3:
        return "#cff4fc"; // Occupied - Blue
      case 4:
        return "#f8d7da"; // Blocked - Red
      default:
        return "#e9ecef"; // Unknown - Gray
    }
  };

  const getStatusTextColor = (status: number) => {
    switch (status) {
      case 1:
        return "#0f5132"; // Available - Dark Green
      case 2:
        return "#664d03"; // Reserved - Dark Yellow
      case 3:
        return "#055160"; // Occupied - Dark Blue
      case 4:
        return "#721c24"; // Blocked - Dark Red
      default:
        return "#495057"; // Unknown - Dark Gray
    }
  };

  useEffect(() => {
    if (show && accommodation) {
      setActiveTab("details");
      loadHistory();
    }
  }, [show, accommodation]);

  const loadHistory = async () => {
    if (!accommodation) return;

    setLoadingHistory(true);
    setHistoryError("");

    try {
      const response = await accommodationService.getAccommodationHistory(
        accommodation.accommodationId
      );
      setHistory(response.data || []);
    } catch (error: any) {
      setHistoryError(error.message || "Failed to load accommodation history");
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!accommodation) {
    return null;
  }
  const blue = {
    50: "#F0F7FF",
    100: "#C2E0FF",
    200: "#80BFFF",
    300: "#66B2FF",
    400: "#3399FF",
    500: "#007FFF",
    600: "#6b7280",
    700: "#0059B2",
    800: "#004C99",
    900: "#003A75",
  };
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
    color: blue[600],
    borderBottom: "solid #ccc 1px",
    fontWeight: 600,
    boxShadow: "0px 2px 0px 0px #B7945A",
  };
  const tabListStyle = {
    display: "flex",

    gap: 2,
    marginBottom: "2rem",
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY/MM/DD");
  };

  const renderDetailsTab = () => (
    <div>
      {/* {JSON.stringify(accommodation)} */}
      <div>
        {/* Basic Information */}
        <div className="d-flex align-items-center mb-4">
          <div className="flex-grow-1">
            <hr
              className="my-0"
              style={{ borderTop: "2px solid #0d6efd", opacity: 0.3 }}
            />
          </div>
          <h6 className="mb-0 mx-3 text-primary fw-bold">
            <i className="fas fa-info-circle me-2"></i>
            {intl.formatMessage({ id: "LABEL.ACCOMODATION.BESICINFO" })}
          </h6>
          <div className="flex-grow-1">
            <hr
              className="my-0"
              style={{ borderTop: "2px solid #0d6efd", opacity: 0.3 }}
            />
          </div>
        </div>
        <Row className="mb-4 px-4">
          {/* Room Name */}
          <Col md={2}>
            <GlobalLabel
              value={intl.formatMessage({
                id: "LABEL.ACCOMODATION.ROOMNAME",
              })}
            />
          </Col>
          <Col md={4}>
            <div className="position-relative">{accommodation.roomName}</div>
          </Col>
          <Col md={2}>
            <GlobalLabel
              value={intl.formatMessage({
                id: "LABEL.ACCOMODATION.ACCOMODATIONTYPE",
              })}
            />
          </Col>
          <Col md={4}>
            <div className="position-relative">
              {accommodation.accommodationType}
            </div>
          </Col>
        </Row>
        <Row className="mb-4 px-4">
          {/* Room Name */}
          <Col md={2}>
            <GlobalLabel
              value={intl.formatMessage({
                id: "LABEL.ACCOMODATION.ACCOMODATIONLOCATION",
              })}
            />
          </Col>
          <Col md={4}>
            <div className="position-relative">{accommodation.location}</div>
          </Col>
          <Col md={2}>
            <GlobalLabel
              value={intl.formatMessage({
                id: "LABEL.ACCOMODATION.AVABILITYSTATUS",
              })}
            />
          </Col>
          <Col md={4}>
            <div className="position-relative">
              {accommodation.availabilityStatus}
            </div>
          </Col>
        </Row>
      </div>
      {/* Building Details */}
      <div className="d-flex align-items-center mb-4 mt-5">
        <div className="flex-grow-1">
          <hr
            className="my-0"
            style={{ borderTop: "2px solid #198754", opacity: 0.3 }}
          />
        </div>
        <h6 className="mb-0 mx-3 text-success fw-bold">
          <i className="fas fa-building me-2"></i>
          {intl.formatMessage({ id: "LABEL.ACCOMODATION.BUILDINGDETAILS" })}
        </h6>
        <div className="flex-grow-1">
          <hr
            className="my-0"
            style={{ borderTop: "2px solid #198754", opacity: 0.3 }}
          />
        </div>
      </div>

      <Row className="mb-4 px-4">
        {/* Building Name */}
        <Col md={2}>
          <GlobalLabel
            value={intl.formatMessage({
              id: "LABEL.ACCOMODATION.BUILDINGADDRESS",
            })}
          />
        </Col>
        <Col md={4}>
          {" "}
          <div className="position-relative">{accommodation.buildingName}</div>
        </Col>
        {/* Room Capacity */}
        <Col md={2}>
          <GlobalLabel
            required
            value={intl.formatMessage({
              id: "LABEL.ACCOMODATION.ROOMCAPACITY",
            })}
          />
        </Col>
        <Col md={4}>
          {" "}
          <div className="position-relative">{accommodation.roomCapacity}</div>
        </Col>
      </Row>

      {/* Additional Notes */}
      {accommodation.remarks && (
        <>
          <div className="d-flex align-items-center mb-4 mt-5">
            <div className="flex-grow-1">
              <hr
                className="my-0"
                style={{ borderTop: "2px solid #6c757d", opacity: 0.3 }}
              />
            </div>
            <h6 className="mb-0 mx-3 fw-bold" style={{ color: "#6c757d" }}>
              <i className="fas fa-sticky-note me-2"></i>

              {intl.formatMessage({
                id: "LABEL.ACCOMODATION.ADDITIONALINFO",
              })}
            </h6>
            <div className="flex-grow-1">
              <hr
                className="my-0"
                style={{ borderTop: "2px solid #6c757d", opacity: 0.3 }}
              />
            </div>
          </div>
          <Row className="mb-4 px-4">
            {/* Remarks */}
            <Col md={2}>
              <GlobalLabel
                value={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.REMARK",
                })}
              />
            </Col>
            <Col md={10}>
              {" "}
              <div className="position-relative">{accommodation.remarks}</div>
            </Col>
          </Row>{" "}
          <Row className="mb-4 px-4">
            <Col md={2}>
              <GlobalLabel
                value={intl.formatMessage({
                  id: "LABEL.CREATEDDATE",
                })}
              />
            </Col>
            <Col md={4}>
              {" "}
              <div className="position-relative">
                {formatDate(accommodation.createdDate.toString())}
              </div>
            </Col>
            <Col md={2}>
              <GlobalLabel
                value={intl.formatMessage({
                  id: "TABLE.COLUMN.CREATEDBY",
                })}
              />
            </Col>
            <Col md={4}>
              {" "}
              <div className="position-relative">
                {accommodation.createdByUser}
              </div>
            </Col>
          </Row>
          {accommodation.updatedDate && (
            <>
              <Row className="mb-4 px-4">
                <Col md={2}>
                  <GlobalLabel
                    value={intl.formatMessage({
                      id: "DT.COLUMN.UPDATEDDATE",
                    })}
                  />
                </Col>
                <Col md={4}>
                  {" "}
                  <div className="position-relative">
                    {formatDate(accommodation.updatedDate.toString())}
                  </div>
                </Col>
                <Col md={2}>
                  <GlobalLabel
                    value={intl.formatMessage({
                      id: "DT.COLUMN.UPDATEDBY",
                    })}
                  />
                </Col>
                <Col md={4}>
                  {" "}
                  <div className="position-relative">
                    {accommodation.updatedByUser}
                  </div>
                </Col>
              </Row>
            </>
          )}
        </>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div>
      {loadingHistory ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Loading history...</div>
        </div>
      ) : historyError ? (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-history fs-2x mb-3"></i>
          <div>
            {intl.formatMessage({
              id: "LABEL.ACCOMODATION.NORECORDFOUND",
            })}
          </div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-history fs-2x mb-3"></i>
          <div>
            {intl.formatMessage({
              id: "LABEL.ACCOMODATION.NORECORDFOUND",
            })}
          </div>
        </div>
      ) : (
        <div className="timeline">
          {history.map((record, index) => (
            <div key={record.bookingId} className="timeline-item">
              {/* <div className="timeline-marker">
                <i className={getHistoryIcon(record.actionType)}></i>
              </div> */}
              <div className="timeline-content mb-0">
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-10">
                        {" "}
                        <div className="justify-content-between align-items-start mb-2">
                          <DetailLabels
                            isI18nKey={false}
                            text={formatDate(record.startDate.toString())}
                            customClassName="lbl-txt-semibold-light"
                          />
                          <DetailLabels
                            isI18nKey={false}
                            text={" - "}
                            customClassName="lbl-txt-semibold-light px-1"
                          />
                          <DetailLabels
                            isI18nKey={false}
                            text={formatDate(record.endDate.toString())}
                            customClassName="lbl-txt-semibold-light"
                          />{" "}
                        </div>
                        <div className="text-muted">
                          <small>
                            <i className="fas fa-user me-1"></i>
                            {record.bookedBy}
                          </small>
                        </div>
                      </div>
                      <div className="col-md-2">
                        {" "}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{}</h6>
                          <DetailLabels
                            isI18nKey={false}
                            text={record.requestNumber!}
                            customClassName="lbl-txt-semibold-light"
                          />{" "}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {intl.formatMessage({
            id: "LABEL.ACCOMODATION.ACCDetails",
          })}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div style={tabListStyle}>
          <button
            onClick={() => setTabInit(0)}
            style={tabInit == 0 ? activeTabStyle : TabStyle}
          >
            {intl.formatMessage({
              id: "LABEL.ACCOMODATION.DETAILS",
            })}
          </button>
          <button
            onClick={() => setTabInit(1)}
            style={tabInit == 1 ? activeTabStyle : TabStyle}
          >
            {" "}
            {intl.formatMessage({
              id: "LABEL.ACCOMODATION.HOSTORY",
            })}
            {history.length > 0 && (
              <Badge
                bg="secondary"
                className="ms-2"
                style={{ borderRadius: "50%" }}
              >
                {history.length}
              </Badge>
            )}
          </button>
        </div>
        <div style={{ display: tabInit === 0 ? "block" : "none" }}>
          {tabInit === 0 && <>{renderDetailsTab()}</>}
        </div>
        <div style={{ display: tabInit === 1 ? "block" : "none" }}>
          {tabInit === 1 && <>{renderHistoryTab()}</>}
        </div>
      </Modal.Body>

      <Modal.Footer>
        {/* {onEdit && (
          <Button variant="primary" onClick={() => onEdit(accommodation)}>
            <i className="fas fa-edit me-2"></i>
            Edit
          </Button>
        )} */}

        <button
          type="button"
          onClick={onHide}
          className="btn MOD_btn btn-cancel w-10 pl-5 mx-3"
        >
          <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
        </button>
      </Modal.Footer>

      <style>{`
        .timeline {
          position: relative;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }

        .timeline-marker {
          position: absolute;
          left: -22px;
          top: 8px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
        }

        .timeline-content {
          margin-left: 20px;
        }
      `}</style>
    </Modal>
  );
};

export default AccommodationDetails;
