import {
  Box as MuiBox,
  BoxProps,
  Divider as MuiDivider,
  DividerProps,
  CircularProgress as MuiCircularProgress,
  CircularProgressProps,
  Skeleton as MuiSkeleton,
  SkeletonProps,
} from '@mui/material';
export type { BoxProps, DividerProps, CircularProgressProps, SkeletonProps };
export function Box(props: BoxProps) {
  return <MuiBox {...props} />;
}
export function Divider(props: DividerProps) {
  return <MuiDivider {...props} />;
}
export function CircularProgress(props: CircularProgressProps) {
  return <MuiCircularProgress {...props} />;
}
export function Skeleton(props: SkeletonProps) {
  return <MuiSkeleton {...props} />;
}
