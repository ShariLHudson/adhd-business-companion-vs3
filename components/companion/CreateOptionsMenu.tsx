"use client";

import { useEffect, useRef, useState } from "react";

export type CreateOptionsAction =
  | "change-type"
  | "save-for-later"
  | "start-over"
  | "delete-draft";

type CreateOptionsMenuProps = {
  onAction: (action: CreateOptionsAction) => void;
  /** Hide change type when artifact type is locked. */
  changeTypeDisabled?: boolean;
  className?: string;
};

const ITEMS: { id: CreateOptionsAction; label: string }[] = [
  { id: "change-type", label: "Change Type" },
  { id: "save-for-later", label: "Save For Later" },
  { id: "start-over", label: "Start Over" },
  { id: "delete-draft", label: "Delete Draft" },
];

export function CreateOptionsMenu({
  onAction,
  changeTypeDisabled = false,
  className = "",
}: CreateOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function pick(action: CreateOptionsAction) {
    setOpen(false);
    onAction(action);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-lg border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
      >
        Options ▾
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-[#d4cdc3] bg-white py-1 shadow-lg"
        >
          {ITEMS.map((item) => {
            const disabled =
              item.id === "change-type" && changeTypeDisabled;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => !disabled && pick(item.id)}
                className={`block w-full px-4 py-2.5 text-left text-sm font-medium ${
                  item.id === "delete-draft"
                    ? "text-[#a85c4a] hover:bg-[#a85c4a]/8"
                    : "text-[#1f1c19] hover:bg-[#f5f0e8]"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
