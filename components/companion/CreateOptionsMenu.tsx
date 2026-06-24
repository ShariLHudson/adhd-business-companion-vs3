"use client";

import { useEffect, useRef, useState } from "react";
import { MENU_DROPDOWN_ITEM, MENU_TEXT } from "@/lib/menuNavStyles";

export type CreateOptionsAction =
  | "change-type"
  | "save-for-later"
  | "start-over"
  | "delete-draft";

type CreateOptionsMenuProps = {
  onAction: (action: CreateOptionsAction) => void;
  /** Hide change type when artifact type is locked. */
  changeTypeDisabled?: boolean;
  triggerLabel?: string;
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
  triggerLabel = "Options",
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
        className={`rounded-lg border border-[#1e4f4f]/25 bg-white px-3 py-1.5 text-sm font-semibold ${MENU_TEXT} hover:bg-[#f0f5f5] hover:text-black`}
      >
        {triggerLabel} ▾
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
                className={`${MENU_DROPDOWN_ITEM} px-4 py-2.5 ${
                  item.id === "delete-draft"
                    ? "text-[#a85c4a] hover:bg-[#a85c4a]/8 hover:text-[#a85c4a]"
                    : ""
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
