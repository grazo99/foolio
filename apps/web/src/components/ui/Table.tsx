import {
  Table as MuiTable,
  TableProps,
  TableBody as MuiTableBody,
  TableBodyProps,
  TableCell as MuiTableCell,
  TableCellProps,
  TableContainer as MuiTableContainer,
  TableContainerProps,
  TableHead as MuiTableHead,
  TableHeadProps,
  TableRow as MuiTableRow,
  TableRowProps,
  Paper as MuiPaper,
  PaperProps,
} from '@mui/material';
export type {
  TableProps,
  TableBodyProps,
  TableCellProps,
  TableContainerProps,
  TableHeadProps,
  TableRowProps,
  PaperProps,
};
export function Table(props: TableProps) {
  return <MuiTable {...props} />;
}
export function TableBody(props: TableBodyProps) {
  return <MuiTableBody {...props} />;
}
export function TableCell(props: TableCellProps) {
  return <MuiTableCell {...props} />;
}
export function TableContainer(props: TableContainerProps) {
  return <MuiTableContainer {...props} />;
}
export function TableHead(props: TableHeadProps) {
  return <MuiTableHead {...props} />;
}
export function TableRow(props: TableRowProps) {
  return <MuiTableRow {...props} />;
}
export function Paper(props: PaperProps) {
  return <MuiPaper {...props} />;
}
