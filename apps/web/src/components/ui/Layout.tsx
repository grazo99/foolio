import {
  Box as MuiBox,
  BoxProps,
  Divider as MuiDivider,
  DividerProps,
  CircularProgress as MuiCircularProgress,
  CircularProgressProps,
} from '@mui/material';
export type { BoxProps, DividerProps, CircularProgressProps };
export function Box(props: BoxProps) {
  return <MuiBox {...props} />;
}
export function Divider(props: DividerProps) {
  return <MuiDivider {...props} />;
}
export function CircularProgress(props: CircularProgressProps) {
  return <MuiCircularProgress {...props} />;
}
