export interface ServiceFeedbackModel {
  feedbackId?: number;
  requestId: number;
  serviceName: string;
  rating: number; // 1-5 star rating
  timelinessRating: number; // 1-5 dropdown rating
  comments?: string; // Optional text area
  submissionDate?: Date;
  submittedUserId?: number;
  feedbackStatus: FeedbackStatus;
  isLocked?: boolean;
  linkExpiredAt?: Date;
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
}

export interface ServiceFeedbackFormModel {
  requestId: number;
  serviceName: string;
  rating: number;
  comments?: string;
  requestNumber: string;
  feedbackStatus: number;
}

export enum FeedbackStatus {
  PendingFeedback = 1,
  Submitted = 2,
  NotSubmitted = 3,
  Expired = 4,
}

export interface ServiceFeedbackSearchModel {
  pageNumber: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: string;
  requestId?: number;
  feedbackStatus?: FeedbackStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface FeedbackLinkModel {
  requestId: number;
  token: string;
  expiresAt: Date;
  isValid: boolean;
}
