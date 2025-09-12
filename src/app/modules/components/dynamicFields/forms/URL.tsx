import { useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";
import { Box, Typography } from "@mui/material";

export const URL = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const [placeholder, setPlaceholder] = useState(formControl.placeholder || "");
	const [maxLength, setMaxLength] = useState<number | null>(null);
	const [currentLength, setCurrentLength] = useState<number>(0);
	const intl = useIntl();

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
										let urlRegex: RegExp;
										let regexString: string | undefined;
										if (
											formControl.attributes &&
											typeof formControl.attributes === 'object' &&
											!Array.isArray(formControl.attributes)
										) {
											regexString = (formControl.attributes as ServiceFieldAttribute).regexValidation;
										}

										if (regexString) {
											// Use the regex from the DB (string), add 'i' flag if needed
											urlRegex = new RegExp(regexString, "i");
										} else {
											// Fallback to default regex
											urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
										}

										// Add regex validation for URL
										setValidatorSchema(prevState => ({
											...prevState,
											pattern: {
												value: urlRegex,
												message: intl.formatMessage({ id: 'VALIDATION.INVALIDURL' })
											}
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
	}, [formControl, intl]);

	const setTextParams = (value: any) => {
		let data = (value.target as HTMLInputElement).value;

		// Filter out non-ASCII characters
		if (!isAsciiOnly(data)) {
			data = filterAsciiOnly(data);
			// Update the input field with filtered value
			(value.target as HTMLInputElement).value = data;
		}

		if (value.type == 'keydown') {
			// Pre-validation from parent component
			if (customHandlers?.onBeforeChangeURL) {

				const eventResult = customHandlers.onBeforeChangeURL(data, formControl);

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
			if (customHandlers?.onBlurInputURL) {
				const eventResult = customHandlers.onBlurInputURL(data, formControl);

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
		setCurrentLength(data ? data.length : 0);

		// Post change callback
		if (customHandlers?.onChangeText) {
			customHandlers.onChangeText(value, formControl);
		}
	}

	// Helper function to check if text contains only ASCII characters
	const isAsciiOnly = (text: string): boolean => {
		return /^[\x00-\x7F]*$/.test(text);
	};

	// Helper function to filter out non-ASCII characters
	const filterAsciiOnly = (text: string): string => {
		return text.replace(/[^\x00-\x7F]/g, '');
	};

	// Handle input to prevent exceeding max length and filter non-ASCII characters
	const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
		let value = event.currentTarget.value;

		// Filter out non-ASCII characters
		if (!isAsciiOnly(value)) {
			value = filterAsciiOnly(value);
			event.currentTarget.value = value;
		}

		if (maxLength && value.length > maxLength) {
			value = value.slice(0, maxLength);
			event.currentTarget.value = value;
		}

		formHook.setValue(fieldKey, value as any);
		setCurrentLength(value.length);
	};

	// Handle paste to prevent exceeding max length and filter non-ASCII characters
	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		const pastedText = event.clipboardData.getData('text');

		// Filter out non-ASCII characters from pasted text
		const filteredPastedText = filterAsciiOnly(pastedText);

		if (maxLength) {
			const currentText = event.currentTarget.value;
			const selectionStart = event.currentTarget.selectionStart || 0;
			const selectionEnd = event.currentTarget.selectionEnd || 0;

			// Calculate the new text after paste with filtered content
			const beforeSelection = currentText.slice(0, selectionStart);
			const afterSelection = currentText.slice(selectionEnd);
			const newText = beforeSelection + filteredPastedText + afterSelection;

			// If the new text would exceed the limit, prevent default and truncate
			if (newText.length > maxLength) {
				event.preventDefault();
				const maxPasteLength = maxLength - beforeSelection.length - afterSelection.length;
				const truncatedPaste = filteredPastedText.slice(0, maxPasteLength);
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
				// Prevent default and set the filtered value
				event.preventDefault();
				event.currentTarget.value = newText;
				formHook.setValue(fieldKey, newText as any);
				setCurrentLength(newText.length);

				// Set cursor position after the pasted text
				setTimeout(() => {
					const input = event.currentTarget;
					if (input && typeof input.setSelectionRange === 'function' && input.isConnected) {
						const newCursorPosition = beforeSelection.length + filteredPastedText.length;
						try {
							input.setSelectionRange(newCursorPosition, newCursorPosition);
						} catch (e) {
							// Silently handle cases where setSelectionRange fails
							console.warn('Failed to set selection range:', e);
						}
					}
				}, 0);
			}
		} else {
			// No max length restriction, but still filter ASCII
			if (!isAsciiOnly(pastedText)) {
				event.preventDefault();
				const currentText = event.currentTarget.value;
				const selectionStart = event.currentTarget.selectionStart || 0;
				const selectionEnd = event.currentTarget.selectionEnd || 0;

				const beforeSelection = currentText.slice(0, selectionStart);
				const afterSelection = currentText.slice(selectionEnd);
				const newText = beforeSelection + filteredPastedText + afterSelection;

				event.currentTarget.value = newText;
				formHook.setValue(fieldKey, newText as any);
				setCurrentLength(newText.length);

				// Set cursor position after the pasted text
				setTimeout(() => {
					const input = event.currentTarget;
					if (input && typeof input.setSelectionRange === 'function' && input.isConnected) {
						const newCursorPosition = beforeSelection.length + filteredPastedText.length;
						try {
							input.setSelectionRange(newCursorPosition, newCursorPosition);
						} catch (e) {
							// Silently handle cases where setSelectionRange fails
							console.warn('Failed to set selection range:', e);
						}
					}
				}, 0);
			}
		}
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
					onBlur={readonly ? undefined : (e) => setTextParams(e)}
					onKeyDown={readonly ? undefined : (e) => setTextParams(e)}
					onInput={handleInput}
					onPaste={handlePaste}
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
	);
}