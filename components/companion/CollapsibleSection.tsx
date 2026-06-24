"use client";

import { MENU_LIST_LABEL, MENU_TEXT } from "@/lib/menuNavStyles";

export function CollapsibleSection({
  id,
  title,
  count,
  open,
  onToggle,
  children,
  className = "",
}: {
  id: string;
  title: string;
  count?: number;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center gap-2 rounded-lg py-2 text-left text-black hover:bg-black/[0.03] hover:text-black"
      >
        <span className={`text-sm ${MENU_TEXT}`} aria-hidden>
          {open ? "▼" : "▶"}
        </span>
        <span className={`text-sm font-semibold ${MENU_TEXT}`}>{title}</span>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-[#1e4f4f]/10 px-2 py-0.5 text-xs font-semibold text-[#1e4f4f]">
            {count}
          </span>
        )}
      </button>
      {open && <div className="mt-1 pl-5">{children}</div>}
    </section>
  );
}
