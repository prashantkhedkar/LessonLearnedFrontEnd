// Dashboard configuration interfaces

export interface ChartConfig {
  id: string;
  type: 'donut' | 'bar' | 'timeline' | 'updates' | 'rating' | 'averageClosureTime' | 'notificationTimeline' | 'widgetStats';
  title: string;
  dataSource: string;
  height?: number;
}

export interface RowConfig {
  id: string;
  type: 'dual-layout' | 'single-layout' | 'single-multirow-layout';
  barChart?: ChartConfig;
  donutChart?: ChartConfig;
  timeline?: ChartConfig;
  updates?: ChartConfig;
  chart?: ChartConfig; // For single-layout type
  charts?: ChartConfig[]; // For single-multirow-layout type - multiple charts in separate rows
  leftChart?: ChartConfig; // For dual-layout type
  rightChart?: ChartConfig; // For dual-layout type
  ratingChart?: ChartConfig; // For rating component
  closureTimeChart?: ChartConfig; // For average closure time component
}

export interface RoleConfig {
  [role: string]: RowConfig[];
}

export interface DashboardConfig {
  roles: RoleConfig;
  dataSources: { [key: string]: string };
  staticData: { [key: string]: any };
}

export interface UserDashboardData {
  userId: number;
  role: string;
  customData?: { [key: string]: any };
}

// API service interface for fetching user-specific data
export interface DashboardDataService {
  fetchUserData(userId: number, dataSource: string): Promise<any>;
  fetchUserRoleConfig(userId: number): Promise<RowConfig[]>;
}

// Bound configuration after data binding
export interface BoundRowConfig extends Omit<RowConfig, 'barChart' | 'donutChart' | 'timeline' | 'updates' | 'chart' | 'charts' | 'leftChart' | 'rightChart' | 'ratingChart' | 'closureTimeChart'> {
  barChart?: ChartConfig & { data: any };
  donutChart?: ChartConfig & { data: any };
  timeline?: ChartConfig & { data: any };
  updates?: ChartConfig & { data: any };
  chart?: ChartConfig & { data: any }; // For single-chart type
  charts?: (ChartConfig & { data: any })[]; // For single-multirow-layout type - multiple bound charts
  leftChart?: ChartConfig & { data: any }; // For single-chart-pair type
  rightChart?: ChartConfig & { data: any }; // For single-chart-pair type
  ratingChart?: ChartConfig & { data: any }; // For rating component
  closureTimeChart?: ChartConfig & { data: any }; // For average closure time component
}
