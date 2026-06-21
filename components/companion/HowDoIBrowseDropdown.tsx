"use client";

import type { ReactNode } from "react";
import type { HowDoIHelpArticle } from "@/lib/howDoIHelpTypes";
import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { HowDoIWorkflowCard } from "@/components/companion/HowDoIWorkflowCard";

const SECTION_BTN =
  "flex w-full items-center gap-2 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80";

export function HowDoIBrowseDropdown({
  id,
  label,
  emoji,
  description,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  emoji: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className="overflow-hidden rounded-xl border border-[#e4ddd2] bg-white shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={SECTION_BTN}
      >
        <span className="text-lg leading-none" aria-hidden="true">
          {emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-[#1f1c19]">
            {label}
          </span>
          <span className="block text-xs text-[#6b635a]">{description}</span>
        </span>
        <span className="shrink-0 text-sm text-[#9a8f82]" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open ? (
        <div className="border-t border-[#efe8de] bg-[#faf7f2]/40 px-3 py-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function HowDoISubgroupBlock({
  label,
  articles,
  expandedCards,
  highlightedId,
  onToggleCard,
  onOpen,
  onOpenActivity,
  onOpenSettings,
  onAsk,
  registerCardRef,
  showLabel = true,
}: {
  label: string;
  articles: HowDoIHelpArticle[];
  expandedCards: Set<string>;
  highlightedId: string | null;
  onToggleCard: (id: string) => void;
  onOpen?: (section: AppSection) => void;
  onOpenActivity?: (activityId: string) => void;
  onOpenSettings?: (section: SettingsSection) => void;
  onAsk?: (prompt: string) => void;
  registerCardRef: (id: string, el: HTMLDivElement | null) => void;
  showLabel?: boolean;
}) {
  if (articles.length === 0) return null;

  return (
    <div className="mb-4 last:mb-0">
      {showLabel ? (
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          {label}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        {articles.map((article) => (
          <HowDoIWorkflowCard
            key={article.id}
            article={article}
            open={expandedCards.has(article.id)}
            highlighted={highlightedId === article.id}
            onToggle={() => onToggleCard(article.id)}
            onOpen={onOpen}
            onOpenActivity={onOpenActivity}
            onOpenSettings={onOpenSettings}
            onAsk={onAsk}
            cardRef={(el) => registerCardRef(article.id, el)}
          />
        ))}
      </div>
    </div>
  );
}
