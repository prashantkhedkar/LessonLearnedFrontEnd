import React, { useState, useEffect } from "react";
import { WorkflowAction } from "./types/workflow";

type Props = {
    currentStepId: number;
    currentRole: string;
    actions: WorkflowAction[];
    onStatusChange: (status: string, toRole: string) => void;
};

const WorkflowActions: React.FC<Props> = ({ currentStepId, currentRole, actions, onStatusChange }) => {
    const [filteredActions, setFilteredActions] = useState<WorkflowAction[]>([]);

    useEffect(() => {
        const matchedActions = actions.filter(
            (action) => action.stepId === currentStepId && action.toRole === currentRole
        );
        setFilteredActions(matchedActions);
    }, [actions, currentStepId, currentRole]);

    const handleActionClick = (action: WorkflowAction) => {
        onStatusChange(action.nextStatus, action.toRole);
    };

    if (filteredActions.length === 0) {
        return <p>No available actions for this step and role.</p>;
    }

    return (
        <div className="flex gap-2 mt-4">
            {filteredActions.map((action) => (
                <button
                    key={action.actionId}
                    onClick={() => handleActionClick(action)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {action.actionName}
                </button>
            ))}
        </div>
    );
};

export default WorkflowActions;
