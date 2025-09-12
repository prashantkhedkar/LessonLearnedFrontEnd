// Extended types for options management
import { ServiceFieldOption } from "../../../../modules/components/dynamicFields/utils/types";

export interface OptionsManagerState {
    options: ServiceFieldOption[];
    currentOption: {
        label: string;
        isDefault: boolean;
    };
    editingIndex: number | null;
}

export interface OptionsManagerProps {
    initialOptions?: ServiceFieldOption[];
    onOptionsChange: (options: ServiceFieldOption[]) => void;
    fieldType: 'dropdown' | 'radiogroup';
}

export interface OptionFormData {
    label: string;
    isDefault: boolean;
}

export interface OptionsManagerMethods {
    addOption: () => void;
    editOption: (index: number) => void;
    deleteOption: (index: number) => void;
    setDefault: (index: number) => void;
    resetForm: () => void;
}
