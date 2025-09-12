import React, { useMemo, useRef, useEffect } from "react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
  Controls,
  ConnectionLineType,
  ReactFlowInstance,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import CustomNode from "./CustomNode";
import { BtnLabeltxtMedium2 } from "../../../modules/components/common/formsLabels/detailLabels";
import { auto } from "@popperjs/core";

// Interface for workflow table data (API response structure)
export interface WorkflowTableData {
  StepId: number;
  From: string;
  StepNo: number;
  StepName: string;
  Action: string;
  CurrentStatus: string;
  NextStatus: string;
}

// Interface for API response (lowercase properties)
export interface ApiWorkflowData {
  stepId: number;
  from: string;
  stepNo: number;
  stepName: string;
  action: string;
  currentStatus: string;
  nextStatus: string;
}

// Helper function to transform API data to expected format
const transformApiData = (apiData: ApiWorkflowData[]): WorkflowTableData[] => {
  return apiData.map((item) => ({
    StepId: item.stepId,
    From: item.from,
    StepNo: item.stepNo,
    StepName: item.stepName,
    Action: item.action?.replace(/\r\n/g, "").trim() || "", // Clean up action text
    CurrentStatus: item.currentStatus,
    NextStatus: item.nextStatus,
  }));
};

// Define node types for ReactFlow
const nodeTypes = {
  custom: CustomNode,
};

// Sample data based on your NEW API table structure (simulate API response)
// NOTE: This data is currently being used for testing instead of live API data
const sampleApiData: WorkflowTableData[] = [
  // {
  //   StepId: 1,
  //   From: "Requestor",
  //   StepNo: 1,
  //   StepName: "Submission",
  //   Action: "Submit",
  //   CurrentStatus: "",
  //   NextStatus: "Submitted",
  // },
  // {
  //   StepId: 2,
  //   From: "SecurityUnit",
  //   StepNo: 2,
  //   StepName: "Security Approval",
  //   Action: "Approve",
  //   CurrentStatus: "Submitted",
  //   NextStatus: "Security Approved",
  // },
  // {
  //   StepId: 3,
  //   From: "SecurityUnit",
  //   StepNo: 2,
  //   StepName: "Security Approval",
  //   Action: "Reject",
  //   CurrentStatus: "Submitted",
  //   NextStatus: "Security Rejected",
  // },
  // {
  //   StepId: 4,
  //   From: "SecurityUnit",
  //   StepNo: 2,
  //   StepName: "Security Approval",
  //   Action: "Return",
  //   CurrentStatus: "Submitted",
  //   NextStatus: "Return",
  // },
  // {
  //   StepId: 5,
  //   From: "FulfilmentUnit",
  //   StepNo: 3,
  //   StepName: "Fulfilment Approval",
  //   Action: "Approve",
  //   CurrentStatus: "Security Approved",
  //   NextStatus: "Fulfilment Approved",
  // },
  // {
  //   StepId: 6,
  //   From: "FulfilmentUnit",
  //   StepNo: 3,
  //   StepName: "Fulfilment Approval",
  //   Action: "Reject",
  //   CurrentStatus: "Security Approved",
  //   NextStatus: "Fulfilment Rejected",
  // },
  // {
  //   StepId: 7,
  //   From: "FulfilmentUnit",
  //   StepNo: 3,
  //   StepName: "Fulfilment Approval",
  //   Action: "Return",
  //   CurrentStatus: "Security Approved",
  //   NextStatus: "Fulfilment Returned",
  // },
  // {
  //   StepId: 8,
  //   From: "FulfilmentUnit",
  //   StepNo: 4,
  //   StepName: "Fulfillment Action",
  //   Action: "Update",
  //   CurrentStatus: "Fulfilment Approved",
  //   NextStatus: "In Progress",
  // },
  // {
  //   StepId: 9,
  //   From: "FulfilmentUnit",
  //   StepNo: 5,
  //   StepName: "Service Delivered",
  //   Action: "Update",
  //   CurrentStatus: "In Progress",
  //   NextStatus: "Delivered",
  // },
  // {
  //   StepId: 10,
  //   From: "Requestor",
  //   StepNo: 6,
  //   StepName: "Delivery Acknowledgement",
  //   Action: "Accept",
  //   CurrentStatus: "Delivered",
  //   NextStatus: "Delivered Acknowledged",
  // },
  // {
  //   StepId: 11,
  //   From: "FulfilmentUnit",
  //   StepNo: 7,
  //   StepName: "Fulfillment Completion",
  //   Action: "Update",
  //   CurrentStatus: "Delivered Acknowledged",
  //   NextStatus: "Completed",
  // },
];

// Helper function to generate colors based on action type
const getActionColor = (action: string): string => {
  // Safety check for undefined/null action
  if (!action || typeof action !== "string") return "#f1f5f9"; // Light slate

  const lowerAction = action.toLowerCase();

  if (lowerAction.includes("approve")) return "#d1fae5"; // Light green
  if (lowerAction.includes("reject")) return "#fee2e2"; // Light red
  if (lowerAction.includes("return")) return "#fef3c7"; // Light orange/yellow
  if (lowerAction.includes("submit")) return "#dbeafe"; // Light blue
  if (lowerAction.includes("accept")) return "#d1fae5"; // Light green
  if (lowerAction.includes("on hold")) return "#e0e7ff"; // Light indigo
  if (lowerAction.includes("in progress")) return "#ede9fe"; // Light purple
  if (lowerAction.includes("quotation")) return "#cffafe"; // Light cyan
  if (lowerAction.includes("upload")) return "#ecfccb"; // Light lime
  if (lowerAction.includes("delivered")) return "#ccfbf1"; // Light teal
  if (lowerAction.includes("update")) return "#fce7f3"; // Light pink
  if (
    lowerAction.includes("complete") ||
    lowerAction.includes("closed") ||
    lowerAction.includes("finish") ||
    lowerAction.includes("end")
  )
    return "#fecaca"; // Light red for completion
  return "#f1f5f9"; // Light slate as default
};

// Helper function to generate edge stroke colors (more vibrant for visibility)
const getEdgeColor = (action: string): string => {
  // Safety check for undefined/null action
  if (!action || typeof action !== "string") return "#64748b"; // Slate

  const lowerAction = action.toLowerCase();

  if (lowerAction.includes("approve")) return "#10b981"; // Green
  if (lowerAction.includes("reject")) return "#ef4444"; // Red
  if (lowerAction.includes("return")) return "#f59e0b"; // Orange
  if (lowerAction.includes("submit")) return "#3b82f6"; // Blue
  if (lowerAction.includes("accept")) return "#10b981"; // Green
  if (lowerAction.includes("on hold")) return "#6366f1"; // Indigo
  if (lowerAction.includes("in progress")) return "#8b5cf6"; // Purple
  if (lowerAction.includes("quotation")) return "#06b6d4"; // Cyan
  if (lowerAction.includes("upload")) return "#84cc16"; // Lime
  if (lowerAction.includes("delivered")) return "#14b8a6"; // Teal
  if (lowerAction.includes("update")) return "#ec4899"; // Pink
  if (
    lowerAction.includes("complete") ||
    lowerAction.includes("closed") ||
    lowerAction.includes("finish") ||
    lowerAction.includes("end")
  )
    return "#dc2626"; // Red for completion
  return "#64748b"; // Slate as default
};

// Helper function to generate colors based on "From" entity only
const getFromEntityColor = (from: string): string => {
  // Safety check for undefined/null from
  if (!from || typeof from !== "string") return "#e2e8f0"; // Light slate

  // Define color mapping for "From" entities - using lighter, more pleasant colors
  const fromEntityColors: { [key: string]: string } = {
    Requestor: "#dbeafe", // Light blue
    "Requesting Unit": "#dbeafe", // Light blue
    FulfilmentUnit: "#d1fae5", // Light green
    "Fulfilment Unit": "#d1fae5", // Light green
    SecurityUnit: "#fee2e2", // Light red
    "Security Unit": "#fee2e2", // Light red
    SupportingUnit: "#fef3c7", // Light yellow/orange
    "Supporting Unit": "#fef3c7", // Light yellow/orange
    "Delegation Unit": "#ede9fe", // Light purple
  };

  return fromEntityColors[from] || "#f1f5f9"; // Light slate as default
};

// Helper function to create darker arrow colors
const getDarkerArrowColor = (color: string): string => {
  if (color === "#10b981") return "#047857"; // Green to dark green
  if (color === "#ef4444") return "#b91c1c"; // Red to dark red
  if (color === "#f59e0b") return "#d97706"; // Orange to dark orange
  if (color === "#3b82f6") return "#1d4ed8"; // Blue to dark blue
  if (color === "#ec4899") return "#be185d"; // Pink to dark pink
  if (color === "#8b5cf6") return "#6d28d9"; // Purple to dark purple
  if (color === "#14b8a6") return "#0d9488"; // Teal to dark teal
  if (color === "#6366f1") return "#4338ca"; // Indigo to dark indigo
  if (color === "#06b6d4") return "#0891b2"; // Cyan to dark cyan
  if (color === "#84cc16") return "#65a30d"; // Lime to dark lime
  if (color === "#dc2626") return "#991b1b"; // Red to dark red
  return "#1f2937"; // Default dark gray
};

// Helper function to create node ID from entity name
const createEntityId = (entityName: string): string => {
  return entityName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
};

// Helper function to create action ID
const createActionId = (stepId: number, action: string): string => {
  // Safety check for undefined/null action
  const safeAction = action || "unknown_action";
  return `action_${stepId}_${safeAction
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")}`;
};

// Function to dynamically generate nodes and edges from API data
const generateWorkflowElements = (
  apiData: WorkflowTableData[] | ApiWorkflowData[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } => {
  // Safety check: ensure apiData is valid
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    console.warn(
      "Invalid or empty apiData provided to generateWorkflowElements"
    );
    return { nodes: [], edges: [] };
  }

  // Transform API data if it's in lowercase format
  let workflowData: WorkflowTableData[];
  if (apiData.length > 0 && "stepId" in apiData[0]) {
    // API data is in lowercase format, transform it
    workflowData = transformApiData(apiData as ApiWorkflowData[]);
    console.log("Transformed API data:", workflowData);
  } else {
    // Data is already in expected format
    workflowData = apiData as WorkflowTableData[];
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create sets to store unique step names and statuses
  const stepNames = new Set<string>();
  const statuses = new Set<string>();

  // Collect unique step names and statuses
  workflowData.forEach((step) => {
    if (step && step.StepName && step.StepNo && step.From) {
      // Concatenate From with StepName for better visibility
      stepNames.add(`${step.From}: ${step.StepName} (${step.StepNo})`);
    }
    if (step.CurrentStatus && step.CurrentStatus.trim()) {
      statuses.add(step.CurrentStatus);
    }
    if (step.NextStatus && step.NextStatus.trim()) {
      statuses.add(step.NextStatus);
    }
  });

  console.log("Step Names:", Array.from(stepNames));
  console.log("Statuses:", Array.from(statuses));

  // Create step name nodes (From: StepName (StepNo))
  stepNames.forEach((stepName) => {
    const stepId = createEntityId(stepName);
    const stepData = workflowData.find(
      (step) => `${step.From}: ${step.StepName} (${step.StepNo})` === stepName
    );
    const fromEntityColor = stepData
      ? getFromEntityColor(stepData.From)
      : "#64748b";

    nodes.push({
      id: stepId,
      type: "custom",
      data: {
        label: stepName,
        type: "stepName",
        stepName: stepData?.StepName || stepName,
        from: stepData?.From || "Unknown",
        stepNo: stepData?.StepNo, // Add stepNo to the node data
        action:
          workflowData
            .filter(
              (s) =>
                s.From === stepData?.From && s.StepName === stepData?.StepName
            )
            .map((s) => s.Action)
            .join(", ") || "None",
        // Add tooltip data for step nodes
        tooltip: `Entity1: ${stepData?.From || "Unknown"}\nStep: ${
          stepData?.StepName || "Unknown"
        }\nStep Number1 : ${
          stepData?.StepNo || "N/A"
        }\nActions Available1: ${workflowData
          .filter(
            (s) =>
              s.From === stepData?.From && s.StepName === stepData?.StepName
          )
          .map((s) => s.Action)
          .join(", ")}`,
        tooltipTitle: `${stepData?.StepName || "Unknown"} - ${
          stepData?.From || "Unknown"
        }`,
        tooltipDetails: [
          {
            label: <BtnLabeltxtMedium2 text={"WORKFLOW.CHART.ENTITY"} />,
            value: stepData?.From || "Unknown",
          },
          {
            label: <BtnLabeltxtMedium2 text={"WORKFLOW.CHART.STEPNUMBER"} />,
            value: stepData?.StepNo?.toString() || "N/A",
          },
          {
            label: (
              <BtnLabeltxtMedium2 text={"WORKFLOW.CHART.ACTIONSAVAILABLE"} />
            ),
            value:
              workflowData
                .filter(
                  (s) =>
                    s.From === stepData?.From &&
                    s.StepName === stepData?.StepName
                )
                .map((s) => s.Action)
                .join(", ") || "None",
          },
        ],
      },
      style: {
        background: `linear-gradient(135deg, ${fromEntityColor} 0%, rgba(255, 255, 255, 0.9) 50%, ${fromEntityColor} 100%)`, // Soft gradient with white center
        border: `2px solid rgba(156, 163, 175, 0.3)`, // Subtle border
        borderRadius: "16px", // More rounded
        fontSize: "36px",
        fontWeight: "600", // Softer weight
        color: "#374151", // Dark gray text for better readability
        padding: "24px",
        width: "auto",
        textAlign: "center",
        minWidth: "450px",
        height: "auto",
        boxShadow:
          "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)", // Soft shadow
        minHeight: "120px", // Reduced from 150px
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textShadow: "0 1px 2px rgba(0,0,0,0.3)", // Subtle text shadow
        lineHeight: "1.2", // Better line spacing for multi-line text
        letterSpacing: "0.3px", // Reduced letter spacing
        wordBreak: "break-word", // Handle long text gracefully
        hyphens: "auto", // Enable hyphenation for long words
      },
      position: { x: 0, y: 0 },
      draggable: true,
    });
  });

  // Create status nodes
  statuses.forEach((status) => {
    if (!status || !status.trim()) return;

    const statusId = createEntityId(status);
    const isCompleted = status.toLowerCase().includes("completed");
    const isRejected = status.toLowerCase().includes("rejected");

    let statusColor = "#6366f1"; // Default indigo
    if (isCompleted) statusColor = "#10b981"; // Green for completed
    else if (isRejected) statusColor = "#ef4444"; // Red for rejected
    else if (status.toLowerCase().includes("approved"))
      statusColor = "#10b981"; // Green for approved
    else if (status.toLowerCase().includes("progress"))
      statusColor = "#8b5cf6"; // Purple for in progress
    else if (status.toLowerCase().includes("delivered"))
      statusColor = "#14b8a6"; // Teal for delivered

    nodes.push({
      id: statusId,
      type: "custom",
      data: {
        label: status,
        type: "status",
        stepName: status,
        from: isCompleted ? "Completed" : isRejected ? "Rejected" : " ",
        // action: 'Status Node', // Simplified action text instead of transition count
        // Add tooltip data for status nodes
        // tooltip: ` `,
        // tooltipTitle: `Status: ${status}`,
        // tooltipDetails: [
        //   {
        //     label: "Type",
        //     value: isCompleted
        //       ? "Final Status"
        //       : isRejected
        //       ? "Rejected Status"
        //       : "Intermediate Status",
        //   },

        //   {
        //     label: "Status Category",
        //     value: isCompleted
        //       ? "✅ Complete"
        //       : isRejected
        //       ? "❌ Rejected"
        //       : "🔄 In Progress",
        //   },
        // ],
      },
      style: {
        background: "#ffffff",
        border: `3px solid ${statusColor}`, // Reduced border width
        borderRadius: "10px", // Reduced border radius
        fontSize: "32px", // Reduced from 46px for more compact design
        fontWeight: "600", // Slightly reduced weight
        color: statusColor,
        padding: "18px", // Reduced padding from 25px
        width: "auto",
        textAlign: "center",
        minWidth: "300px", // Reduced from 350px
        height: "auto",
        minHeight: "100px", // Reduced from 120px
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 4px 12px ${statusColor}30, 0 1px 6px rgba(0,0,0,0.15)`, // Reduced shadow
        lineHeight: "1.2", // Better line spacing
        letterSpacing: "0.3px", // Reduced letter spacing
        wordBreak: "break-word", // Handle long status names
        textShadow: `0 1px 2px ${statusColor}40`, // Subtle text shadow in status color
      },
      position: { x: 0, y: 0 },
      draggable: true,
    });
  });

  // Create action nodes and edges
  workflowData.forEach((step) => {
    if (!step || !step.StepName || typeof step.StepId !== "number") {
      console.warn("Skipping invalid step:", step);
      return;
    }

    const stepNameId = createEntityId(
      `${step.From}: ${step.StepName} (${step.StepNo})`
    );
    const nextStatusId = step.NextStatus
      ? createEntityId(step.NextStatus)
      : null;
    const currentStatusId = step.CurrentStatus
      ? createEntityId(step.CurrentStatus)
      : null;

    const actionColor = getActionColor(step.Action);
    const edgeColor = getEdgeColor(step.Action); // New vibrant color for edges
    const fromEntityColor = getFromEntityColor(step.From);

    // Create edge directly from step name to next status (if exists)
    if (nextStatusId && step.NextStatus) {
      // Create a unique edge ID that includes action to handle multiple actions from same step
      const edgeId = `e${
        step.StepId
      }_step_to_next_${step.Action.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      edges.push({
        id: edgeId,
        source: stepNameId,
        target: nextStatusId,
        type: "smoothstep",
        animated: true,
        sourceHandle: direction === "LR" ? "right" : "bottom",
        targetHandle: direction === "LR" ? "left" : "top",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getDarkerArrowColor(edgeColor), // Use darker color for arrow
        },
        style: {
          strokeWidth: 8, // Significantly increased for much broader visibility
          stroke: edgeColor, // Use vibrant edge color
          fontWeight: "bold",
        },
        label: step.Action,
        labelStyle: {
          fontSize: "24px", // Reduced from 28px for more compact design
          fontWeight: "700", // Slightly reduced weight
          fill: edgeColor, // Use edge color for text
          backgroundColor: "#ffffff",
          padding: "8px 12px", // Reduced padding for more compact labels
          borderRadius: "12px", // Reduced border radius
          border: `2px solid ${edgeColor}`, // Use edge color for border
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)", // Reduced shadow
          letterSpacing: "0.3px", // Reduced letter spacing
          lineHeight: "1.2", // Better line height
          maxWidth: "200px", // Reduced max width
          textAlign: "center",
          whiteSpace: "nowrap", // Prevent text wrapping in labels
          overflow: "hidden",
          textOverflow: "ellipsis", // Handle long action names gracefully
          textShadow: "0 1px 2px rgba(0,0,0,0.2)", // Reduced text shadow
        },
        labelBgStyle: {
          fill: "#ffffff",
          fillOpacity: 0.95,
        },
      });
    }

    // Create edge from current status to step name (if current status exists)
    if (currentStatusId && step.CurrentStatus) {
      // Check if there's already an edge from this status to this step
      const existingEdge = edges.find(
        (e) => e.source === currentStatusId && e.target === stepNameId
      );

      if (!existingEdge) {
        edges.push({
          id: `e${step.StepId}_current_to_step`,
          source: currentStatusId,
          target: stepNameId,
          type: "smoothstep",
          animated: false,
          sourceHandle: direction === "LR" ? "right" : "bottom",
          targetHandle: direction === "LR" ? "left" : "top",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#374151", // Darker gray for dashed edges
          },
          style: { strokeWidth: 6, stroke: "#6b7280", strokeDasharray: "4,4" }, // Significantly increased stroke width for much broader dashed lines
        });
      }
    }
  });

  console.log(
    "Generated nodes:",
    nodes.map((n) => ({ id: n.id, label: n.data.label, type: n.data.type }))
  );
  console.log(
    "Generated edges:",
    edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
    }))
  );

  // Validate edges - ensure all source and target nodes exist
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter((edge) => {
    const sourceExists = nodeIds.has(edge.source);
    const targetExists = nodeIds.has(edge.target);

    if (!sourceExists || !targetExists) {
      console.error(
        `Invalid edge ${edge.id}: source="${edge.source}" (${sourceExists}), target="${edge.target}" (${targetExists})`
      );
    }

    return sourceExists && targetExists;
  });

  return { nodes, edges: validEdges };
};

// Layout algorithm using Dagre
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  const nodeWidth = 280; // Increased to accommodate new card design width (min-w-64 = 256px + padding)
  const nodeHeight = 160; // Increased to accommodate new card design height

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 250 : 220, // Further increased spacing between nodes on same rank
    ranksep: isHorizontal ? 400 : 350, // Further increased spacing between ranks (edge length)
    marginx: 80, // Increased margins for better edge clearance
    marginy: 80,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Debug: Check if Step 3 edge is being added to layout
  const step3EdgeExists = edges.find((e) => e.id === "e3_to");
  if (step3EdgeExists) {
    console.log("🔴 Step 3 edge being added to layout:", step3EdgeExists);
  }

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Props interface for the component
interface DynamicWorkflowGeneratorProps {
  workflowData?: WorkflowTableData[] | ApiWorkflowData[];
  direction?: "TB" | "LR";
  nodesDraggable?: boolean;
  showControls?: boolean;
  showMiniMap?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  onCenterChart?: (centerFn: () => void) => void; // Callback to expose center function to parent
}

// Main component
export const DynamicWorkflowGenerator: React.FC<
  DynamicWorkflowGeneratorProps
> = ({
  workflowData = sampleApiData,
  direction = "TB",
  nodesDraggable = true,
  showControls = true,
  showMiniMap = false,
  onRefresh,
  isLoading = false,
  onCenterChart,
}) => {
  // Use API data if available, otherwise fallback to sample data
  const actualWorkflowData =
    workflowData && workflowData.length > 0 ? workflowData : sampleApiData;

  // Log data source for debugging
  React.useEffect(() => {
    if (workflowData && workflowData.length > 0) {
      console.log("✅ Using API data:", workflowData.length, "items");
    } else {
      console.log("⚠️ Using sample data:", sampleApiData.length, "items");
    }
  }, [workflowData]);

  // Generate nodes and edges from API data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => generateWorkflowElements(actualWorkflowData, direction),
    [actualWorkflowData, direction]
  );

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges, direction),
    [initialNodes, initialEdges, direction]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
    null
  );
  const [tooltip, setTooltip] = React.useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
    nodeType: string;
    title?: string;
    details?: Array<{ label: string; value: string }>;
  }>({
    visible: false,
    content: "",
    x: 0,
    y: 0,
    nodeType: "default",
  });
  const reactFlowInstance = useRef<ReactFlowInstance<any, any> | null>(null);

  // Handle ReactFlow initialization
  const onInit = (instance: ReactFlowInstance<any, any>) => {
    reactFlowInstance.current = instance;
  };

  // Center chart function
  const centerChart = React.useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 2.5,
        duration: 600,
      });
    }
  }, []);

  // Expose center function to parent component
  React.useEffect(() => {
    if (onCenterChart) {
      onCenterChart(centerChart);
    }
  }, [onCenterChart, centerChart]);

  // Force update edges when data changes
  React.useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // Trigger fitView when direction changes to center the chart
  useEffect(() => {
    if (reactFlowInstance.current) {
      // Use setTimeout to ensure nodes are rendered before fitting view
      setTimeout(() => {
        centerChart();
      }, 100);
    }
  }, [direction, layoutedNodes.length, layoutedEdges.length, centerChart]);

  // Update edge styles when a node is selected
  React.useEffect(() => {
    if (selectedNodeId) {
      const updatedEdges = edges.map((edge) => {
        const isRelated =
          edge.source === selectedNodeId || edge.target === selectedNodeId;

        if (isRelated) {
          // Get the original edge color or use a default
          const originalColor = edge.style?.stroke || "#3b82f6";

          // Create a darker version of the original color
          const getDarkerColor = (color: string) => {
            if (color === "#10b981") return "#047857"; // Green to dark green
            if (color === "#ef4444") return "#b91c1c"; // Red to dark red
            if (color === "#f59e0b") return "#d97706"; // Orange to dark orange
            if (color === "#3b82f6") return "#1d4ed8"; // Blue to dark blue
            if (color === "#ec4899") return "#be185d"; // Pink to dark pink
            if (color === "#8b5cf6") return "#6d28d9"; // Purple to dark purple
            if (color === "#14b8a6") return "#0d9488"; // Teal to dark teal
            return "#1f2937"; // Default dark gray
          };
          const darkColor = getDarkerColor(originalColor);

          // Highlighted edge style
          return {
            ...edge,
            style: {
              ...edge.style,
              strokeWidth: 15, // Extremely thick line for very broad highlighted edges
              stroke: darkColor, // Use darker color
              filter: `drop-shadow(0 0 12px ${darkColor}) brightness(1.2)`, // Enhanced glowing effect
              zIndex: 1000, // Bring to front
            },
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: darkColor, // Use darker color for highlighted arrow
            },
            labelStyle: {
              ...edge.labelStyle,
              fontSize: "28px", // Reduced from 46px for better readability
              fontWeight: "700", // Reduced from 900 for more balanced appearance
              fill: darkColor, // Use darker color for text
              backgroundColor: "#ffffff",
              padding: "16px 24px", // Reduced padding
              borderRadius: "20px", // Reduced border radius
              border: `4px solid ${darkColor}`, // Reduced border thickness
              boxShadow: `0 8px 16px rgba(0,0,0,0.4), 0 0 25px ${darkColor}40`, // Reduced shadow intensity
              transform: "scale(1.1)", // Reduced scaling for more subtle effect
              textShadow: "0 2px 4px rgba(0,0,0,0.4)", // Reduced text shadow
            },
          };
        } else {
          // Dimmed edge style - keep visible but with reduced opacity
          return {
            ...edge,
            style: {
              ...edge.style,
              strokeWidth: 4, // Significantly thicker stroke for broader dimmed edges
              stroke: edge.style?.stroke || "#6b7280", // Keep original color but lighter
              opacity: 0.3, // More visible than before but still dimmed
            },
            animated: false,
            labelStyle: {
              ...edge.labelStyle,
              opacity: 0.4, // More visible labels for dimmed edges
              fontSize: edge.labelStyle?.fontSize || "20px", // Smaller font for dimmed labels
            },
          };
        }
      });
      setEdges(updatedEdges);
    } else {
      // Reset all edges to normal style
      setEdges(layoutedEdges);
    }
  }, [selectedNodeId, layoutedEdges.length]); // Depend on layoutedEdges instead of edges to avoid infinite loop

  // Debug edges state changes
  React.useEffect(() => {
    console.log("🔍 All edges in component state:", edges);
    const step3Edge = edges.find(
      (edge) => edge.id === "SecurityUnit-Reject-Requestor"
    );
    console.log("🔍 Step 3 edge in state:", step3Edge);
    if (step3Edge) {
      console.log("🔴 Step 3 edge found in state!", step3Edge);
    } else {
      console.log("🔴 Step 3 edge NOT found in component state!");
    }
  }, [edges]);

  // Handle node click to highlight related edges
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    event.stopPropagation();

    if (selectedNodeId === node.id) {
      // If clicking the same node, deselect it
      setSelectedNodeId(null);
    } else {
      // Select the new node
      setSelectedNodeId(node.id);
    }

    console.log("Node clicked:", {
      id: node.id,
      label: node.data?.label,
      type: node.data?.type,
      selected: selectedNodeId !== node.id,
    });
  };

  // Handle node mouse enter to show tooltip
  const onNodeMouseEnter = (event: React.MouseEvent, node: Node) => {
    if (node.data?.tooltip && typeof node.data.tooltip === "string") {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        visible: true,
        content: node.data.tooltip,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        nodeType: (node.data.type as string) || "default",
        title: (node.data.tooltipTitle as string) || "",
        details:
          (node.data.tooltipDetails as Array<{
            label: string;
            value: string;
          }>) || [],
      });
    }
  };

  // Handle node mouse leave to hide tooltip
  const onNodeMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Handle click on background to deselect
  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  // Handle node drag end to save new positions
  const onNodeDragStop = (event: any, node: any) => {
    console.log("Node dragged to new position:", {
      id: node.id,
      position: node.position,
      type: node.type,
      label: node.data?.label,
    });
    // You can add logic here to save positions to localStorage or API
    // For example:
    // localStorage.setItem(`node-position-${node.id}`, JSON.stringify(node.position));
  };

  return (
    // <ReactFlowProvider>
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Refresh Button */}
      {/* {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
        >
          {isLoading ? (
            <>
              <svg
                style={{ animation: "spin 1s linear infinite" }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.75V6.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.25 6.75L16.01 7.99"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.25 12H17.75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.25 17.25L16.01 16.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19.25V17.75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.75 17.25L7.99 16.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.75 12H6.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.75 6.75L7.99 7.99"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 12a8 8 0 0 1 8-8V2.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m8 6 4-4 4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 12a8 8 0 0 1-8 8v1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m16 18-4 4-4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Refresh
            </>
          )}
        </button>
      )} */}

      {/* Add CSS animations for fancy effects */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes pulseEdge {
            0% { stroke-width: 8px; opacity: 1; }
            50% { stroke-width: 12px; opacity: 0.8; }
            100% { stroke-width: 8px; opacity: 1; }
          }
          
          @keyframes glowLabel {
            0% { 
              box-shadow: 0 8px 16px rgba(0,0,0,0.4), 0 0 25px currentColor;
              transform: scale(1.15);
            }
            50% { 
              box-shadow: 0 12px 24px rgba(0,0,0,0.5), 0 0 35px currentColor;
              transform: scale(1.18);
            }
            100% { 
              box-shadow: 0 8px 16px rgba(0,0,0,0.4), 0 0 25px currentColor;
              transform: scale(1.15);
            }
          }

          @keyframes tooltipSlideIn {
            0% {
              opacity: 0;
              transform: translate(-50%, -100%) scale(0.8) translateY(10px);
              filter: blur(4px);
            }
            50% {
              opacity: 0.8;
              transform: translate(-50%, -100%) scale(1.05) translateY(-5px);
              filter: blur(1px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -100%) scale(1) translateY(0);
              filter: blur(0);
            }
          }

          @keyframes tooltipSlideOut {
            0% {
              opacity: 1;
              transform: translate(-50%, -100%) scale(1) translateY(0);
              filter: blur(0);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -100%) scale(0.8) translateY(10px);
              filter: blur(4px);
            }
          }

          @keyframes tooltipGlow {
            0% {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.3);
            }
            50% {
              box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.5);
            }
            100% {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.3);
            }
          }

          @keyframes statusTooltipGlow {
            0% {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.3);
            }
            50% {
              box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.5);
            }
            100% {
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.3);
            }
          }

          .fancy-tooltip {
            animation: tooltipSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%);
            border: 1px solid rgba(255, 255, 255, 0.15);
            position: relative;
            overflow: hidden;
          }

          .fancy-tooltip::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            animation: shimmer 2s infinite;
          }

          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          .fancy-tooltip.stepName {
            animation: tooltipSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
                       tooltipGlow 2s ease-in-out infinite;
            border-color: rgba(59, 130, 246, 0.3);
          }

          .fancy-tooltip.status {
            animation: tooltipSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
                       statusTooltipGlow 2s ease-in-out infinite;
            border-color: rgba(16, 185, 129, 0.3);
          }

          .tooltip-content {
            position: relative;
            z-index: 1;
          }

          .tooltip-title {
           
            margin-bottom: 8px;
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          }

          .tooltip-info {
           
            opacity: 0.9;
            line-height: 1.5;
          }
        `}
      </style>

      <ReactFlow
        key={`${nodes.length}-${edges.length}`} // Force re-render when nodes/edges change
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{
          padding: 0.1, // Reduced padding for better use of screen space
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 2.5, // Reduced max zoom for better default view
          duration: 800,
        }}
        nodesDraggable={nodesDraggable}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        selectNodesOnDrag={false}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 6, fontWeight: "bold" }, // Significantly increased for broader default edges
          animated: true,
        }}
        minZoom={0.1}
        maxZoom={8} // Significantly increased to allow much more zoom
        defaultViewport={{ x: 0, y: 0, zoom: 6 }} // Much higher default zoom for maximum visibility
      >
        <Background color="#aaa" gap={16} />
        {showControls && (
          <Controls
            position="top-left"
            showInteractive={false}
            showFitView={true}
            showZoom={true}
          />
        )}
      </ReactFlow>

      {/* Fancy Tooltip */}
      {tooltip.visible && (
        <div
          className={`fancy-tooltip ${tooltip.nodeType}`}
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            color: "white",
            padding: "16px 20px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            // maxWidth: "320px",
            // minWidth: "320px",
            width: "350px",
            pointerEvents: "none",
            lineHeight: "1.5",
          }}
        >
          <div className="tooltip-content">
            {tooltip.title && (
              <div className="tooltip-title">{tooltip.title}</div>
            )}
            <div className="tooltip-info">
              {tooltip.details && tooltip.details.length > 0 ? (
                <div>
                  {tooltip.details.map((detail, index) => (
                    <div className="row" key={index}>
                      <div
                        className="col-md-5"
                        style={{ border: "0px solid blue" }}
                      >
                        {detail.label}
                      </div>
                      <div
                        className="col-md-1"
                        style={{ border: "0px solid blue" }}
                      >
                        :
                      </div>
                      <div
                        className="col-md-6"
                        style={{
                          textAlign: "right",
                          flex: 1,
                          border: "0px solid red",
                        }}
                      >
                        <BtnLabeltxtMedium2 text={detail.value} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ whiteSpace: "pre-line" }}>{tooltip.content}</div>
              )}
            </div>
          </div>

          {/* Tooltip Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              left: "50%",
              width: "12px",
              height: "12px",
              background:
                "linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderTop: "none",
              borderLeft: "none",
              transform: "translateX(-50%) rotate(45deg)",
            }}
          />
        </div>
      )}
    </div>
    // </ReactFlowProvider>
  );
};

export default DynamicWorkflowGenerator;
