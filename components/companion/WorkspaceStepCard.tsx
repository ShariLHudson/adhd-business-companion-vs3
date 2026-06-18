"use client";

import type { ReactNode } from "react";

const CREATE_TOOLTIP =
  "Create helps you build emails, posts, plans, workshops, funnels, SOPs and more.";

/** Compact workspace step card — matches Client Avatar, Strategy, Project panels. */
export function WorkspaceStepCard({
  sectionLabel,
  title,
  children,
  footer,
  showCreateTooltip = false,
  className = "",
}: {
  sectionLabel: string;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  showCreateTooltip?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`companion-fade-in mx-auto w-full max-w-xs rounded-2xl border border-[#d4cdc3] bg-white/85 p-4 shadow-sm sm:max-w-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          {sectionLabel}
        </p>
        {showCreateTooltip ? (
          <span
            className="shrink-0 cursor-help text-sm leading-none text-[#9a8f82]"
            title={CREATE_TOOLTIP}
            aria-label={CREATE_TOOLTIP}
          >
            ⓘ
          </span>
        ) : null}
      </div>
      {title ? (
        <p className="mt-2 text-base font-semibold leading-snug text-[#1f1c19]">
          {title}
        </p>
      ) : null}
      {children ? <div className={title ? "mt-3" : "mt-2"}>{children}</div> : null}
      {footer ? (
        <p className="mt-3 text-xs leading-relaxed text-[#6b635a]">{footer}</p>
      ) : null}
    </div>
  );
}

export { CREATE_TOOLTIP };
