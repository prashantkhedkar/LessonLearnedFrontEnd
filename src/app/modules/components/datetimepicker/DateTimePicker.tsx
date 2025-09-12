import  { useState } from 'react'
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "./DateTimePicker.css"


interface DatePickerprops {
    dateChange: Function,
    value : string
  }

export const DateTimePickerComponent =({ ...props }: DatePickerprops)=>{  

      const ClickHandler = (date) => {

  	}

      const [startDate, setStartDate] = useState("");

      
      const onChangeDate = (date) => {
        setStartDate(date);
        props.dateChange(date.toLocaleString());

      };
      
return(
           <>
           <div style={{ display: 'inline-block' }}>
                <DatePicker showIcon={false} 
                selected={startDate}  onChange={onChangeDate}  placeholderText='Select a Date'
                className="form-control form-control-solid ps-12 flatpickr-input active input5"/>
                  {/* <input type="button" onClick={ClickHandler} value="Click"/> */}
            </div>
            </>
        )       
}
 
export default DateTimePickerComponent;