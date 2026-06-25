"use client";

import { AppBackButton } from "@/components/companion/AppBackButton";
import { NAV_CHAT } from "@/lib/navigationBack";

/** Journey-aware back — replaces legacy Close control in library panels. */
export function LibraryCloseButton({
  onClose,
  destination = NAV_CHAT,
}: {
  onClose: () => void;
  destination?: string;
}) {
  return (
    <AppBackButton destination={destination} onBack={onClose} size="compact" />
  );
}

export function LibraryPanelHeader({
  title,
  description,
  onClose,
  backDestination = NAV_CHAT,
}: {
  title: string;
  description: string;
  onClose: () => void;
  backDestination?: string;
}) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-[#e7dfd4] pb-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-[#1f1c19]">{title}</h1>
        <p className="mt-1.5 text-base leading-relaxed text-[#6b635a]">
          {description}
        </p>
      </div>
      <LibraryCloseButton onClose={onClose} destination={backDestination} />
    </header>
  );
}

export function LibraryResultActions({
  onSave,
  onUse,
  onDuplicate,
  onDelete,
  saveLabel = "Save",
  useLabel = "Use",
}: {
  onSave?: () => void;
  onUse?: () => void;
  onDuplicate?: () => void;
  onDelete: () => void;
  saveLabel?: string;
  useLabel?: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {onSave ? (
        <button
          type="button"
          onClick={onSave}
          className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          {saveLabel}
        </button>
      ) : null}
      {onUse ? (
        <button
          type="button"
          onClick={onUse}
          className="rounded-lg border border-[#1e4f4f]/40 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
        >
          {useLabel}
        </button>
      ) : null}
      {onDuplicate ? (
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
        >
          Duplicate
        </button>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#a85c4a] hover:bg-[#a85c4a]/10"
      >
        Delete
      </button>
    </div>
  );
}
