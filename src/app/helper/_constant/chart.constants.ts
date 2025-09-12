import * as echarts from "echarts";

export const gradientColorsForDonut = [
  new echarts.graphic.LinearGradient(0.25, 0, 0.75, 1, [
    { offset: 0, color: "#C0CA38" },
    { offset: 1, color: "#E4EB92" },
  ]),
  new echarts.graphic.LinearGradient(0.3, 0, 0.7, 1.2, [
    { offset: 0, color: "#69D0C8" },
    { offset: 1, color: "#CBF2EC" },
  ]),
  new echarts.graphic.LinearGradient(0.25, 0, 0.75, 1, [
    { offset: 0, color: "#9A9DDF" },
    { offset: 1, color: "#CACBFC" },
  ]),
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "#F48585" },
    { offset: 1, color: "#F6D5D5" },
  ]),
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "#EEAA38" },
    { offset: 1, color: "#F8E2BB" },
  ]),
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "#E0CA75" },
    { offset: 1, color: "#FBF1CB" },
  ]),
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "#A7F3D0" },
    { offset: 1, color: "#EDFFF7" },
  ]),
  "#60A5FA", // static fallback
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "#997CEE" },
    { offset: 1, color: "#CCBEF4" },
  ]),
];

export const gradientColorsForBar = [
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#C0CA38" },
    { offset: 1, color: "#E4EB92" },
  ]),
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#69D0C8" },
    { offset: 1, color: "#CBF2EC" },
  ]),
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#9A9DDF" },
    { offset: 1, color: "#CACBFC" },
  ]),
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#F48585" },
    { offset: 1, color: "#F6D5D5" },
  ]),
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#EEAA38" },
    { offset: 1, color: "#F8E2BB" },
  ]),
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#E0CA75" },
    { offset: 1, color: "#FBF1CB" },
  ]),
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#A7F3D0" },
    { offset: 1, color: "#EDFFF7" },
  ]),
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#60A5FA" },
    { offset: 1, color: "#BFDBFE" },
  ]),
  new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#997CEE" },
    { offset: 1, color: "#CCBEF4" },
  ]),
];

// Data source color mapping for consistent bar chart colors
export const dataSourceColorMap: { [key: string]: any } = {
  // Academic/Educational data sources - Green theme
  'majorData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#C0CA38" },
    { offset: 1, color: "#E4EB92" },
  ]),
  'graduatesData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#C0CA38" },
    { offset: 1, color: "#E4EB92" },
  ]),
  'graduateMajorData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#A7F3D0" },
    { offset: 1, color: "#EDFFF7" },
  ]),
  'graduatesSummaryData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#A7F3D0" },
    { offset: 1, color: "#EDFFF7" },
  ]),
  
  // Request/Service data sources - Blue theme
  'barchart2Data': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#60A5FA" },
    { offset: 1, color: "#BFDBFE" },
  ]),
  'scholarshipCountriesData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#60A5FA" },
    { offset: 1, color: "#BFDBFE" },
  ]),
  'monthlyRequestsData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#9A9DDF" },
    { offset: 1, color: "#CACBFC" },
  ]),
  'monthlyCompletionData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#997CEE" },
    { offset: 1, color: "#CCBEF4" },
  ]),
  'annualStatsData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#69D0C8" },
    { offset: 1, color: "#CBF2EC" },
  ]),
  
  // Performance/Metrics data sources - Orange/Yellow theme
  'submittedRequestsData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#EEAA38" },
    { offset: 1, color: "#F8E2BB" },
  ]),
  'completedRequestsData': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#E0CA75" },
    { offset: 1, color: "#FBF1CB" },
  ]),
  
  // Default fallback
  'default': new echarts.graphic.LinearGradient(1, 0, 0, 0, [
    { offset: 0, color: "#9CA3AF" },
    { offset: 1, color: "#E5E7EB" },
  ])
};

// Function to get bar color based on data source
export const getBarColorByDataSource = (dataSource: string): any => {
  return dataSourceColorMap[dataSource] || dataSourceColorMap['default'];
};
