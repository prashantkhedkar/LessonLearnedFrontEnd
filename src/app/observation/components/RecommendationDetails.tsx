import React, { useState } from 'react'
import Recommendation from './Recommendation'
import ActionsDisplay from './ActionsDisplay'
import dayjs from 'dayjs'
import {KTSVG} from '../../../_metronic/helpers'
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Button,
  TextField,
  Box,
  Typography
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

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ClearIcon from '@mui/icons-material/Clear';
interface RecommendationDetailsProps {
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
  const [isExpanded, setIsExpanded] = useState(false)
  const intl = useIntl()
  const lang = useLang()

  // Debug logging
  console.log('RecommendationDetails rendered with:', { 
    recommendationId, 
    onEditClick: !!onEditClick,
    onDeleteClick: !!onDeleteClick,
    text: text.substring(0, 50) + '...'
  });

  return (
    <>
      <Accordion 
        expanded={isExpanded}
        onChange={() => setIsExpanded(!isExpanded)}
        className={`mb-5 ${className}`}
        sx={{
          border: '1px solid #8c87872e',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
          '& .MuiAccordionSummary-root': {
            direction: 'rtl',
            borderBottom: '1px solid #E4E6EF',
            backgroundColor: '#ffffff'
          },
          '& .MuiAccordionDetails-root': {
            direction: 'rtl',
            padding: 0,
            backgroundColor: '#ffffff'
          }
        }}
      >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel-content"
        id="panel-header"
        className="py-2"
        sx={{
          margin: '0 !important',
          '&.MuiAccordionSummary-root': {
            margin: '0 !important',
            minHeight: '60px',
            padding: '16px',
            '&.Mui-expanded': {
              minHeight: 'unset',
            }
            
          },
          '& .MuiAccordionSummary-content': {
            margin: '0 !important',
             padding: '8px 0',
          }
        }}
      >
        <div className="w-100 d-flex justify-content-between align-items-center">
        
            <LabelTextSemibold2
              text= {`الجزء ${index}`}
            />
          <div className="d-flex align-items-center me-3" style={{ gap: '15px', borderLeft: '1px solid #E2E2E2',paddingLeft: '10px' }}>
            <EditOutlinedIcon 
              onClick={(e) => {
                e.stopPropagation(); // Prevent accordion toggle
                console.log('Edit icon clicked in RecommendationDetails', { onEditClick, recommendationId });
                if (onEditClick) {
                  onEditClick();
                }
              }}
              sx={{ 
                fontSize: 20, 
               
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }} 
            />
            <ClearIcon 
              onClick={(e) => {
                e.stopPropagation(); // Prevent accordion toggle
                console.log('Delete icon clicked in RecommendationDetails', { onDeleteClick, recommendationId });
                if (onDeleteClick) {
                  onDeleteClick();
                }
              }}
              sx={{ 
                fontSize: 20, 
                cursor: 'pointer',
                '&:hover': { color: 'error.main' }
              }} 
            />
          </div>
        </div>
      </AccordionSummary>

      <AccordionDetails>
        {/* Main Content */}
        <div className="p-4">
          
        
          {/* Actions Display Component - Only render when accordion is expanded */}
          {isExpanded && (
            <div className="mb-4">
              <ActionsDisplay 
                recommendationId={recommendationId}
              />
            </div>
          )}
         
          
        </div>
      </AccordionDetails>
    </Accordion>
    </>
  )
}

export default RecommendationDetails