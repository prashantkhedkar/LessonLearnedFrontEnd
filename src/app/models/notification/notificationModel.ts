export interface INotification {
  notificationId: number;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  notificationType: string | null;
  actionUrl: string | null;
  actionParams: string | null;
  serviceId: number | null;
  serviceRequestId: number | null;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  isRead?: boolean;
  readDate?: string;
  serviceRequestCurrentStepId?: number;
  serviceRequestStatusId?: number;
  actionBy?: string;
  requestNumber?: string;
}

export interface INotificationResponse {
  data: INotification[];
  totalCount: number;
  unreadCount: number;
}

export interface INotificationRequest {
  pageNumber?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

export interface IMarkAsReadRequest {
  notificationIds: number[];
}
