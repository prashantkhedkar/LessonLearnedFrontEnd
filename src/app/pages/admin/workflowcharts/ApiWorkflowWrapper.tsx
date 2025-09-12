import React, { useState, useEffect } from "react";
import DynamicWorkflowGenerator, {
  ApiWorkflowData,
} from "./DynamicWorkflowGenerator";
import {
  fetchWorkflowDataFromApi,
  WorkflowApiResponse,
} from "./workflowApiService";
import { GetWorkflowStepActionDetailsByServiceId } from "../../../modules/services/adminSlice";
import { useAppDispatch } from "../../../../store";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
} from "../../../modules/components/common/formsLabels/detailLabels";

interface ApiWorkflowWrapperProps {
  workflowId?: number;
  serviceId?: number;
  direction?: "TB" | "LR";
  height?: string;
  nodesDraggable?: boolean;
  showControls?: boolean;
  showMiniMap?: boolean;
}

export const ApiWorkflowWrapper: React.FC<ApiWorkflowWrapperProps> = ({
  workflowId,
  serviceId,
  direction = "LR",
  height = "75rem",
  nodesDraggable = true,
  showControls = true,
  showMiniMap = false,
}) => {
  const [workflowData, setWorkflowData] = useState<ApiWorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDirection, setCurrentDirection] = useState<"TB" | "LR">(
    direction
  );
  const dispatch = useAppDispatch();

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      setError(null);
      dispatch(
        GetWorkflowStepActionDetailsByServiceId({ serviceId: serviceId || 0 })
      )
        .then(unwrapResult)
        .then((orginalPromiseResult) => {
          if (orginalPromiseResult.statusCode === 200) {
            console.log("API Response:", orginalPromiseResult.data); // Debug log
            // Ensure we have valid data before setting
            if (
              orginalPromiseResult.data &&
              Array.isArray(orginalPromiseResult.data)
            ) {
              setWorkflowData(orginalPromiseResult.data);
            } else {
              console.warn("Invalid data format, using empty array");
              setWorkflowData([]);
            }
          } else {
            console.error("API returned non-200 status");
            setWorkflowData([]);
          }
        })
        .catch((error) => {
          console.error("fetching data error:", error);
          setWorkflowData([]); // Set empty array on error
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load workflow data"
      );
      setWorkflowData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflowData();
  }, [workflowId, serviceId]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "10px", color: "#6c757d" }}>
            Loading workflow...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center", color: "#dc3545" }}>
          <i
            className="fas fa-exclamation-triangle fa-3x"
            style={{ marginBottom: "10px" }}
          ></i>
          <p>Error loading workflow: {error}</p>
          <button
            className="btn btn-outline-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if workflowData is available and has data
  if (!workflowData || workflowData.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center", color: "#6c757d" }}>
          <i
            className="fas fa-info-circle fa-3x"
            style={{ marginBottom: "10px" }}
          ></i>
          <p>No workflow data available for this service.</p>
          {/* <button 
            className="btn btn-outline-primary"
            onClick={loadWorkflowData}
          >
            Refresh
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      {/* View Direction Toggle Controls */}
      <div
        style={{
          position: "absolute",
          width: "20%",
          top: "9px",
          left: "auto",
          right: "16px",
          zIndex: 1000,
          display: "flex",
          gap: "8px",
          // backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "8px 12px",
          // borderRadius: "8px",
          // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          // border: "1px solid #e0e0e0",
        }}
      >
        {/* <span
          style={{
            color: "#374151",
            alignSelf: "center",
            marginRight: "8px",
          }}
        >
          View:
        </span> */}

        {/* Vertical View Button */}
        <button
          onClick={() => setCurrentDirection("TB")}
          className={`btn btn-sm MOD_btn ${
            currentDirection === "TB" ? "btn-create" : "btn-cancel"
          } w-10 pl-5`}
          // style={{
          //   padding: "4px 12px",
          //   display: "flex",
          //   alignItems: "center",
          //   gap: "4px",
          //   minWidth: "80px",
          //   justifyContent: "center",
          // }}
        >
          <i className="fas fa-arrows-alt-v" style={{ fontSize: "12px" }}></i>
          {currentDirection === "TB" ? (
            <>
              <BtnLabeltxtMedium2 text={"WORKFLOW.CHART.VERTICAL"} />
            </>
          ) : (
            <>
              {" "}
              <BtnLabelCanceltxtMedium2 text={"WORKFLOW.CHART.VERTICAL"} />
              {/* Vertical */}
            </>
          )}
        </button>

        {/* Horizontal View Button */}
        <button
          onClick={() => setCurrentDirection("LR")}
          className={`btn btn-sm MOD_btn ${
            currentDirection === "LR" ? "btn-create" : "btn-cancel"
          } w-10 pl-5 mx-3`}
          //  className="btn MOD_btn btn-create w-10 pl-5 mx-3"
        >
          <i className="fas fa-arrows-alt-h" style={{ fontSize: "12px" }}></i>

          {currentDirection === "LR" ? (
            <>
              <BtnLabeltxtMedium2 text={"WORKFLOW.CHART.HORIZONTAL"} />
            </>
          ) : (
            <>
              {" "}
              <BtnLabelCanceltxtMedium2 text={"WORKFLOW.CHART.HORIZONTAL"} />
              {/* Horizontal */}
            </>
          )}
        </button>
      </div>

      <DynamicWorkflowGenerator
        workflowData={workflowData}
        direction={currentDirection}
        nodesDraggable={nodesDraggable}
        showControls={showControls}
        showMiniMap={showMiniMap}
        onRefresh={loadWorkflowData}
        isLoading={loading}
      />
    </div>
  );
};

export default ApiWorkflowWrapper;
