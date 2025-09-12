import * as React from 'react';
import { useAutocomplete, AutocompleteGetTagProps } from '@mui/base/useAutocomplete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import { useAppDispatch } from '../../../../store';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { ServiceFieldOption } from '../dynamicFields/utils/types';

const Root = styled('div')(
  ({ theme }) => `
  color: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,.85)'
    };
  font-size: 14px;
`,
);

const Label = styled('label')`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled('div')(
  ({ theme }) => `
  border: 1px solid ${theme.palette.mode === 'dark' ? '#434343' : '#d9d9d9'};
  background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
  border-radius: 4px;
  padding: 3px;
  display: flex;
  flex-wrap: wrap;

  &:hover {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
  }

  &.focused {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
    color: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,.85)'
    };
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`,
);

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string;
}

function Tag(props: TagProps) {
  const { label, onDelete, ...other } = props;
  return (
    <div {...other}>
      <span>{label}</span>
      <CloseIcon onClick={onDelete} />
    </div>
  );
}

const StyledTag = styled(Tag)<TagProps>(
  ({ theme }) => `
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fafafa'
    };
  border: 1px solid ${theme.palette.mode === 'dark' ? '#303030' : '#e8e8e8'};
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`,
);

const Listbox = styled('ul')(
  ({ theme }) => `
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: ${theme.palette.mode === 'dark' ? '#2b2b2b' : '#fafafa'};
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li.${autocompleteClasses.focused} {
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
    cursor: pointer;

    & svg {
      color: currentColor;
    }
  }
`,
);

type Props = {
  onSearchChangeHandler: any;
  data: ServiceFieldOption[];
  selectedValue: ServiceFieldOption[];
  placeholder?: string;
  id: string;
  readOnly?: boolean;
  isMultiSelect: boolean; // Add support for single/multi select
};


export default function AutoCompleteMultiSelectLookup({ onSearchChangeHandler, data, selectedValue, placeholder, id, readOnly = false, isMultiSelect = true }: Props) {
  const onValueChange = (obj: any) => {
    if (!readOnly) {
      return onSearchChangeHandler(obj);
    }
  };

  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: id, // Use the dynamic ID passed from parent
    defaultValue: [],
    multiple: isMultiSelect,
    options: data,
    getOptionLabel: (option) => option.label,
    isOptionEqualToValue: (option, value) => option.value === value.value, // Fix: prevent duplicate selection
    onChange: (event, newValue) => {
      if (!readOnly) {
        onValueChange(newValue);
      }
    },
    value: selectedValue,
    readOnly: readOnly,
  });

  return (
    <Root>
      <div {...getRootProps()}>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          {
            Array.isArray(value) && value.map((option: ServiceFieldOption, index: number) => (
              <StyledTag label={option.label} {...getTagProps({ index })} />
            ))
          }
          <input type='text' {...getInputProps()} placeholder={placeholder} readOnly={readOnly} disabled={readOnly} />
        </InputWrapper>
      </div>
      {groupedOptions && groupedOptions.length > 0 && !readOnly ? (
        <Listbox {...getListboxProps()} >
          {(groupedOptions as typeof data).map((option, index) => {
            const isSelected = Array.isArray(value) && value.some((v: ServiceFieldOption) => v.value === option.value);
            return (
              <li {...getOptionProps({ option, index })} >
                <span>{option.label}</span>
                {isSelected && (
                  <span style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                    <CheckIcon fontSize="small" style={{ color: '#1890ff', visibility: 'visible' }} />
                  </span>
                )}
              </li>
            );
          })}
        </Listbox>
      ) : null}
    </Root>
  );
}
