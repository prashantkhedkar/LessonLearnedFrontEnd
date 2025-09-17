import React from 'react';
import './ContentSection.css';
import { InfoLabels, LabelTextSemibold2 } from "../formsLabels/detailLabels";

interface ContentSectionProps {
  title: string;
  content: string;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, content }) => {
  return (
    <div className="content-section">
      <div className="content-section-container">
        <div className="content-section-title">
          {/* <span className="title-label">{title}</span> */}
          <LabelTextSemibold2 style={{}} text={title} isRequired={false} />
        </div>
        <div className="content-section-body">
          <LabelTextSemibold2 style={{}} text={content} isRequired={false} />
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
