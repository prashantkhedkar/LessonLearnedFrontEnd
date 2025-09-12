import {
  gradientColorsForBar,
  gradientColorsForDonut,
  getBarColorByDataSource,
} from "../../helper/_constant/chart.constants";
import * as echarts from "echarts";

const constants = {
  BORDER_RADIUS: 4,
  BORDER_COLOR: "#fff",
  BORDER_WIDTH: 2,
  TITLE_FONT: {
    fontFamily: "FrutigerLTArabic-Bold_2",
    fontSize: 18,
    lineHeight: 20,
  },
  REGULAR_FONT: {
    fontFamily: "FrutigerLTArabic-Roman_0",
    fontSize: 14,
    lineHeight: 24,
  },
  LEGEND_CONFIG: {
    align: "right",
    itemWidth: 25,
    itemHeight: 20,
    itemGap: 30,
    formatter: (name) => `{label|${name}}`,
    textStyle: {
      rich: {
        label: {
          fontSize: 17,
          color: "#000",
          fontFamily: "FrutigerLTArabic-Roman_0",
          padding: [0, 8, 0, 0],
          align: "right",
        },
      },
    },
  },
  TITLE_CONFIG: (text: string) => ({
    text,
    right: 0,
    top: "top",
    textStyle: {
      ...constants.TITLE_FONT,
    },
  }),
};

export const getDonutChartOptions = (
  title: string,
  data: { name: string; arName?: string; value: number }[]
) => ({
  title: constants.TITLE_CONFIG(title),
  tooltip: {
    trigger: "item",
    className: "echarts-tooltip-text",
  },
  legend: {
    ...constants.LEGEND_CONFIG,
    orient: "vertical",
    right: 0,
    left: "25%",
    top: "middle",
    itemGap: 12,
  },
  grid: {
    left: "center",
    right: "center",
    containLabel: true,
  },
  series: [
    {
      name: title,
      type: "pie",
      radius: ["45%", "75%"],
      center: ["70%", "50%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: constants.BORDER_RADIUS,
        borderColor: constants.BORDER_COLOR,
        borderWidth: constants.BORDER_WIDTH,
        cursor: 'default'
      },
      label: { show: false },
      labelLine: { show: false },
      data: data.map((item, idx) => ({
        ...item,
        itemStyle: {
          color: gradientColorsForDonut[idx % gradientColorsForDonut.length],
          cursor: 'default'
        },
      })),
    },
  ],
});

export const getBarChartOption = (
  title: string,
  data: {
    xAxisData: string[] | number[];
    seriesData: { name: string; data: number[] }[];
  },
  dataSource?: string,
  customBarColor?: any
) => ({
  color: gradientColorsForBar,
  title: constants.TITLE_CONFIG(title),
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    className: "echarts-tooltip-text",
  },
  legend: {
    ...constants.LEGEND_CONFIG,
    bottom: 0,
    data: data.seriesData.map((item) => item.name),
  },
  grid: {
    left: "2%",
    right: "2%",
    bottom: "10%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: data.xAxisData,
    axisLabel: {
      textStyle: { ...constants.REGULAR_FONT },
      interval: 0,
      formatter: (value) =>
        value.length > 9 ? value.match(/.{1,9}/g).join("\n") : value,
    },
  },

  yAxis: {
    type: "value",
    position: "right",
    axisLabel: { textStyle: { ...constants.REGULAR_FONT } },
  },
  series: data.seriesData.map((seriesItem, index) => {
    let barColor;

    // Handle custom bar color from config
    if (customBarColor) {
      if (customBarColor.type === 'linear') {
        barColor = new echarts.graphic.LinearGradient(
          customBarColor.x || 1,
          customBarColor.y || 0,
          customBarColor.x2 || 0,
          customBarColor.y2 || 0,
          customBarColor.colorStops || []
        );
      } else {
        barColor = customBarColor;
      }
    } else if (dataSource) {
      barColor = getBarColorByDataSource(dataSource);
    } else {
      barColor = gradientColorsForBar[index % gradientColorsForBar.length];
    }

    return {
      name: seriesItem.name,
      type: "bar",
      stack: "total",
      barWidth: "30px", // Reduce bar width to 40% of available space
      data: seriesItem.data,
      itemStyle: {
        color: barColor,
        borderRadius:
          index === data.seriesData.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0],
        borderColor: constants.BORDER_COLOR,
        borderWidth: 1,
        cursor: 'default'
      },
    };
  }),
});
