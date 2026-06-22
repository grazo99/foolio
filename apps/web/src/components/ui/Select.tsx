import { Select as MuiSelect, SelectProps, MenuItem, InputLabel } from '@mui/material';
export type { SelectProps };
export { MenuItem, InputLabel };
export function Select<T = unknown>(props: SelectProps<T>) {
  return <MuiSelect {...props} />;
}
