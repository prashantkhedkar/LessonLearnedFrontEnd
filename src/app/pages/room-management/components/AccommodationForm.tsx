import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import {
  AccommodationModel,
  AccommodationStatus,
  AccommodationType,
  AccommodationCreateUpdateModel,
} from "../../../models/accommodation/accommodationModels";
import { MUIDatePicker } from "../../../modules/components/datePicker/MUIDatePicker";
import { GlobalLabel } from "../../../modules/components/common/label/LabelCategory";
import DropdownListInModal from "../../../modules/components/dropdown/DropdownListInModal";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
} from "../../../modules/components/common/formsLabels/detailLabels";
import { ILookup } from "../../../models/global/globalGeneric";
import { useAppDispatch } from "../../../../store";
import { GetLookupValues } from "../../../modules/services/adminSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { writeToBrowserConsole } from "../../../modules/utils/common";

interface AccommodationFormProps {
  show: boolean;
  onHide: () => void;
  accommodation?: AccommodationModel | null;
  onSave: (accommodation: AccommodationCreateUpdateModel) => Promise<void>;
  loading: boolean;
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({
  show,
  onHide,
  accommodation,
  onSave,
  loading,
}) => {
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<AccommodationCreateUpdateModel>({
    accommodationType: "", // Start with empty string instead of "Single"
    location: "",
    availabilityStatus: undefined, // Start with undefined instead of AccommodationStatus.Available
    roomCapacity: 1,
    remarks: "",
    roomName: "", // Updated from roomNumber to roomName
    buildingName: "",
    floorNumber: "",
    roomSize: 0,
    availabilityStartDate: new Date(), // New required field
    availabilityEndDate: undefined, // New optional field
    unitId: 0,
    availabilityStatusId: 0,
    accommodationTypeId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [accommodationType, setAccommodationType] = useState<ILookup[]>([]);
  const [roomAvailabilityStatus, setRoomAvailabilityStatus] = useState<
    ILookup[]
  >([]);

  const isEditMode = !!accommodation;

  // Function to scroll to top of modal body
  const scrollToTop = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (show && accommodation) {
      // Populate form with existing accommodation data
      setFormData({
        roomName: accommodation.roomName, // Updated from roomNumber to roomName
        accommodationType: accommodation.accommodationType,
        location: accommodation.location,
        buildingName: accommodation.buildingName || "",
        roomCapacity: accommodation.roomCapacity,
        availabilityStartDate:
          accommodation.availabilityStartDate || new Date(), // New field
        availabilityEndDate: accommodation.availabilityEndDate, // New field
        remarks: accommodation.remarks || "",
        availabilityStatus: accommodation.availabilityStatus,
        unitId: accommodation.unitId,
        availabilityStatusId: accommodation.availabilityStatusId,
        accommodationTypeId: accommodation.accommodationTypeId,
      });
    } else if (show && !accommodation) {
      // Reset form for new accommodation
      setFormData({
        accommodationType: "", // Start with empty string instead of "Single"
        location: "",
        availabilityStatus: undefined, // Start with undefined instead of AccommodationStatus.Available
        roomCapacity: 1,
        remarks: "",
        roomName: "", // Updated from roomNumber to roomName
        buildingName: "",
        floorNumber: "",
        roomSize: 0,
        availabilityStartDate: new Date(), // New required field
        availabilityEndDate: undefined, // New optional field
        unitId: 0,
        availabilityStatusId: 0,
        accommodationTypeId: 0,
      });
    }
    setErrors({});
    setSubmitError("");
  }, [show, accommodation]);

  // Load lookup values when component mounts or modal opens
  useEffect(() => {
    if (show) {
      // Load Accommodation Types
      dispatch(GetLookupValues({ lookupType: "AccommodationType" }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const response: ILookup[] = originalPromiseResult.data;
            setAccommodationType(response);
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });

      // Load Availability Status options
      dispatch(GetLookupValues({ lookupType: "AccommodationStatus" }))
        .then(unwrapResult)
        .then((originalPromiseResult) => {
          if (originalPromiseResult.statusCode === 200) {
            const response: ILookup[] = originalPromiseResult.data;
            setRoomAvailabilityStatus(response);
          }
        })
        .catch((rejectedValueOrSerializedError) => {
          writeToBrowserConsole(rejectedValueOrSerializedError);
        });
    }
  }, [show, dispatch]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validations as per your specifications
    // Skip room name validation in edit mode since it can't be changed
    if (!isEditMode) {
      if (!formData.roomName.trim()) {
        newErrors.roomName = intl.formatMessage({
          id: "LABEL.ACCOMODATION.ROOMNAME.REQUIRED",
        });
      } else if (formData.roomName.length < 2) {
        newErrors.roomName = intl.formatMessage({
          id: "LABEL.ACCOMODATION.ROOMNAME.LENGTHREQUIRED",
        });
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = intl.formatMessage({
        id: "LABEL.ACCOMODATION.ACCOMODATIONLOCATION.REQUIRED",
      });
    }

    // Accommodation Type validation
    if (!formData.accommodationTypeId && formData.accommodationTypeId == 0) {
      newErrors.accommodationTypeId = intl.formatMessage({
        id: "LABEL.ACCOMODATION.ACCOMODATIONTYPE.REQUIRED",
      });
    }

    // Availability Status validation
    if (
      formData.availabilityStatusId === undefined ||
      formData.availabilityStatusId === null ||
      formData.availabilityStatusId === 0
    ) {
      newErrors.availabilityStatusId = intl.formatMessage({
        id: "LABEL.ACCOMODATION.AVABILITYSTATUS.REQUIRED",
      });
    }

    // Room Capacity validation - must be greater than 0
    if (formData.roomCapacity < 1) {
      newErrors.roomCapacity = intl.formatMessage({
        id: "LABEL.ACCOMODATION.ROOMCAPACITY.REQUIRED",
      });
    }

    // If Accommodation Type is Shared, Room Capacity must be at least 2
    if (formData.accommodationTypeId === 27 && formData.roomCapacity < 2) {
      newErrors.roomCapacity = intl.formatMessage({
        id: "LABEL.ACCOMODATION.ROOMCAPACITY.SHAREDREQUIRED",
      });
    }

    // Availability Start Date must not be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    const startDate = new Date(formData.availabilityStartDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      newErrors.availabilityStartDate = intl.formatMessage({
        id: "LABEL.ACCOMODATION.AVAIBILITYSTARTDATE.REQUIRED",
      });
    }

    // // Email validation for contact email
    // if (formData.contactEmail && formData.contactEmail.trim()) {
    //   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailPattern.test(formData.contactEmail)) {
    //     newErrors.contactEmail = 'Please enter a valid email address';
    //   }
    // }

    // // Phone validation for contact phone
    // if (formData.contactPhone && formData.contactPhone.trim()) {
    //   const phonePattern = /^[\+]?[0-9\-\s\(\)]{7,20}$/;
    //   if (!phonePattern.test(formData.contactPhone)) {
    //     newErrors.contactPhone = 'Please enter a valid phone number';
    //   }
    // }

    // Room size validation
    // if (formData.roomSize && formData.roomSize < 0) {
    //   newErrors.roomSize = "Room size cannot be negative";
    // }

    // Room name format validation (alphanumeric with hyphens and underscores)
    // Skip pattern validation in edit mode since room name can't be changed
    if (!isEditMode) {
      const roomNamePattern = /^[A-Za-z0-9\-_]+$/;
      if (formData.roomName && !roomNamePattern.test(formData.roomName)) {
        newErrors.roomName = intl.formatMessage({
          id: "LABEL.ACCOMODATION.ROOMNAME.EXPREQUIRED",
        });
      }
    }

    setErrors(newErrors);

    // Scroll to top if there are validation errors
    if (Object.keys(newErrors).length > 0) {
      scrollToTop();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && accommodation) {
        // For updates, include the ID
        const updateRequest = {
          accommodationId: accommodation.accommodationId,
          ...formData,
        };
        await onSave(updateRequest as any);
      } else {
        await onSave(formData);
      }
      onHide();
    } catch (error: any) {
      setSubmitError(
        error.message ||
          intl.formatMessage({
            id: "MESSAGE.ERROR.MESSAGE",
          })
      );
    }
  };

  const handleClose = () => {
    if (!loading) {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode
            ? intl.formatMessage({ id: "LABEL.ACCOMODATION.EDITACCOMODATION" })
            : intl.formatMessage({ id: "LABEL.ACCOMODATION.ADDACCOMODATION" })}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body
          ref={modalBodyRef}
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {submitError && (
            <Alert variant="danger" className="mb-4">
              {submitError}
            </Alert>
          )}
          {/* {JSON.stringify(formData)} */}

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
                required
                value={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.ROOMNAME",
                })}
              />
            </Col>
            <Col md={4}>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={formData.roomName}
                  maxLength={50}
                  onChange={(e) =>
                    handleInputChange("roomName", e.target.value)
                  }
                  placeholder="e.g., A-101, B-205"
                  // isInvalid={!!errors.roomName}
                  disabled={isEditMode}
                  style={
                    isEditMode
                      ? { backgroundColor: "#f8f9fa", cursor: "not-allowed" }
                      : {}
                  }
                />
                {errors.roomName && (
                  <div className="invalid-feedback d-block">
                    {errors.roomName}
                  </div>
                )}
                {/* <Form.Control.Feedback type="invalid">
                  {errors.roomName}
                </Form.Control.Feedback> */}
              </div>
            </Col>

            {/* Accommodation Type */}
            <Col md={2}>
              <GlobalLabel
                required
                value={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.ACCOMODATIONTYPE",
                })}
              />
            </Col>
            <Col md={4}>
              <DropdownListInModal
                data={accommodationType}
                dataKey="lookupId"
                dataValue="lookupName"
                value={formData.accommodationTypeId || 0}
                defaultText={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.ACCOMODATIONTYPE.PH",
                })}
                width={300}
                onChangeFunction={(value: string) =>
                  handleInputChange("accommodationTypeId", parseInt(value))
                }
                isClearable={false}
              />
              {errors.accommodationTypeId && (
                <div className="invalid-feedback d-block">
                  {errors.accommodationTypeId}
                </div>
              )}
            </Col>
          </Row>

          <Row className="mb-4 px-4">
            {/* Location */}
            <Col md={2}>
              <GlobalLabel
                required
                value={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.ACCOMODATIONLOCATION",
                })}
              />
            </Col>
            <Col md={4}>
              <Form.Control
                type="text"
                value={formData.location}
                maxLength={200}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.ACCOMODATIONLOCATION.PH",
                })}
                // isInvalid={!!errors.location}
              />
              {errors.location && (
                <div className="invalid-feedback d-block">
                  {errors.location}
                </div>
              )}
              {/* <Form.Control.Feedback type="invalid">
                {errors.location}
              </Form.Control.Feedback> */}
            </Col>

            {/* Availability Status */}
            <Col md={2}>
              <GlobalLabel
                required
                value={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.AVABILITYSTATUS",
                })}
              />
            </Col>
            <Col md={4}>
              <DropdownListInModal
                data={roomAvailabilityStatus}
                dataKey="lookupId"
                dataValue="lookupName"
                value={formData.availabilityStatusId}
                defaultText={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.AVABILITYSTATUS.PH",
                })}
                width={300}
                onChangeFunction={(value: string) =>
                  handleInputChange("availabilityStatusId", parseInt(value))
                }
                isClearable={false}
              />
              {errors.availabilityStatusId && (
                <div className="invalid-feedback d-block">
                  {errors.availabilityStatusId}
                </div>
              )}
            </Col>
          </Row>

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

          <Row className="mb-3 px-2">
            {/* Building Name */}
            <Col md={2}>
              <GlobalLabel
                value={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.BUILDINGADDRESS",
                })}
              />
            </Col>
            <Col md={4}>
              <Form.Control
                type="text"
                value={formData.buildingName}
                maxLength={100}
                onChange={(e) =>
                  handleInputChange("buildingName", e.target.value)
                }
                placeholder={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.BUILDINGADDRESS.PH",
                })}
              />
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
              <Form.Control
                type="number"
                min="1"
                max="10"
                value={formData.roomCapacity}
                onChange={(e) =>
                  handleInputChange(
                    "roomCapacity",
                    parseInt(e.target.value) || 1
                  )
                }
                // isInvalid={!!errors.roomCapacity}
              />
              {errors.roomCapacity && (
                <div className="invalid-feedback d-block">
                  {errors.roomCapacity}
                </div>
              )}

              <Form.Text className="text-muted">
                {formData.accommodationTypeId === 27
                  ? intl.formatMessage({
                      id: "LABEL.ACCOMODATION.ROOMCAPACITY.VALIDATION1",
                    })
                  : intl.formatMessage({
                      id: "LABEL.ACCOMODATION.ROOMCAPACITY.VALIDATION2",
                    })}
              </Form.Text>
            </Col>
          </Row>

          {/* Availability Dates */}
          <div className="d-flex align-items-center mb-4 mt-5">
            <div className="flex-grow-1">
              <hr
                className="my-0"
                style={{ borderTop: "2px solid #fd7e14", opacity: 0.3 }}
              />
            </div>
            <h6 className="mb-0 mx-3 text-warning fw-bold">
              <i className="fas fa-calendar-alt me-2"></i>

              {intl.formatMessage({
                id: "LABEL.ACCOMODATION.AVAIBILITY",
              })}
            </h6>
            <div className="flex-grow-1">
              <hr
                className="my-0"
                style={{ borderTop: "2px solid #fd7e14", opacity: 0.3 }}
              />
            </div>
          </div>

          <Row className="mb-4 px-4">
            {/* Availability Start Date */}
            <Col md={2}>
              <GlobalLabel
                required
                value={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.AVAIBILITYSTARTDATE",
                })}
              />
            </Col>
            <Col md={4}>
              <MUIDatePicker
                placeholder="Select start date"
                value={formData.availabilityStartDate}
                onDateChange={(newDate: Date) =>
                  handleInputChange(
                    "availabilityStartDate",
                    newDate || new Date()
                  )
                }
                id="availabilityStartDate"
                key="availabilityStartDate"
                disablePast={true}
              />
              {errors.availabilityStartDate && (
                <div className="invalid-feedback d-block">
                  {errors.availabilityStartDate}
                </div>
              )}
              <Form.Text className="text-muted">
                {intl.formatMessage({
                  id: "LABEL.ACCOMODATION.AVAIBILITYSTARTDATEHELP",
                })}
              </Form.Text>
            </Col>

            {/* Availability End Date */}
            <Col md={2}>
              <GlobalLabel
                value={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.AVAIBILITYENDDATE",
                })}
              />
            </Col>
            <Col md={4}>
              <MUIDatePicker
                placeholder={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.AVAIBILITYENDDATE.PH",
                })}
                value={formData.availabilityEndDate}
                onDateChange={(newDate: Date) =>
                  handleInputChange("availabilityEndDate", newDate)
                }
                id="availabilityEndDate"
                key="availabilityEndDate"
              />
              {/* <Form.Text className="text-muted">
                {intl.formatMessage({
                  id: "LABEL.ACCOMODATION.AVAIBILITYENDDATEHELP",
                })}
              </Form.Text> */}
            </Col>
          </Row>

          {/* Additional Notes */}
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
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.remarks}
                maxLength={700}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder={intl.formatMessage({
                  id: "LABEL.ACCOMODATION.REMARK.PH",
                })}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="">
          <button
            type="submit"
            disabled={loading}
            className="btn MOD_btn btn-create w-10 pl-5 mx-3"
          >
            {loading && (
              <Spinner animation="border" size="sm" className="me-2" />
            )}
            <BtnLabeltxtMedium2
              text={
                isEditMode
                  ? intl.formatMessage({
                      id: "LABEL.UPDATE",
                    })
                  : intl.formatMessage({
                      id: "LABEL.CREATE",
                    })
              }
            />
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="btn MOD_btn btn-cancel w-10 pl-5 mx-3"
          >
            <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AccommodationForm;
