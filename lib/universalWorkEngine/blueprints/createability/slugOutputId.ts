/** Stable output id from blueprint + deliverable label. */

export function slugOutputFragment(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return slug || "output";
}

export function makeOutputId(blueprintId: string, outputName: string): string {
  return `output.${blueprintId}.${slugOutputFragment(outputName)}`;
}
