"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NavigationReturnBar } from "@/components/companion/NavigationReturnBar";
import { popNavigationFrame } from "@/lib/navigationContext";
import {
  RESEARCH_LIBRARY_INPUT_PLACEHOLDER,
  RESEARCH_LIBRARY_OPENING_PROMPT,
  RESEARCH_LIBRARY_SUPPORTING,
  RESEARCH_LIBRARY_TITLE,
  buildResearchOutcome,
  consumePendingContextualResearch,
  continueResearchConversation,
  contextualRequestOpeningText,
  getResearchCollectionById,
  groupSavedResearch,
  inferResearchUseOptions,
  listActiveResearchSessions,
  listSavedResearch,
  markCollectionSaved,
  organizedCollectionView,
  persistResearchPair,
  refreshCurrentResearch,
  saveResearchCollectionRecord,
  startResearchConversation,
  trackResearchLibraryEvent,
  type ResearchCollectionRecord,
  type ResearchOutcomeArtifact,
  type ResearchSession,
  type ResearchUseOption,
} from "@/lib/researchLibrary";

type Props = {
  onBack?: () => void;
  registerBack?: (fn: (() => void) | null) => void;
  onOpenCreate?: (seedText: string) => void;
  onOpenProjects?: (seedText: string) => void;
  onOpenVisualThinking?: (payload: {
    topic: string;
    summary: string;
    findings: Array<{ title: string; content: string }>;
    researchCollectionId: string;
  }) => void;
  onOpenStrategicPlanning?: (seedText: string) => void;
  onOpenBusinessEstate?: (seedText: string) => void;
};

type ViewMode = "home" | "conversation" | "collection" | "saved" | "use";

const BTN_PRIMARY =
  "rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#163a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";
const BTN_SECONDARY =
  "rounded-xl border border-[#d4cdc3] px-3 py-2 text-sm font-semibold text-[#4b463f] hover:bg-[#f5f0ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]";

export function ResearchLibraryPanel({
  onBack,
  registerBack,
  onOpenCreate,
  onOpenProjects,
  onOpenVisualThinking,
  onOpenStrategicPlanning,
  onOpenBusinessEstate,
}: Props) {
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [view, setView] = useState<ViewMode>("home");
  const [draft, setDraft] = useState("");
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [collection, setCollection] =
    useState<ResearchCollectionRecord | null>(null);
  const [offerUse, setOfferUse] = useState(false);
  const [useOptions, setUseOptions] = useState<ResearchUseOption[]>([]);
  const [outcome, setOutcome] = useState<ResearchOutcomeArtifact | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState(() => listSavedResearch());
  const [activeSessions, setActiveSessions] = useState(() =>
    listActiveResearchSessions(),
  );

  useEffect(() => {
    trackResearchLibraryEvent("research_library_opened");
    registerBack?.(onBack ?? null);
    return () => registerBack?.(null);
  }, [onBack, registerBack]);

  useEffect(() => {
    const pending = consumePendingContextualResearch();
    if (!pending) return;
    const text = contextualRequestOpeningText(pending);
    void handleSubmitText(text, {
      sourceExperience: pending.sourceExperience,
      sourceEntityId: pending.sourceEntityId,
      sourceSelectionIds: pending.sourceSelectionIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for Research This
  }, []);

  function syncLists() {
    setSaved(listSavedResearch());
    setActiveSessions(listActiveResearchSessions());
  }

  function handleSubmitText(
    text: string,
    meta?: {
      sourceExperience?: string | null;
      sourceEntityId?: string | null;
      sourceSelectionIds?: string[];
    },
  ) {
    const trimmed = text.trim();
    if (!trimmed) return;

    trackResearchLibraryEvent("research_request_submitted", {
      length: trimmed.length,
    });

    if (!session || !collection) {
      const result = startResearchConversation({
        text: trimmed,
        sourceExperience: meta?.sourceExperience ?? "research_library",
        sourceEntityId: meta?.sourceEntityId,
        sourceSelectionIds: meta?.sourceSelectionIds,
      });
      trackResearchLibraryEvent("research_mode_inferred", {
        mode: result.session.researchMode,
      });
      trackResearchLibraryEvent("research_collection_created");
      trackResearchLibraryEvent("source_type_used", {
        type: result.session.liveResearchAvailable
          ? "current"
          : "stable_knowledge",
      });
      setSession(result.session);
      setCollection(result.collection);
      setStatusNotice(result.currentResearchNotice);
      setOutcome(result.autoOutcome);
      setOfferUse(result.offerUseThisResearch);
      persistResearchPair(result.session, result.collection);
      setView("conversation");
      setDraft("");
      syncLists();
      return;
    }

    const result = continueResearchConversation({
      session,
      collection,
      text: trimmed,
    });
    trackResearchLibraryEvent("research_continued");
    if (result.autoOutcome) {
      trackResearchLibraryEvent("creation_generated", {
        kind: result.autoOutcome.kind,
      });
    }
    setSession(result.session);
    setCollection(result.collection);
    setStatusNotice(result.currentResearchNotice);
    setOutcome(result.autoOutcome);
    setOfferUse(result.offerUseThisResearch);
    persistResearchPair(result.session, result.collection);
    setView("conversation");
    setDraft("");
    syncLists();
  }

  function openUseThisResearch() {
    if (!collection) return;
    const options = inferResearchUseOptions({
      collection,
      session,
    });
    trackResearchLibraryEvent("use_this_research_opened");
    trackResearchLibraryEvent("format_options_inferred", {
      count: options.length,
    });
    setUseOptions(options);
    setView("use");
  }

  function selectUseOption(option: ResearchUseOption) {
    if (!collection) return;
    trackResearchLibraryEvent("option_selected", { id: option.id });
    if (option.destination === "stay" || option.outcomeType === "continue") {
      setView("conversation");
      return;
    }
    const artifact = buildResearchOutcome({ collection, option });
    setOutcome(artifact);
    const linked = {
      ...collection,
      selectedUse: option.id,
      inferredPossibleUses: option.label
        ? Array.from(
            new Set([...collection.inferredPossibleUses, option.label]),
          )
        : collection.inferredPossibleUses,
      updatedAt: new Date().toISOString(),
    };
    if (option.destination === "create") {
      linked.linkedCreationPackageIds = [
        ...linked.linkedCreationPackageIds,
        artifact.id,
      ];
      trackResearchLibraryEvent("creation_generated");
    }
    if (option.destination === "projects") {
      linked.linkedProjectIds = [...linked.linkedProjectIds, artifact.id];
      trackResearchLibraryEvent("project_proposal_generated");
    }
    if (option.destination === "visual_thinking") {
      linked.linkedVisualWorkspaceIds = [
        ...linked.linkedVisualWorkspaceIds,
        artifact.id,
      ];
      trackResearchLibraryEvent("visual_handoff_opened");
    }
    if (option.destination === "strategic_planning") {
      linked.linkedStrategyIds = [...linked.linkedStrategyIds, artifact.id];
      trackResearchLibraryEvent("strategy_handoff_opened");
    }
    setCollection(linked);
    if (session) persistResearchPair(session, linked);
    else saveResearchCollectionRecord(linked);

    if (option.destination === "visual_thinking" && onOpenVisualThinking) {
      onOpenVisualThinking({
        topic: linked.topic,
        summary: linked.summary,
        findings: linked.findings.map((f) => ({
          title: f.title,
          content: f.content,
        })),
        researchCollectionId: linked.id,
      });
      return;
    }
    if (option.destination === "create" && onOpenCreate) {
      onOpenCreate(
        `${artifact.title}\n\n${artifact.sections.map((s) => `${s.title}\n${s.body}`).join("\n\n")}`,
      );
    }
    if (option.destination === "projects" && onOpenProjects) {
      onOpenProjects(artifact.content);
    }
    if (option.destination === "strategic_planning" && onOpenStrategicPlanning) {
      onOpenStrategicPlanning(artifact.content);
    }
    if (option.destination === "business_estate" && onOpenBusinessEstate) {
      onOpenBusinessEstate(artifact.content);
    }
    setView("conversation");
  }

  function handleRefresh() {
    if (!session || !collection) return;
    const result = refreshCurrentResearch(session, collection);
    trackResearchLibraryEvent("research_refreshed", {
      available: session.liveResearchAvailable,
    });
    setSession(result.session);
    setCollection(result.collection);
    setStatusNotice(result.message);
    persistResearchPair(result.session, result.collection);
  }

  function handleSaveCollection() {
    if (!collection) return;
    const next = markCollectionSaved(collection);
    setCollection(next);
    syncLists();
  }

  function resumeSession(s: ResearchSession) {
    const found = s.currentResearchCollectionId
      ? getResearchCollectionById(s.currentResearchCollectionId)
      : null;
    setSession(s);
    if (found) setCollection(found);
    setView("conversation");
    setOutcome(null);
  }

  const organized = collection ? organizedCollectionView(collection) : null;
  const groups = groupSavedResearch(saved);

  return (
    <section
      className="relative flex h-full min-h-0 w-full flex-col bg-[linear-gradient(160deg,#f7f1e8_0%,#efe6d8_45%,#e7ddd0_100%)] text-[#2f2a24]"
      aria-labelledby={titleId}
      data-testid="research-library-panel"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_20%_10%,rgba(255,255,255,0.55),transparent_45%),radial-gradient(ellipse_at_80%_0%,rgba(30,79,79,0.08),transparent_40%)]" />
      <div className="relative z-[1] flex items-start justify-between gap-3 px-4 pb-2 pt-4 sm:px-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#6b6358]">
            Spark Estate
          </p>
          <h1 id={titleId} className="mt-1 text-3xl font-semibold tracking-tight">
            {RESEARCH_LIBRARY_TITLE}
          </h1>
          <p className="mt-1 max-w-2xl text-base text-[#5a5349]">
            {RESEARCH_LIBRARY_SUPPORTING}
          </p>
        </div>
        <NavigationReturnBar
          currentDestination="research-library"
          onReturn={() => {
            popNavigationFrame();
            onBack?.();
          }}
        />
      </div>

      <div className="relative z-[1] flex flex-wrap gap-2 px-4 pb-3 sm:px-6">
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => setView("home")}
        >
          New research
        </button>
        {collection ? (
          <>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setView("conversation")}
            >
              Conversation
            </button>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setView("collection")}
              data-testid="research-library-open-collection"
            >
              Research Collection
            </button>
            <button
              type="button"
              className={BTN_PRIMARY}
              onClick={openUseThisResearch}
              data-testid="research-library-use-this"
            >
              Use This Research
            </button>
          </>
        ) : null}
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => {
            syncLists();
            setView("saved");
          }}
        >
          Review Saved Research
        </button>
      </div>

      <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
        {view === "home" && !session ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#ddd2c3]/bg-white/55 p-6 shadow-sm backdrop-blur-md">
            <p className="text-2xl font-medium leading-snug text-[#2f2a24]">
              {RESEARCH_LIBRARY_OPENING_PROMPT}
            </p>
            {activeSessions.length > 0 ? (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[#6b6358]">
                  Continue Previous Research
                </p>
                <ul className="mt-2 space-y-2">
                  {activeSessions.slice(0, 5).map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={`${BTN_SECONDARY} w-full text-left`}
                        onClick={() => resumeSession(s)}
                      >
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {(view === "conversation" || (view === "home" && session)) &&
        session ? (
          <div
            className="mx-auto flex max-w-3xl flex-col gap-4"
            data-testid="research-library-conversation"
          >
            {statusNotice ? (
              <p
                className="rounded-xl border border-[#d9cfc0] bg-[#fff9f0] px-4 py-3 text-sm text-[#5a5349]"
                role="status"
              >
                {statusNotice}
              </p>
            ) : null}
            {session.conversationTurns.map((turn) => (
              <article
                key={turn.id}
                className={
                  turn.role === "user"
                    ? "ml-8 rounded-2xl bg-[#1e4f4f] px-4 py-3 text-lg text-white"
                    : "mr-4 rounded-2xl border border-[#ddd2c3] bg-white/70 px-4 py-3 text-lg leading-relaxed text-[#2f2a24] whitespace-pre-wrap"
                }
              >
                <h2 className="sr-only">
                  {turn.role === "user" ? "You" : "Shari"}
                </h2>
                {turn.content.replace(/\*\*/g, "")}
              </article>
            ))}
            {outcome ? (
              <aside
                className="rounded-2xl border border-[#1e4f4f]/30 bg-white/80 p-4"
                data-testid="research-library-outcome"
              >
                <h2 className="text-xl font-semibold">{outcome.title}</h2>
                <div className="mt-3 space-y-3">
                  {outcome.sections.slice(0, 10).map((s) => (
                    <div key={s.title}>
                      <h3 className="text-base font-semibold">{s.title}</h3>
                      <p className="mt-1 whitespace-pre-wrap text-base text-[#4b463f]">
                        {s.body}
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
            {offerUse ? (
              <button
                type="button"
                className={BTN_PRIMARY}
                onClick={openUseThisResearch}
              >
                Use This Research
              </button>
            ) : null}
          </div>
        ) : null}

        {view === "collection" && organized && collection ? (
          <div
            className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-[#ddd2c3] bg-white/70 p-5"
            data-testid="research-library-collection"
          >
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-semibold">{collection.title}</h2>
                <p className="text-sm text-[#6b6358]">
                  Status: {collection.currentResearchStatus.replace(/_/g, " ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={handleRefresh}
                >
                  Retry Current Research
                </button>
                <button
                  type="button"
                  className={BTN_SECONDARY}
                  onClick={handleSaveCollection}
                >
                  Save Research
                </button>
              </div>
            </header>
            <section>
              <h3 className="text-lg font-semibold">What I Asked</h3>
              <p className="mt-1">{organized.whatIAsked}</p>
            </section>
            <section>
              <h3 className="text-lg font-semibold">What We Found</h3>
              <p className="mt-1">{organized.whatWeFound || "Still gathering."}</p>
            </section>
            <section>
              <h3 className="text-lg font-semibold">Important Findings</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {organized.importantFindings.map((f) => (
                  <li key={f.id}>
                    <strong>{f.title}</strong> — {f.content}
                  </li>
                ))}
              </ul>
            </section>
            {organized.keyFacts.length ? (
              <section>
                <h3 className="text-lg font-semibold">Key Facts</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {organized.keyFacts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {organized.examples.length ? (
              <section>
                <h3 className="text-lg font-semibold">Examples</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {organized.examples.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {organized.optionsOrComparisons.length ? (
              <section>
                <h3 className="text-lg font-semibold">Options or Comparisons</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {organized.optionsOrComparisons.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {organized.risksOrCautions.length ? (
              <section>
                <h3 className="text-lg font-semibold">Risks or Cautions</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {organized.risksOrCautions.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section>
              <h3 className="text-lg font-semibold">Unresolved Questions</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {organized.unresolvedQuestions.length ? (
                  organized.unresolvedQuestions.map((f) => (
                    <li key={f}>{f}</li>
                  ))
                ) : (
                  <li>None recorded yet.</li>
                )}
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-semibold">Sources</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {organized.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-semibold">My Notes</h3>
              <p className="mt-1">
                {organized.myNotes.length
                  ? organized.myNotes.join(" · ")
                  : "No personal notes yet."}
              </p>
            </section>
            <section>
              <h3 className="text-lg font-semibold">What I Could Do With This</h3>
              <p className="mt-1">
                Open Use This Research for context-aware choices.
              </p>
            </section>
          </div>
        ) : null}

        {view === "use" ? (
          <div
            className="mx-auto max-w-2xl space-y-3 rounded-2xl border border-[#ddd2c3] bg-white/75 p-5"
            data-testid="research-library-use-options"
          >
            <h2 className="text-2xl font-semibold">Use This Research</h2>
            <p className="text-base text-[#5a5349]">
              Here are the most useful next steps from what we’ve gathered.
            </p>
            <ul className="space-y-2">
              {useOptions.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className={`${opt.primary ? BTN_PRIMARY : BTN_SECONDARY} w-full text-left`}
                    onClick={() => selectUseOption(opt)}
                  >
                    <span className="block text-base font-semibold">
                      {opt.label}
                    </span>
                    <span className="mt-1 block text-sm opacity-90">
                      {opt.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {view === "saved" ? (
          <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-[#ddd2c3] bg-white/70 p-5">
            <h2 className="text-2xl font-semibold">Saved Research</h2>
            {(
              [
                ["Active Research", groups.active],
                ["Saved Research", groups.saved],
                ["Recently Updated", groups.recentlyUpdated],
                ["Linked to Creations", groups.linkedToCreations],
                ["Linked to Projects", groups.linkedToProjects],
                ["Needs Current Update", groups.needsCurrentUpdate],
              ] as const
            ).map(([label, items]) => (
              <section key={label}>
                <h3 className="text-lg font-semibold">{label}</h3>
                {items.length === 0 ? (
                  <p className="mt-1 text-sm text-[#6b6358]">None yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {items.slice(0, 6).map((c) => (
                      <li key={`${label}-${c.id}`}>
                        <button
                          type="button"
                          className={`${BTN_SECONDARY} w-full text-left`}
                          onClick={() => {
                            setCollection(c);
                            const match = activeSessions.find((s) =>
                              c.researchSessionIds.includes(s.id),
                            );
                            if (match) setSession(match);
                            setView("collection");
                          }}
                        >
                          {c.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative z-[1] border-t border-[#ddd2c3]/80 bg-white/50 px-4 py-3 backdrop-blur-md sm:px-6">
        <form
          className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitText(draft);
          }}
        >
          <label className="sr-only" htmlFor="research-library-input">
            Research question
          </label>
          <textarea
            id="research-library-input"
            ref={inputRef}
            data-testid="research-library-input"
            className="min-h-[56px] flex-1 rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-3 text-lg text-[#2f2a24] outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]"
            placeholder={RESEARCH_LIBRARY_INPUT_PLACEHOLDER}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitText(draft);
              }
            }}
            rows={2}
          />
          <button type="submit" className={BTN_PRIMARY}>
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
