import { useEffect, useMemo, useState } from "react";
import moment from "moment/moment";
import { FieldPath } from "react-hook-form";
import { FormModel, IFormProps, ServiceFieldAttribute } from "../utils/types";
import { MUIDatePicker } from "../../datePicker/MUIDatePicker";
import { useIntl } from "react-intl";
import { ErrorLabel, InfoLabels } from "../../common/formsLabels/detailLabels";

export const DATE = <T extends FormModel>({ containerClass, inputClass, headerClass, formControl, formHook, customHandlers, readonly }: IFormProps<T> & { readonly?: boolean }) => {
  const intl = useIntl();

  const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

  // Helper to parse both formats
  const parseDate = (dateStr: string) => {
    return moment(dateStr, ["YYYY-MM-DD", "YYYY/MM/DD"], true);
  };

  // Use minValue and maxValue from attributes if present, otherwise fallback
  let minDate: moment.Moment | undefined = undefined;
  let maxDate: moment.Moment | undefined = undefined;
  let allowFutureDate: boolean = true; // Default to allow future dates

  if (formControl.attributes &&
    !Array.isArray(formControl.attributes)) {
    if (formControl.attributes.minValue) {
      const min = parseDate(formControl.attributes.minValue);
      if (min.isValid()) minDate = min;
    }
    if (formControl.attributes.maxValue) {
      const max = parseDate(formControl.attributes.maxValue);
      if (max.isValid()) maxDate = max;
    }
    if (formControl.attributes.allowFutureDate !== undefined) {
      allowFutureDate = formControl.attributes.allowFutureDate;
    }
  }

  // If allowFutureDate is false, set maxDate to today (if not already set to an earlier date)
  if (!allowFutureDate) {
    const today = moment().startOf('day');
    if (!maxDate || maxDate.isAfter(today)) {
      maxDate = today;
    }
  }

  // Set initial date: use defaultValue if valid, else empty
  const initialDate =
    typeof formControl["defaultValue"] !== "boolean" &&
      formControl["defaultValue"] &&
      parseDate(formControl["defaultValue"]).isValid()
      ? parseDate(formControl["defaultValue"]).format("YYYY/MM/DD")
      : undefined;

  const [date, setDate] = useState<string | undefined>(initialDate);
  const [validatorSchema, setValidatorSchema] = useState<object>();
  const errors = formHook.formState.errors || formHook.formState.errors[formControl["fieldKey"]];
  const fieldKey = formControl.fieldKey as FieldPath<T>;
  const [placeholder, setPlaceholder] = useState(formControl.placeholder || "");

  useMemo(() => {
    if (fieldValue !== undefined && formHook.getValues(fieldKey) === undefined) {
      formHook.setValue(fieldKey, fieldValue as any);
    }
  }, [fieldValue, fieldKey, formHook]);

  useMemo(() => {
    let minDateFromAttr: string | undefined;
    let maxDateFromAttr: string | undefined;
    let requiredFlag = false;
    let allowFutureDateFromAttr: boolean = true;

    for (const [key, value] of Object.entries(formControl)) {
      switch (key) {
        case 'isRequired':
          if (value) {
            requiredFlag = true;
          }
          break;
        case 'attributes':
          if (value) {
            const attributeProperties = value as ServiceFieldAttribute;
            for (const [attrKey, attrValue] of Object.entries(attributeProperties)) {
              switch (attrKey) {
                case "minValue":
                  if (attrValue && typeof attrValue === 'string') {
                    minDateFromAttr = attrValue;
                  }
                  break;
                case "maxValue":
                  if (attrValue && typeof attrValue === 'string') {
                    maxDateFromAttr = attrValue;
                  }
                  break;
                case "allowFutureDate":
                  if (attrValue !== undefined) {
                    allowFutureDateFromAttr = typeof attrValue === 'boolean' ? attrValue : attrValue === 'true';
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

    // If allowFutureDate is false, enforce maxDate as today
    if (!allowFutureDateFromAttr) {
      const today = moment().startOf('day').format('YYYY-MM-DD');
      if (!maxDateFromAttr || moment(maxDateFromAttr).isAfter(moment(today))) {
        maxDateFromAttr = today;
      }
    }

    setValidatorSchema(prevState => ({
      ...prevState,
      required: requiredFlag ? `${intl.formatMessage({ id: "LABEL.REQUIRED" })}` : false,
      validate: (value: any) => {
        if (requiredFlag && (!value || value === "")) {
          return intl.formatMessage({ id: "LABEL.REQUIRED" });
        }
        if (!value) return true;
        let dateVal = parseDate(value);
        if (minDateFromAttr && dateVal.isBefore(parseDate(minDateFromAttr))) {
          return intl.formatMessage({ id: 'VALIDATION.MINDATE' }) + " " + parseDate(minDateFromAttr).format('YYYY/MM/DD');
        }
        if (maxDateFromAttr && dateVal.isAfter(parseDate(maxDateFromAttr))) {
          return intl.formatMessage({ id: 'VALIDATION.MAXDATE' }) + " " + parseDate(maxDateFromAttr).format('YYYY/MM/DD');
        }
        return true;
      }
    }));
  }, [formControl, intl]);

  useEffect(() => {
    // Prefer value from form state (e.g., SampleData) if present
    const formValue = formHook.getValues(fieldKey);
    if (formValue && typeof formValue === 'string' && formValue !== "") {
      setDate(formValue);
    } else if (!formControl["defaultValue"] || formControl["defaultValue"] === "") {
      // If defaultValue is empty, clear the field completely
      setDate(undefined);
      formHook.setValue(fieldKey, "" as any);
    } else {
      formHook.setValue(fieldKey, formControl["defaultValue"] as any);
      setDate(formControl["defaultValue"]);
    }
  }, [formControl, formHook, fieldKey]);

  const setDateParams = (value: any) => {
    // Handle clearing - when value is undefined or null, clear the field
    if (value === undefined || value === null) {
      formHook.clearErrors(fieldKey);
      formHook.setValue(fieldKey, "" as any);
      setDate(undefined);

      // Post change callback
      if (customHandlers?.onChangeDate) {
        customHandlers.onChangeDate("", formControl);
      }
      return;
    }

    // Only keep the date part in YYYY/MM/DD format
    const dateOnly = moment(value).format("YYYY/MM/DD");

    // Pre-validation from parent component
    if (customHandlers?.onBeforeChangeDate) {
      const result = customHandlers.onBeforeChangeDate(dateOnly, formControl);
      if (typeof result === 'string') {
        formHook.setError(fieldKey, { type: 'manual', message: result });
        return;
      }
      if (result === false) {
        formHook.setError(fieldKey, { type: 'manual', message: intl.formatMessage({ id: "LABEL.REQUIRED" }) });
        return;
      }
    }

    formHook.clearErrors(fieldKey);
    formHook.setValue(fieldKey, dateOnly as any);
    setDate(dateOnly);

    // Post change callback
    if (customHandlers?.onChangeDate) {
      customHandlers.onChangeDate(dateOnly, formControl);
    }
  }

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={(formControl["isRequired"]) as boolean} />
      </div>
      <div className={inputClass}>
        <MUIDatePicker
          {...formHook.register(
            fieldKey,
            { ...validatorSchema } // Apply validation
          )}
          minDate={minDate ? minDate.toDate() : undefined}
          maxDate={maxDate ? maxDate.toDate() : undefined}
          disableFuture={!allowFutureDate}
          value={date ? moment(date, "YYYY/MM/DD").toDate() : undefined}
          onDateChange={readonly ? (() => { }) : (date: Date) => setDateParams(date)}
          placeholder={placeholder}
          dateFormat="YYYY/MM/DD"
          key={fieldKey}
          id={String(formControl.fieldKey)}
          isDisabled={!!readonly}
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