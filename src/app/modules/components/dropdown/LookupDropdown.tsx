import Dropdown from 'react-bootstrap/Dropdown';
import cssDropdown from './FilterLookupDDL.module.css'
import './bootstrapoverride.css'
import { useEffect, useState } from 'react';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import { fetchLookupAsync } from '../../services/globalSlice';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { Select, MenuItem } from '@mui/material';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';

interface DropDownPlainprops {
    valueChange?: Function;
    lookupType: string;
    defaultI18nSelectionKey: string;
    fieldIdReference: string;
    onSelectedValueChange?: Function;
    currentValue?: number;
}

interface gridDropdownList {
    Key: number;
    Value: string;
}[] = [];

function LookupDropdown({ ...props }: DropDownPlainprops) {
    const lang = useLang();
    const dispatch = useAppDispatch();
    const { viewLookups } = useAppSelector((s) => s.globalgeneric);
    const currentItem: gridDropdownList = { Key: 0, Value: props.defaultI18nSelectionKey };
    const [getDropDownState, setDropDownState] = useState<{ Key: number; Value: string }[]>([])
    var data: gridDropdownList[] = [];

    useEffect(() => {
        if (!props.lookupType)
            return;

        data = [...data, currentItem];

        dispatch(fetchLookupAsync())
            .then((response) => {
                response.payload.data
                    .filter((item: any) => {
                        if (item.lookupType === props.lookupType) {
                            return item
                        }
                    })
                    .map((item: any) => {
                        const currentItem: gridDropdownList = { Key: item.lookupId, Value: (lang === "en" ? item.lookupName : item.lookupNameAr) };
                        data = [...data, currentItem];
                    });
                setDropDownState(data);
            })
    }, [dispatch, setDropDownState]);

    function onChange(Key: string, Value: string) {
        setDropPlainValue(Value);
        //props.valueChange(Key, Value);
        props.currentValue = (dropPlainValue) ? parseInt(dropPlainValue) : 0;
    }

    function onSelectedValueChange() {
        return dropPlainValue
    }

    const [dropPlainValue, setDropPlainValue] = useState(currentItem.Value);

    return (
        <>
            <Select
                value={dropPlainValue}
                onChange={onSelectedValueChange}
                // displayEmpty
                className=""
            // inputProps={{ 'aria-label': 'Without label' }}
            // {...formik.getFieldProps("projectPriorityId")}
            >
                {getDropDownState &&
                    getDropDownState!.map((obj, idx) => (
                        <MenuItem key={obj.Key} value={obj.Value} onClick={() => onChange(obj.Key.toString(), obj.Value)}>
                            {obj.Value}
                        </MenuItem>
                    ))}
            </Select>
        </>
    );
}

export default LookupDropdown;