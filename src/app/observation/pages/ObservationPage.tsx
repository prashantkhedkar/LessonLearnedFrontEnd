import React from 'react';
import { ObservationSteppers } from '../components/ObervationSteppers';
import './ObservationPage.css';

const ObservationPage: React.FC = () => {
  return (
    <div className="container-fluid observation-page-container">
      <div className="card observation-page-card">
        <div className="card-body observation-page-card-body">
          <ObservationSteppers />
        </div>
      </div>
    </div>
  );
};

export default ObservationPage;
