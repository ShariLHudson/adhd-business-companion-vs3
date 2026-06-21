"use client";

import type { ReactNode } from "react";
import {
  getEcosystemAreaColor,
  type EcosystemAreaId,
} from "@/lib/ecosystemAreaColors";

export type EcosystemAreaCardProps = {
  areaId: EcosystemAreaId | string;
  title: string;
  description: string;
  count: number;
  actionLabel: string;
  icon: ReactNode;
  comingSoon?: boolean;
  hideCount?: boolean;
  onAction?: () => void;
};

export function EcosystemAreaCard({
  areaId,
  title,
  description,
  count,
  actionLabel,
  icon,
  comingSoon,
  hideCount = false,
  onAction,
}: EcosystemAreaCardProps) {
  const colors = getEcosystemAreaColor(areaId);

  return (
    <article
      className={`flex h-full flex-col rounded-3xl border border-stone-200 border-t-4 bg-white p-5 shadow-sm ${colors.accent} ${
        comingSoon ? "opacity-75" : ""
      } ${colors.cardTint ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${colors.iconBg} ${colors.iconFg}`}
          aria-hidden
        >
          {icon}
        </span>
        {!hideCount ? (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${colors.badgeBg} ${colors.badgeFg}`}
          >
            {count}
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-base font-bold text-stone-900">{title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-stone-600">
        {description}
      </p>
      {comingSoon ? (
        <span className="mt-4 inline-flex self-start rounded-full border border-dashed border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-500">
          Coming soon
        </span>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className={`mt-4 self-start rounded-full border bg-white px-4 py-2 text-sm font-semibold ${colors.actionBorder} ${colors.actionFg} ${colors.actionHover}`}
        >
          {actionLabel}
        </button>
      )}
    </article>
  );
}
