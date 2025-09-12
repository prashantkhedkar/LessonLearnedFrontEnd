// Base Observation Model
export interface ObservationModel {
  id: number;
  observationTitle: string;
  discussion?: string;
  conclusion?: string;
  initialRecommendation?: string;
  observationType?: number;
  originatingType?: number;
  level?: number;
  submittedBy?: string;
  submittedDate?: Date;
  approvedBy?: string;
  currentAssignment?: string;
  status: string;
  submissionStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Article Create/Update Model (for API requests)
export interface ArticleCreateUpdateModel {
  observationTitle: string;
  discussion?: string;
  conclusion?: string;
  initialRecommendation?: string;
  observationType?: number;
  originatingType?: number;
  level?: number;
  currentAssignment?: string;
  status: number;
}

// Article List Model (for paginated responses)
export interface ArticleListModel {
  articles: ObservationModel[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Article Search Model
export interface ArticleSearchModel {
  searchTerm?: string;
  observationType?: number;
  status?: string;
  currentAssignment?: string;
  level?: number;
  dateFrom?: Date;
  dateTo?: Date;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Default search parameters
export const DEFAULT_ARTICLE_SEARCH: ArticleSearchModel = {
  searchTerm: '',
  observationType: undefined,
  status: '',
  currentAssignment: '',
  level: undefined,
  pageNumber: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

// Default form values
export const DEFAULT_ARTICLE_FORM: ArticleCreateUpdateModel = {
  observationTitle: '',
  discussion: '',
  conclusion: '',
  initialRecommendation: '',
  observationType: 0,
  originatingType: 0,
  level: 0,
  currentAssignment: '',
  status: 12,
};

// Article History Model
export interface ArticleHistoryModel {
  id: number;
  articleId: number;
  action: string;
  performedBy: string;
  performedAt: Date;
  previousValue?: string;
  newValue?: string;
  notes?: string;
}

// Article Stats Model
export interface ArticleStatsModel {
  totalArticles: number;
  draftArticles: number;
  publishedArticles: number;
  archivedArticles: number;
  pendingApproval: number;
  submissionRate: number;
}

// Article Lookup Model
export interface ArticleLookupModel {
  types: { value: string; text: string }[];
  statuses: { value: string; text: string }[];
  mainUnits: { value: string; text: string }[];
  subunits: { value: string; text: string }[];
  assignments: { value: string; text: string }[];
}

// API Response Model
export interface ArticleApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  errors?: string[];
}

// Action types for status updates
export interface SubmitArticleRequest {
  notes?: string;
}

export interface ApproveArticleRequest {
  notes?: string;
}

export interface RejectArticleRequest {
  reason: string;
  notes?: string;
}

export interface ArchiveArticleRequest {
  reason: string;
}
