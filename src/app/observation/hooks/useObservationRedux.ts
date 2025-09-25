import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchObservations,
  fetchAllObservations,
  fetchObservationById,
  createObservation,
  updateObservation,
  deleteObservation,
  submitObservation,
  updateObservationStatus,
  cancelObservation,
  archiveObservation,
  fetchObservationStats,
  fetchObservationLookupData,
  checkObservationTitleAvailability,
  clearError,
  setCurrentObservation,
  clearObservations,
} from "../../modules/services/observationSlice";
import {
  ArticleCreateUpdateModel,
  ArticleSearchModel,
} from "../models/observationModel";

/**
 * Custom hook for managing observation-related operations using Redux
 * This replaces the old useObservation hook that used local state and direct service calls
 */
export const useObservationRedux = () => {
  const dispatch = useAppDispatch();
  const observationState = useAppSelector(state => state.observations);

  // Action creators wrapped in dispatch
  const actions = {
    // Fetch operations
    loadObservations: (searchParams: ArticleSearchModel) =>
      dispatch(fetchObservations(searchParams)),

    loadAllObservations: () =>
      dispatch(fetchAllObservations()),

    loadObservationById: (articleId: number) =>
      dispatch(fetchObservationById({ articleId })),

    // CRUD operations
    createObservation: (observationData: ArticleCreateUpdateModel, submissionStatus = 'Draft') =>
      dispatch(createObservation({ observationData, submissionStatus })),

    updateObservation: (articleId: number, observationData: ArticleCreateUpdateModel) =>
      dispatch(updateObservation({ articleId, observationData })),

    deleteObservation: (articleId: number) =>
      dispatch(deleteObservation({ articleId })),

    // Workflow operations
    submitObservation: (articleId: number, notes?: string) =>
      dispatch(submitObservation({ articleId, notes })),

    // Unified status update for Approve, Reject, Return
    updateObservationStatus: (observationId: number, statusId: number, remarks?: string) =>
      dispatch(updateObservationStatus({ observationId, statusId, remarks })),

    cancelObservation: (articleId: number, notes?: string) =>
      dispatch(cancelObservation({ articleId, notes })),

    archiveObservation: (articleId: number, reason: string) =>
      dispatch(archiveObservation({ articleId, reason })),

    // Utility operations
    getObservationStats: () =>
      dispatch(fetchObservationStats()),

    getLookupData: () =>
      dispatch(fetchObservationLookupData()),

    checkTitleAvailability: (title: string, excludeId?: number) =>
      dispatch(checkObservationTitleAvailability({ title, excludeId })),

    // State management
    clearError: () =>
      dispatch(clearError()),

    setCurrentObservation: (observation: any) =>
      dispatch(setCurrentObservation(observation)),

    clearObservations: () =>
      dispatch(clearObservations()),
  };

  return {
    // State
    ...observationState,

    // Actions
    ...actions,
  };
};

export default useObservationRedux;
