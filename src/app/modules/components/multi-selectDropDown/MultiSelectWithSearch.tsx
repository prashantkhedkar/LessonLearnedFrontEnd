import { useState, useRef } from "react";
import { default as ReactSelect, components, InputAction } from "react-select";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";

export type Option = {
  value: string;
  label: string;
};

const MultiSelectWithSearch = (props: any) => {
  const lang = useLang();
  const [selectInput, setSelectInput] = useState<string>("");
  const isAllSelected = useRef<boolean>(false);
  const selectAllLabel = useRef<string>((lang === 'en') ? "Select all" : "اختر الكل");
  const allOption = { value: "*", label: selectAllLabel.current };

  const filterOptions = (options: Option[], input: string) =>
    options?.filter(({ label }: Option) =>
      label.toLowerCase().includes(input.toLowerCase())
    );

  const comparator = (v1: Option, v2: Option) =>
    (+v1.value) - (+v2.value);

  let filteredOptions = filterOptions(props.options, selectInput);
  let filteredSelectedOptions = filterOptions(props.value, selectInput);

  const Option = (props: any) => (
    <components.Option {...props}>
      {props.value === "*" &&
        !isAllSelected.current &&
        filteredSelectedOptions?.length > 0 ? (
        <input
          key={props.value}
          type="checkbox"
          style={{color:'red'}}
          ref={(input) => {
            if (input) input.indeterminate = true;
          }}
        />
      ) : (
        <input
          key={props.value}
          type="checkbox"
          style={{color:'red'}}
          checked={props.isSelected || isAllSelected.current}
          onChange={() => { }}
        />
      )}
      <label style={{ marginLeft: "5px", marginRight: "7px" }}>{props.label}</label>
    </components.Option>
  );

  const Input = (props: any) => (
    <>
      {selectInput.length === 0 ? (
        <components.Input autoFocus={props.selectProps.menuIsOpen} {...props}>
          {props.children}
        </components.Input>
      ) : (
        <div style={{ border: "1px dotted gray" }}>
          <components.Input autoFocus={props.selectProps.menuIsOpen} {...props}>
            {props.children}
          </components.Input>
        </div>
      )}
    </>
  );

  const customFilterOption = ({ value, label }: Option, input: string) =>
    (value !== "*" && label.toLowerCase().includes(input.toLowerCase())) ||
    (value === "*" && filteredOptions?.length > 0);

  const onInputChange = (
    inputValue: string,
    event: { action: InputAction }
  ) => {
    if (event.action === "input-change") setSelectInput(inputValue);
    else if (event.action === "menu-close" && selectInput !== "")
      setSelectInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.key === " " || e.key === "Enter") && !selectInput)
      e.preventDefault();
  };

  const handleChange = (selected: Option[]) => {
    if (
      selected.length > 0 &&
      !isAllSelected.current &&
      (selected[selected.length - 1].value === allOption.value ||
        JSON.stringify(filteredOptions) ===
        JSON.stringify(selected.sort(comparator)))
    )
      return props.onChange(
        [
          ...(props.value ?? []),
          ...props.options.filter(
            ({ label }: Option) =>
              label.toLowerCase().includes(selectInput?.toLowerCase()) &&
              (props.value ?? []).filter((opt: Option) => opt.label === label)
                .length === 0
          ),
        ].sort(comparator)
      );
    else if (
      selected.length > 0 &&
      selected[selected.length - 1].value !== allOption.value &&
      JSON.stringify(selected.sort(comparator)) !==
      JSON.stringify(filteredOptions)
    )
      return props.onChange(selected);
    else
      return props.onChange([
        ...props.value?.filter(
          ({ label }: Option) =>
            !label.toLowerCase().includes(selectInput?.toLowerCase())
        ),
      ]);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
    }),    
    multiValueLabel: (def: any) => ({
      ...def,
      backgroundColor: 'var(--text-8) !important',
      color: 'var(--text-2) !important',
    }),
    multiValueRemove: (def: any) => ({
      ...def,
      backgroundColor: 'var(--text-8) !important',
      color: 'var(--text-2) !important'
    }),
    valueContainer: (base: any) => ({
      ...base,
      maxHeight: "65px",
      overflow: "auto",
    }),
    option: (styles: any, { isSelected, isFocused }: any) => {
      return {
        ...styles,
        color: isSelected ? 'white' : 'var(--text-2) !important',
        backgroundColor: isSelected ? "var(--primary-5)" : 'white',
        direction: lang === "ar" ? 'rtl' : 'ltr',
        ':hover': {
          backgroundColor: 'var(--primary-10)', 
          color: 'var(--text-regular-2)', 
        },
        zIndex:9999
      };
    },
    menu: (def: any) => ({ ...def, zIndex: 9999 }),
    singleValue: (provided, state) => ({
      ...provided,
      font: 'var(--text-regular-2) !important',
      color: 'var(--text-2) !important'
    }),
    placeholder: (provided, state) => ({
      ...provided,
      font: 'var(--text-regular-2) !important',
      color: 'var(--text-2) !important',
    }),
  };

  if (props.isSelectAll && props.options.length !== 0) {
    isAllSelected.current =
      JSON.stringify(filteredSelectedOptions) ===
      JSON.stringify(filteredOptions);

    if (filteredSelectedOptions?.length > 0) {
      if (filteredSelectedOptions?.length === filteredOptions?.length)
      selectAllLabel.current = (lang === 'en') ? `All (${filteredOptions.length}) selected` : `الكل (${filteredOptions.length}) مختارين`;
      else
      selectAllLabel.current = (lang === 'en') ? `${filteredSelectedOptions?.length} / ${filteredOptions.length} selected` : `${filteredSelectedOptions?.length} / ${filteredOptions.length} مختارين`;
    } else selectAllLabel.current = (lang === 'en') ? "Select all" : "اختر الكل";

    allOption.label = selectAllLabel.current;

    return (
      <ReactSelect
        {...props}
        inputValue={selectInput}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        options={[allOption, ...props.options]}
        onChange={handleChange}
        components={{
          Option: Option,
         // Input: Input,
          ...props.components,
        }}
        filterOption={customFilterOption}
        //menuPlacement={props.menuPlacement ?? "auto"}
        styles={customStyles}
        className="lbl-text-regular-2 custom-select"
        isMulti
        closeMenuOnSelect={false}
        tabSelectsValue={false}
        backspaceRemovesValue={false}
        hideSelectedOptions={false}
        blurInputOnSelect={false}
       menuPortalTarget={document.body} menuPosition={'fixed'}
      />
    );
  }

  return (
    <ReactSelect
      {...props}
      inputValue={selectInput}
      onInputChange={onInputChange}
      filterOption={customFilterOption}
      components={{
      //  Input: Input,
        ...props.components,
      }}
      menuPlacement={props.menuPlacement ?? "auto"}
      onKeyDown={onKeyDown}
      tabSelectsValue={false}
      hideSelectedOptions={true}
      backspaceRemovesValue={false}
      blurInputOnSelect={true}
      menuPortalTarget={document.body} menuPosition={'fixed'}
    />
  );
};

export default MultiSelectWithSearch;
