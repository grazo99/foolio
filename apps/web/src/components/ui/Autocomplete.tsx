import { Autocomplete as MuiAutocomplete, AutocompleteProps } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
export type { AutocompleteProps };
export { createFilterOptions };
export function Autocomplete<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
>(props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
  return <MuiAutocomplete {...props} />;
}
