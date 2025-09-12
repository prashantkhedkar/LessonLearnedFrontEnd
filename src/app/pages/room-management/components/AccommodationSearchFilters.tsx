import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import DropdownList from '../../../modules/components/dropdown/DropdownList';
import { MUIDatePicker } from '../../../modules/components/datePicker/MUIDatePicker';
import {
  AccommodationSearchModel,
  AccommodationLookupModel,
  AccommodationStatus,
  ACCOMMODATION_SORT_OPTIONS
} from '../../../models/accommodation/accommodationModels';

interface AccommodationSearchFiltersProps {
  searchParams: AccommodationSearchModel;
  lookupData: AccommodationLookupModel | null;
  onSearch: (params: Partial<AccommodationSearchModel>) => void;
  loading: boolean;
}

const AccommodationSearchFilters: React.FC<AccommodationSearchFiltersProps> = ({
  searchParams,
  lookupData,
  onSearch,
  loading
}) => {
  const [localFilters, setLocalFilters] = useState(searchParams);

  useEffect(() => {
    setLocalFilters(searchParams);
  }, [searchParams]);

  const handleInputChange = (field: keyof AccommodationSearchModel, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    onSearch(localFilters);
  };

  const handleReset = () => {
    const resetFilters: AccommodationSearchModel = {
      searchText: '',
      availabilityStatus: undefined,
      accommodationType: '',
      location: '',
      buildingName: '',
      bookedDateFrom: undefined,
      bookedDateTo: undefined,
      pageNumber: 1,
      pageSize: searchParams.pageSize,
      sortBy: 'createdDate',
      sortDirection: 'desc'
    };
    setLocalFilters(resetFilters);
    onSearch(resetFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container p-4 mt-5">
      <Row className="g-4">
        {/* Search Text */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Search</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by room number, type, location, or tenant..."
                value={localFilters.searchText || ''}
                onChange={(e) => handleInputChange('searchText', e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="light"
                onClick={handleSearch}
                disabled={loading}
              >
                <i className="fas fa-search"></i>
              </Button>
            </InputGroup>
          </Form.Group>
        </Col>

        {/* Status Filter */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Status</Form.Label>
            <DropdownList
              dataKey="value"
              dataValue="label"
              defaultText="All Statuses"
              value={localFilters.availabilityStatus}
              data={[
                { value: AccommodationStatus.Available, label: 'Available' },
                { value: AccommodationStatus.Occupied, label: 'Occupied' },
                { value: AccommodationStatus.Blocked, label: 'Blocked' }
              ]}
              setSelectedValue={(value) => handleInputChange('availabilityStatus', value)}
            />
          </Form.Group>
        </Col>

        {/* Type Filter */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Type</Form.Label>
            <DropdownList
              dataKey="value"
              dataValue="label"
              defaultText="All Types"
              value={localFilters.accommodationType}
              data={lookupData?.accommodationTypes.map(type => ({ value: type, label: type })) || []}
              setSelectedValue={(value) => handleInputChange('accommodationType', value)}
            />
          </Form.Group>
        </Col>

        {/* Location Filter */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Location</Form.Label>
            <DropdownList
              dataKey="value"
              dataValue="label"
              defaultText="All Locations"
              value={localFilters.location}
              data={lookupData?.locations.map(location => ({ value: location, label: location })) || []}
              setSelectedValue={(value) => handleInputChange('location', value)}
            />
          </Form.Group>
        </Col>

        {/* Building Filter */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Building</Form.Label>
            <DropdownList
              dataKey="value"
              dataValue="label"
              defaultText="All Buildings"
              value={localFilters.buildingName}
              data={lookupData?.buildings.map(building => ({ value: building, label: building })) || []}
              setSelectedValue={(value) => handleInputChange('buildingName', value)}
            />
          </Form.Group>
        </Col>

        {/* Sort By */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Sort By</Form.Label>
            <DropdownList
              dataKey="value"
              dataValue="label"
              defaultText="Select Sort Field"
              value={localFilters.sortBy}
              data={ACCOMMODATION_SORT_OPTIONS}
              setSelectedValue={(value) => handleInputChange('sortBy', value)}
            />
          </Form.Group>
        </Col>

        {/* Sort Direction */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Order</Form.Label>
            <DropdownList
              dataKey="value"
              dataValue="label"
              defaultText="Select Order"
              value={localFilters.sortDirection}
              data={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' }
              ]}
              setSelectedValue={(value) => handleInputChange('sortDirection', value)}
            />
          </Form.Group>
        </Col>

        {/* Page Size */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Per Page</Form.Label>
            <DropdownList
              dataKey="value"
              dataValue="label"
              defaultText="Select Page Size"
              value={localFilters.pageSize}
              data={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 100, label: '100' }
              ]}
              setSelectedValue={(value) => handleInputChange('pageSize', parseInt(value))}
            />
          </Form.Group>
        </Col>

        {/* Date Range */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Booked From</Form.Label>
            <MUIDatePicker
              value={localFilters.bookedDateFrom}
              onDateChange={(date) => handleInputChange('bookedDateFrom', date)}
              placeholder="Select start date"
              id="bookedDateFrom"
              key="bookedDateFrom"
            />
          </Form.Group>
        </Col>

        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">Booked To</Form.Label>
            <MUIDatePicker
              value={localFilters.bookedDateTo}
              onDateChange={(date) => handleInputChange('bookedDateTo', date)}
              placeholder="Select end date"
              id="bookedDateTo"
              key="bookedDateTo"
            />
          </Form.Group>
        </Col>

        {/* Action Buttons */}
        <Col md={6} lg={3}>
          <Form.Group>
            <Form.Label className="fs-6 fw-bold">&nbsp;</Form.Label>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={loading}
                className="btn-sm flex-fill"
              >
                {loading && <i className="fas fa-spinner fa-spin me-2"></i>}
                Search
              </Button>
              <Button
                variant="light"
                onClick={handleReset}
                disabled={loading}
                className="btn-sm flex-fill"
              >
                Reset
              </Button>
            </div>
          </Form.Group>
        </Col>

        {/* Spacer column to maintain grid alignment */}
        <Col md={6} lg={3}>
        </Col>
      </Row>
    </div>
  );
};

export default AccommodationSearchFilters;
