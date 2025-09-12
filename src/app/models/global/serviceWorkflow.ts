export interface WorkflowStepModel {
    stepId? : number;
    serviceId? : number;  
    requestId? : number;
    stepOrder : number;  
    stepName : string;  
    fromEntityId : number;  
    currentStatusId : number;  
    createdBy? : number;  
    createdDate? : Date;  
    updatedBy? : number;  
    updatedDate? : Date;
    serviceWorkflowStepActions? : WorkflowStepActionsModel[];
}

export const workflowStepInitValue: WorkflowStepModel = {
    stepId: 0,
    serviceId: 0,
    requestId: 0,
    stepOrder: 0,
    stepName: "",
    fromEntityId: 0,
    currentStatusId: 0,
    serviceWorkflowStepActions : []
  };

export interface WorkflowStepActionsModel {
    id? : number;
    stepId? : number;
    actionId?: number;
    nextStatusId : number;  
    toEntityId : number;  
    returnStepId : number;  
    createdBy? : number;  
    createdDate? : Date;  
    updatedBy? : number;  
    updatedDate? : Date;
}



export const workflowStepActionsInitValue: WorkflowStepActionsModel = {
    id: 0,
    stepId: 0,
    actionId: 0,
    nextStatusId: 0,
    toEntityId: 0,
    returnStepId: 0
  };


  export interface ActionMasterModel {
    id? : number;
    actionName?: string;
    actionNameEn?: string;    
    createdBy? : number;  
    createdDate? : Date;  
    updatedBy? : number;  
    updatedDate? : Date;
    isActive : boolean;
}

export const actionInitValue: ActionMasterModel = {
  id: 0,
  actionName: "",
  isActive: false
};

export interface UserWorkflowActionModel {
  actionId: number;
  actionName: string;
  statusId: number;
};

export interface ServiceRequestActionModel {
  actionId?: number;
  actionDesc?: string;
  statusId?: number;
  unitId?: number;
};


