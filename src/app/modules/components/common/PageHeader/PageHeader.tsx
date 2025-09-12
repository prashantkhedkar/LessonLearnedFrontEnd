import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subject?: string;
  type?: string;
  level?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subject,
  type,
  level,
  showBackButton = true,
  onBack
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="page-header-container">
      <div className="page-header-content">
        <div className="page-header-text">
          <div className="header-top">
            <h2 className="page-header-title">
              <span className="label">العنوان:</span>
              <span className="value">{title}</span>
            </h2>
            {showBackButton && (
              <button className="back-button" onClick={handleBack}>
                 <i className="fas fa-chevron-left"></i>
                <span>رجوع</span>
               
              </button>
            )}
          </div>
          <div className="page-header-meta">
            {subject && (
              <div className="meta-item">
                <span className="meta-label">الموضوع:</span>
                <span className="meta-value">{subject}</span>
              </div>
            )}
            {type && (
              <div className="meta-item">
                <span className="meta-label">النوع:</span>
                <span className="meta-value">{type}</span>
              </div>
            )}
            {level && (
              <div className="meta-item">
                <span className="meta-label">المستوى:</span>
                <span className="meta-value">{level}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
