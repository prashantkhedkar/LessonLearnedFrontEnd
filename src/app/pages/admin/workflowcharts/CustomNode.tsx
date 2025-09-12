import React, { memo } from "react";
// Use namespace import to avoid TypeScript confusion
import * as ReactFlowComponents from "@xyflow/react";
import { LabelTitleSemibold1 } from "../../../modules/components/common/formsLabels/detailLabels";

// Extract Handle and Position from the namespace
const Handle = ReactFlowComponents.Handle;
const Position = ReactFlowComponents.Position;

interface CustomNodeData {
  stepName?: string;
  name?: string;
  from?: string;
  job?: string;
  action?: string;
  label?: string;
  type?: string;
  stepNo?: number; // Add stepNo to the interface
  [key: string]: any;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

function CustomNode({ data }: CustomNodeProps) {
  // Function to get emoji based on node type or step name
  const getNodeEmoji = (stepName: string, from: string) => {
    if (stepName.toLowerCase().includes("submission")) return "📝";
    if (stepName.toLowerCase().includes("security")) return "🔒";
    if (
      stepName.toLowerCase().includes("fulfilment") ||
      stepName.toLowerCase().includes("fulfillment")
    )
      return "✅";
    if (stepName.toLowerCase().includes("delivery")) return "📦";
    if (stepName.toLowerCase().includes("approval")) return "👍";
    if (stepName.toLowerCase().includes("reject")) return "❌";
    if (stepName.toLowerCase().includes("return")) return "↩️";
    if (stepName.toLowerCase().includes("completed")) return "🎉";
    if (stepName.toLowerCase().includes("progress")) return "⏳";
    if (stepName.toLowerCase().includes("delivered")) return "✉️";
    if (from.toLowerCase().includes("requestor")) return "👤";
    if (from.toLowerCase().includes("security")) return "🛡️";
    if (
      from.toLowerCase().includes("fulfilment") ||
      from.toLowerCase().includes("fulfillment")
    )
      return "⚙️";
    return "⚡"; // default emoji
  };

  // Function to get background color based on node type
  const getNodeColors = (stepName: string, from: string, type: string) => {
    if (type === "status") {
      if (stepName.toLowerCase().includes("completed"))
        return {
          bg: "bg-green-50",
          border: "border-green-400",
          emoji: "bg-green-100",
        };
      if (stepName.toLowerCase().includes("rejected"))
        return {
          bg: "bg-red-50",
          border: "border-red-400",
          emoji: "bg-red-100",
        };
      if (stepName.toLowerCase().includes("approved"))
        return {
          bg: "bg-blue-50",
          border: "border-blue-400",
          emoji: "bg-blue-100",
        };
      if (stepName.toLowerCase().includes("progress"))
        return {
          bg: "bg-purple-50",
          border: "border-purple-400",
          emoji: "bg-purple-100",
        };
      if (stepName.toLowerCase().includes("delivered"))
        return {
          bg: "bg-teal-50",
          border: "border-teal-400",
          emoji: "bg-teal-100",
        };
      return {
        bg: "bg-gray-50",
        border: "border-gray-400",
        emoji: "bg-gray-100",
      };
    }

    if (from.toLowerCase().includes("security"))
      return {
        bg: "bg-orange-50",
        border: "border-orange-400",
        emoji: "bg-orange-100",
      };
    if (
      from.toLowerCase().includes("fulfilment") ||
      from.toLowerCase().includes("fulfillment")
    )
      return {
        bg: "bg-indigo-50",
        border: "border-indigo-400",
        emoji: "bg-indigo-100",
      };
    if (from.toLowerCase().includes("requestor"))
      return {
        bg: "bg-cyan-50",
        border: "border-cyan-400",
        emoji: "bg-cyan-100",
      };

    return { bg: "bg-white", border: "border-stone-400", emoji: "bg-gray-100" };
  };

  const stepName = data.stepName || data.name || data.label || "Step";
  const fromInfo = data.from || data.job || "Action";
  const stepNo = data.stepNo;
  // const emoji = getNodeEmoji(stepName, fromInfo);
  // const colors = getNodeColors(stepName, fromInfo, data.type || '');

  return (
    <div>
      {/* Step Number Badge - centered in entire card */}
      {/* Main Content */}
      <div className=" flex flex-col justify-center items-center text-center">
        {/* Text Content */}
        <div className="" style={{ border: "0px solid red" }}>
          <>
            {stepNo && (
              <div
                className="flex flex-col justify-center items-center text-center"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem",
                }}
              >
                <div
                  className="text-white rounded-full shadow-lg"
                  style={{
                    width: "70px",
                    height: "70px",
                    aspectRatio: "1",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 40% 30%, transparent 4%, transparent 57%, rgba(0,0,0,0.3) 90%) #907347`,
                    fontSize: "32px",
                    fontWeight: "900",
                    zIndex: 20,
                    boxShadow:
                      "0 6px 15px rgba(144, 115, 71, 0.4), 0 3px 8px rgba(0,0,0,0.3)",
                    color: "white",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: "1",
                    textAlign: "center",
                    border: "0px solid red",
                  }}
                >
                  {stepNo}
                </div>
              </div>
            )}
          </>
          <LabelTitleSemibold1
            text={stepName}
            isI18nKey={false}
            customClassName="truncate"
          />
          {/* <p className="text-sm font-bold mb-1 truncate">{stepName}</p> */}
          <h3 className="text-sm truncate">{fromInfo}</h3>
          {/* {data.action && (
            <div className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full truncate max-w-full">
              <span className="truncate">{data.action}</span>
            </div>
          )} */}
        </div>
      </div>
      {/* Bottom accent bar */}
      <div className="h-3 bg-gradient-to-r from-teal-400 to-emerald-500"></div>{" "}
      {/* ReactFlow Handle components for proper edge connections */}
      {/* Vertical layout handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          width: 8,
          height: 8,
          backgroundColor: "#10b981",
          border: "1px solid #059669",
          opacity: 0.6,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.6")}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          width: 8,
          height: 8,
          backgroundColor: "#10b981",
          border: "1px solid #059669",
          opacity: 0.6,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.6")}
      />
      {/* Horizontal layout handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          width: 8,
          height: 8,
          backgroundColor: "#3b82f6",
          border: "1px solid #2563eb",
          opacity: 0.6,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.6")}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          width: 8,
          height: 8,
          backgroundColor: "#3b82f6",
          border: "1px solid #2563eb",
          opacity: 0.6,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "1")}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "0.6")}
      />
    </div>
  );
}

export default memo(CustomNode);
