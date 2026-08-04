"use client";

import { useId, useRef, useState } from "react";
import { useExclusivePopover } from "@/lib/windowDismiss/useExclusivePopover";
import type { DraftMenuGroup } from "@/lib/createDraftActions";
import { MENU_DROPDOWN_ITEM, MENU_SECTION_HEADING, MENU_TEXT } from "@/lib/menuNavStyles";

const triggerClass =
  `rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-sm font-semibold ${MENU_TEXT} shadow-sm hover:bg-[#f0f5f5] hover:text-black disabled:cursor-not-allowed disabled:opacity-50`;

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const instanceId = useId();

  // Several of these render side by side in one bar, so the id is per instance.
  // Adds Escape (there was none) plus focus return, and joins the registry.
  useExclusivePopover({
    overlayId: `draft-dropdown:${label}:${instanceId}`,
    open,
    onClose: () => setOpen(false),
    rootRef,
    triggerRef,
  });

  function pick(id: string) {
    setOpen(false);
    onPick(id);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
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
          data-testid="draft-dropdown-panel"
          className={`spark-layer-popover absolute mt-1 max-h-[min(70vh,28rem)] min-w-[14rem] overflow-y-auto rounded-xl border border-[#d4cdc3] bg-white py-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {groups.map((group, gi) => (
            <div key={group.label ?? `group-${gi}`}>
              {group.label ? (
                <p className={`px-4 pb-1 pt-2 text-[10px] ${MENU_SECTION_HEADING}`}>
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => pick(item.id)}
                  className={MENU_DROPDOWN_ITEM}
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
