"use client";

import type { MasterLibraryCategory } from "@/lib/sparkMasterLibrary/types";

import { MasterLibraryItemCard } from "./MasterLibraryItemCard";

type MasterLibraryCategoryPanelProps = {
  category: MasterLibraryCategory;
  defaultOpen?: boolean;
};

export function MasterLibraryCategoryPanel({
  category,
  defaultOpen = false,
}: MasterLibraryCategoryPanelProps) {
  if (category.items.length === 0) {
    return null;
  }

  return (
    <details className="founder-master-lib__category" open={defaultOpen}>
      <summary className="founder-master-lib__category-summary">
        <span className="founder-master-lib__category-label">{category.label}</span>
        <span className="founder-master-lib__category-count">
          {category.items.length} entries
        </span>
      </summary>
      <p className="founder-master-lib__category-purpose">{category.purpose}</p>
      <div className="founder-master-lib__grid">
        {category.items.map((item) => (
          <MasterLibraryItemCard key={item.id} item={item} />
        ))}
      </div>
    </details>
  );
}
