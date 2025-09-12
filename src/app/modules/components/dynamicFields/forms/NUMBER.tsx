import { useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";
import { Box, Typography } from "@mui/material";

export const NUMBER = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const errors = formHook.formState.errors;
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const intl = useIntl();
	const [placeholder, setPlaceholder] = useState(formControl.placeholder || "");
	const [maxLengthState, setMaxLengthState] = useState<number | null>(null);
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
		let numberRegex: RegExp | undefined = undefined;
		if (formControl.attributes &&
			typeof formControl.attributes === 'object' &&
			!Array.isArray(formControl.attributes) &&
			"regexValidation" in formControl.attributes &&
			(formControl.attributes as ServiceFieldAttribute).regexValidation
		) {
			numberRegex = new RegExp((formControl.attributes as ServiceFieldAttribute).regexValidation!);
		}

		setValidatorSchema(prevState => ({
			...prevState,
			validate: (value: string) => {
				if (value && numberRegex && !numberRegex.test(value)) {
					return intl.formatMessage({ id: 'VALIDATION.INVALID.NUMBER' });
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
										setMaxLengthState(maxLengthValue);
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

								case "minValue":
									if (attrValue !== undefined && attrValue !== null && attrValue !== "") {
										setValidatorSchema(prevState => ({
											...prevState,
											min: { value: Number(attrValue), message: intl.formatMessage({ id: 'VALIDATION.MINLIMIT' }) + attrValue }
										}));
									}
									break;

								case "maxValue":
									if (attrValue !== undefined && attrValue !== null && attrValue !== "") {
										setValidatorSchema(prevState => ({
											...prevState,
											max: { value: Number(attrValue), message: intl.formatMessage({ id: 'VALIDATION.MAXLIMIT' }) + attrValue }
										}));
									}
									break;

								case "regexValidation":
									if (attrValue) {
										let regexString: string | RegExp = /^[1-9]\d*$/; // Default positive integers without leading zeros
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
												pattern: { value: regex, message: `${intl.formatMessage({ id: "VALIDATION.INVALID.NUMBER" })}` }
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

	const setNumberParams = (event: any) => {
		// Block non-numeric input on keydown (except for allowed navigation keys)
		if (event.type === 'keydown') {
			const allowedKeys = [
				'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End',
			];
			if (
				!allowedKeys.includes(event.key) &&
				!/^[0-9]$/.test(event.key)
			) {
				event.preventDefault();
				return;
			}
		}

		// Pre-validation from parent component
		if (event.type == 'keydown') {
			if (customHandlers?.onBeforeChangeNumber) {
				const eventResult = customHandlers.onBeforeChangeNumber(event, formControl);

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

		const data = (event.target as HTMLInputElement).value;
		formHook.setValue(fieldKey, data as any);
		setCurrentLength(data ? data.length : 0);

		// Post change callback
		if (customHandlers?.onChangeNumber) {
			customHandlers.onChangeNumber(Number(data), formControl);
		}
	};

	// Handle input to prevent exceeding max length
	const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
		if (maxLengthState && event.currentTarget.value.length > maxLengthState) {
			event.currentTarget.value = event.currentTarget.value.slice(0, maxLengthState);
			formHook.setValue(fieldKey, event.currentTarget.value as any);
		}
		setCurrentLength(event.currentTarget.value.length);
	};

	// Enhanced paste handler that combines numeric validation with character limit
	const handleEnhancedPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		const pastedText = event.clipboardData.getData('text');

		// First check for non-numeric characters
		if (!/^[0-9]*$/.test(pastedText)) {
			event.preventDefault();
			formHook.setError(fieldKey, {
				type: 'manual',
				message: intl.formatMessage({ id: 'VALIDATION.INVALID.NUMBER' })
			});
			return;
		}

		// Then handle character limit if maxLengthState is set
		if (maxLengthState) {
			const currentText = event.currentTarget.value;
			const selectionStart = event.currentTarget.selectionStart || 0;
			const selectionEnd = event.currentTarget.selectionEnd || 0;

			// Calculate the new text after paste
			const beforeSelection = currentText.slice(0, selectionStart);
			const afterSelection = currentText.slice(selectionEnd);
			const newText = beforeSelection + pastedText + afterSelection;

			// If the new text would exceed the limit, prevent default and truncate
			if (newText.length > maxLengthState) {
				event.preventDefault();
				const maxPasteLength = maxLengthState - beforeSelection.length - afterSelection.length;
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

	// Ensure maxLength is number or undefined (minLength removed to prevent HTML5 validation)
	let maxLength: number | undefined = undefined;
	if (formControl.attributes && !Array.isArray(formControl.attributes)) {
		const maxLen = formControl.attributes.maxLength;
		maxLength = maxLen && !isNaN(Number(maxLen)) ? Number(maxLen) : undefined;
	}

	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={Boolean(formControl["isRequired"])} />
			</div>
			<div className={inputClass}>
				<input
					type={"text"}
					className={'form-control form-control-solid active input5 lbl-text-regular-2'}
					placeholder={placeholder}
					{...formHook.register(
						fieldKey,
						{ ...validatorSchema } // Apply validation
					)}
					name={String(fieldKey)}
					onKeyDown={readonly ? undefined : setNumberParams}
					onPaste={readonly ? undefined : handleEnhancedPaste}
					onInput={handleInput}
					maxLength={maxLength}
					autoComplete="off"
					key={fieldKey}
					id={String(formControl.fieldKey)}
					readOnly={!!readonly}
					disabled={!!readonly}
				/>
				{errors && errors[fieldKey] && errors[fieldKey]?.message && (
					<ErrorLabel text={String(errors[fieldKey]?.message)} isI18nKey={false} />
				)}
				{/* {maxLengthState && (
					<Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
						<Typography
							variant="caption"
							color={currentLength >= maxLengthState ? "error" : "text.secondary"}
							sx={{ fontSize: '0.75rem' }}
						>
							{currentLength}/{maxLengthState}
						</Typography>
					</Box>
				)} */}
			</div>
		</div>
	);
};
