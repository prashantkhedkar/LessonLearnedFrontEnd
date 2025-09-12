import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchObservations,
  fetchAllObservations,
  fetchObservationById,
  createObservation,
  updateObservation,
  deleteObservation,
  submitObservation,
  approveObservation,
  rejectObservation,
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
    
    approveObservation: (articleId: number, notes?: string) => 
      dispatch(approveObservation({ articleId, notes })),
    
    rejectObservation: (articleId: number, reason: string, notes?: string) => 
      dispatch(rejectObservation({ articleId, reason, notes })),
    
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
