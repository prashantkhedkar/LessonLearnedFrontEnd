import { useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";

export const DECIMAL = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
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

	const decimalRegex = !Array.isArray(formControl.attributes) && formControl.attributes?.regexValidation || /^[0-9]*\.?[0-9]*$/;
	const decimalPlaces = !Array.isArray(formControl.attributes) && formControl.attributes?.decimalPlaces ? parseInt(formControl.attributes.decimalPlaces) : 2;

	useMemo(() => {
		for (const [key, value] of Object.entries(formControl)) {
			switch (key) {
				case 'isRequired':
					if (value) {
						setValidatorSchema(prevState => ({ ...prevState, required: `${intl.formatMessage({ id: "LABEL.REQUIRED" })}` }));
					}
					break;

				case 'attributes':
					if (value) {
						const attributeProperties = value as ServiceFieldAttribute;

						for (const [attrKey, attrValue] of Object.entries(attributeProperties)) {
							switch (attrKey) {
								case "maxLength":
									if (attrValue) {
										setValidatorSchema(prevState => ({
											...prevState,
											maxLength: { value: Number(attrValue), message: intl.formatMessage({ id: 'VALIDATION.MAXCHARLIMIT' }) + attrValue }
										}));
									}
									break;

								case "minLength":
									if (attrValue) {
										setValidatorSchema(prevState => ({
											...prevState,
											minLength: { value: Number(attrValue), message: intl.formatMessage({ id: 'VALIDATION.MINCHARLIMIT' }) + attrValue }
										}));
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

		// Add regex validation for decimal
		setValidatorSchema(prevState => ({
			...prevState,
			pattern: {
				value: decimalRegex,
				message: intl.formatMessage({ id: 'VALIDATION.INVALIDDECIMAL' }, { X: decimalPlaces })
			},
			validate: (value: string) => {
				if (value === undefined || value === null || value === "") return true;
				const num = Number(value);
				if (
					formControl.attributes &&
					!Array.isArray(formControl.attributes) &&
					(formControl.attributes as ServiceFieldAttribute).minValue !== undefined &&
					value !== ""
				) {
					if (num < Number(formControl.attributes.minValue)) {
						return intl.formatMessage({ id: 'VALIDATION.MINLIMIT' }) + formControl.attributes.minValue;
					}
				}

				if (
					formControl.attributes &&
					!Array.isArray(formControl.attributes) &&
					(formControl.attributes as ServiceFieldAttribute).maxValue !== undefined &&
					value !== ""
				) {
					if (num > Number(formControl.attributes.maxValue)) {
						return intl.formatMessage({ id: 'VALIDATION.MAXLIMIT' }) + formControl.attributes.maxValue;
					}
				}
				return true;
			}
		}));

	}, [formControl, intl]);

	const setTextParams = (value: any) => {
		const data = (value.target as HTMLInputElement).value;

		// Block non-numeric and non-dot input
		if (value.type === 'keydown') {
			const e = value as React.KeyboardEvent<HTMLInputElement>;
			const allowedKeys = [
				'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.',
				'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End',
			];

			// Always allow English numbers, dot, minus, and navigation keys
			// In Arabic mode, also allow Arabic-Indic numerals (U+0660 - U+0669) but convert to English
			const isArabic = intl.locale && intl.locale.startsWith('ar');
			if (isArabic) {
				// Check if key is Arabic-Indic numeral
				const code = e.key.charCodeAt(0);
				if (code >= 0x0660 && code <= 0x0669) {
					// Insert the corresponding English numeral instead
					const englishNum = String(code - 0x0660);
					const target = e.target as HTMLInputElement;
					const start = target.selectionStart ?? 0;
					const end = target.selectionEnd ?? 0;
					const value = target.value;
					target.value = value.slice(0, start) + englishNum + value.slice(end);
					// Move cursor after inserted number
					setTimeout(() => {
						target.setSelectionRange(start + 1, start + 1);
					}, 0);
					e.preventDefault();
					return;
				}
			}

			if (!allowedKeys.includes(e.key)) {
				e.preventDefault();
				return;
			}
		}

		if (value.type == 'keydown') {
			// Pre-validation from parent component
			if (customHandlers?.onBeforeChangeDecimal) {
				const eventResult = customHandlers.onBeforeChangeDecimal(data, formControl);

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
		} else if (value.type == 'blur') {
			// Pre-validation from parent component
			if (customHandlers?.onBlurInputDecimal) {
				const eventResult = customHandlers.onBlurInputDecimal(data, formControl);

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
		} else {
			if (data && data.length == 0) {
				setValidatorSchema(prevState => ({ ...prevState, required: `${intl.formatMessage({ id: "LABEL.REQUIRED" })}` }));

				return;
			}
		}

		formHook.clearErrors(fieldKey);

		formHook.setValue(fieldKey, data as any);

		// Post change callback
		if (customHandlers?.onChangeText) {
			customHandlers.onChangeText(value, formControl);
		}
	}

	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
			</div>
			<div className={inputClass}>
				<input className={'form-control form-control-solid active input5 lbl-text-regular-2'}
					type={"text"}
					placeholder={formControl.placeholder}
					{...formHook.register(
						fieldKey,
						{ ...validatorSchema } // Apply validation
					)}
					name={fieldKey}
					onBlur={readonly ? undefined : (e) => setTextParams(e)}
					onKeyDown={readonly ? undefined : (e) => setTextParams(e)}
					maxLength={
						formControl.attributes &&
							!Array.isArray(formControl.attributes) &&
							formControl.attributes.maxLength
							? Number(formControl.attributes.maxLength)
							: undefined
					}
					autoComplete="off"
					key={fieldKey}
					id={String(formControl.fieldKey)}
					readOnly={!!readonly}
					disabled={!!readonly}
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