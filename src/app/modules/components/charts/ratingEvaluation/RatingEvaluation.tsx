import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import './RatingEvaluation.css';

interface RatingData {
  stars: number;
  percentage: number;
}

interface RatingEvaluationProps {
  title?: string;
  ratings?: RatingData[];
  className?: string;
}

const defaultRatings: RatingData[] = [
  { stars: 5, percentage: 62 },
  { stars: 4, percentage: 31 },
  { stars: 3, percentage: 25 },
  { stars: 2, percentage: 10 },
  { stars: 1, percentage: 0 },
];

const RatingEvaluation: React.FC<RatingEvaluationProps> = ({
  title = "تصنيف التقييم",
  ratings = defaultRatings,
  className = ""
}) => {
  const renderStars = (totalStars: number, filledStars: number) => {
    const stars: JSX.Element[] = [];
    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i <= filledStars ? 'star-filled' : 'star-empty'}
        />
      );
    }
    return stars;
  };

  return (
    <div className={`rating-evaluation-container ${className}`}>
      <div className="card">
        <div className="card-header">
          <div className="rating-header">
            <h3 className="rating-title">{title}</h3>
          </div>
        </div>
        
        <div className="card-body">
          <div className="rating-content">
            {ratings.map((rating, index) => (
              <div key={index} className="rating-row">
               
                <div className="percentage-container">
                  <span className="percentage-text">% {rating.percentage}</span>
                </div>
                 <div className="stars-container">
                  {renderStars(5, rating.stars)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingEvaluation;
