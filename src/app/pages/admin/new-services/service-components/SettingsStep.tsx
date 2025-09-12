import { forwardRef, useImperativeHandle } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AdminSetupServiceModel } from "../../../../models/global/serviceModel";
import { useNavigate } from "react-router-dom";

type props = {
    serviceId: number;
    onSuccess?: () => void; // Add optional onSuccess prop
};
export const SettingsStep = forwardRef((props: props, ref) => {
    const { serviceId } = props;
    const { formState: { errors }, handleSubmit } = useForm<AdminSetupServiceModel>();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<AdminSetupServiceModel> = data => {
        navigate("/admin-dashboard");
    };

    useImperativeHandle(ref, () => ({
        submit: () => {
            handleSubmit(onSubmit)();
        }
    }));

    return (
        <div>
            <h2>Settings Step</h2>
            <p>Service ID: {serviceId}</p>
            <form onSubmit={handleSubmit(onSubmit)}>

            </form>
        </div>
    );
});