import React from 'react';
import './ContentSection.css';
import { InfoLabels } from '../formsLabels/detailLabels';

interface ContentSectionProps {
  title: string;
  content: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  content
}) => {
  return (
    <div className="content-section">
      <div className="content-section-container">
        <div className="content-section-title">
          {/* <span className="title-label">{title}</span> */}
           <InfoLabels
                          style={{}}
                          text={title}
                          isRequired={false}
                        />
        </div>
        <div className="content-section-body">
         <InfoLabels
                          style={{}}
                          text={content}
                          isRequired={false}
                        />
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
