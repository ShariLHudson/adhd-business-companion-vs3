// Brain Dump taxonomy — specific buckets so dozens/hundreds of entries stay
// findable. The classifier assigns the MOST specific one; users can override.
export const BRAINDUMP_CATEGORY_GROUPS: {
  group: string;
  emoji: string;
  categories: string[];
}[] = [
  {
    group: "Business",
    emoji: "💼",
    categories: [
      "Sales",
      "Marketing",
      "Content",
      "Client Work",
      "Finance",
      "Product / Services",
      "Website / Tech",
      "Learning / Research",
      "Admin",
    ],
  },
  {
    group: "Personal",
    emoji: "🌿",
    categories: ["Health", "Family", "Home", "Personal Errands"],
  },
  {
    group: "ADHD",
    emoji: "🧠",
    categories: ["Ideas", "Brainstorm", "Someday / Maybe", "Follow Up"],
  },
];

// Flat list (in display order) + "Other" fallback.
export const BRAINDUMP_CATEGORIES: string[] = [
  ...BRAINDUMP_CATEGORY_GROUPS.flatMap((g) => g.categories),
  "Other",
];

// Normalize a model/legacy value to a known category (else "Other").
export function normalizeCategory(value?: string | null): string {
  if (!value) return "Other";
  const v = value.trim().toLowerCase();
  const hit = BRAINDUMP_CATEGORIES.find((c) => c.toLowerCase() === v);
  return hit ?? "Other";
}
