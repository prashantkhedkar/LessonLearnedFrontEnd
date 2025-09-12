import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
  ValidateFeedbackLink,
  GetFeedbackByRequestId,
  SubmitFeedback,
  clearFeedbackError,
  resetFeedbackState,
} from "../../../modules/services/feedbackSlice";
import {
  ServiceFeedbackFormModel,
  FeedbackStatus,
} from "../../../models/global/feedbackModel";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
  DetailLabels,
  HeaderLabels,
} from "../../../modules/components/common/formsLabels/detailLabels";
import { GlobalLabel } from "../../../modules/components/common/label/LabelCategory";
import { useIntl } from "react-intl";

interface ServiceFeedbackFormProps {
  show?: boolean;
  onHide?: () => void;

  serviceFeedbackFormModel: ServiceFeedbackFormModel;
}

const ServiceFeedbackForm: React.FC<ServiceFeedbackFormProps> = ({
  show = true,
  onHide= (isReload: any) => Promise<void>,
  serviceFeedbackFormModel: serviceFeedbackFormModel,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const intl = useIntl();
  // Handle modal close
  const handleClose = () => {
    if (onHide) {
      if (serviceFeedbackFormModel && serviceFeedbackFormModel.feedbackStatus > 0)
      {
         onHide(false);
      }
      else {
         onHide(true);
      }
     
    } else {
      // Fallback: navigate away if no onHide provided
      navigate(-1);
    }
  };

  // Redux state
  const { feedbackData, isLoading, isSubmitting, error, linkValidation } =
    useAppSelector((state) => state.feedback);

  // Form state
  const [formData, setFormData] = useState<ServiceFeedbackFormModel>({
    requestId: 0,
    serviceName: "",
    rating: 0,
    comments: "",
    requestNumber: "",
    feedbackStatus: 0,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Clear validation errors when modal is shown/opened
  useEffect(() => {
    if (show) {
      setFormErrors({});
      setShowSuccess(false);
      // Also clear any Redux errors
      dispatch(clearFeedbackError());
    }
  }, [show, dispatch]);

  useEffect(() => {
    // Validate the feedback link on component mount
    // if (token && requestId) {
    //   dispatch(ValidateFeedbackLink({ token, requestId }));
    // } else {
    //   // Invalid URL parameters
    //   navigate('/error?message=Invalid feedback link');
    // }

    if (serviceFeedbackFormModel && serviceFeedbackFormModel.requestId! > 0) {
      setFormData({
        requestId: serviceFeedbackFormModel.requestId,
        serviceName: serviceFeedbackFormModel.serviceName!,
        rating: serviceFeedbackFormModel.rating,
        // timelinessRating: feedbackData.timelinessRating || 0,
        comments: "",
        requestNumber: serviceFeedbackFormModel.requestNumber!,
        feedbackStatus: Number(serviceFeedbackFormModel.feedbackStatus),
      });

      // If feedback is already submitted, show read-only view
      if (
        serviceFeedbackFormModel.feedbackStatus === FeedbackStatus.Submitted
      ) {
        setShowSuccess(true);
      }
    }
    // Cleanup on unmount
    return () => {
      dispatch(resetFeedbackState());
    };
  }, [serviceFeedbackFormModel, dispatch, navigate]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Validate overall rating
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = intl.formatMessage({ id: "LABEL.FEEDBACK.RATINGVALIDATION" });// "Please provide a rating between 1 and 5 stars";
    }

    // Validate comments length (optional field but with max length)
    // if (formData.comments && formData.comments.length > 500) {
    //   errors.comments = "Comments cannot exceed 500 characters";
    // }

    // Validate request ID
    // if (!formData.requestId || formData.requestId <= 0) {
    //   errors.requestId = "Valid request ID is required";
    // }

    // // Validate service name
    // if (!formData.serviceName || formData.serviceName.trim() === "") {
    //   errors.serviceName = "Service name is required";
    // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFormErrors({});

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector(
        ".fv-plugins-message-container"
      );
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    try {
      const result = await dispatch(SubmitFeedback({ formData }));

      if (SubmitFeedback.fulfilled.match(result)) {
        setShowSuccess(true);
        // Clear any errors
        dispatch(clearFeedbackError());
      } else if (SubmitFeedback.rejected.match(result)) {
        // Handle rejection case
        console.error("Feedback submission rejected:", result.error);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // You might want to set a general error state here
    }
  };

  const handleInputChange = (
    field: keyof ServiceFeedbackFormModel,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const renderStarRating = (
    value: number,
    onChange: (rating: number) => void,
    disabled: boolean = false
  ) => {
    const hasError = formErrors.rating && !disabled;
    
    return (
      <div className={`rating ${hasError ? "rating-error" : ""}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`rating-label ${disabled ? "disabled" : ""} ${
              hasError ? "error" : ""
            }`}
            onClick={() => !disabled && onChange(star)}
            style={{
              cursor: disabled ? "default" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
            title={disabled ? "" : `${intl.formatMessage({ id: "LABEL.FEEDBACK.RATE" })} ${star} ${intl.formatMessage({ id: "LABEL.FEEDBACK.RATESTAR" })}${star !== 1 ? "s" : ""}`}
          >
            <i
              className={`ki-duotone ki-star fs-2x ${
                star <= value
                  ? hasError
                    ? "text-danger"
                    : "text-warning"
                  : hasError
                  ? "text-danger opacity-25"
                  : "text-muted"
              }`}
              style={{
                transition: "all 0.2s ease",
                transform:
                  !disabled && star <= value ? "scale(1.1)" : "scale(1)",
              }}
            >
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
        ))}
        {!disabled && (
          <span className="ms-3 text-muted fs-7">
            {value > 0 ? `${value}/5` :  <>{intl.formatMessage({ id: "LABEL.FEEDBACK.CLICKTORATE" })} </>}
          </span>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title> <HeaderLabels text={"LABEL.FEEDBACK.HEADER"} /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "300px" }}
          >
            <div className="d-flex flex-column align-items-center">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="text-muted fw-semibold fs-6 mt-3">
                Loading feedback form...
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  if (showSuccess || formData.feedbackStatus === FeedbackStatus.Submitted) {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-success"> <HeaderLabels text={"LABEL.FEEDBACK.SUBMITTEDHEADER"} /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-4">
              <i className="ki-duotone ki-check-circle fs-5x text-success">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            {/* <h2 className="fw-bolder text-success mb-4">Thank You!</h2> */}
            <div className="fs-6 fw-semibold text-gray-600 mb-4">
              {intl.formatMessage({ id: "LABEL.FEEDBACK.SUCESSMESSAGE" })}
            </div>
            <div className="text-muted fw-semibold fs-6 mb-6">
              {intl.formatMessage({ id: "LABEL.FEEDBACK.SUCESSMESSAGEAPP" })}{" "}
              <span className="fw-bold text-gray-800">
                 {formData.requestNumber} 
              </span>
            </div>

            <div className="separator separator-dashed my-6"></div>

            <div className="mb-0">
              <h4 className="fs-3 fw-bold text-gray-900 mb-4">
                  {intl.formatMessage({ id: "LABEL.FEEDBACK.YOURFEEDBACK" })}
              </h4>
              <div className="row g-4">
                <div className="col-12">
                    <div className="text-center" style={{display:"inline-block"}}>
                      {renderStarRating(formData.rating, () => {}, true)}
                    </div>
                  
                </div>
                
                {formData.comments && (
                  <div className="col-12">
                    <div className="card card-dashed">
                      <div className="card-body py-3">
                        <div className="fs-6 fw-bold text-gray-700 mb-2">
                          Comments:
                        </div>
                        <div className="text-muted fs-6">
                          {formData.comments}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
          type="button"
          className="btn MOD_btn btn-cancel w-10 pl-5 mx-3"
          onClick={handleClose}
        >
          <BtnLabelCanceltxtMedium2 text={"LABEL.CLOSE"} />
        </button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title><HeaderLabels text={"LABEL.FEEDBACK.HEADER"} /></Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh" }}>
        <div className="container-fluid">
          {/* <div className="card card-flush">
            <div className="card-body pt-0"> */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center p-4 mb-6">
              <i className="ki-duotone ki-shield-tick fs-2hx text-danger me-3">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="d-flex flex-column">
                <h5 className="mb-1 text-danger">Error</h5>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            {/* Request ID - Read Only */}
            <div className="row mb-6">
              <div className="col-lg-3 col-md-4">
                <div className="fs-6 fw-semibold mt-2 mb-3">
                   <GlobalLabel value={intl.formatMessage({ id: "LABEL.REQUESTID" })}  />
                </div>
              </div>
              <div className="col-lg-9 col-md-8 fv-row">
                 <DetailLabels
                  isI18nKey={false}
                    text={formData.requestNumber}
                  customClassName="lbl-txt-semibold-1 pt-2"
                />
               
              </div>
            </div>

            {/* Service Name - Read Only */}
            <div className="row mb-6">
              <div className="col-lg-3 col-md-4">
                <div className="fs-6 fw-semibold mt-2 mb-3">
                <GlobalLabel value={intl.formatMessage({ id: "LABEL.SERVICENAME" })}  />
                </div>
              </div>
              <div className="col-lg-9 col-md-8 fv-row">
                
                 <DetailLabels
                  isI18nKey={false}
                    text={formData.serviceName}
                  customClassName="lbl-txt-semibold-1 pt-2"
                />
                {/* <div className="text-muted fs-7 mt-2">
                  Auto-filled from the original request
                </div> */}
              </div>
            </div>

            {/* Overall Rating - Star Rating */}
            <div className="row mb-6">
              <div className="col-lg-3 col-md-4">
                <div className="fs-6 fw-semibold mt-2 mb-3">
                    <GlobalLabel required value={intl.formatMessage({ id: "LABEL.FEEDBACK.OVERALLRATING" })}  />
                </div>
              </div>
              <div
                className={`col-lg-9 col-md-8 fv-row ${
                  formErrors.rating ? "fv-plugins-message-container" : ""
                }`}
              >
                <div className="mt-2">
                  {renderStarRating(formData.rating, (rating) =>
                    handleInputChange("rating", rating)
                  )}
                </div>
                <div className="text-muted fs-7 mt-2">
                    {intl.formatMessage({ id: "LABEL.FEEDBACK.RATINGMESSAGE" })}
                 
                </div>
                {formErrors.rating && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block text-danger fs-7 mt-2">
                      <span role="alert">{formErrors.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments - Text Area */}
            {/* <div className="row mb-6">
              <div className="col-lg-3 col-md-4">
                <div className="fs-6 fw-semibold mt-2 mb-3">
                  Comments / Suggestions
                </div>
              </div>
              <div
                className={`col-lg-9 col-md-8 fv-row ${
                  formErrors.comments ? "fv-plugins-message-container" : ""
                }`}
              >
                <textarea
                  className={`form-control form-control-solid ${
                    formErrors.comments ? "is-invalid" : ""
                  }`}
                  rows={4}
                  value={formData.comments}
                  onChange={(e) =>
                    handleInputChange("comments", e.target.value)
                  }
                  placeholder="Additional remarks or suggestions for improvement (optional)"
                  style={{ resize: "vertical", minHeight: "120px" }}
                  maxLength={500}
                />
                <div
                  className={`fs-7 mt-2 ${
                    (formData.comments || "").length > 450
                      ? "text-warning"
                      : (formData.comments || "").length > 480
                      ? "text-danger"
                      : "text-muted"
                  }`}
                >
                  Optional field for additional feedback. Character count:{" "}
                  {(formData.comments || "").length}/500
                </div>
                {formErrors.comments && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block text-danger fs-7 mt-2">
                      <span role="alert">{formErrors.comments}</span>
                    </div>
                  </div>
                )}
              </div>
            </div> */}

            {/* Error Summary */}
            {/* {Object.keys(formErrors).length > 0 && (
              <div className="alert alert-light-warning d-flex align-items-center p-3 mb-4">
                <i className="ki-duotone ki-information-5 fs-2hx text-warning me-3">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                <div className="d-flex flex-column">
                  <h6 className="mb-1 text-warning">
                    Please correct the following errors:
                  </h6>
                  <ul className="mb-0">
                    {Object.entries(formErrors).map(([field, error]) => (
                      <li key={field} className="text-warning fs-7">
                        <strong>
                          {field.charAt(0).toUpperCase() + field.slice(1)}:
                        </strong>{" "}
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )} */}
          </form>
          {/* </div>
          </div> */}
        </div>
      </Modal.Body>
      <Modal.Footer className="pt-4">
        <button
          type="submit"
          className="btn MOD_btn btn-create w-10 pl-5 mx-3"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          <BtnLabeltxtMedium2 text={"BUTTON.LABEL.SUBMITFEEDBACK"} />
        </button>
        <button
          type="button"
          className="btn MOD_btn btn-cancel w-10 pl-5 mx-3"
          onClick={handleClose}
        >
          <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ServiceFeedbackForm;
