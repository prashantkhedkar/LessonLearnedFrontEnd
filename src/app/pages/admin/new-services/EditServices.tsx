import { useEffect, useState } from "react";
import StepperComponent from "../../../modules/components/workflowStepper/StepperComponent";
import { useLocation } from "react-router-dom";

export const EditServices = () => {
    const location = useLocation();
    const [serviceId, setServiceId] = useState<number | null>(null);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [statusId, setStatusId] = useState<number>(-1);
    const [isPublished, setIsPublished] = useState<boolean>(false);
    const [currentTabView, setCurrentTabView] = useState<string>("draft-view");

    useEffect(() => {
        var output = location.state ? JSON.parse(JSON.stringify(location.state)).serviceId : 0;
        var isReadOnly = location.state ? JSON.parse(JSON.stringify(location.state)).isReadOnly : false;
        var statusId = location.state ? JSON.parse(JSON.stringify(location.state)).statusId : -1;
        var isPublished = location.state ? JSON.parse(JSON.stringify(location.state)).isPublish : false;
        var currentTabView = location.state ? JSON.parse(JSON.stringify(location.state)).currentTabView : "draft-view";

        setServiceId(output);
        setReadOnly(isReadOnly);
        setStatusId(statusId);
        setIsPublished(isPublished);
        setCurrentTabView(currentTabView);
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    {serviceId
                        &&
                        statusId &&
                        <StepperComponent serviceId={serviceId} readOnly={readOnly} statusId={statusId} isPublish={isPublished} currentTabView={currentTabView} />
                    }
                </div>
            </div>
        </>
    )
}
