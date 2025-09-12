import { useMemo, useRef, useState, useEffect } from "react";
import { DynamicFieldModel, FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { Controller, FieldPath } from "react-hook-form";
import JoditEditor from 'jodit-react'
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";
import { IJodit } from "jodit/types/types";
import { Box, Typography } from "@mui/material";

export const TEXTEDITOR = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly = false }: IFormProps<T> & { readonly?: boolean }) => {
	const [validatorSchema, setValidatorSchema] = useState<object>();
	const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
	const fieldKey = formControl.fieldKey as FieldPath<T>;
	const [disableControls, setDisableControls] = useState<boolean>(false);
	const editorRef = useRef<IJodit>(null);
	const intl = useIntl();
	const [lengthError, setLengthError] = useState<string>("");

	const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

	// Helper to strip HTML tags and count only text content
	const getTextLength = (html: string) => {
		const div = document.createElement("div");
		div.innerHTML = html;
		return div.textContent?.length || 0;
	};
	const [currentLength, setCurrentLength] = useState<number>(0);

	// Get max length from attributes
	const maxLength = (formControl.attributes && !Array.isArray(formControl.attributes) && formControl.attributes.maxLength) ? Number(formControl.attributes.maxLength) : undefined;

	// Update current length whenever the field value changes
	useEffect(() => {
		const currentValue = formHook.getValues(fieldKey);
		const valueToCheck = currentValue || fieldValue || ('defaultValue' in formControl && formControl.defaultValue !== undefined ? formControl.defaultValue : "");

		if (valueToCheck !== undefined && valueToCheck !== null) {
			const textLength = getTextLength(String(valueToCheck));
			setCurrentLength(textLength);
		} else {
			setCurrentLength(0);
		}
	}, [formHook.watch(fieldKey), fieldKey, fieldValue]);

	const DEFAULT_JODIT_CONFIG = {
		autoFocus: false,
		placeholder: "",
		language: "ar",
		debugLanguage: true,
		i18n: { ar: { 'Insert as Text': 'التنسيق الإفتراضي', 'Keep': 'احتفظ بالتنسيق', 'Clean': 'التنسيق الإفتراضي', 'Insert only Text': 'إدراج النص فقط', } },
		allowTab: true,
		tabIndex: 1,
		tabWidth: 3,
		editorClassName: "custom-jodit-editor",
		buttons: [
			"bold", "underline", "|",
			"ul", "ol", "|",
			"table", "|",
			"align", "eraser", "undo"
		],
		events: {
			openPasteDialog: (popup) => {
				const interval = setInterval(() => {
					const pasteButton = popup.querySelector('.jodit-ui-button__text')
					if (pasteButton) {
						pasteButton.textContent = "hi"
						clearInterval(interval)
					}
				}, 100)
			},
			beforeInput: (event) => {
				if (!maxLength) return;

				const editor = event.currentTarget;
				const currentTextLength = getTextLength(editor.innerHTML);

				// Allow deletion operations
				if (event.inputType === 'deleteContentBackward' ||
					event.inputType === 'deleteContentForward' ||
					event.inputType === 'deleteWordBackward' ||
					event.inputType === 'deleteWordForward' ||
					event.inputType === 'deleteByCut') {
					return;
				}

				// Get the text that would be inserted
				const data = event.data || '';

				// Check if adding this text would exceed the limit
				if (currentTextLength + data.length > maxLength) {
					event.preventDefault();
					setLengthError(intl.formatMessage({ id: 'VALIDATION.CHARACTER_LIMIT_REACHED' }, { maxLength }));
					return false;
				}

				// Clear error if we're within limit
				setLengthError("");
				return true;
			},
			keydown: (event) => {
				if (!maxLength) return;

				const editor = event.currentTarget;
				const currentTextLength = getTextLength(editor.innerHTML);

				const allowedKeys = [
					'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
					'Home', 'End', 'PageUp', 'PageDown', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5',
					'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
				];

				const isCtrlKey = event.ctrlKey || event.metaKey;
				const allowedCtrlKeys = ['a', 'c', 'x', 'z', 'y']; // Removed 'v' to handle paste separately

				// Allow special keys and shortcuts
				if (allowedKeys.includes(event.key) ||
					(isCtrlKey && allowedCtrlKeys.includes(event.key.toLowerCase()))) {
					return;
				}

				// Prevent paste using Ctrl+V when at limit
				if (isCtrlKey && event.key.toLowerCase() === 'v') {
					if (currentTextLength >= maxLength) {
						event.preventDefault();
						setLengthError(intl.formatMessage({ id: 'VALIDATION.CHARACTER_LIMIT_REACHED_PASTE' }));
						return;
					}
				}

				// Prevent typing new characters if at limit
				const isCharacterKey = event.key.length === 1 && !isCtrlKey;
				if (currentTextLength >= maxLength && isCharacterKey) {
					event.preventDefault();
					setLengthError(intl.formatMessage({ id: 'VALIDATION.CHARACTER_LIMIT_REACHED' }, { maxLength }));
					return;
				}

				// Prevent Enter key if at limit
				if (event.key === 'Enter' && currentTextLength >= maxLength) {
					event.preventDefault();
					setLengthError(intl.formatMessage({ id: 'VALIDATION.CHARACTER_LIMIT_REACHED' }, { maxLength }));
					return;
				}
			},
			paste: (event) => {
				if (!maxLength) return;
				const editor = event.currentTarget;
				setTimeout(() => {
					if (!editor) return;
					const currentTextLength = getTextLength(editor.innerHTML);
					if (currentTextLength > maxLength) {
						// Truncate to maxLength
						const div = document.createElement("div");
						div.innerHTML = editor.innerHTML;
						const textContent = div.textContent || div.innerText || '';
						const truncatedText = textContent.slice(0, maxLength);
						editor.innerHTML = '';
						const textNode = editor.ownerDocument.createTextNode(truncatedText);
						editor.appendChild(textNode);
						setLengthError(intl.formatMessage({ id: 'VALIDATION.CONTENT_TRUNCATED' }, { maxLength }));
					} else {
						setLengthError("");
					}
				}, 0);
			},
			input: (event) => {
				if (!maxLength) return;

				const editor = event.currentTarget;
				const currentTextLength = getTextLength(editor.innerHTML);

				// If somehow the content exceeds the limit (fallback protection)
				if (currentTextLength > maxLength) {
					// Truncate the content to the maximum allowed length
					const div = document.createElement("div");
					div.innerHTML = editor.innerHTML;
					const textContent = div.textContent || div.innerText || '';
					const truncatedText = textContent.slice(0, maxLength);

					// Clear the editor and insert the truncated text
					editor.innerHTML = '';
					const textNode = editor.ownerDocument.createTextNode(truncatedText);
					editor.appendChild(textNode);

					setLengthError(intl.formatMessage({ id: 'VALIDATION.CONTENT_TRUNCATED' }, { maxLength }));
				}
			}
		},
		paste: {
			clean: true,
			stripTags: true,
		},
		disablePlugins: ['paste'],
		toolbarAdaptive: false
	};

	const config = useMemo(() => ({
		...DEFAULT_JODIT_CONFIG,
		readOnly: disableControls
	}), [disableControls]);

	// Handle change event with length validation
	const handleOnChangeEditor = (data: string) => {
		if (!maxLength) {
			setCurrentLength(getTextLength(data));
			return data;
		}

		// Get current text length (excluding HTML tags)
		const textLength = getTextLength(data);
		setCurrentLength(textLength);

		if (textLength > maxLength) {
			setLengthError(intl.formatMessage({ id: 'VALIDATION.TEXT_CANNOT_EXCEED' }, { maxLength }));
			// Prevent the change by returning undefined
			return undefined;
		}

		// Clear errors if within limit
		setLengthError("");
		return data;
	};

	useMemo(() => {
		// Set default value if no fieldValue and field has defaultValue
		if (fieldValue === undefined && 'defaultValue' in formControl && formControl.defaultValue !== undefined && formControl.defaultValue !== null &&
			formControl.defaultValue !== "" && formHook.getValues(fieldKey) === undefined) {
			formHook.setValue(fieldKey, formControl.defaultValue as any);
		}

		// If fieldValue is provided (existing data), ensure it's set in the form
		if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
			const currentFormValue = formHook.getValues(fieldKey);
			if (currentFormValue === undefined || currentFormValue === null || currentFormValue === "") {
				formHook.setValue(fieldKey, fieldValue as any);
			}
		}

		// Initialize current length on mount - prioritize fieldValue over form value
		const currentValue = fieldValue || formHook.getValues(fieldKey) || ('defaultValue' in formControl && formControl.defaultValue !== undefined ? formControl.defaultValue : "");
		if (currentValue !== undefined && currentValue !== null) {
			setCurrentLength(getTextLength(String(currentValue)));
		}
	}, [fieldValue, fieldKey, formHook, formControl]);

	// Clear length error when field value changes
	useEffect(() => {
		if (lengthError) {
			const currentValue = formHook.getValues(fieldKey);
			if (currentValue && maxLength) {
				const textLength = getTextLength(String(currentValue));
				if (textLength <= maxLength) {
					setLengthError("");
				}
			}
		}
	}, [formHook.watch(fieldKey), lengthError, maxLength, fieldKey]);

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
	}, [formControl, intl]);

	const validateEditor = (value: any) => {
		let plainText = value;
		try {
			if (typeof window !== 'undefined' && window.document) {
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = value || '';
				plainText = tempDiv.textContent || tempDiv.innerText || '';
			}
		} catch (e) {
			plainText = value;
		}

		const minLength = (formControl.attributes && !Array.isArray(formControl.attributes) && formControl.attributes.minLength) ? Number(formControl.attributes.minLength) : undefined;
		const maxLength = (formControl.attributes && !Array.isArray(formControl.attributes) && formControl.attributes.maxLength) ? Number(formControl.attributes.maxLength) : undefined;

		if ('isRequired' in formControl && formControl.isRequired && plainText.length === 0) {
			return intl.formatMessage({ id: 'LABEL.REQUIRED' });
		}
		if (minLength && plainText.length < minLength) {
			return intl.formatMessage({ id: 'VALIDATION.MINCHARLIMIT' }) + minLength;
		}
		if (maxLength && plainText.length > maxLength) {
			return intl.formatMessage({ id: 'VALIDATION.MAXCHARLIMIT' }) + maxLength;
		}

		if (customHandlers?.onBeforeChangeTextEditor) {
			const eventResult = customHandlers.onBeforeChangeTextEditor(value, formControl);
			if (typeof eventResult === 'string') return eventResult;
			if (eventResult === false) return intl.formatMessage({ id: 'LABEL.REQUIRED' });
		}
		if (customHandlers?.onBlurTextEditor) {
			const eventResult = customHandlers.onBlurTextEditor(value, formControl);
			if (typeof eventResult === 'string') return eventResult;
			if (eventResult === false) return intl.formatMessage({ id: 'LABEL.REQUIRED' });
		}
		return true;
	};

	return (
		<div className={containerClass}>
			<div className={headerClass}>
				<InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
			</div>
			<div className={inputClass}>
				{readonly ? (
					<p className="form-control form-control-lg form-control-solid mb-3 mb-lg-0 readonlyClassName"
						style={{ overflow: 'auto' }}
						dangerouslySetInnerHTML={{
							__html: fieldValue ? String(fieldValue) : ""
						}}
					/>
				) : (
					<Controller
						control={formHook.control}
						name={fieldKey}
						rules={{ validate: validateEditor }}
						render={({ field, fieldState }) => (
							<>
								<JoditEditor
									ref={editorRef}
									config={config}
									value={fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : (field.value !== undefined && field.value !== null ? String(field.value) : ('defaultValue' in formControl && formControl.defaultValue !== undefined && formControl.defaultValue !== null ? String(formControl.defaultValue) : ""))}
									onChange={value => {
										const processedValue = handleOnChangeEditor(value);
										if (processedValue !== undefined) {
											field.onChange(processedValue);
											if (customHandlers?.onChangeTextEditor) {
												customHandlers.onChangeTextEditor(processedValue, formControl);
											}
										} else {
											// If the value exceeds the limit, revert to the previous valid value
											const currentValue = field.value || "";
											if (editorRef.current) {
												editorRef.current.value = String(currentValue);
											}
										}
									}}
									onBlur={() => {
										field.onBlur();
										if (customHandlers?.onBlurTextEditor) {
											customHandlers.onBlurTextEditor(field.value !== undefined && field.value !== null ? String(field.value) : "", formControl as DynamicFieldModel);
										}
									}}
									key={fieldKey}
									id={String(formControl.fieldKey)}
								/>
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
								{lengthError && (
									<ErrorLabel text={lengthError} isI18nKey={false} />
								)}
								{fieldState.error && (
									<ErrorLabel text={String(fieldState.error.message)} isI18nKey={false} />
								)}
							</>
						)}
					/>
				)}
			</div>
		</div>
	);
}