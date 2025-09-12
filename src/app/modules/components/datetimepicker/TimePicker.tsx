import { TextField } from '@mui/material';
import { Box } from '@mui/system';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useLang } from '../../../../_metronic/i18n/Metronici18n';
import 'dayjs/locale/ar-dz';
import 'dayjs/locale/en';
import dayjs, { Dayjs } from 'dayjs';
import { maxTime } from 'date-fns';
import "./DateTimePicker.css"
import { useIntl } from 'react-intl';
import { TimeValidationError } from '@mui/x-date-pickers/models';
import React from 'react';
require('dayjs/locale/ar')

interface ITimePicker {
  label: string;
  value: dayjs.Dayjs | null;
  isDisabled?: boolean;
  OnTimeChange: (value: dayjs.Dayjs | null) => void;
  minimumTime?: dayjs.Dayjs | undefined;
  maximumTime?: dayjs.Dayjs | undefined;
  enableAMPM?: boolean; //default value is true
  hideAM?: boolean;
  hidePM?: boolean;
  onTimeAccept?: (value: dayjs.Dayjs | null) => void;
};



export default function TimePickerComponent({ label, value, OnTimeChange, onTimeAccept, isDisabled, minimumTime, maximumTime, enableAMPM, hideAM, hidePM }: ITimePicker) {

  const lang = useLang();
  const intl = useIntl();
  dayjs.locale(lang);

  function OnKeyPress(e) {
    e.preventDefault();
    return false;
  }

  return (
    <>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang === 'ar' ? 'ar-dz' : 'en'}>

        <TimePicker disabled={isDisabled} views={['hours', 'minutes']} value={value} label={label}
          slotProps={{
            textField: { size: 'small', fullWidth: true, }
            // onKeyDown: (event) => OnKeyPress(event),
            , openPickerIcon: {
              width: '1rem',
              height: '1rem',
            },
            popper: {
              className: hideAM ? 'hide-am' : ''
            }
          }} onChange={OnTimeChange}
          ampm={enableAMPM}
          minTime={minimumTime}
          maxTime={maximumTime}
          localeText={{
            okButtonLabel: intl.formatMessage({ id: 'LABEL.OK' }),
            fieldHoursPlaceholder: () => intl.formatMessage({ id: lang === "ar" ? 'PLACEHOLDER.TIMEPICKER.MINUTES' : 'PLACEHOLDER.TIMEPICKER.HOURS' }),
            fieldMinutesPlaceholder: () => intl.formatMessage({ id: lang === "ar" ? 'PLACEHOLDER.TIMEPICKER.HOURS' : 'PLACEHOLDER.TIMEPICKER.MINUTES' }),
            fieldSecondsPlaceholder: () => intl.formatMessage({ id: 'PLACEHOLDER.TIMEPICKER.SECONDS' }),
          }}
          onAccept={onTimeAccept}
        />
      </LocalizationProvider>


    </>
  );
}



export function TimePickerComponent24({ label, value, OnTimeChange, isDisabled, minimumTime, maximumTime, enableAMPM, hideAM, hidePM }: ITimePicker) {

  const lang = useLang();
  const intl = useIntl();
  dayjs.locale(lang);

  function OnKeyPress(e) {
    e.preventDefault();
    return false;
  }

  return (
    <>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang == 'ar' ? 'ar-dz' : 'en'}>

        <TimePicker disabled={isDisabled} views={['hours', 'minutes']} value={value} label={label}
          slotProps={{
            textField: {
              size: 'small', fullWidth: true, onKeyDown: (event) => OnKeyPress(event),
            }
            , openPickerIcon: {
              width: '1rem',
              height: '1rem',
            },
            popper: {
              className: hideAM ? 'hide-am' : ''
            }
          }} onChange={OnTimeChange}
          ampm={enableAMPM}
          minTime={minimumTime}
          maxTime={maximumTime}
          format="HH:mm"
          localeText={{
            okButtonLabel: intl.formatMessage({ id: 'LABEL.OK' }),
            fieldHoursPlaceholder: () => intl.formatMessage({ id: lang === "ar" ? 'PLACEHOLDER.TIMEPICKER.MINUTES' : 'PLACEHOLDER.TIMEPICKER.HOURS' }),
            fieldMinutesPlaceholder: () => intl.formatMessage({ id: lang === "ar" ? 'PLACEHOLDER.TIMEPICKER.HOURS' : 'PLACEHOLDER.TIMEPICKER.MINUTES' }),
            fieldSecondsPlaceholder: () => intl.formatMessage({ id: 'PLACEHOLDER.TIMEPICKER.SECONDS' }),
          }}
        />
      </LocalizationProvider>


    </>
  );
}


export function TimePickerComponentWithMessage({ label, value, OnTimeChange, isDisabled, minimumTime, maximumTime, enableAMPM, hideAM, hidePM }: ITimePicker) {
  const [error, setError] = React.useState<TimeValidationError | null>(null);
  const lang = useLang();
  const intl = useIntl();
  dayjs.locale(lang);

  const errorMessage = React.useMemo(() => {
    switch (error) {
      case 'minTime': {
        return intl.formatMessage({ id: "MOD.MEETING.INVALIDSTARTENDTIME" });
      }

      case 'invalidDate': {
        return '';
      }

      default: {
        return '';
      }
    }
  }, [error]);

  function OnKeyPress(e) {
    e.preventDefault();
    return false;
  }

  return (
    <>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang === 'ar' ? 'ar-dz' : 'en'}>

        <TimePicker disabled={isDisabled} views={['hours', 'minutes']} value={value} label={label}
          onError={(newError) => setError(newError)}
          slotProps={{
            textField: { size: 'small', fullWidth: true, helperText: errorMessage }
            , openPickerIcon: {
              width: '1rem',
              height: '1rem',
            },
            popper: {
              className: hideAM ? 'hide-am' : ''
            }
          }} onChange={OnTimeChange}
          ampm={enableAMPM}
          minTime={minimumTime}
          maxTime={maximumTime}
          localeText={{
            okButtonLabel: intl.formatMessage({ id: 'LABEL.OK' }),
            fieldHoursPlaceholder: () => intl.formatMessage({ id: lang === "ar" ? 'PLACEHOLDER.TIMEPICKER.MINUTES' : 'PLACEHOLDER.TIMEPICKER.HOURS' }),
            fieldMinutesPlaceholder: () => intl.formatMessage({ id: lang === "ar" ? 'PLACEHOLDER.TIMEPICKER.HOURS' : 'PLACEHOLDER.TIMEPICKER.MINUTES' }),
            fieldSecondsPlaceholder: () => intl.formatMessage({ id: 'PLACEHOLDER.TIMEPICKER.SECONDS' }),
          }}
        />
      </LocalizationProvider>
    </>
  );
}