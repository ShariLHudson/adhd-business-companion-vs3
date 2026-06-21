"use client";

import type { HowDoIHelpArticle } from "@/lib/howDoIHelpTypes";
import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { HowDoIWorkflowCard } from "@/components/companion/HowDoIWorkflowCard";

export function HowDoINewUserStartSection({
  articles,
  expandedCards,
  onToggleCard,
  onOpen,
  onOpenActivity,
  onOpenSettings,
  onAsk,
  registerCardRef,
}: {
  articles: HowDoIHelpArticle[];
  expandedCards: Set<string>;
  onToggleCard: (id: string) => void;
  onOpen?: (section: AppSection) => void;
  onOpenActivity?: (activityId: string) => void;
  onOpenSettings?: (section: SettingsSection) => void;
  onAsk?: (prompt: string) => void;
  registerCardRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  return (
    <section
      className="mt-5 overflow-hidden rounded-xl border border-[#e4ddd2] bg-[#f0f9ff] shadow-sm"
      style={{ borderLeftWidth: "4px", borderLeftColor: "#0284c7" }}
      aria-label="New user start here"
    >
      <div className="px-4 py-4 sm:px-5">
        <h2 className="text-base font-bold text-[#0c4a6e]">
          <span aria-hidden="true">👋 </span>
          New? Start Here
        </h2>
        <p className="mt-1 text-sm text-[#475569]">
          Brand-new to the ecosystem? Pick your pace — five minutes, one day,
          or your first week.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {articles.map((article) => (
            <HowDoIWorkflowCard
              key={article.id}
              article={article}
              open={expandedCards.has(article.id)}
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
    </section>
  );
}
