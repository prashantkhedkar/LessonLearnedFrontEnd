// Room Management Models for React TypeScript

export interface AccommodationModel {
  accommodationId: number;
  accommodationType: string; // Single, Shared, VIP, Family
  location: string; // Building name or facility location
  availabilityStatus: string; // 1=Available, 2=Reserved, 3=Occupied, 4=Blocked
  availabilityStatusText: string;
  bookedDate?: Date;
  nextAvailableDate?: Date;
  roomCapacity: number; // Maximum number of occupants allowed
  remarks?: string; // Any notes about the room or usage status
  roomName: string; // Changed from roomNumber to roomName as per requirements
  buildingName?: string;

  availabilityStartDate?: Date; // New field - when the room becomes available
  availabilityEndDate?: Date; // New field - optional end date for availability
  unitId: number;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  updatedBy?: number;
  updatedDate?: Date;
  createdByUser?: string;
  updatedByUser?: string;
  availabilityStatusId: number;
  accommodationTypeId: number;
}

export interface AccommodationListModel {
  accommodations: AccommodationModel[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AccommodationCreateUpdateModel {
  roomName: string; // Changed from roomNumber to roomName as per requirements
  accommodationType: string;
  location: string;
  buildingName?: string;
  floorNumber?: string;
  roomSize?: number;
  roomCapacity: number;
  availabilityStartDate: Date; // New field as per requirements
  availabilityEndDate?: Date; // Optional end date
  unitId: number;
  availabilityStatus?: string;
  remarks?: string;
  availabilityStatusId: number;
  accommodationTypeId: number;
}

export interface AccommodationSearchModel {
  searchText?: string;
  availabilityStatus?: number;
  accommodationType?: string;
  location?: string;
  buildingName?: string;
  bookedDateFrom?: Date;
  bookedDateTo?: Date;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
}

export interface AccommodationBookingModel {
  bookingId: number;
  accommodationId: number;
  tenantUNumber: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  bookingStartDate: Date;
  bookingEndDate?: Date;
  bookingStatus: number; // 1=Active, 2=Completed, 3=Cancelled
  bookingStatusText: string;
  bookingRemarks?: string;
  numberOfOccupants: number;
  specialRequirements?: string;
  createdDate: Date;
  createdByName?: string;

  // Accommodation details
  roomNumber?: string;
  accommodationType?: string;
  location?: string;
}

export interface AccommodationHistoryModel {
  bookingId: number;
  room: string;
  startDate: Date;
  endDate: Date;
  bookedBy: string;
  requestNumber?: string;
  bookedDate: Date;
}

export interface AccommodationStatsModel {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  blockedRooms: number;
  occupancyRate: number;
}

export interface AccommodationLookupModel {
  accommodationTypes: string[];
  locations: string[];
  buildings: string[];
  availabilityStatuses: {
    value: number;
    text: string;
  }[];
}

// Enums for better type safety
export enum AccommodationStatus {
  Available = 27,
  Occupied = 29,
  Blocked = 28,
}

export enum BookingStatus {
  Active = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum AccommodationType {
  Single = "Single",
  Shared = "Shared",
  VIP = "VIP",
  Family = "Family",
}

// Action types for status updates
export interface BlockAccommodationRequest {
  reason: string;
}

export interface UnblockAccommodationRequest {
  reason: string;
}

// Form validation interfaces
export interface AccommodationFormErrors {
  accommodationType?: string;
  location?: string;
  roomCapacity?: string;
  roomName?: string; // Changed from roomNumber to roomName
  buildingName?: string;
  floorNumber?: string;
  roomSize?: string;
  availabilityStartDate?: string; // New validation field
  monthlyRent?: string; // New validation field
  securityDeposit?: string; // New validation field
  contactEmail?: string; // New validation field
  contactPhone?: string; // New validation field
  general?: string;
}

// API Response wrapper
export interface AccommodationApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: any;
  statusCode?: number;
}

// Table column definitions for data grid
export interface AccommodationTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, record: AccommodationModel) => React.ReactNode;
}

// Filter options for the accommodation list
export interface AccommodationFilterOptions {
  showAvailableOnly: boolean;
  showOccupiedOnly: boolean;
  showBlockedOnly: boolean;
  selectedTypes: string[];
  selectedLocations: string[];
  selectedBuildings: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

// Sort options
export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

export const ACCOMMODATION_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "roomNumber", label: "Room Number" },
  { value: "accommodationType", label: "Type" },
  { value: "location", label: "Location" },
  { value: "availabilityStatus", label: "Status" },
  { value: "createdDate", label: "Created Date" },
  { value: "bookedDate", label: "Booked Date" },
];

// Default values for forms
export const DEFAULT_ACCOMMODATION_SEARCH: AccommodationSearchModel = {
  pageNumber: 1,
  pageSize: 10,
  sortBy: "createdDate",
  sortDirection: "desc",
};

export const DEFAULT_ACCOMMODATION_FORM: AccommodationCreateUpdateModel = {
  accommodationType: "",
  location: "",
  availabilityStatus: "",
  roomCapacity: 1,
  roomName: "", // Changed from roomNumber to roomName
  availabilityStartDate: new Date(), // New required field
  unitId: 0,
  availabilityStatusId: 0,
  accommodationTypeId: 0,
};

// Helper functions
export const getStatusColor = (status: number): string => {
  switch (status) {
    case AccommodationStatus.Available:
      return "success";
    case AccommodationStatus.Occupied:
      return "info";
    case AccommodationStatus.Blocked:
      return "danger";
    default:
      return "secondary";
  }
};

export const getStatusIcon = (status: number): string => {
  switch (status) {
    case AccommodationStatus.Available:
      return "fas fa-check-circle";
    case AccommodationStatus.Occupied:
      return "fas fa-user";
    case AccommodationStatus.Blocked:
      return "fas fa-ban";
    default:
      return "fas fa-question-circle";
  }
};
