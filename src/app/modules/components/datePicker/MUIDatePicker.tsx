import dayjs, { Dayjs } from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/ar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { useState } from "react";
import { generateUUID } from "../../utils/common";
import { IconButton, InputAdornment } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface IDatePicker {
  placeholder: string;
  value?: Date;
  isDisabled?: boolean;
  onDateChange: Function;
  disablePast?: boolean;
  disableFuture?: boolean;
  maxDate?: Date;
  minDate?: Date;
  dateFormat?: string;
  isReadOnly?: boolean;
  id: string;
  key: string;
}

dayjs.locale("ar");
dayjs.extend(updateLocale);
dayjs.updateLocale("ar", {
  weekdays: [
    "السبت",
    "الجمعة",
    "الخميس",
    "الأربعاء",
    "الثلاثاء",
    "الإثنين",
    "الأحد",
  ],
  weekStart: 1,
});

function MUIDatePicker({
  id,
  key,
  placeholder,
  value,
  onDateChange,
  isDisabled,
  disablePast = false,
  disableFuture = false,
  maxDate,
  minDate,
  dateFormat = "YYYY/MM/DD",
  isReadOnly,
}: IDatePicker) {
  const dayjsValue = value ? dayjs(value) : null;
  const [open, setOpen] = useState(false);

  const getArabicWeekDayName = (engDayName: string) => {
    let arabicDayName = "";
    switch (engDayName) {
      case "ح":
        arabicDayName = "الأحد";
        break;
      case "ن":
        arabicDayName = "الإثنين";
        break;
      case "ث":
        arabicDayName = "الثلاثاء";
        break;
      case "ر":
        arabicDayName = "الأربعاء";
        break;
      case "خ":
        arabicDayName = "الخميس";
        break;
      case "ج":
        arabicDayName = "الجمعة";
        break;
      case "س":
        arabicDayName = "السبت";
        break;
      default:
        arabicDayName = engDayName;
    }

    return arabicDayName;
  };

  function renderDay(props: PickersDayProps<Dayjs>) {
    const { day, ...other } = props;
    const isWeekend = (dayNumber: number): boolean => {
      return [0, 6].includes(dayNumber);
    };
    return (
      <PickersDay
        className={
          isWeekend(props.day.day()) ? "pickers-weekend" : "pickers-weekdays"
        }
        {...other}
        day={day}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <div
        className="custom-calender-widget"
        dir="rtl"
        style={{ backgroundColor: "#FFFF" }}
      >
        <DatePicker
          key={key}
          open={open}
          readOnly={isReadOnly}
          disabled={isDisabled}
          value={dayjsValue}
          onClose={() => setOpen(false)}
          onChange={(date) => {
            const selectedDate = date ? date.toDate() : undefined;
            onDateChange(selectedDate);
          }}
          maxDate={maxDate ? dayjs(maxDate) : undefined}
          minDate={minDate ? dayjs(minDate) : undefined}
          disablePast={disablePast}
          disableFuture={disableFuture}
          format={dateFormat}
          slotProps={{
            desktopPaper: {
              sx: {
                minWidth: "330px",
                ".MuiDayCalendar-weekDayLabel, .MuiPickersCalendarHeader-label, .MuiPickersMonth-monthButton":
                {
                  fontFamily: "HelveticaNeueLTArabic-Light_0",
                  margin: "0 3px",
                },
                ".MuiDateCalendar-root": {
                  height: "320px",
                },
                ".MuiMonthCalendar-root": {
                  minHeight: "210px",
                },
                ".MuiDayCalendar-weekContainer": {
                  margin: "0",
                },
                ".MuiDayCalendar-header > *": {
                  minWidth: "36.7px",
                },
                ".MuiDayCalendar-header > *:nth-child(6), .MuiDayCalendar-header > *:nth-child(7)":
                {
                  minWidth: "38.5px",
                },
                ".MuiDayCalendar-weekContainer > *": {
                  minWidth: "38.5px",
                },
                ".MuiDayCalendar-weekDayLabel:nth-child(6), .MuiDayCalendar-weekDayLabel:nth-of-type(7)":
                {
                  backgroundColor:
                    "var(--date-picker-weekend-bg-color) !important",
                  margin: "0",
                },
                ".Mui-selected": {
                  backgroundColor:
                    "var(--date-picker-text-active-color) !important",
                  ":hover": {
                    backgroundColor: "var(--date-picker-text-active-color)",
                    borderColor: "transparent",
                    boxShadow: "none",
                    color: "var(--date-picker-text-color)",
                  },
                  ":active": {
                    backgroundColor: "var( --date-picker-hover-bg-color)",
                    color: "var(--date-picker-text-color)",
                  },
                },
              },
            },
            previousIconButton: {
              sx: {
                color: "var(--date-picker-text-active-color)",
                ":hover": {
                  backgroundColor: "var( --date-picker-hover-bg-color)",
                  borderColor: "transparent",
                  boxShadow: "none",
                  color: "var(--date-picker-text-color)",
                },
              },
            },
            nextIconButton: {
              sx: {
                color: "var(--date-picker-text-active-color)",

                ":hover": {
                  backgroundColor: "var( --date-picker-hover-bg-color)",
                  borderColor: "transparent",
                  boxShadow: "none",
                  color: "var(--date-picker-text-color)",
                },
              },
            },
            switchViewButton: {
              sx: {
                color: "var(--date-picker-text-active-color)",
                ":hover": {
                  backgroundColor: "var( --date-picker-hover-bg-color)",
                  borderColor: "transparent",
                  boxShadow: "none",
                  color: "var(--date-picker-text-color)",
                },
              },
            },
            calendarHeader: {
              classes: {
                root: "d-flex gap-4 justify-content-between",
                labelContainer: "ms-0 gap-2",
              },
              sx: {
                width: "100%",
                position: "relative",
                fontFamily: ['"FrutigerLTArabic-Roman_0"', "Roboto"].join(","),
                "> div": {
                  width: "100%",
                },
                ".MuiPickersCalendarHeader-label": {
                  margin: "0",
                  font: '400 14px/1.75rem "HelveticaNeueLTArabic-Light_0"',
                },
                "> div.MuiPickersCalendarHeader-labelContainer": {
                  margin: "0",
                  cursor: "default !important",
                },
                // ".MuiSvgIcon-root": {
                //   fill: "var(--calendar-text-inverse-color)",
                // },
                ".MuiPickersArrowSwitcher-root": {
                  justifyContent: "flex-end !important",
                  marginLeft: "10px !important",
                  "& .MuiSvgIcon-root": {
                    width: "1.5rem",
                    height: "1.5rem",
                  },
                },
                ".MuiPickersArrowSwitcher-spacer": {
                  width: "0px !important",
                },
                "& .MuiIconButton-edgeEnd": {
                  transform: "scaleX(-1)",
                },
                "& .MuiIconButton-edgeStart": {
                  transform: "scaleX(-1)",
                },

                padding: "0 1rem",
              },
            },
            day: {
              showDaysOutsideCurrentMonth: true,
              sx: {
                fontFamily: "HelveticaNeueLTArabic-Light_0",
                ":active": {
                  backgroundColor:
                    "var(--date-picker-text-active-color) !important",
                },
                ":hover": {
                  backgroundColor: "var( --date-picker-hover-bg-color)",
                  borderColor: "transparent",
                  boxShadow: "none",
                  color: "var(--date-picker-text-active-color)",
                },
                "&.Mui-selected": {
                  backgroundColor:
                    "var(--date-picker-text-active-color) !important",
                  ":hover": {
                    backgroundColor: "var( --date-picker-hover-bg-color)",
                    color: "var(--date-picker-text-inverse-color)",
                  },
                },
                "&:not(.Mui-selected)": {
                  borderColor:
                    "var(--date-picker-text-active-color) !important",
                },
              },
            },
            // yearButton: {
            //   sx: {
            //     fontFamily: "HelveticaNeueLTArabic-Light_0",
            //     maxHeight: "230px",
            //     ":active": {
            //       backgroundColor:
            //         "var(--date-picker-text-active-color) !important",
            //     },
            //     ":hover": {
            //       backgroundColor: "var( --date-picker-hover-bg-color)",
            //       borderColor: "transparent",
            //       boxShadow: "none",
            //       color: "var(--date-picker-text-active-color)",
            //     },
            //     "& .Mui-selected": {
            //       backgroundColor:
            //         "var(--date-picker-text-active-color) !important",
            //       ":hover": {
            //         backgroundColor: "var( --date-picker-hover-bg-color)",
            //         color: "var(--date-picker-text-inverse-color)",
            //       },
            //     },
            //   },
            // },
            // monthButton: {
            //   sx: {
            //     fontFamily: "HelveticaNeueLTArabic-Light_0",
            //     direction: "rtl",
            //     ":active": {
            //       backgroundColor:
            //         "var(--date-picker-text-active-color) !important",
            //     },
            //     ":hover": {
            //       backgroundColor: "var( --date-picker-hover-bg-color)",
            //       borderColor: "transparent",
            //       boxShadow: "none",
            //       color: "var(--date-picker-text-active-color)",
            //     },
            //   },
            // },
            textField: {
              size: "small",
              fullWidth: true,
              InputProps: {
                sx: {
                  fontWeight: "500",
                  fontSize: "0.8125rem",
                  lineHeight: 1,
                  height: "2.5rem",
                  color: "var(--date-picker-text-color)",
                  fontFamily: "HelveticaNeueLTArabic-Light_0",

                  "& fieldset": {
                    borderRadius: "0.375rem",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: "hsl(0, 0%, 80%)",
                    boxShadow: "var(--tw-input-focus-box-shadow)",
                    boxSizing: "border-box",
                  },
                  "& input::placeholder": {
                    color: "var(--date-picker-text-color) !important",
                    opacity: "1 !important",
                  },
                  "&:hover": {
                    "& fieldset": {
                      borderColor: "hsl(0, 0%, 80%) !important",
                      borderWidth: "1px !important",
                    },
                  },
                  "&.Mui-focused": {
                    "& fieldset": {
                      borderColor:
                        "var(--date-picker-text-active-color) !important",
                      borderWidth: "1px !important",
                      boxShadow:
                        "0px 1px 1px rgb(0 0 0 / 8%) inset, 0px 0px 8px #dfcfb6 !important",
                    },
                  },
                },
                startAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="open calendar"
                      onClick={(e) => {
                        setOpen(true);
                      }}
                      size="small"
                      sx={{
                        color: "var(--date-picker-text-active-color",
                        "&:hover": {
                          backgroundColor: "var(--date-picker-hover-bg-color)",
                        },
                      }}
                    >
                      <CalendarTodayIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: dayjsValue ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear date"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateChange(undefined);
                      }}
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
              placeholder,
            },
            inputAdornment: {
              onClick: () => setOpen(true),
              sx: {
                " button:not(.Mui-disabled) > svg ": {
                  color: "var(--date-picker-icon-color)",
                },
                "& > button > svg": {
                  color: "var(--date-picker-text-active-color)",
                },
              },
            },
            layout: {
              sx: {
                direction: "rtl !important",
              },
            },
            field: {
              readOnly: true,
              onKeyDown: () => setOpen(true),
            },
          }}
          slots={{
            day: renderDay,
          }}
          sx={{
            ".MuiPickersFadeTransitionGroup-root": {
              direction: "rtl",
            },
          }}
          // className={`label-datepicker ${dayjsValue ? '' : 'custom-label'}`}
          views={["year", "month", "day"]}
          dayOfWeekFormatter={(day) => `${getArabicWeekDayName(day)}`}
        />
      </div>
    </LocalizationProvider>
  );
}

export { MUIDatePicker };
