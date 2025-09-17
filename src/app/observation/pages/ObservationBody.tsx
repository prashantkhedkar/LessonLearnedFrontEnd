import React from 'react';
import { useLang } from '../../../_metronic/i18n/Metronici18n';
import ContentSection from '../../modules/components/common/ContentSection/ContentSection';
interface ObservationBodyProps {
  values: {
    discussion: string;
    conclusion: string;
    initialRecommendation: string;
  };
}

const ObservationBody: React.FC<ObservationBodyProps> = ({ values }) => {

  const lang = useLang();
  const sections = [
    {
      label: 'المناقشة',
      value: values.discussion,
    },
    {
      label: 'الخاتمة',
      value: values.conclusion,
    },
    {
      label: 'التواصي',
      value: values.initialRecommendation,
    },
  ];

  return (
    <>
    <div className="article-form rtl-form">
      {sections.map((section, idx) => (
        <div className="bg-light p-3 mb-3 rounded" key={idx}>
          {/* <div className="fw-bold mb-2">{section.label}</div>
          <div className="text-muted">{section.value}</div> */}
              
       <ContentSection 
            title={section.label}
            content={section.value}
          />
        </div>
      ))}
    </div>
    </>
  );
};

export default ObservationBody;
