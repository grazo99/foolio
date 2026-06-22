import { FormControl as MuiFormControl, FormControlProps } from '@mui/material';
export type { FormControlProps };
export function FormControl(props: FormControlProps) {
  return <MuiFormControl {...props} />;
}
