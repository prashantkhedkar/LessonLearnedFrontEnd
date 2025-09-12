import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  INotification,
  INotificationRequest,
  INotificationResponse,
  IMarkAsReadRequest,
} from "../models/notification/notificationModel";
import { requests } from "../helper/axiosInterceptor";
import { responseType } from "../models/global/responseResult";

// Notification API response wrapper
interface NotificationApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
}

class NotificationService {
  private baseURL = "/Notification";

  // Get notifications with pagination
  async getNotifications(searchParams: INotificationRequest): Promise<
    NotificationApiResponse<{
      notifications: INotification[];
      totalCount: number;
      unreadCount: number;
    }>
  > {
    try {
      console.log(
        "🌐 Making API call to notifications with params:",
        searchParams
      );

      const queryParams = new URLSearchParams({
        page: (searchParams.pageNumber || 1).toString(),
        pageSize: (searchParams.pageSize || 10).toString(),
      });

      if (searchParams.unreadOnly) {
        queryParams.append("unreadOnly", "true");
      }

      const response = await requests.get<responseType>(
        `${this.baseURL}?${queryParams}`
      );

      console.log("📡 Raw API response for notifications:", response);

      if (response.statusCode === 200 && response.data) {
        // Handle response data that could be the notifications object or array
        const responseData = response.data as any;
        const result = {
          success: true,
          message: response.message || "Notifications retrieved successfully",
          data: {
            notifications: responseData.notifications || responseData || [],
            totalCount:
              responseData.totalCount ||
              (Array.isArray(responseData) ? responseData.length : 0),
            unreadCount: responseData.unreadCount || 0,
          },
          statusCode: response.statusCode,
        };
        console.log("✅ Returning formatted notifications response:", result);
        return result;
      } else {
        console.log("❌ Notifications API response failed:", response);
        return {
          success: false,
          message: response.message || "Failed to fetch notifications",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch notifications",
        statusCode: 500,
      };
    }
  }

  // Mark notifications as read
  async markNotificationsAsRead(
    notificationIds: number[]
  ): Promise<NotificationApiResponse<boolean>> {
    try {
      console.log("🌐 Marking notifications as read:", notificationIds);

      // If only one notification ID, use the single endpoint
      if (notificationIds.length === 1) {
        const response = await requests.put<responseType>(
          `${this.baseURL}/${notificationIds[0]}/mark-read`,
          {}
        );

        console.log("📡 Raw API response for mark as read:", response);

        if (response.statusCode === 200) {
          return {
            success: true,
            message:
              response.message || "Notification marked as read successfully",
            data: true,
            statusCode: response.statusCode,
          };
        } else {
          return {
            success: false,
            message: response.message || "Failed to mark notification as read",
            statusCode: response.statusCode || 500,
          };
        }
      } else {
        // For multiple notifications, mark them one by one
        const results = await Promise.allSettled(
          notificationIds.map((id) =>
            requests.post<responseType>(`${this.baseURL}/${id}/mark-read`, {})
          )
        );

        const failedIds: number[] = [];
        results.forEach((result, index) => {
          if (
            result.status === "rejected" ||
            (result.status === "fulfilled" && result.value.statusCode !== 200)
          ) {
            failedIds.push(notificationIds[index]);
          }
        });

        if (failedIds.length === 0) {
          return {
            success: true,
            message: "All notifications marked as read successfully",
            data: true,
            statusCode: 200,
          };
        } else {
          return {
            success: false,
            message: `Failed to mark ${failedIds.length} notification(s) as read`,
            statusCode: 500,
          };
        }
      }
    } catch (error: any) {
      console.error("Error marking notifications as read:", error);
      return {
        success: false,
        message: error.message || "Failed to mark notifications as read",
        statusCode: 500,
      };
    }
  }

  // Mark single notification as read (convenience method)
  async markNotificationAsRead(
    notificationId: number
  ): Promise<NotificationApiResponse<boolean>> {
    try {
      console.log("🌐 Marking single notification as read:", notificationId);

      const response = await requests.post<responseType>(
        `${this.baseURL}/${notificationId}/mark-read`,
        {}
      );

      console.log("📡 Raw API response for mark single as read:", response);

      if (response.statusCode === 200) {
        return {
          success: true,
          message:
            response.message || "Notification marked as read successfully",
          data: true,
          statusCode: response.statusCode,
        };
      } else {
        return {
          success: false,
          message: response.message || "Failed to mark notification as read",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      return {
        success: false,
        message: error.message || "Failed to mark notification as read",
        statusCode: 500,
      };
    }
  }

  // Delete notification
  async deleteNotification(
    notificationId: number
  ): Promise<NotificationApiResponse<boolean>> {
    try {
      console.log("🌐 Deleting notification:", notificationId);

      const response = await requests.delete<responseType>(
        `${this.baseURL}/${notificationId}`
      );

      console.log("📡 Raw API response for delete notification:", response);

      if (response.statusCode === 200) {
        return {
          success: true,
          message: response.message || "Notification deleted successfully",
          data: true,
          statusCode: response.statusCode,
        };
      } else {
        return {
          success: false,
          message: response.message || "Failed to delete notification",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      return {
        success: false,
        message: error.message || "Failed to delete notification",
        statusCode: 500,
      };
    }
  }

  // Get unread notification count
  async getUnreadCount(): Promise<NotificationApiResponse<number>> {
    try {
      console.log("🌐 Getting unread notification count");

      const response = await requests.get<responseType>(
        `${this.baseURL}?page=1&pageSize=1`
      );

      console.log("📡 Raw API response for unread count:", response);

      if (response.statusCode === 200 && response.data) {
        const responseData = response.data as any;
        return {
          success: true,
          message: response.message || "Unread count retrieved successfully",
          data: responseData.unreadCount || 0,
          statusCode: response.statusCode,
        };
      } else {
        return {
          success: false,
          message: response.message || "Failed to get unread count",
          statusCode: response.statusCode || 500,
        };
      }
    } catch (error: any) {
      console.error("Error getting unread count:", error);
      return {
        success: false,
        message: error.message || "Failed to get unread count",
        statusCode: 500,
      };
    }
  }
}

// Create service instance
const notificationService = new NotificationService();

// Redux async thunks using the service
export const fetchNotifications = createAsyncThunk<
  INotificationResponse,
  INotificationRequest,
  { rejectValue: string }
>(
  "notifications/fetchNotifications",
  async (request: INotificationRequest, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(request);

      if (response.success && response.data) {
        return {
          data: response.data.notifications,
          totalCount: response.data.totalCount,
          unreadCount: response.data.unreadCount,
        };
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch notifications");
    }
  }
);

export const markNotificationsAsRead = createAsyncThunk<
  boolean,
  IMarkAsReadRequest,
  { rejectValue: string }
>(
  "notifications/markAsRead",
  async (request: IMarkAsReadRequest, { rejectWithValue }) => {
    try {
      const response = await notificationService.markNotificationsAsRead(
        request.notificationIds
      );

      if (response.success) {
        return true;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to mark notifications as read"
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk<
  boolean,
  { notificationId: number },
  { rejectValue: string }
>(
  "notifications/markSingleAsRead",
  async ({ notificationId }, { rejectWithValue }) => {
    try {
      const response = await notificationService.markNotificationAsRead(
        notificationId
      );

      if (response.success) {
        return true;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to mark notification as read"
      );
    }
  }
);

export const getUnreadNotificationCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("notifications/getUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const response = await notificationService.getUnreadCount();

    if (response.success && response.data !== undefined) {
      return response.data;
    } else {
      return rejectWithValue(response.message);
    }
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to get unread count");
  }
});

export const deleteNotification = createAsyncThunk<
  boolean,
  { notificationId: number },
  { rejectValue: string }
>(
  "notifications/deleteNotification",
  async ({ notificationId }, { rejectWithValue }) => {
    try {
      const response = await notificationService.deleteNotification(
        notificationId
      );

      if (response.success) {
        return true;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete notification");
    }
  }
);
