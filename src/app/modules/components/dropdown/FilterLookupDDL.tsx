import Dropdown from 'react-bootstrap/Dropdown';
import cssDropdown from './FilterLookupDDL.module.css'
import './bootstrapoverride.css'
import { useEffect, useState } from 'react';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import { generateUUID } from '../../utils/common';
import { fetchLookupAsync } from '../../services/globalSlice';
import { useAppDispatch } from '../../../../store';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import { unwrapResult } from '@reduxjs/toolkit';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useIntl } from 'react-intl';
import CommonConstant from '../../../helper/_constant/common.constant';
import { Badge } from '@mui/material';
import { BtnLabeltxtMedium2, HeaderLabels, LabelHeadingMedium4, LabelHeadingSemibold3, LabelTextMedium1, LabelTitleSemibold2, LabelheadingSemibold5 } from '../common/formsLabels/detailLabels';


interface DropDownPlainprops {
  valueChange: Function;
  lookupType: string;
  count: Function;
  useMediaType: string;
  servicetype?: string;
  defaultValue?: string;
  exclusionList?: [];
}

interface gridDropdownList {
  Key: number;
  Value: string;
}[] = [];

function FilterLookupDDL({ ...props }: DropDownPlainprops) {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const lang = useLang();
  let currentItem: gridDropdownList = { Key: 0, Value: "" };

  const [getDropDownState, setDropDownState] = useState<{ Key: number; Value: string }[]>([])
  var data: gridDropdownList[] = [];

  useEffect(() => {
    if (!props.lookupType)
      return;

    data = [...data, currentItem];

    dispatch(fetchLookupAsync())
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          originalPromiseResult.data.filter((item: any) => {
            if (item.lookupType === props.lookupType) {
              if (item.lookupName !== "") {
                return item
              }
            }
          })
            .map((item: any) => {
              const currentItem: gridDropdownList = { Key: item.lookupId, Value: (lang === "en" ? item.lookupName : item.lookupNameAr) };
              data = [...data, currentItem];
            });
          setDropDownState(data);
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        console.log(rejectedValueOrSerializedError);
      });
  }, [dispatch, setDropDownState]);

  function onChange(Key: string, Value: string) {
    setDropPlainValue(Value);
    props.valueChange(Key, Value)
  }

  const [dropPlainValue, setDropPlainValue] = useState(currentItem.Value);

  return (

    <Dropdown >
      <Dropdown.Toggle variant="default" id="dropdown-basic" className={cssDropdown["filter-lookup"]} style={{ padding: "0px" }}>
        {/* <span className={cssDropdown["filter-lookup-show"]}>{intl.formatMessage({ id: 'MOD.WATIRA.SHOW' })}</span>:
        <span className={cssDropdown["filter-lookup-ddl-values"]}>{" "}{dropPlainValue == "" ? props.defaultValue : dropPlainValue}</span> */}
        <LabelheadingSemibold5 text={"MOD.WATIRA.SHOW"} customClassName='mx-2' />:
        <LabelheadingSemibold5 text={dropPlainValue == "" ? props.defaultValue! : dropPlainValue} customClassName='mx-2' />
        <Badge className='mx-2'
          badgeContent={(props.count()).toString()}
          sx={{
            "& .MuiBadge-badge": {
              color: "var(--Primary-4, #AF8848)",
              backgroundColor: "var(--Primary-10, #EFE7DA)",
              font: "var(--caption-semibold)",
              top: "13px",
              right: "7px",
              width: "24px",
              height: "24px"
            }
          }}
        >
          {/* {(props.count()).toString()} */} 0
        </Badge>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {(getDropDownState && getDropDownState.length > 0) &&
          getDropDownState.map((item) => (
            <Dropdown.Item eventKey={item.Key} key={generateUUID()} onClick={() => onChange(item.Key.toString(), item.Value)} className={cssDropdown["dropdown-menu"]} >

              {
                (props.useMediaType === "image") &&
                <img src={` ${toAbsoluteUrl('/media/svg/mod-specific/' + item.Key)}.svg`} alt='img' onError={(event) => (event.target as HTMLImageElement).style.display = 'none'} />
              }
              {
                (props.useMediaType === "icon") &&
                <FiberManualRecordIcon />
              }

              <div className={` ${cssDropdown["time"]}`}>{item.Value}</div>
            </Dropdown.Item>
          ))
        }
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default FilterLookupDDL;