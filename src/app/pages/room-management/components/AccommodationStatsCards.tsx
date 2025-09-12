import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { AccommodationStatsModel } from '../../../models/accommodation/accommodationModels';

interface AccommodationStatsCardsProps {
  stats: AccommodationStatsModel | null;
}

const AccommodationStatsCards: React.FC<AccommodationStatsCardsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Row className="mb-6">
        <Col>
          <div className="text-center text-muted">
            <i className="fas fa-spinner fa-spin"></i> Loading statistics...
          </div>
        </Col>
      </Row>
    );
  }

  const statsCards = [
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: 'fas fa-home',
      color: 'primary',
      description: 'Total accommodations'
    },
    {
      title: 'Available',
      value: stats.availableRooms,
      icon: 'fas fa-check-circle',
      color: 'success',
      description: 'Ready for booking'
    },
    {
      title: 'Occupied',
      value: stats.occupiedRooms,
      icon: 'fas fa-user',
      color: 'info',
      description: 'Currently in use'
    },
    {
      title: 'Reserved',
      value: stats.reservedRooms,
      icon: 'fas fa-clock',
      color: 'warning',
      description: 'Pending occupancy'
    },
    {
      title: 'Blocked',
      value: stats.blockedRooms,
      icon: 'fas fa-ban',
      color: 'danger',
      description: 'Maintenance/blocked'
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate.toFixed(1)}%`,
      icon: 'fas fa-chart-pie',
      color: 'dark',
      description: 'Current utilization'
    }
  ];

  return (
    <Row className="g-5 g-xl-8 mb-6">
      {statsCards.map((stat, index) => (
        <Col key={index} xxl={2} xl={4} md={6}>
          <Card className={`bg-light-${stat.color} hoverable card-xl-stretch`}>
            <Card.Body className="text-center">
              <div className={`text-${stat.color} mb-3`}>
                <i className={`${stat.icon} fs-2x`}></i>
              </div>
              <div className={`text-${stat.color} fw-bolder fs-2x mb-2`}>
                {stat.value}
              </div>
              <div className="fw-bold text-gray-800 fs-7 mb-1">
                {stat.title}
              </div>
              <div className="text-gray-600 fs-8">
                {stat.description}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AccommodationStatsCards;
