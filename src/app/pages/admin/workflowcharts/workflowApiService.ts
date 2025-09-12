// API service to fetch workflow data
export interface WorkflowApiResponse {
  StepId: number;
  From: string;
  Action: string;
  To: string;
  StepName: string;
}

// Simulated API call - replace this with your actual API endpoint
export const fetchWorkflowData = async (): Promise<WorkflowApiResponse[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return your table data structure
  return [
    {
      StepId: 1,
      From: "Requestor",
      Action: "Submit",
      To: "FulfilmentUnit",
      StepName: "Submission",
    },
    {
      StepId: 2,
      From: "FulfilmentUnit",
      Action: "Approve",
      To: "SecurityUnit",
      StepName: "Fulfilment Approval",
    },
    {
      StepId: 3,
      From: "FulfilmentUnit",
      Action: "Reject",
      To: "Requestor",
      StepName: "Fulfilment Approval",
    },
    {
      StepId: 4,
      From: "FulfilmentUnit",
      Action: "Return",
      To: "Requestor",
      StepName: "Fulfilment Approval",
    },
    {
      StepId: 5,
      From: "SecurityUnit",
      Action: "Approve",
      To: "FulfilmentUnit",
      StepName: "Security Approval",
    },
    {
      StepId: 6,
      From: "SecurityUnit",
      Action: "Reject",
      To: "Requestor",
      StepName: "Security Approval",
    },
    {
      StepId: 7,
      From: "SecurityUnit",
      Action: "Return",
      To: "FulfilmentUnit",
      StepName: "Security Approval",
    },
    {
      StepId: 8,
      From: "FulfilmentUnit",
      Action: 'Mark as "On Hold"',
      To: "FulfilmentUnit",
      StepName: "Fulfilment Action",
    },
    {
      StepId: 9,
      From: "FulfilmentUnit",
      Action: 'Mark as "In Progress"',
      To: "FulfilmentUnit",
      StepName: "Fulfilment Action",
    },
    {
      StepId: 10,
      From: "FulfilmentUnit",
      Action: "Assigned for Quotation",
      To: "SupportingUnit",
      StepName: "Fulfilment Action",
    },
    {
      StepId: 11,
      From: "SupportingUnit",
      Action: "Upload Quotation",
      To: "Requestor",
      StepName: "Quotation Submission",
    },
    {
      StepId: 12,
      From: "Requestor",
      Action: "Accept",
      To: "FulfilmentUnit",
      StepName: "Quotation Response",
    },
    {
      StepId: 13,
      From: "Requestor",
      Action: "Return",
      To: "SupportingUnit",
      StepName: "Quotation Response",
    },
    {
      StepId: 14,
      From: "FulfilmentUnit",
      Action: 'Mark as "In Progress"',
      To: "FulfilmentUnit",
      StepName: "Fulfilment Action",
    },
    {
      StepId: 15,
      From: "FulfilmentUnit",
      Action: "Mark as Delivered",
      To: "Requestor",
      StepName: "Service Delivery",
    },
    {
      StepId: 16,
      From: "Requestor",
      Action: "Accept",
      To: "FulfilmentUnit",
      StepName: "Delivery Acknowledgement",
    },
    {
      StepId: 17,
      From: "FulfilmentUnit",
      Action: "Update",
      To: "Requestor",
      StepName: "Fulfilment Completion",
    },
  ];
};

// Example of how to use with real API
export const fetchWorkflowDataFromApi = async (
  workflowId?: number
): Promise<WorkflowApiResponse[]> => {
  try {
    const response = await fetch(`/api/workflow/${workflowId || "default"}`);
    if (!response.ok) {
      throw new Error("Failed to fetch workflow data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching workflow data:", error);
    // Fallback to sample data
    return fetchWorkflowData();
  }
};
