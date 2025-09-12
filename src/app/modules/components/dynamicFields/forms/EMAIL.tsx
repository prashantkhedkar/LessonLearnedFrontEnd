import { useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";
import { Box, Typography } from "@mui/material";

export const EMAIL = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const intl = useIntl();
	const [placeholder, setPlaceholder] = useState(formControl.placeholder || "");
	const [maxLength, setMaxLength] = useState<number | null>(null);
	const [currentLength, setCurrentLength] = useState<number>(0);

	const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

	useMemo(() => {
		if (fieldValue !== undefined && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, fieldValue as any);
			setCurrentLength(String(fieldValue).length);
		}
		// Also set defaultValue if no fieldValue and field has defaultValue
		else if (fieldValue === undefined && 'defaultValue' in formControl && formControl.defaultValue !== undefined && formControl.defaultValue !== null && formControl.defaultValue !== "" && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, formControl.defaultValue as any);
			setCurrentLength(String(formControl.defaultValue).length);
		}
		// Update current length if field has existing value
		else {
			const currentValue = formHook.getValues(fieldKey);
			if (currentValue !== undefined) {
				setCurrentLength(String(currentValue).length);
			}
		}
	}, [fieldValue, fieldKey, formHook, formControl]);

	useMemo(() => {
		let emailRegex: RegExp | undefined = undefined;
		if (formControl.attributes &&
			typeof formControl.attributes === 'object' &&
			!Array.isArray(formControl.attributes) &&
			"regexValidation" in formControl.attributes &&
			(formControl.attributes as ServiceFieldAttribute).regexValidation
		) {
			emailRegex = new RegExp((formControl.attributes as ServiceFieldAttribute).regexValidation!);
		}

		setValidatorSchema(prevState => ({
			...prevState,
			validate: (value: string) => {
				if (!/^[\x00-\x7F]*$/.test(value)) {
					return false;
				}
				if (value && emailRegex && !emailRegex.test(value)) {
					return intl.formatMessage({ id: 'VALIDATION.INVALID.EMAIL' });
				}
				return true;
			}
		}));


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
										const maxLengthValue = Number(attrValue);
										setMaxLength(maxLengthValue);
										setValidatorSchema(prevState => ({
											...prevState,
											maxLength: { value: maxLengthValue, message: intl.formatMessage({ id: 'VALIDATION.MAXCHARLIMIT' }) + attrValue }
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
								case "regexValidation":
									if (attrValue) {
										let regexString: string | RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
										if (
											formControl.attributes &&
											typeof formControl.attributes === 'object' &&
											!Array.isArray(formControl.attributes) &&
											"regexValidation" in formControl.attributes
										) {
											regexString = (formControl.attributes as ServiceFieldAttribute).regexValidation || regexString;
										}

										if (regexString) {
											const regex = new RegExp(regexString);
											setValidatorSchema(prevState => ({
												...prevState,
												pattern: { value: regex, message: `${intl.formatMessage({ id: "VALIDATION.INVALID.EMAIL" })}` }
											}));
										}
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

	const setEmailParams = (event: any) => {
		// Block Arabic and non-ASCII on keydown
		if (event.type === 'keydown') {
			const key = event.key;
			if (/[^\x00-\x7F]/.test(key)) {
				event.preventDefault();
				formHook.setError(fieldKey, {
					type: 'manual',
					message: ''
				});
				return;
			}
		}

		// Pre-validation from parent component
		if (event.type == 'keydown') {
			if (customHandlers?.onBeforeChangeEmail) {
				const eventResult = customHandlers.onBeforeChangeEmail(event, formControl);

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
			// TDB
		}

		formHook.clearErrors(fieldKey);

		const data = (event.target as HTMLInputElement).value;
		formHook.setValue(fieldKey, data as any);
		setCurrentLength(data ? data.length : 0);

		// Post change callback
		if (customHandlers?.onChangeEmail) {
			customHandlers.onChangeEmail(data, formControl);
		}
	};

	// Enhanced paste handler that combines ASCII validation with character limit
	const handleEnhancedPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		const pastedText = event.clipboardData.getData('text');

		// First check for non-ASCII characters
		if (/[^\x00-\x7F]/.test(pastedText)) {
			event.preventDefault();
			formHook.setError(fieldKey, {
				type: 'manual',
				message: intl.formatMessage({ id: 'VALIDATION.ENGLISH_ONLY' })
			});
			return;
		}

		// Then handle character limit if maxLength is set
		if (maxLength) {
			const currentText = event.currentTarget.value;
			const selectionStart = event.currentTarget.selectionStart || 0;
			const selectionEnd = event.currentTarget.selectionEnd || 0;

			// Calculate the new text after paste
			const beforeSelection = currentText.slice(0, selectionStart);
			const afterSelection = currentText.slice(selectionEnd);
			const newText = beforeSelection + pastedText + afterSelection;

			// If the new text would exceed the limit, prevent default and truncate
			if (newText.length > maxLength) {
				event.preventDefault();
				const maxPasteLength = maxLength - beforeSelection.length - afterSelection.length;
				const truncatedPaste = pastedText.slice(0, maxPasteLength);
				const finalText = beforeSelection + truncatedPaste + afterSelection;

				event.currentTarget.value = finalText;
				formHook.setValue(fieldKey, finalText as any);
				setCurrentLength(finalText.length);

				// Set cursor position after the pasted text with null check
				setTimeout(() => {
					const input = event.currentTarget;
					if (input && typeof input.setSelectionRange === 'function' && input.isConnected) {
						const newCursorPosition = beforeSelection.length + truncatedPaste.length;
						try {
							input.setSelectionRange(newCursorPosition, newCursorPosition);
						} catch (e) {
							// Silently handle cases where setSelectionRange fails
							console.warn('Failed to set selection range:', e);
						}
					}
				}, 0);
			} else {
				// Update current length for normal paste
				setTimeout(() => {
					setCurrentLength(newText.length);
				}, 0);
			}
		}
	};

	// Handle input to prevent exceeding max length
	const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
		if (maxLength && event.currentTarget.value.length > maxLength) {
			event.currentTarget.value = event.currentTarget.value.slice(0, maxLength);
			formHook.setValue(fieldKey, event.currentTarget.value as any);
		}
		setCurrentLength(event.currentTarget.value.length);
	};

	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
			</div>
			<div className={inputClass}>
				<input className={'form-control form-control-solid active input5 lbl-text-regular-2'}
					type={"text"}
					placeholder={placeholder}
					{...formHook.register(
						fieldKey,
						{ ...validatorSchema } // Apply validation
					)}
					name={fieldKey}
					onKeyDown={setEmailParams}
					onPaste={handleEnhancedPaste}
					onInput={handleInput}
					maxLength={maxLength || undefined}
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
				{/* {maxLength && (
					<Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
						<Typography
							variant="caption"
							color={currentLength >= maxLength ? "error" : "text.secondary"}
							sx={{ fontSize: '0.75rem' }}
						>
							{currentLength}/{maxLength}
						</Typography>
					</Box>
				)} */}
			</div>
		</div>
	)
}
