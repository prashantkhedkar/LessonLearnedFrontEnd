import React from 'react';
import './DetailLabels.css';

interface DetailLabelsProps {
  text: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export const DetailLabels: React.FC<DetailLabelsProps> = ({ text, required = false, htmlFor, className }) => {
  return (
    <label className={`detail-label ${className || ''}`} htmlFor={htmlFor}>
      {text}
      {required && <span className="required-asterisk">*</span>}
    </label>
  );
};
