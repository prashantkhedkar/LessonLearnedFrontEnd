import * as React from 'react';
import { useAutocomplete, AutocompleteGetTagProps } from '@mui/base/useAutocomplete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import { IUsers } from '../../../models/global/userModel';
import { useAppDispatch } from '../../../../store';
import { generateUUID } from '../../utils/common';
import { IJPUserGroup } from '../../../models/global/globalGeneric';
import { UserContactInfo, UserGroupAvatar } from '../customAvatar/CustomAvatar';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { HtmlTooltip } from '../tooltip/HtmlTooltip';

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
  data: IJPUserGroup[];
  selectedValue: IJPUserGroup[];
  placeholdertext: string;
  isDisabled?: boolean;
};

export default function AutoCompleteMultiSelectUserGroupTextBox({ onSearchChangeHandler, data, selectedValue, placeholdertext, isDisabled }: Props) {
  const dispatch = useAppDispatch();
  const lang = useLang();
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
      return option.groupName;
    },
    onChange: (newValue) => {
      onValueChange(newValue);
    },
    filterOptions: (options, { inputValue }) =>
      options.filter(option =>
        option.groupName.toLowerCase().includes(inputValue.toLowerCase())
      ),
    value: selectedValue
  });

  const handleOptionClick = (option: IJPUserGroup) => {
    const isSelected = value.some((selectedOption) => selectedOption.groupId == option.groupId);
    const newSelectedValues = isSelected ? value.filter((selectedOption) => selectedOption.groupId !== option.groupId) : [...value, option];
    onValueChange(newSelectedValues);
  };

  const handleTagRemove = (option: IJPUserGroup) => {
    const newSelectedValues = value.filter((selectedOption) => selectedOption.groupId !== option.groupId);
    onValueChange(newSelectedValues);
  };

  const TooltipTitle = ({ groupMembers }) => {
    return (
      <div className="user-list domain-title scrollable-height-setup">
        {
          groupMembers && groupMembers.map((name) => {
            return (
              <div className="user-section">
                <UserContactInfo
                  name={lang == "ar" ? (!name.nameAr || name.nameAr == "" ? name?.displayName : name.nameAr) : name?.displayName}
                  userid={name.userid}
                  image={""}
                  customStyle={""}
                  isShowText={true}
                  gender={name.gender && name.gender !== "" ? name.gender : undefined}
                />
              </div>
            );
          })
        }
      </div>
    );
  };

  const GroupMembersView = ({ groupMembers }) => {
    return (
      <>
        {
          groupMembers &&
          <HtmlTooltip
            placement="top"
            title={<TooltipTitle groupMembers={groupMembers} />}
            arrow
            TransitionProps={{ timeout: 400 }}
            className="custom-tooltip">
            <div className="members">
              {groupMembers.length > 99 ? 99 : groupMembers.length}
            </div>
          </HtmlTooltip>
        }
      </>
    );
  };

  return (
    <>
      <div {...getRootProps()}>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          {value.map((option: IJPUserGroup, index: number) => (
            <StyledTag label={option.groupName} {...getTagProps({ index })} key={option.groupId ? option.groupId : index} onDelete={() => handleTagRemove(option)} />
          ))}
          <input type='text' {...getInputProps()} placeholder={placeholdertext} disabled={isDisabled} />
        </InputWrapper>
      </div>
      {groupedOptions && groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()} >
          {(groupedOptions as typeof data).map((option, index) => {
            const isSelected = value.some((selectedOption) => selectedOption.groupName === option.groupName);
            return (
              <li {...getOptionProps({ option, index })} key={generateUUID()} aria-selected={isSelected} onClick={() => handleOptionClick(option)}>
                {/* {isSelected && <CheckIcon fontSize="small" />} */}
                <span className='mx-3'>
                  {option.groupName}
                </span>
                <span className='d-flex justify-content-end'>
                  <GroupMembersView groupMembers={option.groupMembers} />
                </span>
              </li>
            );
          })}

        </Listbox>

      ) : null}

    </>
  );
}


