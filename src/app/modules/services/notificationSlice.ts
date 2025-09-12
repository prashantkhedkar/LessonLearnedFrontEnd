import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INotification } from "../../models/notification/notificationModel";
import {
  fetchNotifications,
  markNotificationsAsRead,
  getUnreadNotificationCount,
} from "../../services/notificationService";

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  hasMorePages: boolean;
  isLoadingMore: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  hasMorePages: false,
  isLoadingMore: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.notifications = [];
      state.hasMorePages = false;
    },
    markAsReadLocally: (state, action: PayloadAction<number[]>) => {
      const notificationIds = action.payload;
      state.notifications = state.notifications.map((notification) =>
        notificationIds.includes(notification.notificationId)
          ? {
              ...notification,
              isRead: true,
              readDate: new Date().toISOString(),
            }
          : notification
      );
      const markedCount = notificationIds.length;
      state.unreadCount = Math.max(0, state.unreadCount - markedCount);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state, action) => {
        const pageNumber = action.meta.arg.pageNumber || 1;
        const isLoadMore = pageNumber > 1;
        if (isLoadMore) {
          state.isLoadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const pageNumber = action.meta.arg.pageNumber || 1;
        const isLoadMore = pageNumber > 1;

        state.loading = false;
        state.isLoadingMore = false;

        if (isLoadMore) {
          // Append new notifications for load more
          state.notifications = [
            ...state.notifications,
            ...action.payload.data,
          ];
        } else {
          // Replace notifications for initial load or filter change
          state.notifications = action.payload.data;
        }

        state.totalCount = action.payload.totalCount;
        state.unreadCount = action.payload.unreadCount;
        state.hasMorePages =
          state.notifications.length < action.payload.totalCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.isLoadingMore = false;
        state.error = action.payload || "Failed to fetch notifications";
      })

      // Mark as read
      .addCase(markNotificationsAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        // Already updated locally via markAsReadLocally
      })
      .addCase(markNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload || "Failed to mark notifications as read";
      })

      // Get unread count
      .addCase(getUnreadNotificationCount.pending, (state) => {
        state.error = null;
      })
      .addCase(getUnreadNotificationCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(getUnreadNotificationCount.rejected, (state, action) => {
        state.error = action.payload || "Failed to get unread count";
      });
  },
});

export const {
  clearError,
  setCurrentPage,
  resetPagination,
  markAsReadLocally,
} = notificationSlice.actions;
export default notificationSlice.reducer;
