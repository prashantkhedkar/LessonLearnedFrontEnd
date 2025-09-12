import Dropdown from 'react-bootstrap/Dropdown';
import cssDropdown from './FilterLookupDDL.module.css'
import { number } from 'yargs';
import { useState } from 'react';

const TaskRecurrence = [
  { Key: 0, Value: '' }
]

type dData = typeof TaskRecurrence;
interface DropDownWhiteprops {
  valueChange: Function,
  data: dData
}

interface DropDownPlainprops {
  valueChange: Function,
  data: dData,
  count: number
}

function DropDownWhite({ ...props }: DropDownWhiteprops) {
  function onChange(e: string) {
    setDropValue(e);
    props.valueChange(e)
  }

  const [dropValue, setDropValue] = useState(props.data[0].Value);

  return (

    <Dropdown className={cssDropdown["dropdown-whitebg"]}>
      <Dropdown.Toggle variant="default" id="dropdown-basic">
        {dropValue}
      </Dropdown.Toggle>

      <Dropdown.Menu>



        {
          props.data.map((item) => (
            <Dropdown.Item eventKey={item.Key} onClick={() => onChange(item.Value)} >{item.Value}</Dropdown.Item>
          ))
        }



      </Dropdown.Menu>
    </Dropdown>
  );
}




export default DropDownWhite;










