"use client";

import type { HowDoIEntry } from "@/lib/howDoIContent";
import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";

const GOLD_LABEL = "text-xs font-bold uppercase tracking-wide text-[#b45309]";

export function HowDoILegacyGuideCard({
  entry,
  open,
  onToggle,
  onOpen,
  onOpenActivity,
  onOpenSettings,
  onAsk,
}: {
  entry: HowDoIEntry;
  open: boolean;
  onToggle: () => void;
  onOpen?: (section: AppSection) => void;
  onOpenActivity?: (activityId: string) => void;
  onOpenSettings?: (section: SettingsSection) => void;
  onAsk?: (prompt: string) => void;
}) {
  const openSection =
    entry.openSection && entry.openSection !== "home" ? entry.openSection : null;

  return (
    <article className="overflow-hidden rounded-xl border border-[#e4ddd2] bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3.5 text-left hover:bg-[#faf7f2]/80"
      >
        <span className="min-w-0 flex-1 text-base font-semibold text-[#1f1c19]">
          {entry.title}
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
              {entry.whatItIs}
            </p>
          </section>

          <section className="mt-3">
            <p className={GOLD_LABEL}>When to use it</p>
            <p className="mt-1 text-sm leading-relaxed text-[#2d2926]">
              {entry.whenToUse}
            </p>
          </section>

          <section className="mt-3">
            <p className={GOLD_LABEL}>Workflow</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[#2d2926]">
              {entry.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <div className="mt-4 flex flex-wrap gap-2">
            {openSection && onOpen ? (
              <button
                type="button"
                onClick={() => onOpen(openSection)}
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                {entry.openLabel} →
              </button>
            ) : null}
            {entry.openActivityId && onOpenActivity ? (
              <button
                type="button"
                onClick={() => onOpenActivity(entry.openActivityId!)}
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                {entry.openLabel} →
              </button>
            ) : null}
            {entry.openSettingsSection && onOpenSettings ? (
              <button
                type="button"
                onClick={() => onOpenSettings(entry.openSettingsSection!)}
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
              >
                {entry.openLabel} →
              </button>
            ) : null}
            {entry.askPrompt && onAsk ? (
              <button
                type="button"
                onClick={() => onAsk(entry.askPrompt!)}
                className="rounded-lg border border-[#1e4f4f] px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                Ask in Chat
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
