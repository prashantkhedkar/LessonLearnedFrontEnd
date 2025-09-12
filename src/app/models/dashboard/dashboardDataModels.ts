// Dashboard Data Models

import { INotification } from "../notification/notificationModel";

export interface IServiceRatingItem {
    stars: number;
    percentage: number;
}

export interface IAverageClosureTimeItem {
    ageGroup: string;
    percentage: number;
    days: number;
}

export interface IActionRequiredItem {
    title: string;
    status: string;
    date: string;
    severity: string;
}

export interface INotificationTimelineItem {
    id: string;
    serviceName: string;
    serviceStatus: string;
    date: string;
    isRead: boolean;
    priority: string;
}

// Backend API Response Interfaces
export interface IStarRatingStatistic {
    stars: number;
    count: number;
    percentage: number;
}

export interface IFeedbackStatisticsResponse {
    totalFeedbacks: number;
    starRatings: IStarRatingStatistic[];
}

export type ServiceRatingData = IServiceRatingItem[];
export type AverageClosureTimeData = IAverageClosureTimeItem[];
export type ActionRequiredData = IActionRequiredItem[];
export type NotificationTimelineData = INotification[];

export interface IDashboardChartApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export type ServiceRatingApiResponse = IDashboardChartApiResponse<ServiceRatingData>;
export type AverageClosureTimeApiResponse = IDashboardChartApiResponse<AverageClosureTimeData>;
export type ActionRequiredApiResponse = IDashboardChartApiResponse<ActionRequiredData>;
export type NotificationTimelineApiResponse = IDashboardChartApiResponse<NotificationTimelineData>;

export const defaultServiceRatingData: ServiceRatingData = [];
export const defaultAverageClosureTimeData: AverageClosureTimeData = [];
export const defaultActionRequiredData: ActionRequiredData = [];
export const defaultNotificationTimelineData: NotificationTimelineData = [];

export const safeParseServiceRatingData = (data: any): ServiceRatingData => {
    // Handle FeedbackStatisticsResponse structure from API
    if (data && typeof data === 'object') {
        // Check for camelCase property names (typical from API serialization)
        if (Array.isArray(data.starRatings)) {
            return data.starRatings.map((item: any) => ({
                stars: item.stars || item.Stars || 0,
                percentage: item.percentage || item.Percentage || 0
            }));
        }

        // Check for PascalCase property names (in case serialization differs)
        if (Array.isArray(data.StarRatings)) {
            return data.StarRatings.map((item: any) => ({
                stars: item.stars || item.Stars || 0,
                percentage: item.percentage || item.Percentage || 0
            }));
        }
    }

    // Fallback for direct array structure
    if (Array.isArray(data) && data.every(item =>
        typeof item === 'object' &&
        typeof item.stars === 'number' &&
        typeof item.percentage === 'number'
    )) {
        return data;
    }

    return defaultServiceRatingData;
};

export const safeParseAverageClosureTimeData = (data: any): AverageClosureTimeData => {
    if (Array.isArray(data) && data.every(item =>
        typeof item === 'object' &&
        typeof item.ageGroup === 'string' &&
        typeof item.percentage === 'number' &&
        typeof item.days === 'number'
    )) {
        return data;
    }
    return defaultAverageClosureTimeData;
};

export const safeParseActionRequiredData = (data: any): ActionRequiredData => {
    if (Array.isArray(data) && data.every(item =>
        typeof item === 'object' &&
        typeof item.title === 'string' &&
        typeof item.status === 'string' &&
        typeof item.date === 'string' &&
        typeof item.severity === 'string'
    )) {
        return data;
    }
    return defaultActionRequiredData;
};

export const safeParseNotificationTimelineData = (data: any): NotificationTimelineData => {
    if (
      Array.isArray(data) &&
      data.every(
        (item) =>
          typeof item === "object" &&
          typeof item.notificationId === "number" &&
          typeof item.titleAr === "string" &&
          typeof item.messageAr === "string" &&
          typeof item.notificationType === "string"  
      )
    ) {
      return data;
    }
    return defaultNotificationTimelineData;
};
