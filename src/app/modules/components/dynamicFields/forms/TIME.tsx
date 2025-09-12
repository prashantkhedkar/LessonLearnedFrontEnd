import { useEffect, useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { FieldPath } from "react-hook-form";
import { TimePickerComponentWithMessage } from "../../datetimepicker/TimePicker";
import moment from "moment";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";

export const TIME = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
	// All React hooks must be declared first
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const [dataInput, setDataInput] = useState<dayjs.Dayjs | null>(() => {
		if (formControl && formControl["defaultValue"] && typeof formControl["defaultValue"] === 'string' && formControl["defaultValue"].trim() && moment(formControl["defaultValue"], "HH:mm", true).isValid()) {
			return dayjs(formControl["defaultValue"], "HH:mm", true);
		}
		return null;
	});
	const [disableTimePicker, setDisableTimePIcker] = useState<boolean>(false);
	const intl = useIntl();

	// Safe access to formControl properties with fallbacks
	const fieldKey = formControl?.fieldKey as FieldPath<T>;
	const fieldValue = formControl && 'fieldValue' in formControl ? formControl.fieldValue : undefined;

	// useMemo hook for field value initialization
	useMemo(() => {
		if (fieldValue !== undefined && formControl?.fieldKey && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, fieldValue as any);
		}
	}, [fieldValue, fieldKey, formHook, formControl?.fieldKey]);

	// useEffect for default value initialization
	useEffect(() => {
		if (!formControl?.fieldKey) return;
		const formValue = formHook.getValues(fieldKey);
		if ((formValue === undefined || formValue === null || formValue === "") && 
			formControl["defaultValue"] && 
			typeof formControl["defaultValue"] === 'string' && 
			formControl["defaultValue"].trim() && 
			moment(formControl["defaultValue"], "HH:mm", true).isValid()) {
			formHook.setValue(fieldKey, formControl["defaultValue"] as any, { shouldValidate: false });
		}
	}, [formControl, fieldKey, formHook]);

	// useEffect for initial picker value
	useEffect(() => {
		if (!formControl?.fieldKey) return;
		let formValue = formHook.getValues(fieldKey);
		let initial: dayjs.Dayjs | null = null;
		if (formValue && typeof formValue === 'string' && formValue.trim()) {
			const parsed = dayjs(formValue, 'HH:mm', true);
			initial = parsed.isValid() ? parsed : null;
		} else if (formValue && dayjs.isDayjs(formValue)) {
			initial = formValue;
		} else if (formControl["defaultValue"] && 
				   typeof formControl["defaultValue"] === 'string' && 
				   formControl["defaultValue"].trim() && 
				   moment(formControl["defaultValue"], "HH:mm", true).isValid()) {
			initial = dayjs(formControl["defaultValue"], 'HH:mm', true);
		}
		setDataInput(initial);
	}, [formControl, fieldKey, formHook]);

	// useMemo for validation schema
	useMemo(() => {
		if (!formControl) return;
		
		let requiredFlag = false;
		if (formControl && typeof formControl === 'object') {
			for (const [key, value] of Object.entries(formControl)) {
				switch (key) {
					case 'isRequired':
						if (value) {
							requiredFlag = true;
						}
						break;
					default:
						break;
				}
			}
		}
		
		// Use minValue and maxValue from attributes if present, otherwise fallback
		const minTimeValue = (formControl.attributes && !Array.isArray(formControl.attributes) && formControl.attributes?.minValue?.trim()) || "00:00";
		const maxTimeValue = (formControl.attributes && !Array.isArray(formControl.attributes) && formControl.attributes?.maxValue?.trim()) || "23:59";

		setValidatorSchema(prevState => ({
			...prevState,
			required: requiredFlag ? `${intl.formatMessage({ id: "LABEL.REQUIRED" })}` : false,
			validate: (value: any) => {
				if (requiredFlag && (!value || value === "")) {
					return intl.formatMessage({ id: "LABEL.REQUIRED" });
				}
				if (!value) return true;
				
				// Ensure value is a string and not empty
				if (typeof value !== 'string' || !value.trim()) {
					return true;
				}
				
				const timeVal = moment(value, ["HH:mm:ss", "HH:mm"]).format("HH:mm");
				if (minTimeValue && timeVal < minTimeValue) {
					return `Time must be after ${minTimeValue}`;
				}
				if (maxTimeValue && timeVal > maxTimeValue) {
					return `Time must be before ${maxTimeValue}`;
				}
				return true;
			}
		}));
	}, [formControl, intl]);

	// Defensive check to ensure formControl is properly defined - after all hooks
	if (!formControl || !formControl.fieldKey) {
		console.error('TIME component: formControl or fieldKey is undefined', formControl);
		return <div>Error: Invalid form control configuration</div>;
	}

	// All hooks are declared above, now safe to access formControl properties
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];

	dayjs.extend(customParseFormat);

	// Use minValue and maxValue from attributes if present, otherwise fallback
	const minTimeValue = (formControl.attributes && !Array.isArray(formControl.attributes) && formControl.attributes?.minValue?.trim()) || "00:00";
	const maxTimeValue = (formControl.attributes && !Array.isArray(formControl.attributes) && formControl.attributes?.maxValue?.trim()) || "23:59";
	const minTimeDate: dayjs.Dayjs | undefined = dayjs(minTimeValue, "HH:mm", true).isValid() ? dayjs(minTimeValue, "HH:mm", true) : undefined;
	const maxTimeDate: dayjs.Dayjs | undefined = dayjs(maxTimeValue, "HH:mm", true).isValid() ? dayjs(maxTimeValue, "HH:mm", true) : undefined;

	const setTimeParams = (value: dayjs.Dayjs | null) => {
		let timeOnly: string = "";
		if (value && dayjs.isDayjs(value) && value.isValid()) {
			timeOnly = value.format("HH:mm");
		} else {
			timeOnly = "";
		}
		if (customHandlers?.onBeforeChangeTime) {
			const result = customHandlers.onBeforeChangeTime(timeOnly, formControl);
			if (typeof result === 'string') {
				formHook.setError(fieldKey, { type: 'manual', message: result });
				return;
			}
			if (result === false) {
				formHook.setError(fieldKey, { type: 'manual', message: `${formControl["fieldLabel"]} change blocked by validation hook.` });
				return;
			}
		}
		formHook.clearErrors(fieldKey);
		formHook.setValue(fieldKey, timeOnly as any);
		setDataInput(value && value.isValid() ? value : null);
		if (customHandlers?.onChangeTime) {
			customHandlers.onChangeTime(timeOnly, formControl);
		}
	};

	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
			</div>
			<div className={inputClass}>
				<TimePickerComponentWithMessage
					{...formHook.register(
						fieldKey,
						{ ...validatorSchema } // Apply validation
					)}
					value={dataInput}
					label=""
					OnTimeChange={readonly ? (() => { }) : setTimeParams}
					isDisabled={!!readonly || disableTimePicker}
					minimumTime={minTimeDate}
					maximumTime={maxTimeDate}
					key={fieldKey}
				/>
				{
					errors[fieldKey] &&
					errors[fieldKey]?.message && (
						<ErrorLabel text={String(errors[fieldKey]?.message)} isI18nKey={false} />
					)
				}
			</div>
		</div>
	);
}