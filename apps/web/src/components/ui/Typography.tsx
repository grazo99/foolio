import { Typography as MuiTypography, TypographyProps } from '@mui/material';
import { ElementType } from 'react';
export type { TypographyProps };
export function Typography<C extends ElementType = 'span'>(
  props: TypographyProps<C, { component?: C }>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <MuiTypography {...(props as any)} />;
}
