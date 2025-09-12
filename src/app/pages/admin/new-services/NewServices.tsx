import { ServiceStatus } from "../../../helper/_constant/serviceStatus";
import StepperComponent from "../../../modules/components/workflowStepper/StepperComponent";

export const NewServices = () => {
    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <StepperComponent serviceId={0} readOnly={false} statusId={ServiceStatus.Draft} isPublish={false} currentTabView={"draft-view"} />
                </div>
            </div>
        </>
    )
}
