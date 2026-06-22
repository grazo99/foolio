import {
  AppBar as MuiAppBar,
  AppBarProps,
  Toolbar as MuiToolbar,
  ToolbarProps,
} from '@mui/material';
export type { AppBarProps, ToolbarProps };
export function AppBar(props: AppBarProps) {
  return <MuiAppBar {...props} />;
}
export function Toolbar(props: ToolbarProps) {
  return <MuiToolbar {...props} />;
}
