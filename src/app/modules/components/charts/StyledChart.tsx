import React, { FC } from "react";
import { ResponsiveChart } from "./ResponsiveChart";

interface StyledChartProps {
  option: any;
  height?: number;
  onChartClick?: (params: any) => void;
  chartTitle?: string;
  titleClassName?: string;
  xAxisClassName?: string;
  yAxisClassName?: string;
  customStyles?: {
    titleStyle?: React.CSSProperties;
    xAxisStyle?: React.CSSProperties;
    yAxisStyle?: React.CSSProperties;
  };
  showCustomTitle?: boolean;
  showCustomAxes?: boolean;
  xAxisLabels?: string[];
  yAxisLabel?: string;
}

const StyledChart: FC<StyledChartProps> = ({
  option,
  height = 350,
  onChartClick,
  chartTitle,
  titleClassName,
  xAxisClassName,
  yAxisClassName,
  customStyles,
  showCustomTitle = false,
  showCustomAxes = false,
  xAxisLabels = [],
  yAxisLabel
}) => {
  // Remove title from chart option if we're using custom HTML title
  const chartOption = showCustomTitle ? {
    ...option,
    title: undefined
  } : option;

  // Remove axis labels from chart option if we're using custom HTML axes
  const finalChartOption = showCustomAxes ? {
    ...chartOption,
    xAxis: {
      ...chartOption.xAxis,
      axisLabel: {
        ...chartOption.xAxis?.axisLabel,
        show: false
      }
    },
    yAxis: {
      ...chartOption.yAxis,
      axisLabel: {
        ...chartOption.yAxis?.axisLabel,
        show: false
      }
    }
  } : chartOption;

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {/* Custom HTML Title */}
      {showCustomTitle && chartTitle && (
        <div
          className={titleClassName}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10,
            fontFamily: 'FrutigerLTArabic-Bold_2',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#000',
            textAlign: 'right',
            ...customStyles?.titleStyle
          }}
        >
          {chartTitle}
        </div>
      )}

      {/* Chart Container */}
      <ResponsiveChart
        option={finalChartOption}
        height={height}
        onChartClick={onChartClick}
      />

      {/* Custom X-Axis Labels */}
      {showCustomAxes && xAxisLabels.length > 0 && (
        <div
          className={xAxisClassName}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '10%',
            right: '10%',
            display: 'flex',
            justifyContent: 'space-between',
            zIndex: 10,
            fontFamily: 'FrutigerLTArabic-Roman_0',
            fontSize: '14px',
            color: '#666',
            ...customStyles?.xAxisStyle
          }}
        >
          {xAxisLabels.map((label, index) => (
            <span key={index} style={{ 
              textAlign: 'center',
              maxWidth: `${90 / xAxisLabels.length}%`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Custom Y-Axis Label */}
      {showCustomAxes && yAxisLabel && (
        <div
          className={yAxisClassName}
          style={{
            position: 'absolute',
            right: '5px',
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            transformOrigin: 'center',
            zIndex: 10,
            fontFamily: 'FrutigerLTArabic-Roman_0',
            fontSize: '14px',
            color: '#666',
            whiteSpace: 'nowrap',
            ...customStyles?.yAxisStyle
          }}
        >
          {yAxisLabel}
        </div>
      )}
    </div>
  );
};

export { StyledChart };
