import React, { useState, useEffect } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import _ from "lodash";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";

const animatedComponents = makeAnimated();

const DropdownListNewDesign = (props) => {
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
    isClearable,
    menuZindex,
    PortalZindex,
    roundedBorder = false
  } = props;

  let selectedText = "";

  interface LookupData {
    label: string;
    value: string;
    color: string;
    bgColor: string;
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
            color: item.colorCode,
            bgColor: item.bgColorCode
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
    ...PortalZindex && {
      menuPortal: (provided, state) => ({
        ...provided,
        zIndex: PortalZindex,

      }),
    },
    ...menuZindex && {
      menu: (provided, state) => ({
        ...provided,
        zIndex: menuZindex,
        backgroundColor: 'var(--dropdown-menu-bg)',
        width: 'fit-content',
        minWidth: '120px',
        borderRadius: '4px',
        padding: '0 4px',
        minHeight: '100%',
      }),
    },

    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused? "var(--button-text-active-color)":"var(--button-text-color)",
      "&:hover": {
        color: "var(--button-text-active-color)",
       
      }
    }),
    control: (provided, state) => ({
      ...provided,
      cursor: 'pointer',
      font: 'var(--text-regular-2) !important',
      color: 'var(--button-text-color) !important',
      border: "2px solid var(--button-border-color)",
      ...roundedBorder && {borderRadius: '24px'},
      backgroundColor: "transparent",
      boxShadow: state.isFocused ? "none" : provided.boxShadow,
      "&:hover": {
        borderColor: "var(--button-border-color)",
        border: "2px solid var(--button-border-color)"
      },
  
    }),
    option: (provided, state) => {
      return {
        ...provided,

        font: 'var(--text-regular-2) !important',
        color: '#F3F4F6',
        backgroundColor: 'rgba(181, 170, 154, 1)',
        opacity: 1,
        border: "1px solid rgba(181, 170, 154, 1)",
        direction: lang === "ar" ? 'rtl' : 'ltr',
        ':hover': {
          backgroundColor: '#B7945A',
          color: '#F3F4F6',
        },

        ':active': {
          backgroundColor: '#B7945A'
        },
       
      };
    },
    singleValue: (provided, state) => ({
      ...provided,
      font: 'var(--text-regular-2) !important',
      // color: 'var(--text-2) !important'
      color: "var(--button-text-color)",
      backgroundColor: "transparent",

    }),
    placeholder: (provided, state) => ({
      ...provided,
      color: 'var(--button-text-color) !important',
    }),
  };

  return (
    <div style={{ width: `${width}px` }}>
      <Select
        isMulti={false}
        autoFocus={focus}
        isDisabled={isDisabled}
        className="basic-single single lbl-text-regular-2 newDesignDropDown z-auto"
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

export default DropdownListNewDesign;


