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
  EVIDENCE_VAULT_ADD_LABEL,
  EVIDENCE_VAULT_BROWSE_LABEL,
  EVIDENCE_VAULT_CONTINUE_DRAFT_LABEL,
  EVIDENCE_VAULT_EMPTY_CTA,
  EVIDENCE_VAULT_EMPTY_INTRO,
  EVIDENCE_VAULT_GENTLE_REMINDER,
  EVIDENCE_VAULT_HOME_CATEGORIES,
  EVIDENCE_VAULT_HOME_KICKER,
  EVIDENCE_VAULT_HOME_LEAD,
  EVIDENCE_VAULT_HOME_NEXT,
  EVIDENCE_VAULT_HOME_TITLE,
  EVIDENCE_VAULT_HOW_DO_I_BODY,
  EVIDENCE_VAULT_HOW_DO_I_LABEL,
  EVIDENCE_VAULT_RECENT_LIMIT,
  EVIDENCE_VAULT_SURPRISE_LABEL,
  EVIDENCE_VAULT_VIEW_ALL_LABEL,
  evidencePreviewLine,
  getRecentEvidenceEntries,
  pickSurpriseEvidenceEntry,
  searchEvidenceEntries,
  shouldShowGentleReminder,
  type EvidenceVaultHomeCategory,
} from "@/lib/estate/evidenceVaultHome";
import "./evidence-vault-interior.css";

export type EvidenceVaultHomeAction =
  | "add-evidence"
  | "continue-draft"
  | "browse"
  | "open-entry"
  | "surprise"
  | "category";

type Props = {
  journalActive: boolean;
  onOpenJournal: () => void;
  onAddEvidence: () => void;
  onContinueDraft: () => void;
  onBrowseArchive: () => void;
  onOpenEntry?: (id: string) => void;
  onCategorySelect?: (category: EvidenceVaultHomeCategory) => void;
  onSearchBrowse?: (query: string) => void;
  /** Discovery File is open above the vault interior plate. */
  behindDiscovery?: boolean;
};

/**
 * Evidence Vault home — private archive orientation after entrance.
 * Does not own the door ceremony; capture flow stays in Discovery File.
 */
export function EvidenceVaultInterior({
  journalActive,
  onOpenJournal,
  onAddEvidence,
  onContinueDraft,
  onBrowseArchive,
  onOpenEntry,
  onCategorySelect,
  onSearchBrowse,
  behindDiscovery = false,
}: Props) {
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
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
    () => getRecentEvidenceEntries(EVIDENCE_VAULT_RECENT_LIMIT, entries),
    [entries],
  );
  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    return searchEvidenceEntries(q, entries).slice(0, 8);
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
      <div className="evidence-vault-interior__ambient" aria-hidden />
      <div className="evidence-vault-interior__content">
        <p className="evidence-vault-interior__kicker">
          {EVIDENCE_VAULT_HOME_KICKER}
        </p>
        <h2 className="evidence-vault-interior__title">
          {EVIDENCE_VAULT_HOME_TITLE}
        </h2>
        <p className="evidence-vault-interior__hint">{EVIDENCE_VAULT_HOME_LEAD}</p>
        {!isEmpty ? (
          <p className="evidence-vault-interior__next">{EVIDENCE_VAULT_HOME_NEXT}</p>
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
          </div>
        </details>

        {showReminder ? (
          <p
            className="evidence-vault-interior__reminder"
            data-testid="evidence-vault-gentle-reminder"
            role="status"
          >
            {EVIDENCE_VAULT_GENTLE_REMINDER}
          </p>
        ) : null}

        {isEmpty ? (
          <div
            className="evidence-vault-interior__empty"
            data-testid="evidence-vault-empty-state"
          >
            {EVIDENCE_VAULT_EMPTY_INTRO.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
            {hasDraft ? (
              <button
                type="button"
                className="evidence-vault-interior__action evidence-vault-interior__action--primary"
                onClick={onContinueDraft}
                data-testid="evidence-vault-continue-draft"
              >
                {EVIDENCE_VAULT_CONTINUE_DRAFT_LABEL}
              </button>
            ) : (
              <button
                type="button"
                className="evidence-vault-interior__action evidence-vault-interior__action--primary"
                onClick={onAddEvidence}
                data-testid="evidence-vault-add-first"
              >
                {EVIDENCE_VAULT_EMPTY_CTA}
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className="evidence-vault-interior__actions"
              data-testid="evidence-vault-primary-actions"
            >
              <button
                type="button"
                className="evidence-vault-interior__action evidence-vault-interior__action--primary"
                onClick={onAddEvidence}
                data-testid="evidence-vault-add-evidence"
                aria-pressed={journalActive}
              >
                {EVIDENCE_VAULT_ADD_LABEL}
              </button>
              {hasDraft ? (
                <button
                  type="button"
                  className="evidence-vault-interior__action"
                  onClick={onContinueDraft}
                  data-testid="evidence-vault-continue-draft"
                >
                  {EVIDENCE_VAULT_CONTINUE_DRAFT_LABEL}
                </button>
              ) : null}
              <button
                type="button"
                className="evidence-vault-interior__action"
                onClick={onBrowseArchive}
                data-testid="evidence-vault-browse"
              >
                {EVIDENCE_VAULT_BROWSE_LABEL}
              </button>
            </div>

            <div
              className="evidence-vault-interior__categories"
              data-testid="evidence-vault-categories"
              aria-label="Evidence themes"
            >
              {EVIDENCE_VAULT_HOME_CATEGORIES.map((category) => (
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

            <label className="evidence-vault-interior__search">
              <span className="evidence-vault-interior__search-label">Search</span>
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
            ) : null}

            <div
              className="evidence-vault-interior__recent"
              data-testid="evidence-vault-recent"
            >
              <div className="evidence-vault-interior__recent-head">
                <h3>Recent Evidence</h3>
                <button
                  type="button"
                  className="evidence-vault-interior__text-btn"
                  onClick={onBrowseArchive}
                  data-testid="evidence-vault-view-all"
                >
                  {EVIDENCE_VAULT_VIEW_ALL_LABEL}
                </button>
              </div>
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
                      <span className="evidence-vault-interior__recent-meta">
                        {entry.category}
                      </span>
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
            </div>

            <div className="evidence-vault-interior__secondary">
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
                Open Evidence Journal
              </button>
            </div>

            {surprise ? (
              <div
                className="evidence-vault-interior__surprise"
                data-testid="evidence-vault-surprise-card"
                role="status"
              >
                <p className="evidence-vault-interior__surprise-label">
                  A moment from your archive
                </p>
                <p>{evidencePreviewLine(surprise)}</p>
                <button
                  type="button"
                  className="evidence-vault-interior__action"
                  onClick={() => onOpenEntry?.(surprise.id)}
                >
                  Open this memory
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
