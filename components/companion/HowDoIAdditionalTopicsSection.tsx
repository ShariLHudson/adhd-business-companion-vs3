"use client";

import type { AdditionalHelpTopicGroupId } from "@/lib/howDoIAdditionalTopics";
import type { AdditionalHelpTopicGroupWithArticles } from "@/lib/howDoIAdditionalTopics";
import type { HowDoIHelpArticle } from "@/lib/howDoIHelpTypes";
import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { HowDoIWorkflowCard } from "@/components/companion/HowDoIWorkflowCard";

export function HowDoIAdditionalTopicsSection({
  groups,
  expandedCards,
  openGroups,
  onToggleGroup,
  onToggleCard,
  onOpen,
  onOpenActivity,
  onOpenSettings,
  onAsk,
  registerCardRef,
}: {
  groups: AdditionalHelpTopicGroupWithArticles[];
  expandedCards: Set<string>;
  openGroups: Set<AdditionalHelpTopicGroupId>;
  onToggleGroup: (id: AdditionalHelpTopicGroupId) => void;
  onToggleCard: (id: string) => void;
  onOpen?: (section: AppSection) => void;
  onOpenActivity?: (activityId: string) => void;
  onOpenSettings?: (section: SettingsSection) => void;
  onAsk?: (prompt: string) => void;
  registerCardRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  return (
    <section className="mt-10 pb-6" aria-label="Additional Help Topics">
      <header>
        <h2 className="text-lg font-bold text-[#1f1c19]">
          Additional Help Topics
        </h2>
        <p className="mt-1 text-sm text-[#6b635a]">
          Deeper guidance — overwhelm, chat vs workspaces, ADHD strategies,
          business growth, and more. Expand a topic when you need it.
        </p>
      </header>

      <div className="mt-4 flex flex-col gap-2">
        {groups.map((group) => {
          const groupOpen = openGroups.has(group.id);

          return (
            <div
              key={group.id}
              className="overflow-hidden rounded-xl border border-[#e4ddd2] bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => onToggleGroup(group.id)}
                aria-expanded={groupOpen}
                className="flex w-full items-center gap-2 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80"
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {group.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-[#1f1c19]">
                    {group.label}
                  </span>
                  <span className="block text-xs text-[#6b635a]">
                    {group.description} · {group.articles.length}{" "}
                    {group.articles.length === 1 ? "article" : "articles"}
                  </span>
                </span>
                <span
                  className="shrink-0 text-sm text-[#9a8f82]"
                  aria-hidden="true"
                >
                  {groupOpen ? "▲" : "▼"}
                </span>
              </button>

              {groupOpen ? (
                <div className="border-t border-[#efe8de] bg-[#faf7f2]/40 px-3 py-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {group.articles.map((article: HowDoIHelpArticle) => (
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
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
