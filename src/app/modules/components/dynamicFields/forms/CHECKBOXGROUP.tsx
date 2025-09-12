import { useEffect, useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute, ServiceFieldOption } from "../utils/types";
import { Controller, FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { Checkbox, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";

export const CHECKBOXGROUP = <T extends FormModel>({ containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {

	const [validatorSchema, setValidatorSchema] = useState<object>({});
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const intl = useIntl();
	const [defaultValue, setDefaultValue] = useState<any[]>([]);
	const errors = formHook.formState.errors;

	const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

	useMemo(() => {
		if (fieldValue !== undefined && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, fieldValue as any);
		}
	}, [fieldValue, fieldKey, formHook]);

	useEffect(() => {
		const schema: any = {};
		if (formControl.isRequired) {
			schema.required = `${intl.formatMessage({ id: "LABEL.REQUIRED" })}`;
		}
		setValidatorSchema(schema);

		// Set default value as array of selected values, only if defaultValue exists
		const hasDefaultValue = Object.prototype.hasOwnProperty.call(formControl, 'defaultValue');
		const hasServiceFieldOption = Object.prototype.hasOwnProperty.call(formControl, 'serviceFieldOption') && Array.isArray((formControl as any).serviceFieldOption);
		if (hasDefaultValue && hasServiceFieldOption) {
			const defaultVal = (formControl as any).defaultValue;
			const serviceFieldOption = (formControl as any).serviceFieldOption as ServiceFieldOption[];
			let selectedKeyValPair: ServiceFieldOption[] = serviceFieldOption.filter(x => x.value == defaultVal);
			setDefaultValue(selectedKeyValPair.map(opt => opt.value));
			formHook.setValue(fieldKey, selectedKeyValPair as any);
		} else {
			setDefaultValue([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formControl, intl]);

	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
			</div>
			<div className={inputClass}>
				<FormControl component={"fieldset"}>
					<Controller
						name={fieldKey}
						control={formHook.control}
						defaultValue={defaultValue as any}
						rules={validatorSchema}
						render={({ field }: any) => {
							const setCheckboxGroupParams = (event, option: any) => {
								let selected = Array.isArray(field.value)
									? field.value.map((item: any) => (typeof item === 'object' ? item.value : item))
									: [];
								if (event.target.checked) {
									if (!selected.includes(option.value)) {
										selected.push(option.value);
									}
								} else {
									selected = selected.filter((v) => v !== option.value);
								}

								// Map selected values to ServiceFieldOption objects
								let selectedKeyValPair: ServiceFieldOption[] = [];
								if ('serviceFieldOption' in formControl && Array.isArray(formControl.serviceFieldOption)) {
									selectedKeyValPair = formControl.serviceFieldOption.filter((item) => selected.includes(item.value));
								}
								formHook.setValue(fieldKey, selectedKeyValPair as any);
								if (customHandlers?.onChangeCheckboxGroup) {
									customHandlers.onChangeCheckboxGroup(selectedKeyValPair, formControl);
								}
							};

							// Get selected values from field.value
							const selectedValues = Array.isArray(field.value)
								? field.value.map((item: any) => (typeof item === 'object' ? item.value : item))
								: [];

							return (
								<FormGroup row>
									{
										'serviceFieldOption' in formControl && Array.isArray(formControl.serviceFieldOption) &&
										formControl.serviceFieldOption.map((option, index) => (
											<FormControlLabel
												key={index}
												control={
													<Checkbox
														checked={selectedValues.includes(option.value)}
														onChange={readonly ? undefined : (e) => setCheckboxGroupParams(e, option)}
														disabled={!!readonly}
														sx={{
															"& .MuiSvgIcon-root": { border: "1px" },
															"&.Mui-checked": {
																color: "#B7945A",
															},
														}}
													/>
												}
												label={option.label}
											/>
										))
									}
								</FormGroup>
							)
						}}
					/>
					{
						errors && errors[fieldKey] && errors[fieldKey]?.message && (
							<ErrorLabel text={String(errors[fieldKey]?.message)} isI18nKey={false} />
						)
					}
				</FormControl>
			</div>
		</div>
	)
}
