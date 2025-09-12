import ReactEcharts from "echarts-for-react";

interface Props {
    option: any
};

export default function BarChart({ option }: Props) {
    return (
        <>
            <ReactEcharts option={option} />
        </>
    )
}