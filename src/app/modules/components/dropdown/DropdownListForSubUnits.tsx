import React, { useState, useEffect } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import _ from "lodash";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";

const animatedComponents = makeAnimated();

const DropdownListForSubUnits = (props) => {
  const lang = useLang();

  const {
    data,
    dataKey,
    dataValue,
    value,
    width,
    focus,
    isDisabled,
    defaultText,
    setSelectedValue,
    onChangeFunction,
    isClearable
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
            label: item[dataValue]
          });
        });
    } catch (error) { }
  }

  try {
    selectedText = _data.filter((x) => x.value === value.toString())[0].label;
  } catch (error) { }

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
      color: 'var(--text-2) !important'
    }),
    option: (provided, state) => {
      const { data } = state;  // Extracting data from state to access colorCode
      return {
        ...provided,
        font: 'var(--text-regular-2) !important',
        // color: (data.bgColor) ? data.bgColor : (state.isSelected ? 'white' : 'var(--text-2) !important'),
        // backgroundColor: (data.bgColor) ? data.bgColor : (state.isSelected ? "var(--primary-5)" : 'white'),
        direction: lang === "ar" ? 'rtl' : 'ltr',
        // ':hover': {
        //   backgroundColor: (data.bgColor) ? data.bgColor : 'var(--primary-10)',
        //   color: (data.bgColor) ? data.bgColor : 'var(--text-regular-2)',
        // },
      };
    },
    singleValue: (provided, state) => ({
      ...provided,
      font: 'var(--text-regular-2) !important',
      color: 'var(--text-2) !important'
    }),
    placeholder: (provided, state) => ({
      ...provided,
      color: 'var(--text-2) !important',
    }),
  };

  return (
    <div style={{ width: `${width}px` }}>
      <Select
        isMulti={false}
        autoFocus={focus}
        isDisabled={isDisabled}
        className="basic-single single lbl-text-regular-2"
        classNamePrefix="select"
        placeholder={defaultText}
        components={animatedComponents}
        name="search"
        options={options}
        styles={customStyles}
        isClearable={value ? isClearable : false}
        menuPortalTarget={document.body} menuPosition={'fixed'}
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
          setHasOpenedDropdown(true);
          setOptions(_data);
        }}
        onChange={(e) => {
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
        }}
        onInputChange={(newInputValue) => {
          setInputValue(newInputValue);
        }}
      />
    </div>
  );
};

export default DropdownListForSubUnits;


