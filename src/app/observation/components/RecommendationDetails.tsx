import React, { useState, useCallback, useMemo, useEffect } from 'react'
import Recommendation from './Recommendation'
import ActionsDisplay from './ActionsDisplay'
import dayjs from 'dayjs'
import { KTSVG } from '../../../_metronic/helpers'
import { IRecommendation } from '../../models/recommendation/recommendation.model'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Box,
  Typography,
  IconButton
} from '@mui/material'
import { useIntl } from "react-intl"
import { useLang } from "../../../_metronic/i18n/Metronici18n"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import { HeaderLabels, LabelTextSemibold2 } from '../../modules/components/common/formsLabels/detailLabels'
import CardHeaderSubLabel from '../../modules/components/common/CardHeaderLabel/cardHeaderSubLabel';
import AccessTimeSharpIcon from '@mui/icons-material/AccessTimeSharp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import './RecommendationDetails.css'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ClearIcon from '@mui/icons-material/Clear';
import RecommendationActionsModal from './RecommendationActionsModal';
interface RecommendationDetailsProps {
  recommendation?: IRecommendation // New prop for the full recommendation object
  text: string
  timestamp?: string | Date
  status?: 'sent' | 'delivered' | 'read'
  direction?: 'rtl' | 'ltr'
  className?: string
  index?: number
  observationId?: string | number
  recommendationId?: number
  onEditClick?: () => void
  onDeleteClick?: () => void
}

const RecommendationDetails: React.FC<RecommendationDetailsProps> = ({
  recommendation,
  text,
  timestamp,
  status = 'sent',
  direction = 'rtl',
  className = '',
  index = 1,
  observationId = 1,
  recommendationId,
  onEditClick,
  onDeleteClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true) // Always expanded
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)

  // Validation states
  const [errors, setErrors] = useState({
    observationTitle: '',
    conclusion: '',
    discussion: '',
    combatFunction: '',
    level: ''
  });

  const intl = useIntl()
  const lang = useLang()

  // Action handlers for the modal
  const handleSaveAction = (action: any) => {
    console.log('Save action:', action);
    // TODO: Integrate with your API/state management
  };

  const handleUpdateAction = (actionId: number, action: any) => {
    console.log('Update action:', actionId, action);
    // TODO: Integrate with your API/state management
  };

  const handleDeleteAction = (actionId: number) => {
    console.log('Delete action:', actionId);
    // TODO: Integrate with your API/state management
  };

  // Validation functions
  const validateField = useCallback((fieldName: string, value: string | number) => {
    let error = '';

    switch (fieldName) {
      case 'observationTitle':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = intl.formatMessage({ id: 'VALIDATION.TITLE.REQUIRED' });
        } else if (typeof value === 'string' && value.length > 256) {
          error = intl.formatMessage({ id: 'VALIDATION.TITLE.MAX_LENGTH' });
        }
        break;
      case 'conclusion':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = intl.formatMessage({ id: 'VALIDATION.CONCLUSION.REQUIRED' });
        } else if (typeof value === 'string' && value.length > 1000) {
          error = 'Conclusion must be less than 1000 characters';
        }
        break;
      case 'discussion':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = intl.formatMessage({ id: 'VALIDATION.DISCUSSION.REQUIRED' });
        } else if (typeof value === 'string' && value.length > 1000) {
          error = 'Discussion must be less than 1000 characters';
        }
        break;
      case 'combatFunction':
        if (!value || value === 0) {
          error = intl.formatMessage({ id: 'VALIDATION.COMBOT_FUNCTION.REQUIRED' });
        }
        break;
      case 'level':
        if (!value || value === 0) {
          error = intl.formatMessage({ id: 'VALIDATION.LEVEL.REQUIRED' });
        }
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error === '';
  }, [intl]);

  const validateAllFields = useCallback(() => {
    if (!recommendation) return false;

    const fields = ['observationTitle', 'conclusion', 'discussion', 'combatFunction', 'level'];
    const values = {
      observationTitle: recommendation?.observationTitle || '',
      conclusion: recommendation?.conclusion || '',
      discussion: recommendation?.discussion || '',
      combatFunction: recommendation?.combatFunction || 0,
      level: recommendation?.level || 0
    };

    let isValid = true;
    const newErrors = { ...errors };

    fields.forEach(field => {
      const value = values[field as keyof typeof values];
      let error = '';

      switch (field) {
        case 'observationTitle':
          if (!value || (typeof value === 'string' && !value.trim())) {
            error = intl.formatMessage({ id: 'VALIDATION.TITLE.REQUIRED' });
          } else if (typeof value === 'string' && value.length > 256) {
            error = intl.formatMessage({ id: 'VALIDATION.TITLE.MAX_LENGTH' });
          }
          break;
        case 'conclusion':
          if (!value || (typeof value === 'string' && !value.trim())) {
            error = intl.formatMessage({ id: 'VALIDATION.CONCLUSION.REQUIRED' });
          } else if (typeof value === 'string' && value.length > 1000) {
            error = 'Conclusion must be less than 1000 characters';
          }
          break;
        case 'discussion':
          if (!value || (typeof value === 'string' && !value.trim())) {
            error = intl.formatMessage({ id: 'VALIDATION.DISCUSSION.REQUIRED' });
          } else if (typeof value === 'string' && value.length > 1000) {
            error = 'Discussion must be less than 1000 characters';
          }
          break;
        case 'combatFunction':
          if (!value || value === 0) {
            error = intl.formatMessage({ id: 'VALIDATION.COMBOT_FUNCTION.REQUIRED' });
          }
          break;
        case 'level':
          if (!value || value === 0) {
            error = intl.formatMessage({ id: 'VALIDATION.LEVEL.REQUIRED' });
          }
          break;
      }

      newErrors[field] = error;
      if (error) {
        isValid = false;
      }
    });

    // Only update errors if they actually changed
    const errorsChanged = Object.keys(newErrors).some(key => newErrors[key] !== errors[key]);
    if (errorsChanged) {
      setErrors(newErrors);
    }

    return isValid;
  }, [recommendation, intl, errors]);

  // Check if recommendation has validation errors
  const hasValidationErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== '');
  }, [errors]);

  // Validate recommendation data when component mounts or recommendation changes
  useEffect(() => {
    if (recommendation) {
      validateAllFields();
    }
  }, [recommendation, validateAllFields]);

  // Debug logging (removed getValidationStatus to prevent infinite re-renders)
  console.log('RecommendationDetails rendered with:', {
    recommendation: recommendation ? 'present' : 'missing',
    recommendationId,
    onEditClick: !!onEditClick,
    onDeleteClick: !!onDeleteClick,
    text: text.substring(0, 50) + '...',
    isActionsModalOpen: isActionsModalOpen
  });

  return (
    <>
      <Accordion
        expanded={true} // Always expanded
        className={`mb-5 ${className}`}
        sx={{
          border: "1px solid #8c87872e",
          borderRadius: "8px !important",
          overflow: "hidden",
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
          "&:before": {
            display: "none", // Remove the default divider
          },
          "& .MuiAccordionSummary-root": {
            direction: "rtl",
            borderBottom: "1px solid #E4E6EF",
            backgroundColor: "#ffffff",
            cursor: "default !important", // Remove pointer cursor
            borderTopLeftRadius: "8px !important",
            borderTopRightRadius: "8px !important",
          },
          "& .MuiAccordionDetails-root": {
            direction: "rtl",
            padding: 0,
            backgroundColor: "#ffffff",
            borderBottomLeftRadius: "8px !important",
            borderBottomRightRadius: "8px !important",
          },
        }}
      >
        <AccordionSummary
          aria-controls="panel-content"
          id="panel-header"
          className="py-2"
          sx={{
            margin: "0 !important",
            "&.MuiAccordionSummary-root": {
              margin: "0 !important",
              minHeight: "60px",
              padding: "16px",
              cursor: "default !important", // Remove pointer cursor
              "&:hover": {
                backgroundColor: "#ffffff !important", // Prevent hover effect
              },
            },
            "& .MuiAccordionSummary-content": {
              margin: "0 !important",
              padding: "8px 16px",
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
              display: "none !important", // Hide expand icon
            },
          }}
        >
          <div className="w-100 d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <LabelTextSemibold2
                text={`${index} ${recommendation?.observationTitle || text}`}
              />
              <CardHeaderSubLabel
                text={`${recommendation?.levelLookupNameAr}  |  ${recommendation?.combatFunctionLookupNameAr}`}
                numericVal=""
                style={{ marginTop: "8px" }}
              />
              {/* Validation Status Indicator */}
              {hasValidationErrors && (
                <Box sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'error.main',
                  fontSize: '0.75rem'
                }}>
                  <Typography variant="caption" color="error">
                    ⚠️ يحتوي على أخطاء في التحقق
                  </Typography>
                </Box>
              )}
            </div>
            <div
              className="d-flex align-items-center me-3"
              style={{
                gap: "25px",
              }}
            >
              <EditOutlinedIcon
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion toggle
                  console.log("Edit icon clicked in RecommendationDetails", {
                    onEditClick,
                    recommendationId,
                  });
                  if (onEditClick) {
                    onEditClick();
                  }
                }}
                sx={{
                  fontSize: 20,

                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
              />
              <ClearIcon
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion toggle
                  console.log("Delete icon clicked in RecommendationDetails", {
                    onDeleteClick,
                    recommendationId,
                  });
                  if (onDeleteClick) {
                    onDeleteClick();
                  }
                }}
                sx={{
                  fontSize: 20,
                  cursor: "pointer",
                  "&:hover": { color: "error.main" },
                }}
              />
            </div>
          </div>
        </AccordionSummary>

        <AccordionDetails>
          {/* Main Content */}
          <div className="p-4">
            {/* Actions Display Component - Always render since accordion is always expanded conclusion  discussion*/}
            <div>
              {/* <ActionsDisplay recommendationId={recommendationId} /> */}

              {/* Recommendation Details UI */}
              <div className="row g-3" style={{ direction: 'rtl' }}>
                {/* Right Column - Recommendation Details */}
                <div className="col-md-6" style={{ borderLeft: '1px solid #e5e5e5', paddingLeft: '20px' }}>
                  <div className="p-4">

                    <div className="row">
                      <div className="col-2">

                        <LabelTextSemibold2
                          text={intl.formatMessage({ id: "LABEL.Discussion" })}
                        />
                      </div>
                      <div className="col-10 text-start">
                        <div className="text-start">

                          <LabelTextSemibold2
                            text={recommendation?.discussion || ""}
                          />
                        </div>
                      </div>
                    </div>


                  </div>
                </div>

                {/* Left Column - Discussion */}
                <div className="col-md-6" style={{ paddingRight: '20px' }}>
                  <div className="p-4">

                    <div className="row">
                      <div className="col-2">
                        <LabelTextSemibold2
                          text={intl.formatMessage({ id: "LABEL.Conclusion" })}
                        />
                      </div>
                      <div className="col-10 text-start">
                        <div className="text-start">

                          <LabelTextSemibold2
                            text={recommendation?.conclusion || ""}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <Box className="action-footer mt-5">

                <div className="row mt-3" style={{ direction: 'rtl' }}>

                  <div className="col-md-6" style={{ borderLeft: '1px solid #e5e5e5', paddingLeft: '20px' }}>
                    {/* Left side - By */}
                    <Box className="action-footer-item p-4">
                      <PersonIcon className="action-footer-icon" />
                      <Typography variant="caption" className="action-footer-label">
                        بواسطة :
                      </Typography>
                      <Typography variant="caption" className="action-footer-value">
                        القوات البرية
                      </Typography>
                      <Box className="action-footer-center">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Edit action button clicked", {
                              recommendationId,
                              currentModalState: isActionsModalOpen
                            });
                            alert("Button clicked! Opening modal...");
                            setIsActionsModalOpen(true);
                            console.log("Modal state set to true");
                          }}
                          size="small"
                          className="action-footer-edit-button"
                        >
                          <EditIcon className="action-footer-edit-icon" />
                        </IconButton>
                      </Box>

                    </Box>
                  </div>
                  <div className="col-md-6" style={{ paddingRight: '20px' }}>
                    {/* Right side - Date */}
                    {/* {action.timestamp && ( */}
                    <Box className="action-footer-item p-4">

                      <Typography variant="caption" className="action-footer-label">
                        تاريخ الإجراء :
                      </Typography>
                      <CalendarTodayIcon className="action-footer-icon" />
                      <Typography variant="caption" className="action-footer-value">
                        2025/02/20
                      </Typography>
                      <AccessTimeSharpIcon className="action-footer-icon" />
                      <Typography variant="caption" className="action-footer-value">
                        1345
                      </Typography>
                    </Box>
                  </div>
                </div>
              </Box>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* Recommendation Actions Modal */}
      <RecommendationActionsModal
        open={isActionsModalOpen}
        onClose={() => setIsActionsModalOpen(false)}
        recommendationId={recommendationId}
        recommendationTitle={`إدارة إجراءات التوصية: ${recommendation?.observationTitle || text}`}
        onSaveAction={handleSaveAction}
        onUpdateAction={handleUpdateAction}
        onDeleteAction={handleDeleteAction}
      />
    </>
  );
}

export default RecommendationDetails