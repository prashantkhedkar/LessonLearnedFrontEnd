import React, { useCallback } from "react";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import { ActionMeta, components } from "react-select";
import { IUserSearch } from "../../../models/global/userModel";
import { useAppDispatch } from "../../../../store";
import { useAuth } from "../../auth";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";

type Props = {
  value: any[];
  isMulti: boolean;
  defaultText: string;
  width: number;
  customHeight?: number;
  onSearchChangeHandler: any;
  isDisabled: boolean;
  allowAllUnitUser?: boolean
};

interface Employee {
  label: string;
  value: string;
}

let updatetedUsers: Employee[] = [];
const animatedComponents = makeAnimated();
const { DropdownIndicator } = components;
const customIndicatorSeparator = () => null;
const customDropdownIndicator = (props) => {
  return null; // Returning null will effectively remove the dropdown indicator
};

const SearchDDL = ({
  value,
  isMulti,
  defaultText,
  width,
  customHeight = 0,
  onSearchChangeHandler,
  isDisabled,
  allowAllUnitUser,
}: Props) => {
  const customStyles = {
    control: base => ({
      ...base,
      height: customHeight,
      minHeight: 35,
      overflow: customHeight >= 50 ? 'scroll' : 'inherit',
      font: 'var(--text-regular-2) !important',
      color: 'var(--text-2) !important'
    }),
    option: (provided, state) => ({
      ...provided,
      font: 'var(--text-regular-2) !important',
      color: 'var(--text-2) !important'
    }),
    singleValue: (provided, state) => ({
      ...provided,
      font: 'var(--text-regular-2) !important',
      color: 'var(--text-2) !important'
    }),
    placeholder: (provided, state) => ({
      ...provided,
      color: 'var(--text-2) !important',
      fontSize: '0.8rem'
    }),
  };
  const { auth } = useAuth();
  const lang = useLang();

  const dispatch = useAppDispatch();
  //let updatetedUsers = [];
  let updatetedUsers: Employee[] = [];

  const loadOptions = useCallback(
    (inputValue, callback) => {
      if (!inputValue) {
        return callback([]);
      }
      if (inputValue.length > 0) {
        let formDataObject: IUserSearch;
        formDataObject = {
          //projectId: 0,
          unitId: (allowAllUnitUser && allowAllUnitUser === true) ? "0" : "",
          searchText: inputValue,
          //excludedUsers: excludedUsers,
        };
        // dispatch(fetchUserDetailsAsync({ formDataObject: formDataObject }))
        //   .then((resolve) => {
        //     if (resolve.payload.data && resolve.payload.data.length > 0) {
        //       const updatedUsers = resolve.payload.data.map((user) => ({
        //         value: user.userId,
        //         label: (lang === 'en') ? user.nameEn : user.nameAr,
        //       }));
        //       callback(updatedUsers);
        //     } else {
        //       callback([]);
        //     }
        //   })
        //   .catch((error) => {
        //     console.error("Error fetching users: ", error);
        //     callback([]);
        //   });
      } else {
        callback([]);
      }
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <div style={{ width: `${width}`, height: `${customHeight}px` }} className="searchable-list">
        <AsyncSelect
          isMulti={isMulti}
          loadOptions={loadOptions}
          className="lbl-txt-medium-2"
          name="search"
          // classNamePrefix="select...."
          placeholder={defaultText}
          //components={animatedComponents}
          components={{ DropdownIndicator: customDropdownIndicator, IndicatorSeparator: customIndicatorSeparator }}
          isSearchable={false}
          isClearable={true} // Set isClearable prop to true
          menuIsOpen={false}
          value={value}
          maxMenuHeight={100}
          styles={customStyles}
          onChange={(list: any, action: ActionMeta<any>) => {
            onSearchChangeHandler(list, action);
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default SearchDDL;
