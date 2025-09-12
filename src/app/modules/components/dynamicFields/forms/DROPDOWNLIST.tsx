import { useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { Controller, FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";
import DropdownListInModal from "../../dropdown/DropdownListInModal";

export const DROPDOWNLIST = <T extends FormModel>({ divClass, containerClass, headerClass, inputClass, formControl, formHook, customHandlers, readonly, isReadOnly, isDisabled }: IFormProps<T> & { readonly?: boolean; isReadOnly?: boolean }) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const intl = useIntl();
	const [defaultValue, setDefaultValue] = useState<string>("");
	const [placeholder, setPlaceholder] = useState(formControl.placeholder || "");

	const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

	useMemo(() => {
		// Set value from fieldValue if present
		if (fieldValue !== undefined && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, fieldValue as any);
			return;
		}
		// Set default from serviceFieldOption.isDefault if present and no value is set
		if (Array.isArray((formControl as any).serviceFieldOption)) {
			const defaultOption = (formControl as any).serviceFieldOption.find((opt: any) => opt.isDefault);
			if (defaultOption && formHook.getValues(fieldKey) === undefined) {
				formHook.setValue(fieldKey, defaultOption.value as any);
			}
		}
	}, [fieldValue, fieldKey, formHook, formControl]);

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
									if (attrValue) {

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
	}, []);

	const setDropDownParams = (event: any) => {
		const data = (event.target as HTMLInputElement).value;
		let skipValidation = false;
		// if (formControl.attributes && formControl.attributes.allowSubmitWithoutValidation === "true") {
		// 	skipValidation = true;
		// }

		if (event.type == 'keydown' && !skipValidation) {
			// Pre-validation from parent component
			if (customHandlers?.onBeforeDropDownList) {
				const eventResult = customHandlers.onBeforeDropDownList(event, formControl);

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
		}

		formHook.clearErrors(fieldKey);

		formHook.setValue(fieldKey, data as any);

		// Post change callback
		if (customHandlers?.onChangeDropDownList) {
			customHandlers.onChangeDropDownList(event, formControl);
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
					// Only set rules if validation is not skipped
					{...(
						{ rules: { required: ((formControl["isRequired"] as boolean) === true ? `${intl.formatMessage({ id: "LABEL.REQUIRED" })}` : "") } }
					)}
					{...(formHook.register(fieldKey, {
						onChange: (e) => { setDropDownParams(e) },
						onBlur: (e) => { setDropDownParams(e) },
						...validatorSchema
					})
					)}
					render={({ field: { onChange, value } }) => (
						<DropdownListInModal
							dataKey={"value"}
							dataValue={"label"}
							defaultText={intl.formatMessage({ id: placeholder })}
							value={(value) ? value : ''}
							data={"serviceFieldOption" in formControl ? (formControl as any).serviceFieldOption : []}
							setSelectedValue={readonly ? undefined : onChange}
							key={fieldKey}
							id={String((formControl as any).field ?? (formControl as any).fieldKey)}
							isDisabled={!!isDisabled}
							isReadOnly={!!isDisabled ? false : !!isReadOnly}
						/>
					)}
				/>
			</div>
			{
				errors[fieldKey] &&
				errors[fieldKey]?.message && (
					<ErrorLabel text={String(errors[fieldKey]?.message)} isI18nKey={false} />
				)
			}
		</div>
	);
}