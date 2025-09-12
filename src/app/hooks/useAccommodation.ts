import { useState, useEffect, useCallback } from "react";
import {
  AccommodationModel,
  AccommodationListModel,
  AccommodationCreateUpdateModel,
  AccommodationSearchModel,
  AccommodationStatsModel,
  AccommodationLookupModel,
  DEFAULT_ACCOMMODATION_SEARCH,
} from "../models/accommodation/accommodationModels";
import accommodationService from "../services/accommodationService";

interface UseAccommodationState {
  // Data state
  accommodations: AccommodationModel[];
  currentAccommodation: AccommodationModel | null;
  stats: AccommodationStatsModel | null;
  lookupData: AccommodationLookupModel | null;

  // Pagination state
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;

  // Loading states
  loading: boolean;
  submitting: boolean;
  deleting: boolean;

  // Error state
  error: string | null;

  // Search parameters
  searchParams: AccommodationSearchModel;
}

interface UseAccommodationActions {
  // Data actions
  loadAccommodations: (
    params?: Partial<AccommodationSearchModel>
  ) => Promise<void>;
  loadAccommodationById: (id: number) => Promise<AccommodationModel | null>;
  createAccommodation: (
    accommodation: AccommodationCreateUpdateModel
  ) => Promise<number | null>;
  updateAccommodation: (
    id: number,
    accommodation: AccommodationCreateUpdateModel
  ) => Promise<boolean>;
  deleteAccommodation: (id: number) => Promise<boolean>;

  // Status actions
  blockAccommodation: (id: number, reason: string) => Promise<boolean>;
  unblockAccommodation: (id: number, reason: string) => Promise<boolean>;

  // Data loading actions
  loadStats: () => Promise<void>;
  loadLookupData: () => Promise<void>;

  // Utility actions
  clearError: () => void;
  resetCurrentAccommodation: () => void;
  updateSearchParams: (params: Partial<AccommodationSearchModel>) => void;

  // Validation actions
  checkRoomNumberAvailability: (
    roomNumber: string,
    excludeId?: number
  ) => Promise<boolean>;
}

export function useAccommodation(): [
  UseAccommodationState,
  UseAccommodationActions
] {
  // State
  const [state, setState] = useState<UseAccommodationState>({
    accommodations: [],
    currentAccommodation: null,
    stats: null,
    lookupData: null,
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    loading: false,
    submitting: false,
    deleting: false,
    error: null,
    searchParams: DEFAULT_ACCOMMODATION_SEARCH,
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<UseAccommodationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Load accommodations
  const loadAccommodations = useCallback(
    async (params?: Partial<AccommodationSearchModel>) => {
      try {
        updateState({ loading: true, error: null });

        const searchParams = { ...state.searchParams, ...params };
        updateState({ searchParams });

        console.log("🔄 Loading accommodations with params:", searchParams);
        const response = await accommodationService.getAccommodations(
          searchParams
        );
        console.log("📊 Accommodations API response:", response);

        if (response.success && response.data) {
          console.log("✅ Setting accommodations data:", response.data);

          // Handle the case where API returns accommodations directly as an array
          const accommodationsArray = Array.isArray(response.data)
            ? response.data
            : [];
          const totalCount = accommodationsArray.length;

          updateState({
            accommodations: accommodationsArray,
            totalCount: totalCount,
            pageNumber: searchParams.pageNumber || 1,
            pageSize: searchParams.pageSize || 10,
            totalPages: Math.ceil(totalCount / (searchParams.pageSize || 10)),
            loading: false,
          });
        } else {
          console.log("❌ Accommodations API failed:", response.message);
          updateState({
            error: response.message || "Failed to load accommodations",
            loading: false,
            accommodations: [],
            totalCount: 0,
          });
        }
      } catch (error) {
        console.error("💥 Error in loadAccommodations:", error);
        updateState({
          error: error instanceof Error ? error.message : "An error occurred",
          loading: false,
          accommodations: [],
          totalCount: 0,
        });
      }
    },
    [updateState]
  ); // Remove state.searchParams dependency to prevent infinite loops

  // Load accommodation by ID
  const loadAccommodationById = useCallback(
    async (id: number): Promise<AccommodationModel | null> => {
      try {
        updateState({ loading: true, error: null });

        const response = await accommodationService.getAccommodationById(id);

        if (response.success && response.data) {
          updateState({
            currentAccommodation: response.data,
            loading: false,
          });
          return response.data;
        } else {
          updateState({
            error: response.message || "Failed to load accommodation",
            loading: false,
          });
          return null;
        }
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : "An error occurred",
          loading: false,
        });
        return null;
      }
    },
    [updateState]
  );

  // Create accommodation
  const createAccommodation = useCallback(
    async (
      accommodation: AccommodationCreateUpdateModel
    ): Promise<number | null> => {
      try {
        updateState({ submitting: true, error: null });

        const response = await accommodationService.createAccommodation(
          accommodation
        );
        
        if (response.statusCode && response.data) {
          updateState({ submitting: false });
          // Reload accommodations to get the updated list
          await loadAccommodations();
          return 1;
        } else {
          updateState({
            error: response.message || "Failed to create accommodation",
            submitting: false,
          });
          return null;
        }
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : "An error occurred",
          submitting: false,
        });
        return null;
      }
    },
    [updateState, loadAccommodations]
  );

  // Update accommodation
  const updateAccommodation = useCallback(
    async (
      id: number,
      accommodation: AccommodationCreateUpdateModel
    ): Promise<boolean> => {
      try {
        updateState({ submitting: true, error: null });

        const response = await accommodationService.updateAccommodation(
          id,
          accommodation
        );

        if (response.statusCode && response.data) {
          updateState({ submitting: false });
          // Reload accommodations to get the updated list
          await loadAccommodations();
          return true;
        } else {
          updateState({
            error: response.message || "Failed to update accommodation",
            submitting: false,
          });
          return false;
        }
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : "An error occurred",
          submitting: false,
        });
        return false;
      }
    },
    [updateState, loadAccommodations]
  );

  // Delete accommodation
  const deleteAccommodation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        updateState({ deleting: true, error: null });

        const response = await accommodationService.deleteAccommodation(id);

        if (response.success) {
          updateState({ deleting: false });
          // Reload accommodations to get the updated list
          await loadAccommodations();
          return true;
        } else {
          updateState({
            error: response.message || "Failed to delete accommodation",
            deleting: false,
          });
          return false;
        }
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : "An error occurred",
          deleting: false,
        });
        return false;
      }
    },
    [updateState, loadAccommodations]
  );

  // Block accommodation
  const blockAccommodation = useCallback(
    async (id: number, reason: string): Promise<boolean> => {
      try {
        updateState({ submitting: true, error: null });

        const response = await accommodationService.blockAccommodation(
          id,
          reason
        );

        if (response.statusCode === 200 && response.data) {
          updateState({ submitting: false });
          // Reload accommodations to get the updated list
          await loadAccommodations();
          return true;
        } else {
          updateState({
            error: response.message || "Failed to block accommodation",
            submitting: false,
          });
          return false;
        }
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : "An error occurred",
          submitting: false,
        });
        return false;
      }
    },
    [updateState, loadAccommodations]
  );

  // Unblock accommodation
  const unblockAccommodation = useCallback(
    async (id: number, reason: string): Promise<boolean> => {
      try {
        updateState({ submitting: true, error: null });

        const response = await accommodationService.unblockAccommodation(
          id,
          reason
        );

        if (response.statusCode === 200 && response.data) {
          updateState({ submitting: false });
          // Reload accommodations to get the updated list
          await loadAccommodations();
          return true;
        } else {
          updateState({
            error: response.message || "Failed to unblock accommodation",
            submitting: false,
          });
          return false;
        }
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : "An error occurred",
          submitting: false,
        });
        return false;
      }
    },
    [updateState, loadAccommodations]
  );

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      console.log("🔄 Loading accommodation stats...");
      const response = await accommodationService.getAccommodationStats();
      console.log("📊 Stats API response:", response);

      if (response.success && response.data) {
        console.log("✅ Setting stats data:", response.data);
        updateState({ stats: response.data });
      } else {
        console.log("❌ Stats API failed:", response.message);
      }
    } catch (error) {
      console.error("💥 Failed to load accommodation stats:", error);
    }
  }, [updateState]);

  // Load lookup data
  const loadLookupData = useCallback(async () => {
    try {
      const response = await accommodationService.getLookupData();

      if (response.success && response.data) {
        updateState({ lookupData: response.data });
      }
    } catch (error) {
      console.error("Failed to load lookup data:", error);
    }
  }, [updateState]);

  // Check room number availability
  const checkRoomNumberAvailability = useCallback(
    async (roomNumber: string, excludeId?: number): Promise<boolean> => {
      try {
        const response = await accommodationService.checkRoomNumberAvailability(
          roomNumber,
          excludeId
        );

        if (response.success && response.data) {
          return response.data.isAvailable;
        }
        return false;
      } catch (error) {
        console.error("Failed to check room number availability:", error);
        return false;
      }
    },
    []
  );

  // Reset current accommodation
  const resetCurrentAccommodation = useCallback(() => {
    updateState({ currentAccommodation: null });
  }, [updateState]);

  // Update search parameters
  const updateSearchParams = useCallback(
    (params: Partial<AccommodationSearchModel>) => {
      updateState({ searchParams: { ...state.searchParams, ...params } });
    },
    [state.searchParams, updateState]
  );

  // Actions object
  const actions: UseAccommodationActions = {
    loadAccommodations,
    loadAccommodationById,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    blockAccommodation,
    unblockAccommodation,
    loadStats,
    loadLookupData,
    clearError,
    resetCurrentAccommodation,
    updateSearchParams,
    checkRoomNumberAvailability,
  };

  // Load initial data only once
  useEffect(() => {
    loadLookupData();
  }, [loadLookupData]);

  return [state, actions];
}

export default useAccommodation;
