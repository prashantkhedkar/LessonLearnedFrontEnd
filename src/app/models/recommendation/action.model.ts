// Action interface for recommendation actions
export interface IRecommendationAction {
    id: number | string;
    recommendationId?: number | string;
    text?: string;
    title?: string; // Additional field for modal
    description?: string;
    assignedTo?: string;
    assignedToUserId?: number;
    dueDate?: string;
    fromDate?: string; // Additional field for modal
    toDate?: string; // Additional field for modal
    procedureStatus?: string; // Additional field for modal
    responsibleBy?: string; // Additional field for modal
    responsibleType?: string; // Additional field for modal - individuals or units
    implementation?: string; // Additional field for modal
    coordination?: string; // Additional field for modal
    progress?: number; // Progress percentage (0-100)
    priority?: 'high' | 'medium' | 'low';
    status?: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'active' | 'deleted';
    timestamp?: string;
    createdAt?: string;
    createdBy?: string;
    createdByUserId?: number;
    updatedAt?: string;
    updatedBy?: string;
    updatedByUserId?: number;
    attachments?: string[];
    comments?: IActionComment[];
}

export interface IActionComment {
    id: number;
    actionId: number;
    text: string;
    createdBy: string;
    createdByUserId: number;
    timestamp: string;
}

export interface IActionFormData {
    text?: string;
    title?: string;
    description?: string;
    assignedTo?: string;
    dueDate?: string;
    fromDate?: string;
    toDate?: string;
    procedureStatus?: string;
    responsibleBy?: string;
    responsibleType?: string;
    implementation?: string;
    coordination?: string;
    progress?: number;
    priority?: 'high' | 'medium' | 'low';
    status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

// API request/response interfaces
export interface ICreateActionRequest {
    recommendationId: number | string;
    action: Omit<IRecommendationAction, 'id' | 'timestamp' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
}

export interface IUpdateActionRequest {
    actionId: number;
    action: Partial<Omit<IRecommendationAction, 'id' | 'recommendationId' | 'timestamp' | 'createdBy'>>;
}

export interface IDeleteActionRequest {
    actionId: number;
    recommendationId: number | string;
}

export interface IGetActionsRequest {
    recommendationId: number | string;
}

export interface IGetActionsResponse {
    actions: IRecommendationAction[];
    totalCount: number;
    success: boolean;
    message?: string;
}