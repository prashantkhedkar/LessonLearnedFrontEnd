import React from 'react';
import CreatableSelect from 'react-select/creatable';

export interface CommonOption {
  readonly label: string;
  readonly value: string;
}

export interface CommonCreatableSelectProps {
  options: CommonOption[];
  value: CommonOption | CommonOption[] | null;
  onChange: (value: CommonOption | CommonOption[] | null) => void;
  onCreateOption?: (inputValue: string) => void;
  placeholder?: string;
  isMulti?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isRtl?: boolean;
  className?: string;
  styles?: any;
}

const CreatableDropdownList: React.FC<CommonCreatableSelectProps> = ({
  options,
  value,
  onChange,
  onCreateOption,
  placeholder = 'Select or create...',
  isMulti = false,
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  isRtl = false,
  className,
  styles,
}) => {
  // Default RTL styles
  const rtlStyles = {
    control: (base) => ({
      ...base,
      direction: 'rtl',
      textAlign: 'right',
    }),
    menu: (base) => ({
      ...base,
      direction: 'rtl',
      textAlign: 'right',
    }),
    option: (base) => ({
      ...base,
      direction: 'rtl',
      textAlign: 'right',
    }),
    singleValue: (base) => ({
      ...base,
      direction: 'rtl',
      textAlign: 'right',
    }),
    placeholder: (base) => ({
      ...base,
      direction: 'rtl',
      textAlign: 'right',
    }),
  };

  const appliedStyles = styles ? styles : (isRtl ? rtlStyles : undefined);

  return (
    <CreatableSelect
      isClearable={isClearable}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isMulti={isMulti}
      isRtl={isRtl}
      //onChange={onChange}
      onCreateOption={onCreateOption}
      options={options}
      value={value}
      placeholder={placeholder}
      className={className}
      styles={appliedStyles}
    />
  );
};

export default CreatableDropdownList;
