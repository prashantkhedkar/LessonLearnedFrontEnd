import React from 'react';
import './ContentSection.css';

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
      <div className="content-section-title">
        {title}
      </div>
      <div className="content-section-body">
        {content}
      </div>
    </div>
  );
};

export default ContentSection;

