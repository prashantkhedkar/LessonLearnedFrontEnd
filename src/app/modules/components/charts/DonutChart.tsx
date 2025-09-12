import ReactEcharts from "echarts-for-react";
import { useRef } from "react";

interface Props {
    chartContainerCardCSS?: string;
    chartContainerTitle?: string;
    option: any;
    OnClick?
};
export default function DonutChart({ chartContainerCardCSS, chartContainerTitle, option, OnClick }: Props) {
    const chartRef = useRef(null);
    return (
        <>
            <ReactEcharts option={option} onEvents={OnClick} />
        </>
    )
}