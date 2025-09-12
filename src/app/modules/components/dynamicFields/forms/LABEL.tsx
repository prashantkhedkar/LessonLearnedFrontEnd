import React from 'react';
import { IFormProps, FormModel } from '../utils/types';
import { InfoLabels } from '../../common/formsLabels/detailLabels';

export function LABEL<T extends FormModel>({ divClass, containerClass, inputClass, headerClass, formControl, formHook }: IFormProps<T>) {
  const fieldValue = 'fieldValue' in formControl ? formControl.fieldValue : undefined;

  // Get value from formHook if available, else empty string
  const rawValue = formHook?.getValues?.()[formControl.fieldKey];
  let value: React.ReactNode = '';

  const displayValue = fieldValue !== undefined ? fieldValue : rawValue;

  if (typeof displayValue === 'object' && displayValue !== null) {
    value = Array.isArray(displayValue)
      ? displayValue.map((v, i) => <span key={i}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}{i < displayValue.length - 1 ? ', ' : ''}</span>)
      : JSON.stringify(displayValue);
  } else if (typeof displayValue === 'boolean') {
    value = displayValue ? 'Yes' : 'No';
  } else if (displayValue !== undefined && displayValue !== null) {
    value = String(displayValue);
  }
  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <InfoLabels text={formControl["fieldLabel"]} isI18nKey={true} isRequired={false} />
      </div>
      <div className={inputClass}>
        <InfoLabels text={typeof value === 'string' ? value : ''} isI18nKey={false} isRequired={false} />
      </div>
    </div>
  );
}

export default LABEL;
