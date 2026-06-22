import { Button as MuiButton, ButtonProps } from '@mui/material';
export type { ButtonProps };
export function Button(props: ButtonProps) {
  return <MuiButton {...props} />;
}
