"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { formatHowDoIEntry } from "@/lib/howDoIContent";
import {
  HOW_DO_I_COMPANION_PRINCIPLE,
  HOW_DO_I_CORE_WORKFLOW,
  additionalHelpTopicGroups,
  additionalTopicGroupIdForArticle,
  getHelpArticle,
  groupEcosystemSearchResults,
  helpCenterArticles,
  newUserStartHereArticles,
  searchEcosystem,
  type EcosystemSearchResult,
  type HowDoIHelpArticle,
} from "@/lib/howDoIHelpLibrary";
import type { AdditionalHelpTopicGroupId } from "@/lib/howDoIAdditionalTopics";
import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import { HowDoIAdditionalTopicsSection } from "@/components/companion/HowDoIAdditionalTopicsSection";
import { HowDoINewUserStartSection } from "@/components/companion/HowDoINewUserStartSection";
import { HowDoIWorkflowCard } from "@/components/companion/HowDoIWorkflowCard";

export function HowDoIPanel({
  onOpen,
  onOpenActivity,
  onOpenSettings,
  onOpenEcosystemResult,
  onAsk,
  registerBack,
}: {
  onOpen?: (section: AppSection) => void;
  onOpenActivity?: (activityId: string) => void;
  onOpenSettings?: (section: SettingsSection) => void;
  onOpenEcosystemResult?: (result: EcosystemSearchResult) => void;
  onAsk?: (prompt: string) => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openAdditionalGroups, setOpenAdditionalGroups] = useState<
    Set<AdditionalHelpTopicGroupId>
  >(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const mainAreas = useMemo(() => helpCenterArticles(), []);
  const newUserStart = useMemo(() => newUserStartHereArticles(), []);
  const additionalGroups = useMemo(() => additionalHelpTopicGroups(), []);

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchEcosystem(q, 20);
  }, [query]);

  const groupedResults = useMemo(
    () => groupEcosystemSearchResults(searchResults),
    [searchResults],
  );

  useEffect(() => {
    registerBack?.(() => false);
    return () => registerBack?.(null);
  }, [registerBack]);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!searchWrapRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function registerCardRef(id: string, el: HTMLDivElement | null) {
    cardRefs.current[id] = el;
  }

  function toggleCard(id: string) {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function jumpToArticle(article: HowDoIHelpArticle) {
    setDropdownOpen(false);
    setExpandedCards((prev) => new Set(prev).add(article.id));

    const groupId = additionalTopicGroupIdForArticle(article.id);
    if (groupId) {
      setOpenAdditionalGroups((prev) => new Set(prev).add(groupId));
    }

    window.setTimeout(() => {
      cardRefs.current[article.id]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, groupId ? 120 : 80);
  }

  function toggleAdditionalGroup(id: AdditionalHelpTopicGroupId) {
    setOpenAdditionalGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openSearchResult(result: EcosystemSearchResult) {
    setDropdownOpen(false);

    if (result.action.kind === "help-article") {
      const article = getHelpArticle(result.action.articleId);
      if (article) jumpToArticle(article);
      return;
    }

    onOpenEcosystemResult?.(result);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const best = searchResults[0];
    if (best) {
      openSearchResult(best);
      return;
    }
    const q = query.trim();
    if (q && onAsk) onAsk(`How do I ${q}?`);
  }

  return (
    <div
      className="relative z-10 mx-auto w-full max-w-4xl px-5 py-6 sm:px-6 sm:py-8"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <header>
        <h1 className="text-xl font-bold text-[#1f1c19] sm:text-2xl">
          <span aria-hidden="true">📖 </span>
          How Do I
        </h1>
        <p className="mt-1 text-sm text-[#6b635a]">
          Your owner&apos;s manual — how to use each area, plus deeper help when
          you need it.
        </p>
      </header>

      <div ref={searchWrapRef} className="relative mt-4">
        <form onSubmit={handleSearchSubmit}>
          <label htmlFor="how-do-i-search" className="sr-only">
            Search the ecosystem
          </label>
          <input
            ref={inputRef}
            id="how-do-i-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(Boolean(e.target.value.trim()));
            }}
            onFocus={() => {
              if (query.trim()) setDropdownOpen(true);
            }}
            placeholder="Search areas, activities, strategies, tools, help…"
            autoComplete="off"
            enterKeyHint="search"
            role="combobox"
            aria-expanded={dropdownOpen && searchResults.length > 0}
            aria-controls="how-do-i-search-results"
            className="w-full rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] shadow-sm outline-none placeholder:text-[#9a9289] focus:border-[#b45309] focus:ring-2 focus:ring-[#b45309]/20"
          />
        </form>

        {dropdownOpen && query.trim() ? (
          <div
            id="how-do-i-search-results"
            className="absolute left-0 right-0 z-30 mt-1 max-h-96 overflow-y-auto rounded-xl border border-[#d4cdc3] bg-white py-2 shadow-lg"
          >
            {searchResults.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#6b635a]">
                No matches — press Enter to ask in Chat.
              </p>
            ) : (
              groupedResults.map((group) => (
                <div key={group.type} className="px-1 py-1">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#9a8f82]">
                    {group.type}
                  </p>
                  <ul role="listbox">
                    {group.items.map((result) => (
                      <li key={result.id} role="option">
                        <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#faf7f2]">
                          <span className="text-base leading-none" aria-hidden="true">
                            {result.emoji ?? "•"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-[#1f1c19]">
                              {result.title}
                            </span>
                            <span className="block truncate text-xs text-[#6b635a]">
                              {result.description}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openSearchResult(result)}
                            className="shrink-0 rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163a3a]"
                          >
                            Open
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      <section
        className="mt-5 overflow-hidden rounded-xl border border-[#e4ddd2] bg-[#fffbeb] shadow-sm"
        style={{ borderLeftWidth: "4px", borderLeftColor: "#c9972a" }}
        aria-label="Core Workflow"
      >
        <div className="px-4 py-4 sm:px-5">
          <h2 className="text-base font-bold text-[#92400e]">
            <span aria-hidden="true">⭐ </span>
            Core Workflow (Start Here)
          </h2>
          <p className="mt-2 text-sm font-semibold text-[#78350f]">
            {HOW_DO_I_CORE_WORKFLOW.title}
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#2d2926]">
            {HOW_DO_I_CORE_WORKFLOW.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-[#6b635a]">
            {HOW_DO_I_COMPANION_PRINCIPLE}
          </p>
        </div>
      </section>

      <HowDoINewUserStartSection
        articles={newUserStart}
        expandedCards={expandedCards}
        onToggleCard={toggleCard}
        onOpen={onOpen}
        onOpenActivity={onOpenActivity}
        onOpenSettings={onOpenSettings}
        onAsk={onAsk}
        registerCardRef={registerCardRef}
      />

      <section className="mt-6" aria-label="Main Areas">
        <header>
          <h2 className="text-lg font-bold text-[#1f1c19]">Main Areas</h2>
          <p className="mt-1 text-sm text-[#6b635a]">
            The major destinations — workflow order, not alphabetical.
          </p>
        </header>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mainAreas.map((article) => (
            <HowDoIWorkflowCard
              key={article.id}
              article={article}
              open={expandedCards.has(article.id)}
              onToggle={() => toggleCard(article.id)}
              onOpen={onOpen}
              onOpenActivity={onOpenActivity}
              onOpenSettings={onOpenSettings}
              onAsk={onAsk}
              cardRef={(el) => registerCardRef(article.id, el)}
            />
          ))}
        </div>
      </section>

      <HowDoIAdditionalTopicsSection
        groups={additionalGroups}
        expandedCards={expandedCards}
        openGroups={openAdditionalGroups}
        onToggleGroup={toggleAdditionalGroup}
        onToggleCard={toggleCard}
        onOpen={onOpen}
        onOpenActivity={onOpenActivity}
        onOpenSettings={onOpenSettings}
        onAsk={onAsk}
        registerCardRef={registerCardRef}
      />
    </div>
  );
}

export { formatHowDoIEntry };
