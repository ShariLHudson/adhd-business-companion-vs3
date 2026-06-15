/**
 * Global dropdown standard — alphabetical by display label unless a caller
 * documents an intentional exception (workflow sequence, dates, priority).
 */

export function compareDropdownLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function sortDropdownLabels(labels: readonly string[]): string[] {
  return [...labels].sort(compareDropdownLabels);
}

export function sortByDropdownLabel<T>(
  items: readonly T[],
  getLabel: (item: T) => string,
): T[] {
  return [...items].sort((a, b) =>
    compareDropdownLabels(getLabel(a), getLabel(b)),
  );
}

/** Pin specific values first (e.g. "all"), then sort the rest alphabetically. */
export function sortWithPinnedValues<T>(
  items: readonly T[],
  getValue: (item: T) => string,
  pinnedValues: readonly string[],
  getLabel: (item: T) => string = getValue,
): T[] {
  const pinOrder = new Map(pinnedValues.map((v, i) => [v, i]));
  return [...items].sort((a, b) => {
    const pa = pinOrder.get(getValue(a));
    const pb = pinOrder.get(getValue(b));
    if (pa !== undefined && pb !== undefined) return pa - pb;
    if (pa !== undefined) return -1;
    if (pb !== undefined) return 1;
    return compareDropdownLabels(getLabel(a), getLabel(b));
  });
}
