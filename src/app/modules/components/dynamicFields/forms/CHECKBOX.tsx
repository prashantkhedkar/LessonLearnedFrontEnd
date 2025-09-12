import { useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldOption } from "../utils/types";
import { Controller, FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { Checkbox, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";

export const CHECKBOX = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const intl = useIntl();

	const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

	useMemo(() => {
		if (fieldValue !== undefined && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, fieldValue as any);
		}
	}, [fieldValue, fieldKey, formHook]);

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
						formHook.setValue(fieldKey, true as any);
					}
					break;

				default:
					break;
			}
		}
	}, [formControl, intl]);

	return (
		<div className={divClass}>
			<div className={containerClass}>
				<div className={headerClass}>
					<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"] as boolean)} />
				</div>
				<div className={inputClass}>
					<FormControl component={"fieldset"}>
						<Controller
							name={fieldKey}
							control={formHook.control}
							rules={validatorSchema}
							render={({ field }: any) => {

								const setCheckboxParams = (event) => {
									// Pre-validation from parent component
									if (customHandlers?.onBeforeChangeCheckbox) {
										const eventResult = customHandlers.onBeforeChangeCheckbox(
											('serviceFieldOption' in formControl && Array.isArray((formControl as any).serviceFieldOption) ?
												(formControl as any).serviceFieldOption[0]
												: undefined),
											formControl
										);

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
									};

									// Clear previous errors
									formHook.clearErrors(fieldKey);

									formHook.setValue(fieldKey, event.target.checked);

									if (customHandlers?.onChangeCheckbox) {
										if ('serviceFieldOption' in formControl && Array.isArray((formControl as any).serviceFieldOption)) {
											customHandlers.onChangeCheckbox((formControl as any).serviceFieldOption[0], formControl);
										} else {
											customHandlers.onChangeCheckbox(
												(formControl as any).serviceFieldOption?.[0] ?? {} as ServiceFieldOption,
												formControl
											);
										}
									}
								};

								return (
									<FormGroup row>
										<FormControlLabel
											key={formControl["fieldKey"]}
											control={
												<Checkbox
													checked={!!field.value}
													{...formHook.register(
														fieldKey,
														{ ...validatorSchema } // Apply validation
													)}
													onChange={readonly ? undefined : (e) => setCheckboxParams(e)}
													key={fieldKey}
													id={formControl.hasOwnProperty('fieldId') ? String((formControl as any).fieldId) : undefined}
													disabled={!!readonly}
													sx={{
														"& .MuiSvgIcon-root": { border: "1px" },
														"&.Mui-checked": {
															color: "#B7945A",
														},
													}}
												/>
											}
											label={""}											
										/>
									</FormGroup>
								)
							}}
						/>

						{
							errors[fieldKey] &&
							errors[fieldKey]?.message && (
								<ErrorLabel text={String(errors[fieldKey]?.message)} isI18nKey={false} />
							)
						}
					</FormControl>
				</div>
			</div>
		</div>
	)
}