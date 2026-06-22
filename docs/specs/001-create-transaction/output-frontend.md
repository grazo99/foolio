# Create Transaction — Frontend Output

**Spec:** `docs/specs/001-create-transaction/spec.md`
**Branch:** `feat/001-create-transaction-frontend`
**Completed:** 2026-06-21

## Summary

Built the full transaction management UI: API client layer, transaction list page with routing, transaction form (create + edit), delete confirmation, and loading/error polish. Added a UI wrapper layer (`apps/web/src/components/ui/`) as a design system proxy over MUI.

## Decisions Made

- **MUI component wrappers** (`apps/web/src/components/ui/`): Added at user request for design system enforcement and third-party proxy isolation. All app code imports UI components from here; only infrastructure items (ThemeProvider, CssBaseline, LocalizationProvider) remain as direct MUI imports.
- **`@mui/x-date-pickers` pinned to v5**: v5 is required to match the project's MUI v5 stack; v9 requires MUI v7 and would cause peer dep conflicts.
- **Outer/inner remount pattern for TransactionForm**: `TransactionForm` wrapper passes a `key` derived from `transaction?.id ?? 'new'` to `TransactionFormInner`, causing React to remount on identity change. Avoids synchronous setState in effect bodies.
- **`fetchTick` counter for list refresh**: Rather than extracting `loadTransactions` into a ref or using a `useCallback`, a counter in the `useEffect` dep array cleanly triggers re-fetches.
- **Sentinel option pattern for Autocomplete**: "Add new asset..." / "Add new provider..." options are sentinel objects kept at the top of the filtered list via a custom `filterOptions`, so they remain visible when the user types.
- **Typography polymorphic wrapper uses `as any` internally**: MUI v5's JSX spread with polymorphic components hits a known TypeScript limitation. The `as any` is constrained behind a correct public signature and an ESLint disable comment.

## Deviations from Plan

- Added `apps/web/src/components/ui/` wrapper layer (not in original plan — added per user instruction mid-execution).
- Added `FormControl` to the UI wrappers (was in TransactionForm but not listed in the plan's wrapper inventory).
- `Snackbar` and `Skeleton` added to wrappers during Task 4 (needed but not pre-created).
- `DialogContentText` added to Dialog wrapper (needed for delete confirmation body).
- `onSaved` callback signature changed to `onSaved(message?: string)` to pass success messages up to the Snackbar in TransactionsPage.

## Unresolved / Follow-up

- `Transaction.currency` is typed as `string` in `packages/types` but the UI treats it as `Currency` enum. A backend fix to narrow the type would remove the `as Currency` cast in the form.
- Provider fetch failure shows a warning but still allows form submission (the field is optional). Future: could offer a retry button.
- No navigation beyond `/transactions` — routing is minimal for now.
