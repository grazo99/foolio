import { Chip as MuiChip, ChipProps } from '@mui/material';
export type { ChipProps };
export function Chip(props: ChipProps) {
  return <MuiChip size="small" {...props} />;
}
