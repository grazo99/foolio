import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
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
import { Transaction, TransactionType } from '@foolio/types';
import { fetchTransactions } from '../api/transactions';
import TransactionForm from '../components/TransactionForm';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>(undefined);

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

  function onSaved() {
    loadTransactions();
  }

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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
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
                      {/* TODO Task 4: wire up onClick to open delete confirmation */}
                      <IconButton size="small" aria-label="delete" color="error">
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

      <TransactionForm
        open={formOpen}
        onClose={onFormClose}
        onSaved={onSaved}
        transaction={editTransaction}
      />
    </Box>
  );
}
