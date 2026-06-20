"use client";

import { useEffect, useRef, useState } from "react";
import type { DraftMenuGroup } from "@/lib/createDraftActions";

const triggerClass =
  "rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] shadow-sm hover:bg-[#f0f5f5] disabled:cursor-not-allowed disabled:opacity-50";

export function DraftDropdownMenu({
  label,
  groups,
  onPick,
  disabled,
  align = "left",
}: {
  label: string;
  groups: DraftMenuGroup[];
  onPick: (id: string) => void;
  disabled?: boolean;
  align?: "left" | "right";
}) {
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

  function pick(id: string) {
    setOpen(false);
    onPick(id);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={triggerClass}
      >
        {label} ▼
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute z-40 mt-1 max-h-[min(70vh,28rem)] min-w-[14rem] overflow-y-auto rounded-xl border border-[#d4cdc3] bg-white py-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {groups.map((group, gi) => (
            <div key={group.label ?? `group-${gi}`}>
              {group.label ? (
                <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => pick(item.id)}
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-[#1f1c19] hover:bg-[#f5f0e8]"
                >
                  {item.label}
                </button>
              ))}
              {gi < groups.length - 1 ? (
                <div className="my-1 border-t border-[#e7dfd4]" />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
