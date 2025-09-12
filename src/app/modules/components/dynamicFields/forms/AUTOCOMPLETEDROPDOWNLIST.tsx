import { useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { Controller, FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";
import AutoCompleteMultiSelectLookup from "../../autocomplete/AutoCompleteMultiSelectLookup";

export const AUTOCOMPLETEDROPDOWNLIST = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T>) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const intl = useIntl();
	const [defaultValue, setDefaultValue] = useState<string>("");
	const [placeholder, setPlaceholder] = useState(formControl.placeholder || "");
	const [isMultiSelect, setIsMultiSelect] = useState<boolean>(true); // Default to multi-select

	const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

	useMemo(() => {
		// Set value from fieldValue if present
		if (fieldValue !== undefined && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, fieldValue as any);
			return;
		}
		// Set default from serviceFieldOption.isDefault if present and no value is set
		if (Array.isArray((formControl as any).serviceFieldOption)) {
			const defaultOptions = (formControl as any).serviceFieldOption
				.filter((opt: any) => opt.isDefault);
			if (defaultOptions.length > 0 && formHook.getValues(fieldKey) === undefined) {
				// For single select, take the first default option value, for multi-select, take all values
				const valueToSet = isMultiSelect
					? defaultOptions.map((opt: any) => opt.value)
					: defaultOptions[0].value;
				formHook.setValue(fieldKey, valueToSet as any);
			}
		}
	}, [fieldValue, fieldKey, formHook, formControl, isMultiSelect]);

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
						setDefaultValue(value as string);
						formHook.setValue(fieldKey, value as any);
					}
					break;

				case 'attributes':
					if (value) {
						const attributeProperties = value as ServiceFieldAttribute;

						for (const [attrKey, attrValue] of Object.entries(attributeProperties)) {
							switch (attrKey) {
								case "defaultOption":
									console.log(attrKey);

									if (attrValue) {

									}
									break;

								default:
									console.log(attrKey);
									break;
							}
						}
					}
					break;

				default:
					break;
			}
		}
	}, [formControl, intl, formHook, fieldKey]);

	const setDropDownParams = (selectedValues: any) => {
		// Pre-validation from parent component
		if (customHandlers?.onBeforeAutoDropDownList) {
			const eventResult = customHandlers.onBeforeAutoDropDownList(selectedValues, formControl);

			if (!eventResult) {
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
		}

		formHook.clearErrors(fieldKey);

		// Handle the selected values properly for multi-select vs single select
		let valueToSet;
		if (isMultiSelect) {
			// For multi-select, selectedValues should be an array of ServiceFieldOption
			valueToSet = Array.isArray(selectedValues)
				? selectedValues.map(item => item.value)
				: [];
		}

		formHook.setValue(fieldKey, valueToSet as any);

		// Post change callback
		if (customHandlers?.onChangeAutoDropDownList) {
			customHandlers.onChangeAutoDropDownList(selectedValues, formControl);
		}
	};


	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
			</div>
			<div className={inputClass}>
				<Controller
					control={formHook.control}
					name={fieldKey}
					// Only set rules if validation is not skipped
					rules={{
						required: ((formControl["isRequired"] as boolean) === true ? `${intl.formatMessage({ id: "LABEL.REQUIRED" })}` : false)
					}}
					render={({ field: { onChange, value } }) => (
						<AutoCompleteMultiSelectLookup
							onSearchChangeHandler={(selectedValues) => {
								if (!readonly) {
									onChange(Array.isArray(selectedValues) ? selectedValues.map(item => item.value) : []);
									setDropDownParams(selectedValues);
								}
							}}
							data={
								("serviceFieldOption" in formControl ? formControl.serviceFieldOption : []) ?? []
							}
							selectedValue={
								Array.isArray(value) && "serviceFieldOption" in formControl
									? formControl.serviceFieldOption?.filter(opt => (value as (string | number)[]).includes(opt.value as string | number)) ?? []
									: []
							}
							placeholder={placeholder}
							key={fieldKey}
							id={String(formControl.fieldKey)}
							isMultiSelect={isMultiSelect}
							readOnly={readonly}
						/>
					)}
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