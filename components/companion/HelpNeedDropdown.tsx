"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dayHelpNeedOptions, labelForHelpNeed } from "@/lib/adjustMyDay";

type HelpNeedDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
};

/** Closed-by-default, searchable dropdown for "What would help right now?" */
export function HelpNeedDropdown({
  value,
  onChange,
  id = "day-help-need",
  className = "",
}: HelpNeedDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    const all = dayHelpNeedOptions();
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((o) => o.label.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const display = value
    ? labelForHelpNeed(value)
    : "Select what would help…";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-left text-base font-medium text-[#1f1c19] outline-none hover:border-[#1e4f4f]/40 focus:border-[#1e4f4f]"
      >
        <span className={value ? "" : "text-[#9a8f82]"}>{display}</span>
        <span className="ml-2 text-[#6b635a]" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-[#e7dfd4] bg-white shadow-lg">
          <div className="border-b border-[#e7dfd4] p-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              autoFocus
              className="w-full rounded-lg border border-[#c9bfb0] bg-[#faf8f5] px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
            />
          </div>
          <ul
            role="listbox"
            aria-labelledby={id}
            className="max-h-56 overflow-y-auto py-1"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[#9a8f82]">No matches</li>
            ) : (
              options.map((opt) => (
                <li key={opt.value} role="option" aria-selected={value === opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#1e4f4f]/8 ${
                      value === opt.value
                        ? "bg-[#1e4f4f]/10 text-[#1e4f4f]"
                        : "text-[#1f1c19]"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
