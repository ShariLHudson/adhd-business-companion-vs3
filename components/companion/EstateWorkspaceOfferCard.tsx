"use client";

import type { WorkspaceOffer } from "@/lib/workspaceMode";

type Props = {
  offer: WorkspaceOffer;
  onAccept: () => void;
  onStayHere: () => void;
  onShowMap: () => void;
};

/**
 * Spec 108 — Yes · Stay here · Show Estate map (Welcome Home front door).
 */
export function EstateWorkspaceOfferCard({
  offer,
  onAccept,
  onStayHere,
  onShowMap,
}: Props) {
  return (
    <div
      className="mb-2 rounded-xl border border-[#1e4f4f]/20 bg-white/85 px-3 py-3 shadow-sm backdrop-blur-sm"
      role="region"
      aria-label="Estate invitation"
      data-testid="estate-workspace-offer"
    >
      {offer.line ? (
        <p className="text-center text-sm leading-snug text-[#6b635a]">
          {offer.line}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-full bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          {offer.buttonLabel}
        </button>
        <button
          type="button"
          onClick={onStayHere}
          className="rounded-full border border-[#d4cdc3] bg-white/90 px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-white"
        >
          Stay here
        </button>
        <button
          type="button"
          onClick={onShowMap}
          className="rounded-full border border-[#1e4f4f]/25 bg-[#1e4f4f]/[0.06] px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
        >
          Show map
        </button>
      </div>
    </div>
  );
}
