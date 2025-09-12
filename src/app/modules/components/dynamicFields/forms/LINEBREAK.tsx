import React from 'react';
import { IFormProps, FormModel } from '../utils/types';

export function LINEBREAK<T extends FormModel>({ divClass = '', inputClass = '', formControl, formHook }: IFormProps<T>) {
  return (
    <hr className={`${inputClass}`.trim()} />
  );
}

export default LINEBREAK;
