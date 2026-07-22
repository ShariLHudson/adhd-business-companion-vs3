"use client";

import { useState } from "react";
import type { CreateCatalogItem } from "@/lib/createCatalog";
import {
  catalogItemForSubtype,
  CREATE_BROWSE_CATEGORIES,
  defaultCatalogItemForParentType,
  parentTypesForCategory,
  type CreateBrowseCategoryId,
  type CreateParentType,
} from "@/lib/createEstate/createParentTypes";
import {
  CREATE_ESTATE_BROWSE_MORE_HINT,
  CREATE_ESTATE_HELP_ME_CHOOSE_HINT,
  CREATE_ESTATE_HELP_ME_CHOOSE_QUESTION,
} from "@/lib/createEstate/copy";

type Props = {
  /** Guided = one warm question framing; Browse = direct category grid. Same underlying flow (Spec 133 — one discovery experience). */
  mode: "guided" | "browse";
  /** Confirm gate stays with the parent — never creates Work directly (130/131). */
  onRequestCreate: (item: CreateCatalogItem) => void;
};

/**
 * Part 4 / 9 — Browse More + Help Me Choose.
 * Category → curated parent types → one subtype question (when needed) → confirm.
 * Never the full catalog at once; never more than one question at a time.
 */
export function CreateBrowseCategoriesPanel({ mode, onRequestCreate }: Props) {
  const [categoryId, setCategoryId] = useState<CreateBrowseCategoryId | null>(
    null,
  );
  const [parent, setParent] = useState<CreateParentType | null>(null);

  const heading =
    mode === "guided"
      ? CREATE_ESTATE_HELP_ME_CHOOSE_QUESTION
      : "Browse a category";
  const hint =
    mode === "guided"
      ? CREATE_ESTATE_HELP_ME_CHOOSE_HINT
      : CREATE_ESTATE_BROWSE_MORE_HINT;

  // Step 3 — subtype question for the chosen parent type.
  if (parent && parent.subtypes && parent.subtypes.length > 0) {
    return (
      <div
        className="flex flex-col gap-3"
        data-testid="create-browse-subtype-step"
      >
        <button
          type="button"
          className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
          data-testid="create-browse-back-to-parents"
          onClick={() => setParent(null)}
        >
          ← Back
        </button>
        <h4 className="text-base font-semibold text-[#1f1c19]">
          {parent.subtypeQuestion}
        </h4>
        <ul className="flex flex-wrap gap-2" data-testid="create-browse-subtypes">
          {parent.subtypes.map((subtype) => (
            <li key={subtype.id}>
              <button
                type="button"
                className="rounded-full border border-[#cfc6b8] bg-white px-4 py-2 text-sm font-semibold text-[#3d3429] transition hover:border-[#1e4f4f]/45 hover:bg-[#f3ebe0]"
                data-testid="create-browse-subtype-option"
                onClick={() => {
                  const item = catalogItemForSubtype(parent, subtype.id);
                  if (item) onRequestCreate(item);
                }}
              >
                {subtype.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Step 2 — curated parent type list for the chosen category.
  if (categoryId) {
    const parents = parentTypesForCategory(categoryId);
    const category = CREATE_BROWSE_CATEGORIES.find((c) => c.id === categoryId);
    return (
      <div className="flex flex-col gap-3" data-testid="create-browse-parent-step">
        <button
          type="button"
          className="self-start text-sm font-semibold text-[#1e4f4f] hover:underline"
          data-testid="create-browse-back-to-categories"
          onClick={() => setCategoryId(null)}
        >
          ← Back to categories
        </button>
        <h4 className="text-base font-semibold text-[#1f1c19]">
          {category?.label}
        </h4>
        {parents.length === 0 ? (
          <p
            className="text-sm leading-relaxed text-[#6b635a]"
            data-testid="create-browse-parent-empty"
          >
            Nothing here yet — tell Shari what you have in mind above and she
            will still help you create it.
          </p>
        ) : (
          <ul
            className="grid gap-2 sm:grid-cols-2"
            data-testid="create-browse-parent-cards"
          >
            {parents.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start gap-1 rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-3 text-left transition hover:border-[#cfc6b8]"
                  data-testid="create-browse-parent-card"
                  data-parent-type={p.id}
                  onClick={() => {
                    if (p.subtypes && p.subtypes.length > 0) {
                      setParent(p);
                      return;
                    }
                    const item = defaultCatalogItemForParentType(p);
                    if (item) onRequestCreate(item);
                  }}
                >
                  <span className="text-base font-semibold text-[#1f1c19]">
                    <span aria-hidden="true">{p.emoji}</span> {p.label}
                  </span>
                  <span className="text-sm text-[#6b635a]">{p.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Step 1 — seven top-level categories.
  return (
    <div className="flex flex-col gap-3" data-testid="create-browse-category-step">
      <h4 className="text-base font-semibold text-[#1f1c19]">{heading}</h4>
      <p className="text-sm text-[#6b635a]">{hint}</p>
      <ul
        className="grid gap-2 sm:grid-cols-2"
        data-testid="create-browse-category-cards"
      >
        {CREATE_BROWSE_CATEGORIES.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className="flex w-full flex-col items-start gap-1 rounded-2xl border border-[#e7dfd4] bg-white/90 px-4 py-3 text-left transition hover:border-[#cfc6b8]"
              data-testid="create-browse-category-card"
              data-category={category.id}
              onClick={() => setCategoryId(category.id)}
            >
              <span className="text-base font-semibold text-[#1f1c19]">
                {category.label}
              </span>
              <span className="text-sm text-[#6b635a]">{category.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
