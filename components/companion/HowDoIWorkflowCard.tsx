"use client";

import type { HowDoIHelpArticle } from "@/lib/howDoIHelpTypes";
import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { CompanionObjectVisual } from "@/components/companion/CompanionObjectVisual";
import { objectIdForEmoji } from "@/lib/companionObjects";

const GOLD_LABEL = "text-xs font-bold uppercase tracking-wide text-[#b45309]";

export function HowDoIWorkflowCard({
  article,
  open,
  highlighted = false,
  onToggle,
  onOpen,
  onOpenActivity,
  onOpenSettings,
  onAsk,
  cardRef,
}: {
  article: HowDoIHelpArticle;
  open: boolean;
  highlighted?: boolean;
  onToggle: () => void;
  onOpen?: (section: AppSection) => void;
  onOpenActivity?: (activityId: string) => void;
  onOpenSettings?: (section: SettingsSection) => void;
  onAsk?: (prompt: string) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const hasOpenAction =
    article.openSection ||
    article.openActivityId ||
    article.openSettingsSection ||
    article.askPrompt;

  return (
    <div ref={cardRef} id={`help-article-${article.id}`}>
      <article
        className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow ${
          highlighted
            ? "border-[#b45309] ring-2 ring-[#b45309]/35"
            : "border-[#e4ddd2]"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center gap-2 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80"
        >
          <CompanionObjectVisual
            objectId={objectIdForEmoji(article.emoji, "help")}
            size="sm"
            variant="icon"
            className="shrink-0"
          />
          <span className="min-w-0 flex-1 text-base font-semibold text-[#1f1c19]">
            {article.title}
          </span>
          <span className="shrink-0 text-sm text-[#9a8f82]" aria-hidden="true">
            {open ? "▲" : "▼"}
          </span>
        </button>

        {open ? (
          <div className="border-t border-[#efe8de] px-4 pb-4 pt-3">
            <section>
              <p className={GOLD_LABEL}>What it does</p>
              <p className="mt-1 text-sm leading-relaxed text-[#2d2926]">
                {article.whatItIs}
              </p>
            </section>

            <section className="mt-3">
              <p className={GOLD_LABEL}>When to use it</p>
              <p className="mt-1 text-sm leading-relaxed text-[#2d2926]">
                {article.whenToUse}
              </p>
            </section>

            <section className="mt-3">
              <p className={GOLD_LABEL}>Workflow</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[#2d2926]">
                {article.workflow.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="mt-3">
              <p className={GOLD_LABEL}>Tips</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#4b463f]">
                {article.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            {hasOpenAction ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.openSection && onOpen ? (
                  <button
                    type="button"
                    onClick={() => onOpen(article.openSection!)}
                    className="rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
                  >
                    {article.openLabel ?? "Open"} →
                  </button>
                ) : null}
                {article.openActivityId && onOpenActivity ? (
                  <button
                    type="button"
                    onClick={() => onOpenActivity(article.openActivityId!)}
                    className="rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
                  >
                    {article.openLabel ?? "Open"} →
                  </button>
                ) : null}
                {article.openSettingsSection && onOpenSettings ? (
                  <button
                    type="button"
                    onClick={() => onOpenSettings(article.openSettingsSection!)}
                    className="rounded-lg bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
                  >
                    {article.openLabel ?? "Open Settings"} →
                  </button>
                ) : null}
                {article.askPrompt && onAsk && !article.openSection ? (
                  <button
                    type="button"
                    onClick={() => onAsk(article.askPrompt!)}
                    className="rounded-lg border border-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f]"
                  >
                    Ask in Chat
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    </div>
  );
}
