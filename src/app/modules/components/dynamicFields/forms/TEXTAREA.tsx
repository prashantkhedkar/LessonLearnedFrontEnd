import { useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { FieldPath } from "react-hook-form";
import { TextField, Typography, Box } from "@mui/material";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";

export const TEXTAREA = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const [placeholder, setPlaceholder] = useState(formControl.placeholder || "");
	const [maxLength, setMaxLength] = useState<number | null>(null);
	const [currentLength, setCurrentLength] = useState<number>(0);
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
	const fieldKey = formControl.fieldKey as FieldPath<T>;
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

	const setTextAreaParams = (value: any) => {
		const data = (value.target as HTMLInputElement).value;

		if (value.type == 'keydown') {
			// Pre-validation from parent component
			if (customHandlers?.onBeforeChangeTextArea) {
				const eventResult = customHandlers.onBeforeChangeTextArea(value, formControl);

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
			if (customHandlers?.onBlurTextArea) {
				const eventResult = customHandlers.onBlurTextArea(value, formControl);

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
		if (customHandlers?.onChangeTextArea) {
			customHandlers.onChangeTextArea(value, formControl);
		}
	};

	// Handle input to prevent exceeding max length
	const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		if (maxLength && target.value.length > maxLength) {
			target.value = target.value.slice(0, maxLength);
			formHook.setValue(fieldKey, target.value as any);
		}
		setCurrentLength(target.value.length);
	};

	// Handle paste to prevent exceeding max length
	const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
		if (maxLength) {
			const target = event.target as HTMLInputElement | HTMLTextAreaElement;
			const pastedText = event.clipboardData.getData('text');
			const currentText = target.value;
			const selectionStart = target.selectionStart || 0;
			const selectionEnd = target.selectionEnd || 0;

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

				target.value = finalText;
				formHook.setValue(fieldKey, finalText as any);
				setCurrentLength(finalText.length);

				// Set cursor position after the pasted text
				setTimeout(() => {
					const newCursorPosition = beforeSelection.length + truncatedPaste.length;
					if (target && typeof target.setSelectionRange === 'function' && target.isConnected) {
						try {
							target.setSelectionRange(newCursorPosition, newCursorPosition);
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

	// Set default value in form if available
	if (fieldValue === undefined && 'defaultValue' in formControl && formControl.defaultValue !== undefined && formControl.defaultValue !== null && formControl.defaultValue !== "") {
		if (formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, formControl.defaultValue as any);
			setCurrentLength(String(formControl.defaultValue).length);
		}
	}

	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
			</div>
			<div className={inputClass}>
				<TextField
					inputProps={{
						readOnly: !!readonly,
						maxLength: maxLength || undefined
					}}
					//className={'form-control form-control-solid active input5 lbl-text-regular-2'}
					key={fieldKey}
					id={String(formControl.fieldKey)}
					sx={{
						'& .MuiInputBase-root': {
							height: '100%'
						},
						'& .MuiOutlinedInput-root': {
							'& fieldset': {
								borderColor: true ? '#cccccc' : '#cccccc'
							},
							'&:hover fieldset': {
								borderColor: '#cccccc'
							},
							'&.Mui-focused fieldset': {
								boxShadow: '0px 1px 1px rgb(0 0 0 / 8%) inset, 0px 0px 8px #dfcfb6 !important;'
							},
							'&.Mui-focused': {
								'& fieldset': {
									borderColor: '#cccccc'
								},
							}
						}
					}}
					placeholder={placeholder}
					{...formHook.register(
						fieldKey,
						{ ...validatorSchema } // Apply validation
					)}
					name={fieldKey}
					onBlur={(e) => setTextAreaParams(e)}
					onKeyDown={(e) => setTextAreaParams(e)}
					onInput={handleInput}
					onPaste={handlePaste}
					rows={4}
					multiline
					fullWidth
					aria-multiline={true}
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