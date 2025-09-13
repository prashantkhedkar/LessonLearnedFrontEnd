import React from 'react';
import { useIntl } from "react-intl";
import { ObservationSteppers } from '../components/ObervationSteppers';
import './ObservationPage.css';

// Import the new ComponentShowcase component
import ComponentShowcase from '../../modules/components/ComponentShowcase/ComponentShowcase';

const ObservationPage: React.FC = () => {
  const intl = useIntl();

  return (
    <div className="container-fluid observation-page-container">
      <div className="card observation-page-card">
        <div className="card-body observation-page-card-body">
          
          {/* Component Showcase Section */}
          {/* <ComponentShowcase 
            title={intl.formatMessage({ id: "PAGE.TITLE.OBSERVATION" })}
            showPageHeader={true}
            enableInteractivity={true}
          /> */}

          {/* Original Observation Steppers */}
          {/* <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">{intl.formatMessage({ id: "LABEL.OBSERVATION.PROCESS" })}</h5>
            </div>
            <div className="card-body"> */}
              <ObservationSteppers />
            {/* </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ObservationPage;
