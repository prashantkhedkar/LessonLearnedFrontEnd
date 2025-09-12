import * as React from 'react';
import { useAutocomplete, AutocompleteGetTagProps } from '@mui/base/useAutocomplete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import { useAppDispatch } from '../../../../store';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { FieldGroupMappingModel } from '../../../models/global/FieldGroupMappingModel';
import { GetAllCustomFieldsFromFieldMaster } from '../../../modules/services/adminSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { BtnLabeltxtMedium2 } from '../common/formsLabels/detailLabels';

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

const AddButton = styled('button')(
  ({ theme }) => `
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  margin-left: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: #40a9ff;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`,
);

type Props = {
  onSearchChangeHandler: any;
  data?: FieldGroupMappingModel[]; // Changed from ServiceFieldOption[] to FieldGroupMappingModel[]
  selectedValue: FieldGroupMappingModel[];
  placeholder?: string;
  id: string;
  readOnly?: boolean;
  isMultiSelect: boolean;
  onAddSelected?: (selectedItems: FieldGroupMappingModel[]) => void; // Updated to use FieldGroupMappingModel
  maxSelections?: number; // Maximum number of selections allowed
  excludeItems?: FieldGroupMappingModel[]; // Items to exclude from the dropdown (already selected in drag-drop)
};

export default function AutoCompleteMultiSelectLookupForFieldGrouping({
  onSearchChangeHandler,
  data,
  selectedValue,
  placeholder,
  id,
  readOnly = false,
  isMultiSelect = true,
  onAddSelected,
  maxSelections = 5,
  excludeItems = []
}: Props) {
  const dispatch = useAppDispatch();
  const [availableFields, setAvailableFields] = useState<FieldGroupMappingModel[]>(data || []);
  const [filteredFields, setFilteredFields] = useState<FieldGroupMappingModel[]>([]);
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  // Load fields from GetAllCustomFieldsFromFieldMaster API when component mounts
  useEffect(() => {
    const loadCustomFields = async () => {

      if (data && data.length > 0) {
        // If data is already provided via props, use it
        setAvailableFields(data);
        return;
      }

      setLoading(true);
      try {
        const result = await dispatch(GetAllCustomFieldsFromFieldMaster({}));
        const originalPromiseResult = unwrapResult(result);

        if (originalPromiseResult.statusCode === 200) {
          const fieldOptions: FieldGroupMappingModel[] = originalPromiseResult.data.map((item: any) => ({
            mappingId: item.mappingId || 0,
            fieldId: item.fieldId, // This is the actual field ID from the database
            componentFieldId: item.fieldId, // For consistency, use the same value as fieldId
            displayOrder: item.displayOrder || 0,
            isRequired: item.isRequired || false,
            fieldLabel: item.fieldLabel || item.fieldName || '',
            placeholder: item.placeholder || '',
            fieldDescription: item.fieldDescription || '',
            attributes: item.attributes || {}
          } as FieldGroupMappingModel));
          setAvailableFields(fieldOptions);
        }
      } catch (error) {
        console.error('Failed to load custom fields:', error);
        setAvailableFields([]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomFields();
  }, [dispatch, data]);

  // Update originalMappingsMap whenever selectedValue or excludeItems changes
  useEffect(() => {
    const newMap = new Map<number, FieldGroupMappingModel>();

    // Add mappings from selectedValue (temporary selections in autocomplete)
    selectedValue.forEach(mapping => {
      if (mapping.fieldId) {
        newMap.set(mapping.fieldId, mapping);
      }
    });

    // Add mappings from excludeItems (already selected fields in drag-drop)
    excludeItems.forEach(mapping => {
      if (mapping.fieldId) {
        newMap.set(mapping.fieldId, mapping);
      }
    });
  }, [selectedValue, excludeItems]);

  // Filter out excluded items whenever availableFields or excludeItems changes
  useEffect(() => {

    if (availableFields.length > 0) {
      console.log('AutoComplete Filtering - Available fields:', availableFields.map(f => ({ fieldId: f.fieldId, fieldLabel: f.fieldLabel })));
      console.log('AutoComplete Filtering - Exclude items:', excludeItems.map(e => ({ fieldId: e.fieldId, componentFieldId: e.componentFieldId, fieldLabel: e.fieldLabel })));

      const filtered = availableFields.filter(field => {
        const shouldExclude = excludeItems.some(excludedItem =>
          // Handle both cases:
          // 1. When excludedItem comes from selectedFieldsForGrouping (edit mode) - use componentFieldId
          // 2. When excludedItem comes from temp selections - use fieldId
          excludedItem.componentFieldId === field.fieldId || excludedItem.fieldId === field.fieldId
        );
        return !shouldExclude;
      });

      console.log('AutoComplete Filtering - Filtered fields:', filtered.map(f => ({ fieldId: f.fieldId, fieldLabel: f.fieldLabel })));
      setFilteredFields(filtered);
    } else {
      setFilteredFields([]);
    }
  }, [availableFields, excludeItems]);

  const onValueChange = (obj: any) => {
    if (!readOnly) {
      // obj is already FieldGroupMappingModel[], no conversion needed
      const mappings = Array.isArray(obj) ? obj : [];
      return onSearchChangeHandler(mappings);
    }
  };

  const handleAddSelected = () => {

    if (onAddSelected && Array.isArray(value) && value.length > 0) {
      // Get the currently selected items in the drag-drop component
      const currentlySelectedCount = excludeItems.length;
      const newItemsCount = value.length;

      // Check if adding selected items would exceed the maximum
      if (currentlySelectedCount + newItemsCount <= maxSelections) {
        // value is already FieldGroupMappingModel[], no conversion needed
        onAddSelected(value);
        // Clear the selection after adding
        onValueChange([]);
      } else {
        // Show warning or handle max limit exceeded
        const remainingSlots = maxSelections - currentlySelectedCount;
        toast.warning(intl.formatMessage({
          id: 'FIELD.GROUPING.CANNOT.ADD.FIELDS'
        }, {
          newItemsCount,
          remainingSlots
        }));
      }
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
    id: id,
    defaultValue: [],
    multiple: isMultiSelect,
    options: filteredFields,
    getOptionLabel: (option) => option.fieldLabel || '',
    isOptionEqualToValue: (option, value) => option.fieldId === value.fieldId,
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
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
              {
                Array.isArray(value) && value.map((option: FieldGroupMappingModel, index: number) => (
                  <StyledTag label={option.fieldLabel || ''} {...getTagProps({ index })} />
                ))
              }
              <input
                type='text'
                {...getInputProps()}
                placeholder={loading ? intl.formatMessage({ id: 'LOADING.FIELDS' }) : placeholder}
                readOnly={readOnly || loading}
                disabled={readOnly || loading}
              />
            </InputWrapper>
          </div>
          {onAddSelected && !readOnly && Array.isArray(value) && value.length > 0 && (
            <button
              type="button"
              className='btn MOD_btn btn-create w-10 pl-5 mx-3'
              onClick={handleAddSelected}
              disabled={!value.length || (excludeItems.length >= maxSelections)}
            >
              <BtnLabeltxtMedium2 text={`${intl.formatMessage({ id: 'FIELD.GROUPING.ADD.BUTTON' })} ${(value.length)}`} />
            </button>
          )}
        </div>
      </div>
      {groupedOptions && groupedOptions.length > 0 && !readOnly && !loading ? (
        <Listbox {...getListboxProps()} >
          {(groupedOptions as FieldGroupMappingModel[]).map((option, index) => {
            // Check if item is selected either in current value (temp selections) or in excludeItems (already selected)
            const isSelected = (Array.isArray(value) && value.some((v: FieldGroupMappingModel) => v.fieldId === option.fieldId)) ||
              (excludeItems.some(excludedItem =>
                excludedItem.componentFieldId === option.fieldId || excludedItem.fieldId === option.fieldId
              ));
            return (
              <li {...getOptionProps({ option, index })} key={`option-${option.fieldId}-${index}`}>
                <span>{option.fieldLabel}</span>
                {isSelected && (
                  <span style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}>
                    <CheckIcon fontSize="small" style={{ color: '#b7945a', visibility: 'visible' }} />
                  </span>
                )}
              </li>
            );
          })}
        </Listbox>
      ) : filteredFields.length === 0 && !loading && availableFields.length > 0 ? (
        <div style={{ padding: '12px', color: '#999', fontStyle: 'italic' }}>
          {intl.formatMessage({ id: 'ALL.AVAILABLE.FIELDS.SELECTED' })}
        </div>
      ) : null}
    </Root>
  );
}
