// const fs = require('fs');
// const config = JSON.parse(fs.readFileSync('dashboardConfig.json', 'utf8'));

// // Define drill-down data sources mapping
// const drillDownMapping = {
//   'fetchMasterDashboardTileData': 'fetchServiceRequestsForWidget',
//   'fetchMasterDashboardTilePriorityData': 'fetchServiceRequestsByPriority',
//   'numberOfRequestCreatedByMonthData': 'fetchServiceRequestsByMonth',
//   'inProgressRequestData': 'fetchServiceRequestsByAging',
//   'getTopNthRequestsByServiceCategories': 'fetchServiceRequestsByService',
//   'priorityData': 'fetchServiceRequestsByPriority',
//   'inProgressRequestByUnitData': 'fetchServiceRequestsByUnit',
//   'fulfillmentUnitsRequestsData': 'fetchServiceRequestsByFulfillmentUnit',
//   'averageClosureTimeData': 'fetchServiceRequestsByClosureTime',
//   'feedbackStatisticsData': 'fetchServiceRequestsByRating',
//   'getClosedRequestsData': 'fetchServiceRequestsClosedByMonth',
//   'notificationTimelineData': 'fetchServiceRequestsFromNotifications',
//   'riskData': 'fetchServiceRequestsFromUpdates',
//   'highestRequestedUnitData': 'fetchServiceRequestsByCompletion',
//   'highestRequestedByServiceData': 'fetchServiceRequestsByServiceCompletion',
//   'actionRequiredData': 'fetchServiceRequestsFromActions',
//   'getReceivedRequestsData': 'fetchServiceRequestsReceivedByMonth',
//   'numberOfRequestCreatedByServiceData': 'fetchServiceRequestsByService'
// };

// // Function to add dataSourceForDrillDown to a chart
// function addDrillDownSource(chart) {
//   if (chart.dataSource && drillDownMapping[chart.dataSource] && !chart.dataSourceForDrillDown) {
//     chart.dataSourceForDrillDown = drillDownMapping[chart.dataSource];
//   }
// }

// // Process all roles and charts
// for (const roleName in config.roles) {
//   const roleConfig = config.roles[roleName];
//   for (const row of roleConfig) {
//     // Handle charts array (multi-row layouts)
//     if (row.charts) {
//       row.charts.forEach(addDrillDownSource);
//     }
//     // Handle single chart
//     if (row.chart) {
//       addDrillDownSource(row.chart);
//     }
//     // Handle left and right charts (dual layouts)
//     if (row.leftChart) {
//       addDrillDownSource(row.leftChart);
//     }
//     if (row.rightChart) {
//       addDrillDownSource(row.rightChart);
//     }
//   }
// }

// fs.writeFileSync('dashboardConfig.json', JSON.stringify(config, null, 2));
// console.log('Added dataSourceForDrillDown properties to all charts');
