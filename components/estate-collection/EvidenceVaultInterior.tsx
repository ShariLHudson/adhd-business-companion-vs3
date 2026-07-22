"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EVIDENCE_BANK_UPDATED_EVENT,
  getEvidenceEntries,
  isEvidenceFavorite,
  toggleEvidenceFavorite,
  type EvidenceEntry,
} from "@/lib/evidenceBankStore";
import { hasEvidenceVaultDraft } from "@/lib/estate/evidenceVaultDraft";
import {
  EVIDENCE_VAULT_CONTINUE_DRAFT_LABEL,
  EVIDENCE_VAULT_GENTLE_REMINDER,
  EVIDENCE_VAULT_HOME_CATEGORIES,
  EVIDENCE_VAULT_HOME_TITLE,
  EVIDENCE_VAULT_HOW_DO_I_BODY,
  EVIDENCE_VAULT_HOW_DO_I_LABEL,
  EVIDENCE_VAULT_SURPRISE_LABEL,
  EVIDENCE_VAULT_VIEW_ALL_LABEL,
  evidencePreviewLine,
  getRecentEvidenceEntries,
  pickSurpriseEvidenceEntry,
  searchEvidenceEntries,
  shouldShowGentleReminder,
  type EvidenceVaultHomeCategory,
} from "@/lib/estate/evidenceVaultHome";
import { HowThisFitsTogetherLink } from "@/components/companion/HowThisFitsTogetherLink";
import { EvidenceVaultHome } from "./EvidenceVaultHome";
import "./evidence-vault-interior.css";

export type EvidenceVaultHomeAction =
  | "add-evidence"
  | "continue-draft"
  | "browse"
  | "open-entry"
  | "surprise"
  | "category"
  | "add-attachment"
  | "add-link";

type Props = {
  journalActive: boolean;
  onOpenJournal: () => void;
  onAddEvidence: () => void;
  onContinueDraft: () => void;
  onBrowseArchive: () => void;
  onAddAttachment?: () => void;
  onAddLink?: () => void;
  onOpenEntry?: (id: string) => void;
  onCategorySelect?: (category: EvidenceVaultHomeCategory) => void;
  onSearchBrowse?: (query: string) => void;
  /** Discovery File is open above the vault interior plate. */
  behindDiscovery?: boolean;
};

/**
 * Evidence Vault home — centered frosted window after entrance.
 */
export function EvidenceVaultInterior({
  journalActive,
  onOpenJournal,
  onAddEvidence,
  onContinueDraft,
  onBrowseArchive,
  onAddAttachment,
  onAddLink,
  onOpenEntry,
  onCategorySelect,
  onSearchBrowse,
  behindDiscovery = false,
}: Props) {
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [surprise, setSurprise] = useState<EvidenceEntry | null>(null);

  useEffect(() => {
    const reload = () => {
      setEntries(getEvidenceEntries());
      setHasDraft(hasEvidenceVaultDraft());
    };
    reload();
    window.addEventListener(EVIDENCE_BANK_UPDATED_EVENT, reload);
    window.addEventListener("focus", reload);
    return () => {
      window.removeEventListener(EVIDENCE_BANK_UPDATED_EVENT, reload);
      window.removeEventListener("focus", reload);
    };
  }, []);

  useEffect(() => {
    if (behindDiscovery) return;
    setHasDraft(hasEvidenceVaultDraft());
  }, [behindDiscovery, journalActive]);

  const isEmpty = entries.length === 0;
  const recent = useMemo(
    () => getRecentEvidenceEntries(3, entries),
    [entries],
  );
  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    return searchEvidenceEntries(q, entries).slice(0, 5);
  }, [entries, searchQuery]);
  const showReminder =
    !isEmpty && !behindDiscovery && shouldShowGentleReminder(entries);

  function handleSurprise() {
    const picked = pickSurpriseEvidenceEntry(entries);
    setSurprise(picked);
  }

  function handleFavorite(id: string) {
    toggleEvidenceFavorite(id);
    setEntries(getEvidenceEntries());
  }

  return (
    <section
      className={[
        "evidence-vault-interior",
        behindDiscovery ? "evidence-vault-interior--behind-discovery" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="evidence-vault-interior"
      aria-label={EVIDENCE_VAULT_HOME_TITLE}
    >
      <aside
        className="evidence-vault-interior__folio companion-workspace-frosted"
        data-testid="evidence-vault-folio"
      >
        <EvidenceVaultHome
          onCreateEvidence={onAddEvidence}
          onBrowseEvidence={onBrowseArchive}
          onAddAttachment={onAddAttachment ?? onAddEvidence}
          onAddLink={onAddLink ?? onAddEvidence}
          createPressed={journalActive}
        />

        {hasDraft ? (
          <button
            type="button"
            className="evidence-vault-home__object evidence-vault-home__object--draft"
            onClick={onContinueDraft}
            data-testid="evidence-vault-continue-draft"
          >
            <span className="evidence-vault-home__object-label">
              {EVIDENCE_VAULT_CONTINUE_DRAFT_LABEL}
            </span>
            <span className="evidence-vault-home__object-hint">Unfinished</span>
          </button>
        ) : null}

        {isEmpty ? (
          <p
            className="evidence-vault-interior__empty-note"
            data-testid="evidence-vault-empty-state"
          >
            Start with one thing worth keeping — a result, a lesson, or someone
            you helped.
          </p>
        ) : null}

        {showReminder ? (
          <p
            className="evidence-vault-interior__reminder"
            data-testid="evidence-vault-gentle-reminder"
            role="status"
          >
            {EVIDENCE_VAULT_GENTLE_REMINDER}
          </p>
        ) : null}

        <details
          className="evidence-vault-interior__how"
          data-testid="evidence-vault-how-do-i"
          open={howOpen}
          onToggle={(event) => {
            setHowOpen((event.currentTarget as HTMLDetailsElement).open);
          }}
        >
          <summary>{EVIDENCE_VAULT_HOW_DO_I_LABEL}</summary>
          <div className="evidence-vault-interior__how-body">
            {EVIDENCE_VAULT_HOW_DO_I_BODY.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
            <HowThisFitsTogetherLink areaOrPlaceId="evidence-vault" />
          </div>
        </details>

        {!isEmpty ? (
          <details
            className="evidence-vault-interior__drawer"
            data-testid="evidence-vault-recent"
            open={drawerOpen}
            onToggle={(event) => {
              setDrawerOpen((event.currentTarget as HTMLDetailsElement).open);
            }}
          >
            <summary>Recent drawer</summary>
            <div className="evidence-vault-interior__drawer-body">
              <label className="evidence-vault-interior__search">
                <span className="evidence-vault-interior__search-label">
                  Search
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && searchQuery.trim()) {
                      onSearchBrowse?.(searchQuery.trim());
                    }
                  }}
                  placeholder="Find a memory…"
                  data-testid="evidence-vault-search"
                />
              </label>

              {searchResults ? (
                <div
                  className="evidence-vault-interior__search-results"
                  data-testid="evidence-vault-search-results"
                >
                  {searchResults.length === 0 ? (
                    <p className="evidence-vault-interior__muted">
                      Nothing matched that just yet.
                    </p>
                  ) : (
                    <ul>
                      {searchResults.map((entry) => (
                        <li key={entry.id}>
                          <button
                            type="button"
                            onClick={() => onOpenEntry?.(entry.id)}
                          >
                            {evidencePreviewLine(entry)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <ul className="evidence-vault-interior__recent-list">
                  {recent.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className="evidence-vault-interior__recent-item"
                        onClick={() => onOpenEntry?.(entry.id)}
                        data-testid={`evidence-vault-recent-${entry.id}`}
                      >
                        <span>{evidencePreviewLine(entry)}</span>
                      </button>
                      <button
                        type="button"
                        className={[
                          "evidence-vault-interior__favorite",
                          isEvidenceFavorite(entry)
                            ? "evidence-vault-interior__favorite--on"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={isEvidenceFavorite(entry)}
                        aria-label={
                          isEvidenceFavorite(entry)
                            ? "Remove from favorites"
                            : "Mark as favorite"
                        }
                        onClick={() => handleFavorite(entry.id)}
                        data-testid={`evidence-vault-favorite-${entry.id}`}
                      >
                        ★
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="evidence-vault-interior__drawer-links">
                <button
                  type="button"
                  className="evidence-vault-interior__text-btn"
                  onClick={onBrowseArchive}
                  data-testid="evidence-vault-view-all"
                >
                  {EVIDENCE_VAULT_VIEW_ALL_LABEL}
                </button>
                <button
                  type="button"
                  className="evidence-vault-interior__text-btn"
                  onClick={handleSurprise}
                  data-testid="evidence-vault-surprise"
                >
                  {EVIDENCE_VAULT_SURPRISE_LABEL}
                </button>
                <button
                  type="button"
                  className="evidence-vault-interior__text-btn"
                  onClick={onOpenJournal}
                  data-testid="evidence-vault-journal"
                >
                  Journal
                </button>
              </div>

              <div
                className="evidence-vault-interior__categories"
                data-testid="evidence-vault-categories"
                aria-label="Evidence themes"
              >
                {EVIDENCE_VAULT_HOME_CATEGORIES.slice(0, 8).map((category) => (
                  <button
                    key={category}
                    type="button"
                    className="evidence-vault-interior__category"
                    onClick={() => onCategorySelect?.(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {surprise ? (
                <div
                  className="evidence-vault-interior__surprise"
                  data-testid="evidence-vault-surprise-card"
                  role="status"
                >
                  <p className="evidence-vault-interior__surprise-label">
                    From your archive
                  </p>
                  <p>{evidencePreviewLine(surprise)}</p>
                  <button
                    type="button"
                    className="evidence-vault-interior__text-btn"
                    onClick={() => onOpenEntry?.(surprise.id)}
                  >
                    Open
                  </button>
                </div>
              ) : null}
            </div>
          </details>
        ) : null}

      </aside>
    </section>
  );
}
