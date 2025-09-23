import React, { useState } from 'react'
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
  const intl = useIntl()
  const lang = useLang()

  // Debug logging
  console.log('RecommendationDetails rendered with:', {
    recommendation,
    recommendationId,
    onEditClick: !!onEditClick,
    onDeleteClick: !!onDeleteClick,
    text: text.substring(0, 50) + '...'
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
                          // onClick={() => handleEditAction(action.id)}
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
    </>
  );
}

export default RecommendationDetails