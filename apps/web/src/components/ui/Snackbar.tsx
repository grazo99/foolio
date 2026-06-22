import {
  Snackbar as MuiSnackbar,
  SnackbarProps,
  Alert as MuiAlert,
  AlertProps,
} from '@mui/material';
export type { SnackbarProps, AlertProps };
export function Snackbar(props: SnackbarProps) {
  return <MuiSnackbar {...props} />;
}
export function Alert(props: AlertProps) {
  return <MuiAlert {...props} />;
}
