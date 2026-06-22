import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  EditIcon,
  DeleteIcon,
  AddIcon,
} from '../components/ui';
import { ApiError, Transaction, TransactionType } from '@foolio/types';
import { deleteTransaction, fetchTransactions } from '../api/transactions';
import TransactionForm from '../components/TransactionForm';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>(undefined);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Increment this to re-trigger the fetch effect
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchTransactions()
      .then((data) => {
        if (!controller.signal.aborted) {
          setTransactions(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('Failed to load transactions.');
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [fetchTick]);

  function loadTransactions() {
    setLoading(true);
    setFetchTick((t) => t + 1);
  }

  function showSnackbar(message: string, severity: 'success' | 'error' = 'success') {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  function onNewTransaction() {
    setEditTransaction(undefined);
    setFormOpen(true);
  }

  function onEditTransaction(tx: Transaction) {
    setEditTransaction(tx);
    setFormOpen(true);
  }

  function onFormClose() {
    setFormOpen(false);
    setEditTransaction(undefined);
  }

  function onSaved(message?: string) {
    loadTransactions();
    if (message) showSnackbar(message, 'success');
  }

  function onDeleteClick(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function onDeleteCancel() {
    setDeleteDialogOpen(false);
    setDeletingId(null);
  }

  async function onDeleteConfirm() {
    if (!deletingId) return;
    setDeleteInProgress(true);
    try {
      await deleteTransaction(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      loadTransactions();
      showSnackbar('Transaction deleted', 'success');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const raw = apiErr?.message;
      const message = Array.isArray(raw)
        ? raw.join(', ')
        : (raw ?? 'Failed to delete transaction.');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      showSnackbar(message, 'error');
    } finally {
      setDeleteInProgress(false);
    }
  }

  const SKELETON_ROWS = 5;
  const TABLE_COLUMNS = 9;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Transactions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNewTransaction}>
          New Transaction
        </Button>
      </Box>

      {loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: TABLE_COLUMNS }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && transactions.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No transactions yet. Add your first one!
          </Typography>
          <Button variant="outlined" onClick={onNewTransaction}>
            Add Transaction
          </Button>
        </Box>
      )}

      {!loading && !error && transactions.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {tx.asset.ticker}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tx.asset.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.type}
                      size="small"
                      color={tx.type === TransactionType.BUY ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right">{tx.quantity}</TableCell>
                  <TableCell align="right">{tx.price.toFixed(2)}</TableCell>
                  <TableCell>{tx.currency}</TableCell>
                  <TableCell>{tx.provider?.name ?? '—'}</TableCell>
                  <TableCell>{tx.notes ?? '—'}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => onEditTransaction(tx)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="delete"
                        color="error"
                        onClick={() => onDeleteClick(tx.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={onDeleteCancel}>
        <DialogTitle>Delete transaction?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDeleteCancel} disabled={deleteInProgress}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteConfirm}
            disabled={deleteInProgress}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <TransactionForm
        open={formOpen}
        onClose={onFormClose}
        onSaved={onSaved}
        transaction={editTransaction}
      />
    </Box>
  );
}
