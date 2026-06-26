"use client";

import type { ReactNode } from "react";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
const SECTION_BTN =
  "flex w-full items-center gap-2 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80";

export function EcosystemCloseAllButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center rounded-full border border-[#e7d9c8] bg-[#faf7f2] px-3 py-1.5 text-sm font-semibold text-[#2f261f] hover:bg-[#f3ebe0] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Close All
    </button>
  );
}

export function EcosystemCollapsibleSection({
  id,
  title,
  description,
  objectId,
  open,
  onToggle,
  count,
  children,
  testId,
  accentClass = "border-[#e4ddd2]",
  headerClassName,
  objectClassName,
}: {
  id?: string;
  title: string;
  description?: string;
  objectId?: string;
  open: boolean;
  onToggle: () => void;
  count?: number;
  children: ReactNode;
  testId?: string;
  accentClass?: string;
  headerClassName?: string;
  objectClassName?: string;
}) {
  return (
    <div
      id={id}
      data-testid={testId}
      className={`overflow-hidden rounded-xl border bg-white shadow-sm ${accentClass}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`${SECTION_BTN} ${headerClassName ?? ""}`}
      >
        {objectId ? (
          objectClassName ? (
            <span className={objectClassName} aria-hidden="true">
              <CompanionObjectVisual objectId={objectId} size="md" variant="mini-scene" />
            </span>
          ) : (
            <span className="shrink-0" aria-hidden="true">
              <CompanionObjectVisual objectId={objectId} size="md" variant="mini-scene" />
            </span>
          )
        ) : (
          <span
            className="shrink-0 text-sm text-[#9a8f82]"
            aria-hidden="true"
          >
            {open ? "▼" : "▶"}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-[#1f1c19]">
            {title}
          </span>
          {description ? (
            <span className="block text-xs text-[#6b635a]">{description}</span>
          ) : null}
        </span>
        {count != null && count > 0 ? (
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold tabular-nums text-stone-700">
            {count}
          </span>
        ) : null}
        {objectId ? (
          <span className="shrink-0 text-sm text-[#9a8f82]" aria-hidden="true">
            {open ? "▲" : "▼"}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="border-t border-[#efe8de] bg-[#faf7f2]/40 px-3 py-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function EcosystemSubsectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-3 px-1 text-xs font-bold uppercase tracking-wide text-[#9a8f82] first:mt-0">
      {children}
    </p>
  );
}
