export interface WorkflowAction {
    actionId: number;
    stepId: number;
    actionName: string;
    nextStatus: string;
    toRole: string;
    returnPath?: string | null;
}