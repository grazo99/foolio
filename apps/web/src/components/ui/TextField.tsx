import { TextField as MuiTextField, TextFieldProps } from '@mui/material';
export type { TextFieldProps };
export function TextField(props: TextFieldProps) {
  return <MuiTextField fullWidth {...props} />;
}
