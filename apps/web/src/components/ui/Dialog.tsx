import {
  Dialog as MuiDialog,
  DialogProps,
  DialogTitle as MuiDialogTitle,
  DialogTitleProps,
  DialogContent as MuiDialogContent,
  DialogContentProps,
  DialogContentText as MuiDialogContentText,
  DialogContentTextProps,
  DialogActions as MuiDialogActions,
  DialogActionsProps,
} from '@mui/material';
export type {
  DialogProps,
  DialogTitleProps,
  DialogContentProps,
  DialogContentTextProps,
  DialogActionsProps,
};
export function Dialog(props: DialogProps) {
  return <MuiDialog {...props} />;
}
export function DialogTitle(props: DialogTitleProps) {
  return <MuiDialogTitle {...props} />;
}
export function DialogContent(props: DialogContentProps) {
  return <MuiDialogContent {...props} />;
}
export function DialogContentText(props: DialogContentTextProps) {
  return <MuiDialogContentText {...props} />;
}
export function DialogActions(props: DialogActionsProps) {
  return <MuiDialogActions {...props} />;
}
