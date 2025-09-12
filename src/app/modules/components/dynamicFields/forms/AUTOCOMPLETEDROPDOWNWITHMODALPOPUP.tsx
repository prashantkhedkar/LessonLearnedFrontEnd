import { useEffect, useMemo, useState } from "react";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { Controller, FieldPath } from "react-hook-form";
import { useIntl } from "react-intl";
import { ErrorLabel, HeaderLabels, InfoLabels } from "../../common/formsLabels/detailLabels";
import AutoCompleteMultiSelectUnitTextBox from "../../autocomplete/AutoCompleteMultiSelectUnitTextBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "react-bootstrap";
import UnitTreeView from "../../unitTreeView/UnitTreeView";

export const AUTOCOMPLETEDROPDOWNWITHMODALPOPUP = <T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
    const [validatorSchema, setValidatorSchema] = useState<object>();
    const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
    const fieldKey = formControl.fieldKey as FieldPath<T>;
    const intl = useIntl();
    const [defaultValue, setDefaultValue] = useState<string>("");

    const [showUnitPopup, setShowUnitPopup] = useState(false);
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
    const [serviceUnits, setServiceUnits] = useState<any[]>([]);

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
    }, [formControl, intl, fieldKey, formHook]);

    const handleModalSelect = (obj, action) => {
        setServiceUnits(obj);
        setSelectedUnitIds(obj.map((item) => Number(item.value)));
        formHook.setValue(fieldKey, obj, { shouldValidate: true });
        setShowUnitPopup(false);
    };

    const onUnitChange = (obj, action) => {
        setServiceUnits(obj);
        formHook.setValue(fieldKey, obj, { shouldValidate: true });
        setSelectedUnitIds(obj.map((item) => Number(item.value)));
    };

    const setDropDownParams = (event: any) => {
        const data = (event.target as HTMLInputElement).value;

        if (event.type == 'keydown') {
            // Pre-validation from parent component
            if (customHandlers?.onBeforeAutoDropDownList) {
                const eventResult = customHandlers.onBeforeAutoDropDownList(event, formControl);

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
        if (customHandlers?.onChangeAutoDropDownList) {
            customHandlers.onChangeAutoDropDownList(event, formControl);
        }
    };

    return (
        <div className={containerClass}>
            <div className={headerClass}>
                    <InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
                </div>
                <div className={inputClass}>
                    <Controller
                        name={fieldKey}
                        control={formHook.control}
                        // Only set rules if validation is not skipped
                        {...({ rules: { required: ((formControl["isRequired"] as boolean) === true ? `${intl.formatMessage({ id: "LABEL.REQUIRED" })}` : ""), ...validatorSchema } })}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <div className="row">
                                    <div className="col-md-11">
                                        <AutoCompleteMultiSelectUnitTextBox
                                            data={
                                                Array.isArray((formControl as any).serviceFieldOption)
                                                    ? (formControl as any).serviceFieldOption.map((opt: any) => ({
                                                        ...opt,
                                                        value: typeof opt.value === "boolean" ? String(opt.value) : opt.value
                                                    }))
                                                    : []
                                            }
                                            selectedValue={Array.isArray(value) ? value : []}
                                            placeholdertext={intl.formatMessage({
                                                id: "MOD.MEETING.SELECTUNIT",
                                            })}
                                            key={fieldKey}
                                            readOnly={!!readonly}
                                            onSearchChangeHandler={readonly ? undefined : onChange}
                                        />
                                    </div>
                                    <div className="col-md-1">
                                        <button type="button" className="btn btn-sm p-0 ms-2" onClick={() => setShowUnitPopup(true)} disabled={!!readonly}>
                                            <FontAwesomeIcon icon={faSitemap} size="lg" color="grey" />
                                        </button>
                                    </div>
                                </div>

                                <Modal className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
                                    size="xl"
                                    show={showUnitPopup}
                                    onHide={() => setShowUnitPopup(false)}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>
                                            <HeaderLabels text={"MOD.GLOBAL.MODAL.TITLE.SEARCHUNIT"} />
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <UnitTreeView onUnitSelect={handleModalSelect} selectedUnitIds={selectedUnitIds} selectedUnitList={serviceUnits} isSingleSelection={true} />
                                    </Modal.Body>
                                </Modal>
                            </>
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