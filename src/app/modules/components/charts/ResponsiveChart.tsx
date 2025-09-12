import React, { useRef, useEffect, FC } from "react";
import ReactEChartsCore from "echarts-for-react";
import * as echarts from "echarts/core";
import { BarChart, PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  PieChart,
  CanvasRenderer,
]);

type ResponsiveChartProps = {
  option: any;
  height?: number;
  onChartClick?: (params: any) => void;
};

const ResponsiveChart: FC<ResponsiveChartProps> = ({ option, height = 350, onChartClick }) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      setTimeout(() => {
        const chartInstance = chartRef.current?.getEchartsInstance();
        if (chartInstance) {
          chartInstance.resize();
        }
      }, 100); // short delay to wait for layout
    }
  }, []);

  // Add click event handler
  const onEvents = onChartClick ? {
    'click': onChartClick
  } : undefined;

  return (
    <div style={{ width: "100%", height }}>
      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={option}
        style={{ width: "100%", height: "100%" }}
        notMerge={true}
        lazyUpdate={true}
        opts={{ renderer: "canvas", locale: 'ar', }}
        onEvents={onEvents}
      />
    </div>
  );
};

export { ResponsiveChart }