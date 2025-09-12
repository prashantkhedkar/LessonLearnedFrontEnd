import { useMemo, useState, useEffect } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute, ServiceFieldOption } from "../utils/types";
import { FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";

export const RADIOGROUP = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const intl = useIntl();
	const selectedValue = formHook.watch(fieldKey);

	const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

	useMemo(() => {
		// Only proceed if serviceFieldOption is available
		if (!Array.isArray((formControl as any).serviceFieldOption)) {
			return;
		}

		// Set value from fieldValue if present (force set in readonly mode or if no current value)
		if (fieldValue !== undefined && (readonly || formHook.getValues(fieldKey) === undefined)) {
			// Verify the fieldValue exists in the available options
			const hasMatchingOption = (formControl as any).serviceFieldOption.some(
				(option: ServiceFieldOption) => option.value == fieldValue
			);
			
			if (hasMatchingOption) {
				formHook.setValue(fieldKey, fieldValue as any);
				return;
			}
		}
		
		// Set default from serviceFieldOption.isDefault if present and no value is set
		const defaultOption = (formControl as any).serviceFieldOption.find((opt: any) => opt.isDefault);
		if (defaultOption && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, defaultOption.value as any);
		}
	}, [fieldValue, fieldKey, formHook, formControl, readonly]);

	// Additional effect to ensure fieldValue is set properly in readonly mode
	useEffect(() => {
		if (readonly && fieldValue !== undefined && Array.isArray((formControl as any).serviceFieldOption)) {
			// Ensure the fieldValue matches one of the available options
			const hasMatchingOption = (formControl as any).serviceFieldOption.some(
				(option: ServiceFieldOption) => option.value == fieldValue
			);
			
			if (hasMatchingOption) {
				// Use setTimeout to ensure this runs after component is fully mounted
				setTimeout(() => {
					formHook.setValue(fieldKey, fieldValue as any, { 
						shouldValidate: false, 
						shouldDirty: false 
					});
				}, 0);
			}
		}
	}, [readonly, fieldValue, fieldKey, formHook, formControl]);

	useMemo(() => {
		for (const [key, value] of Object.entries(formControl)) {
			switch (key) {
				case 'isRequired':
					if (value) {
						setValidatorSchema(prevState => ({ ...prevState, required: `${intl.formatMessage({ id: "LABEL.REQUIRED" })}` }));
					}
					break;

				case "defaultValue":
					if (value) {
						formHook.setValue(fieldKey, value as any);
					}
					break;

				case 'attributes':
					if (value) {
						const attributeProperties = value as ServiceFieldAttribute;

						for (const [attrKey, attrValue] of Object.entries(attributeProperties)) {
							switch (attrKey) {
								case "defaultOption":
									if (attrValue) {
										// Do Something
									}
									break;

								default:
									break;
							}
						}
					}
					break;

				default:
					break;
			}
		}
	}, [formControl, intl]);

	const setRadioGroupParams = (value: any) => {
		const data = (value.target as HTMLInputElement).value;

		// Pre-validation from parent component
		if (customHandlers?.onBeforeChangeRadioGroup) {
			const eventResult = customHandlers.onBeforeChangeRadioGroup(value, formControl);

			if (typeof eventResult === "string") {
				formHook.setError(fieldKey, {
					type: 'manual',
					message: eventResult
				})
				return;
			}

			if (eventResult === false) {
				formHook.setError(fieldKey, {
					type: 'manual',
					message: `${intl.formatMessage({ id: "LABEL.REQUIRED" })}`
				})
				return;
			}
		}

		formHook.clearErrors(fieldKey);

		formHook.setValue(fieldKey, data as any);

		// Post change callback
		if (customHandlers?.onChangeRadioGroup) {
			customHandlers.onChangeRadioGroup(value, formControl);
		}
	};

	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
			</div>
			<div className={inputClass}>
				<FormControl component={"fieldset"}>
					<RadioGroup row value={selectedValue || ""} defaultValue={""}>
						{
							Array.isArray((formControl as any).serviceFieldOption) &&
							(formControl as any).serviceFieldOption.map(({ label, value }: ServiceFieldOption) => (
								<FormControlLabel
									{...(formHook.register(
										fieldKey,
										{ ...(!readonly ? validatorSchema : {}) } // Apply validation only when not readonly
									))}
									control={
										<Radio
											disabled={!!readonly}
											checked={selectedValue == value}
											sx={{
												color: 'var(--primary-5, #B7945A)',
												'&.Mui-checked': {
													color: 'var(--primary-5, #B7945A)'
												}
											}}
										/>
									}
									label={label}
									value={value}
									onChange={readonly ? undefined : (e) => setRadioGroupParams(e)}
									key={`${fieldKey}-${value}`}
									id={formControl.hasOwnProperty('fieldId') ? String((formControl as any).fieldId) : undefined}
								/>
							))
						}
					</RadioGroup>
					{
						errors[fieldKey] &&
						errors[fieldKey]?.message && (
							<ErrorLabel text={String(errors[fieldKey]?.message)} isI18nKey={false} />
						)
					}
				</FormControl>
			</div>
		</div>
	)
}
