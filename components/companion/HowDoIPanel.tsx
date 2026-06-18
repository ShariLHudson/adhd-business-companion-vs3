"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  formatHowDoIEntry,
  howDoITopicGroups,
  resolveHowDoI,
  searchHowDoI,
  type HowDoIEntry,
  type HowDoITopicGroup,
} from "@/lib/howDoIContent";
import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { WorkspaceGuide } from "@/components/companion/WorkspaceGuide";

function TopicGroupSection({
  group,
  open,
  onToggle,
  children,
}: {
  group: HowDoITopicGroup;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#1e4f4f]/15 bg-white/85 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="block text-base font-semibold text-[#1f1c19]">
          {open ? "▼" : "▶"} {group.label}
        </span>
      </button>
      {open ? (
        <div className="border-t border-[#e7dfd4] px-4 pb-4 pt-2">{children}</div>
      ) : null}
    </div>
  );
}

function HowDoIDetail({
  entry,
  onBack,
  onOpen,
  onOpenSettings,
  onAsk,
}: {
  entry: HowDoIEntry;
  onBack: () => void;
  onOpen?: (section: AppSection) => void;
  onOpenSettings?: (section: SettingsSection) => void;
  onAsk?: (prompt: string) => void;
}) {
  const openSection = entry.openSection === "home" ? null : entry.openSection;

  return (
    <div className="companion-fade-in w-full">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm font-semibold text-[#1e4f4f]"
      >
        ‹ How Do I
      </button>

      <h2 className="mt-3 text-xl font-semibold text-[#1f1c19]">{entry.title}</h2>

      <div className="mt-4 flex flex-col gap-4 text-base leading-relaxed text-[#4b463f]">
        <section>
          <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            What it is
          </p>
          <p className="mt-1">{entry.whatItIs}</p>
        </section>

        <section>
          <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            When to use it
          </p>
          <p className="mt-1">{entry.whenToUse}</p>
        </section>

        {entry.details?.map((block) => (
          <section key={block.heading}>
            <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
              {block.heading}
            </p>
            <p className="mt-1">{block.body}</p>
          </section>
        ))}

        {entry.examples?.length ? (
          <section>
            <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
              Examples
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {entry.examples.map((ex) => (
                <li key={ex}>{ex}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <p className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            Step-by-step
          </p>
          <ol className="mt-1 list-decimal space-y-2 pl-5">
            {entry.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-5 shrink-0 border-t border-[#e7dfd4] pt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          Take me there
        </p>
        <div className="flex flex-wrap gap-2">
          {openSection && onOpen ? (
            <button
              type="button"
              onClick={() => onOpen(openSection)}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              {entry.openLabel}
            </button>
          ) : null}
          {entry.openSettingsSection && onOpenSettings ? (
            <button
              type="button"
              onClick={() => onOpenSettings(entry.openSettingsSection!)}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              {entry.openLabel}
            </button>
          ) : null}
          {entry.askPrompt && onAsk ? (
            <button
              type="button"
              onClick={() => onAsk(entry.askPrompt!)}
              className="rounded-xl border border-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/[0.06]"
            >
              Ask Shari in Chat
            </button>
          ) : null}
          {entry.id === "fallback" && onAsk ? (
            <button
              type="button"
              onClick={() => onAsk(entry.askPrompt ?? entry.question)}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
            >
              {entry.openLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TopicEntryButton({
  entry,
  onSelect,
}: {
  entry: HowDoIEntry;
  onSelect: (entry: HowDoIEntry) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className="w-full rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-3 text-left hover:border-[#1e4f4f]/40"
    >
      <span className="block text-base font-semibold text-[#1f1c19]">
        {entry.title}
      </span>
      <span className="mt-0.5 block text-sm text-[#6b635a]">
        {entry.whatItIs.slice(0, 100)}
        {entry.whatItIs.length > 100 ? "…" : ""}
      </span>
    </button>
  );
}

export function HowDoIPanel({
  onOpen,
  onOpenSettings,
  onAsk,
  registerBack,
}: {
  onOpen?: (section: AppSection) => void;
  onOpenSettings?: (section: SettingsSection) => void;
  onAsk?: (prompt: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HowDoIEntry | null>(null);
  const [topicGroupsOpen, setTopicGroupsOpen] = useState<Record<string, boolean>>(
    {},
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchHowDoI(query), [query]);
  const topicGroups = useMemo(() => howDoITopicGroups(), []);
  const searching = Boolean(query.trim());

  useEffect(() => {
    registerBack?.(() => {
      if (selected) {
        setSelected(null);
        return true;
      }
      return false;
    });
    return () => registerBack?.(null);
  }, [registerBack, selected]);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, []);

  function submitQuery(raw?: string) {
    const q = (raw ?? query).trim();
    if (!q) return;
    setQuery(q);
    setSelected(resolveHowDoI(q));
  }

  function toggleTopicGroup(id: string) {
    setTopicGroupsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (selected) {
    return (
      <div
        className="relative z-10 mx-auto w-full max-w-xl px-6 py-8"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <HowDoIDetail
          entry={selected}
          onBack={() => setSelected(null)}
          onOpen={onOpen}
          onOpenSettings={onOpenSettings}
          onAsk={onAsk}
        />
      </div>
    );
  }

  return (
    <div
      className="relative z-10 mx-auto w-full max-w-xl px-6 py-8"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <WorkspaceGuide section="how-do-i" />
      <p className="text-2xl font-semibold text-[#1f1c19]">How Do I…</p>
      <p className="mt-1 text-base text-[#6b635a]">
        Search or open a topic group — every answer includes steps and a button
        to open the right place.
      </p>

      <form
        className="relative z-10 mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          submitQuery();
        }}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. create a strategy, schedule an appointment…"
          autoComplete="off"
          enterKeyHint="search"
          className="pointer-events-auto w-full rounded-xl border border-[#c9bfb0] bg-white px-4 py-3 text-base text-[#1f1c19] outline-none focus:border-[#1e4f4f] focus:ring-2 focus:ring-[#1e4f4f]/20"
        />
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a3a]"
        >
          Show me how
        </button>
      </form>

      {searching ? (
        <>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Matching topics
          </p>
          <ul className="mt-2 flex flex-col gap-2 pb-4">
            {results.map((entry) => (
              <li key={entry.id}>
                <TopicEntryButton entry={entry} onSelect={setSelected} />
              </li>
            ))}
            {results.length === 0 ? (
              <li>
                <button
                  type="button"
                  onClick={() => submitQuery(query)}
                  className="w-full rounded-xl border border-dashed border-[#1e4f4f]/35 bg-[#f0f5f5]/80 px-4 py-3 text-left"
                >
                  <span className="block text-base font-semibold text-[#1e4f4f]">
                    Search for “{query.trim()}”
                  </span>
                  <span className="mt-0.5 block text-sm text-[#6b635a]">
                    We&apos;ll show the closest guide or help you ask Shari.
                  </span>
                </button>
              </li>
            ) : null}
          </ul>
        </>
      ) : (
        <>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
            Browse by topic
          </p>
          <div className="mt-2 flex flex-col gap-2 pb-4">
            {topicGroups.map(({ group, entries }) => (
              <TopicGroupSection
                key={group.id}
                group={group}
                open={!!topicGroupsOpen[group.id]}
                onToggle={() => toggleTopicGroup(group.id)}
              >
                <ul className="flex flex-col gap-2">
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      <TopicEntryButton entry={entry} onSelect={setSelected} />
                    </li>
                  ))}
                </ul>
              </TopicGroupSection>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Re-export for chat integrations
export { formatHowDoIEntry };
