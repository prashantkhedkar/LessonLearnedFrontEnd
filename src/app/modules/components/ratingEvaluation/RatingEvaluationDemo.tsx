import React from 'react';
import RatingEvaluation from './RatingEvaluation';

// Example usage of the RatingEvaluation component
const RatingEvaluationDemo: React.FC = () => {
  // Custom rating data example
  const customRatings = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 3 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* Default rating data */}
      <RatingEvaluation />
      
      {/* With custom title and data */}
      <RatingEvaluation 
        title="تقييم المنتج"
        ratings={customRatings}
      />
      
      {/* With custom styling */}
      <RatingEvaluation 
        title="تقييم الخدمة"
        className="custom-rating-style"
        ratings={[
          { stars: 5, percentage: 90 },
          { stars: 4, percentage: 8 },
          { stars: 3, percentage: 2 },
          { stars: 2, percentage: 0 },
          { stars: 1, percentage: 0 },
        ]}
      />
    </div>
  );
};

export default RatingEvaluationDemo;
