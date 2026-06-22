import { DatePicker as MuiDatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
export type { DatePickerProps };
export function DatePicker<TInputDate, TDate = TInputDate>(
  props: DatePickerProps<TInputDate, TDate>,
) {
  return <MuiDatePicker {...props} />;
}
