export type ScreenFilterOption = {
  label: string;
  value: string;
};

export const toFilterOptions = (values: string[]): ScreenFilterOption[] =>
  [...new Set(values.filter(Boolean))]
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({ label: value, value }));
