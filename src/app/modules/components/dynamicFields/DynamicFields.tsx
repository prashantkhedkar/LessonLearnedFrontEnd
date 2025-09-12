import { FormModel, IFormProps } from "./utils/types";
import { TEXT } from "./forms/TEXT";
import { DATE } from "./forms/DATE";
import { EMAIL } from "./forms/EMAIL";
import { NUMBER } from "./forms/NUMBER";
import { TIME } from "./forms/TIME";
import { TEXTAREA } from "./forms/TEXTAREA";
import { TEXTEDITOR } from "./forms/TEXTEDITOR";
import { RADIOGROUP } from "./forms/RADIOGROUP";
import { CHECKBOXGROUP } from "./forms/CHECKBOXGROUP";
import { CHECKBOX } from "./forms/CHECKBOX";
import { DROPDOWNLIST } from "./forms/DROPDOWNLIST";
import { URL } from "./forms/URL";
import { DECIMAL } from "./forms/DECIMAL";
import { AUTOCOMPLETEDROPDOWNLIST } from "./forms/AUTOCOMPLETEDROPDOWNLIST";
import LABEL from "./forms/LABEL";
import LINEBREAK from "./forms/LINEBREAK";
import { AUTOCOMPLETEDROPDOWNWITHMODALPOPUP } from "./forms/AUTOCOMPLETEDROPDOWNWITHMODALPOPUP";
import FIELDGROUPDATATABLE from "./forms/FIELDGROUPDATATABLE";
import { SELECTROOMS } from "./forms/SELECTROOMS";

const DynamicFields = <T extends FormModel>({
  divClass,
  containerClass,
  headerClass,
  inputClass,
  formControl,
  formHook,
  customHandlers,
  readonly,
  isDisabled,
}: IFormProps<T>) => {
  //inputClass = "form-control form-control-solid active input5 lbl-text-regular-2"

  // Defensive check to ensure formControl is properly defined
  if (!formControl || !formControl.fieldTypeId) {
    console.error(
      "DynamicFields: formControl or fieldTypeId is undefined",
      formControl
    );
    return <div>Error: Invalid form control configuration</div>;
  }

  switch (formControl["fieldTypeId"]) {
    case 1:
      return TEXT<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 2:
      return DROPDOWNLIST<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
        isDisabled,
      });

    case 3:
      headerClass = "col-md-2";
      inputClass = "col-md-10";
      return TEXTEDITOR<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 4:
      return CHECKBOX<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 5:
      return RADIOGROUP<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 6:
      return LABEL({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 7:
      return DATE<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    // case 8:
    // 	return CHECKBOXGROUP<T>({ divClass, containerClass, headerClass, inputClass, formControl, formHook, customHandlers, readonly });

    case 8:
      return NUMBER<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 9:
      return TIME<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 10:
      return EMAIL<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 11:
      return URL<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 12:
      return DECIMAL<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 13:
      //inputClass = "form-control active lbl-text-regular-2"
      headerClass = "col-md-2";
      inputClass = "col-md-10";
      return TEXTAREA<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 14:
      return AUTOCOMPLETEDROPDOWNLIST<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    // case 16:
    // 	return <></>;

    // case 17:
    // 	return AUTOCOMPLETEDROPDOWNWITHMODALPOPUP<T>({ divClass, containerClass, headerClass, inputClass, formControl, formHook, customHandlers, readonly });

    case 15:
      inputClass = "w-100";
      return LINEBREAK<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });

    case 16:
      inputClass = "w-100";
      return FIELDGROUPDATATABLE<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
      });
    case 17:
      return SELECTROOMS<T>({
        divClass,
        containerClass,
        headerClass,
        inputClass,
        formControl,
        formHook,
        customHandlers,
        readonly,
        isDisabled,
      });

    default:
      return null;
  }
};

export default DynamicFields;
