import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ObservationDetailWidget.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ObservationFormData } from '../../../../observation/components/ObservationForm';
import { DetailLabels, DetailLabelsWhite, LabelTitleSemibold1White } from '../formsLabels/detailLabels';
import { useIntl } from 'react-intl';

interface PageHeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
  observationData?: ObservationFormData; // New prop for observation form data
}

const ObservationDetailWidget: React.FC<PageHeaderProps> = ({
  showBackButton = true,
  onBack,
  observationData
}) => {
  const navigate = useNavigate();
 const intl = useIntl();
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Use observationData for all display values
  const displayTitle = observationData?.observationTitle || 'No Title Available';
  const displaySubject = observationData?.observationSubject;
  const displayType = observationData?.observationType; // This is a number, might need lookup for display
  const displayLevel = observationData?.level; 
  const combatFunction=observationData?.combatFunction; // This is a number, might need lookup for display

  return (
    <div className="page-header-container">
      <div className="page-header-content">
        <div className="page-header-text">
          <div className="header-top">
            <h2 className="page-header-title">
              <DetailLabelsWhite text={intl.formatMessage({ id: "LABEL.OBSERVATION.TITLE" })} isRequired={false} isI18nKey={true} />
              
               <LabelTitleSemibold1White text={displayTitle} isRequired={false} isI18nKey={false} />
            </h2>
            {showBackButton && (
              <button className="back-button" onClick={handleBack}>
                 <ArrowForwardIcon fontSize='small' />
                <span>رجوع</span>
               
              </button>
            )}
          </div>
          <div className="page-header-meta">
            {displaySubject && (
              <div className="meta-item">
                <DetailLabelsWhite text={intl.formatMessage({ id: "LABEL.OBSERVATION.SUBJECT" })} isRequired={false} isI18nKey={false} />
                 
                 <LabelTitleSemibold1White text={displaySubject} isRequired={false} isI18nKey={false} />
              </div>
            )}
            <div className='row' >
              <div className="col-md-4">
                {displayType && (
                  <div className="meta-item">
                    <DetailLabelsWhite text={intl.formatMessage({ id: "LABEL.OBSERVATION.TYPE" })} isRequired={false} isI18nKey={false} />
                   
                    <LabelTitleSemibold1White text={displayType.toString()} isRequired={false} isI18nKey={false} />
                   
                  </div>
                )}
              </div>
              <div className="col-md-4">
                {displayLevel && (
                  <div className="meta-item">
                    <DetailLabelsWhite text={intl.formatMessage({ id: "LABEL.OBSERVATION.LEVEL" })} isRequired={false} isI18nKey={false} />
                    <LabelTitleSemibold1White text={displayLevel.toString()} isRequired={false} isI18nKey={false} />
                   
                  </div>
                )}
              </div>
               <div className="col-md-4">
                {combatFunction && (
                  <div className="meta-item">
                    <DetailLabelsWhite text={intl.formatMessage({ id: "LABEL.COMBOT_FUNCTION" })} isRequired={false} isI18nKey={false} />
                    
                     <LabelTitleSemibold1White text={combatFunction.toString()} isRequired={false} isI18nKey={false} />
                   
                  </div>
                )}
              </div>
            </div>
            
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationDetailWidget;
