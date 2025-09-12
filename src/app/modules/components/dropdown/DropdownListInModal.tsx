import React, { useState, useEffect } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import _ from "lodash";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";

const animatedComponents = makeAnimated();

const DropdownListInModal = (props) => {
  const lang = useLang();
  const {
    data,
    dataKey,
    dataValue,
    value,
    width,
    focus,
    isDisabled,
    isReadOnly,
    defaultText,
    setSelectedValue,
    onChangeFunction,
    isClearable,
    fromCalendar
  } = props;

  let selectedText = "";

  interface LookupData {
    label: string;
    value: string;
  }

  let _data: LookupData[] = [];

  {
    try {
      data.length &&
        data.map((item, index) => {
          const key = item[dataKey];
          _data.push({
            value: key ? key.toString() : null,
            label: item[dataValue],
          });
        });
    } catch (error) {}
  }

  try {
    selectedText = _data.filter((x) => x.value === value.toString())[0].label;
  } catch (error) {}

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(_data);
  const [hasOpenedDropdown, setHasOpenedDropdown] = useState(false); 

  useEffect(() => {
    if (hasOpenedDropdown) {
      setOptions(getFilteredOptions(inputValue));
    }
  }, [inputValue, hasOpenedDropdown]);

  function getFilteredOptions(inputValue) {
    if (inputValue) {
      return _data.filter((o) =>
        _.includes(_.toLower(o.label), _.toLower(inputValue))
      );
    } else {
      return _data;
    }
  }

  const customStyles = {
    control: base => ({
      ...base,
      font: 'var(--text-regular-2) !important',
      color: isReadOnly ? 'var(--text-muted) !important' : 'var(--text-2) !important',
      backgroundColor: isReadOnly ? 'var(--background-disabled, #f5f5f5) !important' : base.backgroundColor,
      borderColor: isReadOnly ? 'var(--border-muted, #ccc) !important' : base.borderColor,
      opacity: isReadOnly ? 0.6 : 1,
      cursor: isReadOnly ? 'not-allowed' : base.cursor,
      padding: "1.25px !important",
      borderRadius: "8px !important"
    }),
    option: (provided, state) => ({
      ...provided,
      font: 'var(--text-regular-2) !important',
      color: state.isSelected ? 'white' : 'var(--text-2) !important',
      backgroundColor: state.isSelected ? "var(--primary-5)" : 'white',
      direction: lang === "ar" ? 'rtl' : 'ltr',
      cursor: isReadOnly ? 'not-allowed' : 'pointer',
      ':hover': {
        backgroundColor: isReadOnly ? 'white' : 'var(--primary-10)', // Disable hover effect for readonly
        color: isReadOnly ? 'var(--text-2)' : 'var(--text-regular-2)', // Disable hover color change for readonly
      },
    }),
    singleValue: (provided, state) => ({
      ...provided,
      font: 'var(--text-regular-2) !important',
      color: isReadOnly ? 'var(--text-muted) !important' : 'var(--text-2) !important'
    }),
    placeholder: (provided, state) => ({
      ...provided,
      color: isReadOnly ? 'var(--text-muted) !important' : 'var(--text-2) !important',
    }),
  };
    
  return (
    <div style={{ width: `${width}px` }}>
      <Select                
        isMulti={false}
        autoFocus={focus}
        isDisabled={isDisabled || isReadOnly}
        className={`basic-single single lbl-text-regular-2`}
        classNamePrefix="select"
        placeholder={defaultText}
        components={animatedComponents}
        name="search"
        options={options}
        styles={customStyles}
        isClearable={value?isClearable:false}         
        value={
          value
            ? {
                value: value,
                label: selectedText,
              }
            : {
                value: value,
                label: defaultText,
              }
        }
        onMenuOpen={() => {
          if (!isReadOnly) {
            setHasOpenedDropdown(true);
            setOptions(_data);
          }
        }}
        onChange={(e) => {
          if (!isReadOnly) {
            try {
              if (e) {
                if (onChangeFunction) onChangeFunction(e.value);
                setSelectedValue(e.value);
              } else {
                if (onChangeFunction) onChangeFunction(null);
                setSelectedValue(null); 
              }
            } catch (error) {
              console.log("DropdownList " + error);
            }
          }
        }}
        
        onInputChange={(newInputValue) => {
          if (!isReadOnly) {
            setInputValue(newInputValue);
          }
        }}
      />
    </div>
  );
};

export default DropdownListInModal;


