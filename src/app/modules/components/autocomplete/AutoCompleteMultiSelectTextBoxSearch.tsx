import * as React from 'react';
import { useAutocomplete, AutocompleteGetTagProps } from '@mui/base/useAutocomplete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import { IUsers } from '../../../models/global/userModel';
import { useAppDispatch } from '../../../../store';
import { generateUUID } from '../../utils/common';

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
  background-color: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--primary-10)'
    };
  border: 1px solid ${theme.palette.mode === 'dark' ? '#303030' : '#e8e8e8'};
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : 'var(--primary-10)'};
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    
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
  font: var(--text-regular-2) !important;
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
    background-color: ${theme.palette.mode === 'dark' ? '#2b2b2b' : 'var(--primary-10)'};
    font-weight: 600;
    font: var(--text-regular-2) !important;
    & svg {
      color: var(--primary-5, #B7945A);
    }
  }

  & li.${autocompleteClasses.focused} {
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : 'var(--primary-10)'};
    cursor: pointer;
    font: var(--text-regular-2) !important;
    & svg {
      color: var(--primary-5, #B7945A);
    }
  }
`,
);

type Props = {
  onSearchChangeHandler: any;
  data: IUsers[];
  selectedValue: IUsers[];
  placeholdertext: string;
  isDisabled?: boolean;
};


export default function AutoCompleteMultiSelectTextBoxSearch({ onSearchChangeHandler, data, selectedValue, placeholdertext, isDisabled }: Props) {

  const dispatch = useAppDispatch();
  const onValueChange = (obj) => {
    return onSearchChangeHandler(obj);
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
    id: 'customized-hook-demo',
    defaultValue: [],
    multiple: true,
    options: data,
    getOptionLabel: (option) => {
      return option.userName && option.displayName ? `${option.userName} - ${option.displayName}` : '';
    },
    onChange: (newValue) => {
      onValueChange(newValue);
    },
    filterOptions: (options, { inputValue }) =>
      options.filter(option =>
        option.displayName.toLowerCase().includes(inputValue.toLowerCase())
      ),
    value: selectedValue
  });

  const handleOptionClick = (option: IUsers) => {
    const isSelected = value.some((selectedOption) => selectedOption.userId == option.userId);
    const newSelectedValues = isSelected ? value.filter((selectedOption) => selectedOption.userId !== option.userId) : [...value, option];
    onValueChange(newSelectedValues);
  };

  const handleTagRemove = (option: IUsers) => {
    const newSelectedValues = value.filter((selectedOption) => selectedOption.userId !== option.userId);
    onValueChange(newSelectedValues);
  };

  return (
    <>
      <div {...getRootProps()}>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          {value.map((option: IUsers, index: number) => (
            <StyledTag label={option.displayName} {...getTagProps({ index })} key={option.userId} onDelete={() => handleTagRemove(option)} />
          ))}
          <input type='text' {...getInputProps()} placeholder={placeholdertext} disabled={isDisabled} />
        </InputWrapper>
      </div>
      {groupedOptions && groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()} >
          {(groupedOptions as typeof data).map((option, index) => {
            const isSelected = value.some((selectedOption) => selectedOption.displayName === option.displayName);
            return (
              <li {...getOptionProps({ option, index })} key={generateUUID()} aria-selected={isSelected} onClick={() => handleOptionClick(option)}>
                <span>
                  {option.displayName}
                </span>
                {isSelected && <CheckIcon fontSize="small" />}
              </li>
            );
          })}
        </Listbox>
      ) : null}
    </>
  );
}
