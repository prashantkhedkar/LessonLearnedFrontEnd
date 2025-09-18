// INTERFACE TYPE USED AS MODEL FOR HTTP RESPONSE RETURNED FROM .NET CORE API
// REFERENCED IN AGENT.TS FILE
export interface responseType {
    statusCode: number
    message: string
    data: []
}


export interface StatusWidgetData {
  draftCount: number;
  completedCount: number;
  rejectedCount: number;
  inProgressCount: number;
  totalCount: number;
}

export interface StatusWidgetResponse {
  statusCode: number;
  message: string;
  data: StatusWidgetData;
  isSuccess: boolean;
  tranxId?: string | null;
}
