import { ServiceFeedbackModel } from "../global/feedbackModel";

export interface feedbackState {
    feedbackData: ServiceFeedbackModel | null;
  feedbackList: ServiceFeedbackModel[];
  totalRecords: number;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  linkValidation: {
    isValid: boolean;
    isExpired: boolean;
    requestId: number | null;
  };
}

export const initFeedbackState: feedbackState = {
  feedbackData: null,
  feedbackList: [],
  totalRecords: 0,
  isLoading: false,
  error: null,
  isSubmitting: false,
  linkValidation: {
    isValid: false,
    isExpired: false,
    requestId: null,
  },
};
