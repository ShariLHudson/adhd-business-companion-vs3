"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { formatHowDoIEntry } from "@/lib/howDoIContent";
import {
  browseLocationForArticle,
  howDoIBrowseSections,
  articlesForBrowseSubgroup,
  articlesForNewUserStart,
  type HowDoITopSectionId,
  type HowDoISubgroupId,
} from "@/lib/howDoIHelpBrowseStructure";
import {
  getHelpArticle,
  groupEcosystemSearchResults,
  searchEcosystem,
  type EcosystemSearchResult,
  type HowDoIHelpArticle,
} from "@/lib/howDoIHelpLibrary";
import type { AppSection } from "@/lib/companionUi";
import type { SettingsSection } from "@/components/companion/SettingsPanel";
import {
  EcosystemCloseAllButton,
  EcosystemCollapsibleSection,
} from "@/components/companion/EcosystemCollapsibleSection";
import { HowDoISubgroupBlock } from "@/components/companion/HowDoIBrowseDropdown";

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
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [openTopSections, setOpenTopSections] = useState<Set<HowDoITopSectionId>>(
    new Set(),
  );
  const [openSubgroups, setOpenSubgroups] = useState<Set<HowDoISubgroupId>>(
    new Set(),
  );
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const browseSections = useMemo(() => howDoIBrowseSections(), []);
  const newUserArticles = useMemo(() => articlesForNewUserStart(), []);

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
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!highlightedId) return;
    const t = window.setTimeout(() => setHighlightedId(null), 4000);
    return () => window.clearTimeout(t);
  }, [highlightedId]);

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

  function closeAll() {
    setOpenTopSections(new Set());
    setOpenSubgroups(new Set());
    setExpandedCards(new Set());
    setHighlightedId(null);
    setSearchDropdownOpen(false);
  }

  const hasExpanded =
    openTopSections.size > 0 ||
    openSubgroups.size > 0 ||
    expandedCards.size > 0;

  function toggleTopSection(id: HowDoITopSectionId) {
    setOpenTopSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSubgroup(id: HowDoISubgroupId) {
    setOpenSubgroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function jumpToArticle(article: HowDoIHelpArticle) {
    setSearchDropdownOpen(false);
    setQuery("");
    setExpandedCards((prev) => new Set(prev).add(article.id));
    setHighlightedId(article.id);

    const location = browseLocationForArticle(article.id);
    if (location) {
      setOpenTopSections((prev) => new Set(prev).add(location.topSectionId));
      if (location.subgroupId) {
        setOpenSubgroups((prev) => new Set(prev).add(location.subgroupId!));
      }
    }

    window.setTimeout(() => {
      cardRefs.current[article.id]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, location?.subgroupId ? 150 : 100);
  }

  function openSearchResult(result: EcosystemSearchResult) {
    setSearchDropdownOpen(false);

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

  const cardProps = {
    expandedCards,
    highlightedId,
    onToggleCard: toggleCard,
    onOpen,
    onOpenActivity,
    onOpenSettings,
    onAsk,
    registerCardRef,
  };

  return (
    <div
      className="relative z-10 mx-auto w-full max-w-4xl px-5 py-6 sm:px-6 sm:py-8"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1f1c19] sm:text-2xl">
            <span aria-hidden="true">📖 </span>
            How Do I
          </h1>
          <p className="mt-1 text-sm text-[#6b635a]">
            Feature documentation — search, browse, or expand any topic.
          </p>
        </div>
        <EcosystemCloseAllButton onClick={closeAll} disabled={!hasExpanded} />
      </header>

      <section
        className="mt-4 rounded-xl border border-[#e4ddd2] bg-[#faf7f2]/60 p-4"
        aria-label="Search Help"
      >
        <h2 className="text-sm font-bold text-[#1f1c19]">
          <span aria-hidden="true">🔍 </span>
          Search Help
        </h2>
        <p className="mt-1 text-sm text-[#6b635a]">
          Can&apos;t find what you&apos;re looking for? Search topics, features,
          and questions.
        </p>

        <div ref={searchWrapRef} className="relative mt-3">
          <form onSubmit={handleSearchSubmit}>
            <label htmlFor="how-do-i-search" className="sr-only">
              Search help topics
            </label>
            <input
              ref={inputRef}
              id="how-do-i-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchDropdownOpen(Boolean(e.target.value.trim()));
              }}
              onFocus={() => {
                if (query.trim()) setSearchDropdownOpen(true);
              }}
              placeholder="Search topics, features, and questions…"
              autoComplete="off"
              enterKeyHint="search"
              role="combobox"
              aria-expanded={searchDropdownOpen && searchResults.length > 0}
              aria-controls="how-do-i-search-results"
              className="w-full rounded-xl border border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] shadow-sm outline-none placeholder:text-[#9a9289] focus:border-[#b45309] focus:ring-2 focus:ring-[#b45309]/20"
            />
          </form>

          {searchDropdownOpen && query.trim() ? (
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
                          <button
                            type="button"
                            onClick={() => openSearchResult(result)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#faf7f2]"
                          >
                            <span
                              className="text-base leading-none"
                              aria-hidden="true"
                            >
                              {result.emoji ?? "•"}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-[#1f1c19]">
                                {result.title}
                              </span>
                              <span className="block truncate text-xs text-[#6b635a]">
                                {result.description}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-3">
        {browseSections.map((section) => {
          const sectionOpen = openTopSections.has(section.id);

          return (
            <EcosystemCollapsibleSection
              key={section.id}
              id={`how-do-i-section-${section.id}`}
              title={section.label}
              objectId={section.objectId}
              description={section.description}
              open={sectionOpen}
              onToggle={() => toggleTopSection(section.id)}
            >
              {section.id === "new-user" ? (
                <HowDoISubgroupBlock
                  label=""
                  showLabel={false}
                  articles={newUserArticles}
                  {...cardProps}
                />
              ) : (
                section.subgroups?.map((subgroup) => {
                  const subgroupOpen = openSubgroups.has(subgroup.id);
                  const articles = articlesForBrowseSubgroup(subgroup);

                  return (
                    <div key={subgroup.id} className="mb-3 last:mb-0">
                      <button
                        type="button"
                        onClick={() => toggleSubgroup(subgroup.id)}
                        aria-expanded={subgroupOpen}
                        className="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-white/80"
                      >
                        <span className="min-w-0 flex-1 text-sm font-semibold text-[#1f1c19]">
                          {subgroup.label}
                        </span>
                        <span
                          className="shrink-0 text-xs text-[#9a8f82]"
                          aria-hidden="true"
                        >
                          {subgroupOpen ? "▲" : "▼"}
                        </span>
                      </button>
                      {subgroupOpen ? (
                        <HowDoISubgroupBlock
                          label={subgroup.label}
                          showLabel={false}
                          articles={articles}
                          {...cardProps}
                        />
                      ) : null}
                    </div>
                  );
                })
              )}
            </EcosystemCollapsibleSection>
          );
        })}
      </div>
    </div>
  );
}

export { formatHowDoIEntry };
