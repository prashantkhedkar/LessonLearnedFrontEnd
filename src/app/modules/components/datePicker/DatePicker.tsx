
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'path';

interface IDatePicker {
    label: string;
    value?: Date;
    isDisabled? : boolean;
    OnDateChange
  };
  

export default function MUIDatePicker({ label, value, OnDateChange, isDisabled }: IDatePicker) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
     <DatePicker disabled={isDisabled}  value={value} label={label}  slotProps={{ textField: { size: 'small',fullWidth: true }}} onChange={(list) => {
            OnDateChange(list); 
          }} disablePast />
    </LocalizationProvider>
  );
}