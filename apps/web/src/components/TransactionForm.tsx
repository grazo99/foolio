import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Asset, AssetType, Currency, Provider, Transaction, TransactionType } from '@foolio/types';
import { fetchAssets, createAsset } from '../api/assets';
import { fetchProviders, createProvider } from '../api/providers';
import { createTransaction, updateTransaction, CreateTransactionDto } from '../api/transactions';

const ADD_NEW_ASSET_OPTION = '__ADD_NEW_ASSET__';
const ADD_NEW_PROVIDER_OPTION = '__ADD_NEW_PROVIDER__';

const assetFilterOptions = createFilterOptions<AssetOption>();
const providerFilterOptions = createFilterOptions<ProviderOption>();

interface AssetOption {
  id: string;
  label: string;
  isAddNew?: boolean;
}

interface ProviderOption {
  id: string;
  label: string;
  isAddNew?: boolean;
}

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  transaction?: Transaction;
}

/**
 * Inner form component — receives a stable `key` from the outer shell so it
 * remounts (and resets all local state) whenever `transaction` identity or
 * `open` changes. This avoids synchronous setState calls inside effects.
 */
function TransactionFormInner({ open, onClose, onSaved, transaction }: TransactionFormProps) {
  const isEditMode = Boolean(transaction);

  // Asset state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(() => {
    if (!transaction) return null;
    return {
      id: transaction.asset.id,
      label: `${transaction.asset.ticker} — ${transaction.asset.name}`,
    };
  });
  const [showNewAsset, setShowNewAsset] = useState(false);
  const [newAssetTicker, setNewAssetTicker] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState<AssetType>(AssetType.STOCK);

  // Provider state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(() => {
    if (!transaction?.provider) return null;
    return { id: transaction.provider.id, label: transaction.provider.name };
  });
  const [showNewProvider, setShowNewProvider] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');

  // Transaction fields — initialised from `transaction` if editing
  const [txType, setTxType] = useState<TransactionType>(transaction?.type ?? TransactionType.BUY);
  const [quantity, setQuantity] = useState(transaction ? String(transaction.quantity) : '');
  const [price, setPrice] = useState(transaction ? String(transaction.price) : '');
  const [date, setDate] = useState<Dayjs | null>(transaction ? dayjs(transaction.date) : dayjs());
  const [currency, setCurrency] = useState<Currency>(
    transaction ? ((transaction.currency as Currency) ?? Currency.USD) : Currency.USD,
  );
  const [notes, setNotes] = useState(transaction?.notes ?? '');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [assetFetchError, setAssetFetchError] = useState<string | null>(null);

  // Load assets and providers when dialog opens
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    fetchAssets()
      .then((data) => {
        if (!controller.signal.aborted) setAssets(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setAssetFetchError('Failed to load assets. Please close and try again.');
      });

    fetchProviders()
      .then((data) => {
        if (!controller.signal.aborted) setProviders(data);
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [open]);

  const assetOptions: AssetOption[] = [
    { id: ADD_NEW_ASSET_OPTION, label: 'Add new asset...', isAddNew: true },
    ...assets.map((a) => ({ id: a.id, label: `${a.ticker} — ${a.name}` })),
  ];

  const providerOptions: ProviderOption[] = [
    { id: ADD_NEW_PROVIDER_OPTION, label: 'Add new provider...', isAddNew: true },
    ...providers.map((p) => ({ id: p.id, label: p.name })),
  ];

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!selectedAsset && !showNewAsset) {
      errors.asset = 'Asset is required.';
    }
    if (showNewAsset) {
      if (!newAssetTicker.trim()) errors.newAssetTicker = 'Ticker is required.';
      if (!newAssetName.trim()) errors.newAssetName = 'Name is required.';
    }
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      errors.quantity = 'Quantity must be greater than 0.';
    }
    const px = parseFloat(price);
    if (!price || isNaN(px) || px <= 0) {
      errors.price = 'Price must be greater than 0.';
    }
    if (!date || !date.isValid()) {
      errors.date = 'A valid date is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      let assetId: string;

      if (showNewAsset) {
        const newAsset = await createAsset({
          ticker: newAssetTicker.trim().toUpperCase(),
          name: newAssetName.trim(),
          type: newAssetType,
        });
        assetId = newAsset.id;
      } else {
        assetId = selectedAsset!.id;
      }

      let providerId: string | null = null;
      if (showNewProvider && newProviderName.trim()) {
        const newProvider = await createProvider({ name: newProviderName.trim() });
        providerId = newProvider.id;
      } else if (selectedProvider && !selectedProvider.isAddNew) {
        providerId = selectedProvider.id;
      }

      const dto: CreateTransactionDto = {
        assetId,
        type: txType,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        date: date!.toISOString(),
        currency,
        providerId: providerId ?? null,
        notes: notes.trim() || undefined,
      };

      if (isEditMode && transaction) {
        await updateTransaction(transaction.id, dto);
      } else {
        await createTransaction(dto);
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Asset */}
          {assetFetchError && (
            <Typography color="error" variant="body2">
              {assetFetchError}
            </Typography>
          )}
          <Autocomplete
            options={assetOptions}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            value={
              showNewAsset
                ? { id: ADD_NEW_ASSET_OPTION, label: 'Add new asset...', isAddNew: true }
                : selectedAsset
            }
            filterOptions={(options, params) => {
              const filtered = assetFilterOptions(options, params);
              const sentinel = options.find((o) => o.id === ADD_NEW_ASSET_OPTION);
              if (sentinel && !filtered.some((o) => o.id === sentinel.id)) {
                return [sentinel, ...filtered];
              }
              return filtered;
            }}
            onChange={(_e, newVal) => {
              if (newVal?.isAddNew) {
                setShowNewAsset(true);
                setSelectedAsset(null);
              } else {
                setShowNewAsset(false);
                setSelectedAsset(newVal);
              }
              setValidationErrors((prev) => ({ ...prev, asset: '' }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Asset"
                required
                error={Boolean(validationErrors.asset)}
                helperText={validationErrors.asset}
              />
            )}
          />

          {/* Inline new-asset fields */}
          {showNewAsset && (
            <Box
              sx={{
                pl: 2,
                borderLeft: '3px solid',
                borderColor: 'primary.main',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                New asset details
              </Typography>
              <TextField
                label="Ticker"
                required
                value={newAssetTicker}
                onChange={(e) => setNewAssetTicker(e.target.value)}
                error={Boolean(validationErrors.newAssetTicker)}
                helperText={validationErrors.newAssetTicker}
                size="small"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <TextField
                label="Name"
                required
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
                error={Boolean(validationErrors.newAssetName)}
                helperText={validationErrors.newAssetName}
                size="small"
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newAssetType}
                  label="Type"
                  onChange={(e) => setNewAssetType(e.target.value as AssetType)}
                >
                  {Object.values(AssetType).map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Divider />

          {/* Transaction type */}
          <FormControl fullWidth>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={txType}
              label="Transaction Type"
              onChange={(e) => setTxType(e.target.value as TransactionType)}
            >
              {Object.values(TransactionType).map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantity */}
          <TextField
            label="Quantity"
            type="number"
            required
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setValidationErrors((prev) => ({ ...prev, quantity: '' }));
            }}
            error={Boolean(validationErrors.quantity)}
            helperText={validationErrors.quantity}
            inputProps={{ min: 0, step: 'any' }}
          />

          {/* Price per unit */}
          <TextField
            label="Price per unit"
            type="number"
            required
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setValidationErrors((prev) => ({ ...prev, price: '' }));
            }}
            error={Boolean(validationErrors.price)}
            helperText={validationErrors.price}
            inputProps={{ min: 0, step: 'any' }}
          />

          {/* Date */}
          <DatePicker
            label="Date"
            value={date}
            onChange={(newDate) => {
              setDate(newDate);
              setValidationErrors((prev) => ({ ...prev, date: '' }));
            }}
            disableFuture
            renderInput={(params) => (
              <TextField
                {...params}
                required
                error={Boolean(validationErrors.date)}
                helperText={validationErrors.date}
              />
            )}
          />

          {/* Currency */}
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={currency}
              label="Currency"
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              {Object.values(Currency).map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Provider */}
          <Autocomplete
            options={providerOptions}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            value={
              showNewProvider
                ? {
                    id: ADD_NEW_PROVIDER_OPTION,
                    label: 'Add new provider...',
                    isAddNew: true,
                  }
                : selectedProvider
            }
            filterOptions={(options, params) => {
              const filtered = providerFilterOptions(options, params);
              const sentinel = options.find((o) => o.id === ADD_NEW_PROVIDER_OPTION);
              if (sentinel && !filtered.some((o) => o.id === sentinel.id)) {
                return [sentinel, ...filtered];
              }
              return filtered;
            }}
            onChange={(_e, newVal) => {
              if (newVal?.isAddNew) {
                setShowNewProvider(true);
                setSelectedProvider(null);
              } else {
                setShowNewProvider(false);
                setSelectedProvider(newVal);
              }
            }}
            renderInput={(params) => <TextField {...params} label="Provider (optional)" />}
          />

          {/* Inline new-provider field */}
          {showNewProvider && (
            <Box sx={{ pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
              <Typography variant="caption" color="text.secondary">
                New provider
              </Typography>
              <TextField
                label="Provider name"
                required
                value={newProviderName}
                onChange={(e) => setNewProviderName(e.target.value)}
                size="small"
                fullWidth
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          {/* Notes */}
          <TextField
            label="Notes (optional)"
            multiline
            minRows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Submit error */}
          {submitError && (
            <Typography color="error" variant="body2">
              {submitError}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : undefined}
        >
          {submitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Add transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Public wrapper — remounts the inner form whenever `transaction` identity
 * changes so that all local state resets cleanly without useEffect setState.
 */
export default function TransactionForm(props: TransactionFormProps) {
  const key = props.transaction?.id ?? 'new';
  return <TransactionFormInner key={key} {...props} />;
}
