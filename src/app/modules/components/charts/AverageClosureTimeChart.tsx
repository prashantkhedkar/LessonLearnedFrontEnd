import React from "react";
import { useIntl } from "react-intl";
import { ResponsiveChart } from "./ResponsiveChart";
import NoRecordsAvailable from "../noRecordsAvailable/NoRecordsAvailable";

interface AverageClosureTimeData {
  ageGroup: string;
  percentage: number;
  days: number;
}

interface Props {
  data?: AverageClosureTimeData[];
  title?: string;
  height?: number;
  className?: string;
}

const defaultData: AverageClosureTimeData[] = [
  { ageGroup: "10 أيام", percentage: 35, days: 10 },
  { ageGroup: "20 أيام", percentage: 50, days: 20 },
  { ageGroup: "30 أيام", percentage: 83, days: 30 },
  { ageGroup: "40 أيام", percentage: 29, days: 40 },
  { ageGroup: "60+ أيام", percentage: 66, days: 60 },
];

export default function AverageClosureTimeChart({
  data = defaultData,
  title = "متوسط وقت الإغلاق (بالأيام)",
  height = 400,
  className = ""
}: Props) {
  const intl = useIntl();

  // Check if data is empty or undefined
  if (!data || data.length === 0) {
    return (
      <div className={`${className.includes('chart-half-fit') ? '' : 'card card-flush'} h-100 ${className}`}>
        <div className={`${className.includes('chart-half-fit') ? '' : 'card-body p-0'} d-flex flex-column justify-content-between`}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: height || 400,
            textAlign: 'center'
          }}>
            <NoRecordsAvailable />
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for the chart
  const categories = data.map(item => item.ageGroup);
  const percentages = data.map(item => item.percentage);

  const option = {
    title: {
      text: title,
      left: 'right',
      // top: '5%',
      textStyle: {
        fontSize: 18,
        fontWeight: 600,
        color: '#333333',
        align: 'right',
        direction: 'rtl'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        const dataIndex = params[0].dataIndex;
        const item = data[dataIndex];
        return `${item.ageGroup}<br/>النسبة: ${item.percentage}%<br/>المدة: ${item.days} يوم`;
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '15%',
      bottom: '10%',
      containLabel: true,
      height: '70%' // Reduce grid height to create more spacing
    },
    xAxis: {
      type: 'value',
      max: 100,
      inverse: true,
      show: false
    },
    yAxis: {
      type: 'category',
      data: categories,
      position: 'right',
      axisLabel: {
        fontSize: 12,
        color: '#333',
        margin: 10,
        fontWeight: '400'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e5e7eb',
          width: 1,
          type: 'solid'
        }
      },
      boundaryGap: ['20%', '20%'] // Add padding at top and bottom
    },
    barCategoryGap: '80%', // Increase space between bar categories
    series: [
      // Green portion (actual percentage)
      {
        type: 'bar',
        stack: 'total',
        data: percentages.map((value, index) => ({
          value: value,
          itemStyle: {
            color: '#4ade80', // Green color for actual percentage
            borderRadius: [0, 4, 4, 0] // Rounded corners on all sides
          }
        })),
        barWidth: '20%', // Increased bar height
        barMaxWidth: 40 // Increased maximum bar width in pixels
      },
      // Gray portion (remaining percentage)
      {
        type: 'bar',
        stack: 'total',
        data: percentages.map((value, index) => ({
          value: 100 - value,
          itemStyle: {
            color: '#e5e7eb', // Light gray for remaining portion
            borderRadius: [4, 0, 0, 4] // Rounded corners on all sides
          }
        })),
        barWidth: '20%', // Increased bar height
        barMaxWidth: 40, // Increased maximum bar width in pixels
        silent: false, // Allow interaction to show labels
        label: {
          show: true,
          position: 'left',
          formatter: function (params: any) {
            const originalValue = percentages[params.dataIndex];
            return `${originalValue}%`;
          },
          fontSize: 12,
          color: '#333',
          fontWeight: '500',
        }
      }
    ],
    backgroundColor: '#ffffff'
  };

  return (
    <div className={`${className.includes('chart-half-fit') ? '' : 'card card-flush'} h-100 ${className}`}>
      <div className={`${className.includes('chart-half-fit') ? '' : 'card-body p-0'} d-flex flex-column justify-content-between`}>
        <ResponsiveChart option={option} height={height} />
      </div>
    </div>
  );
}

export type { AverageClosureTimeData };
