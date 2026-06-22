import { DatePicker as MuiDatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
export type { DatePickerProps };
export function DatePicker<TDate>(props: DatePickerProps<TDate, TDate>) {
  return <MuiDatePicker {...props} />;
}
