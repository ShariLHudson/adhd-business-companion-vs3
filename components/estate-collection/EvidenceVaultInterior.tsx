"use client";

import {
  EVIDENCE_VAULT_JOURNAL_LABEL,
  EVIDENCE_VAULT_ROOM_NAME,
} from "@/lib/estate/evidenceVaultExperience";
import "./evidence-vault-interior.css";

type Props = {
  journalActive: boolean;
  onOpenJournal: () => void;
  showSecondaryActions?: boolean;
  onBrowseArchive?: () => void;
  /** Discovery File is open above the vault interior plate. */
  behindDiscovery?: boolean;
};

/**
 * Evidence Vault interior — journal is the first interaction.
 */
export function EvidenceVaultInterior({
  journalActive,
  onOpenJournal,
  showSecondaryActions = false,
  onBrowseArchive,
  behindDiscovery = false,
}: Props) {
  return (
    <section
      className={[
        "evidence-vault-interior",
        behindDiscovery ? "evidence-vault-interior--behind-discovery" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="evidence-vault-interior"
      aria-label={EVIDENCE_VAULT_ROOM_NAME}
    >
      <div className="evidence-vault-interior__ambient" aria-hidden />
      <div className="evidence-vault-interior__content">
        <p className="evidence-vault-interior__kicker">You are inside</p>
        <h2 className="evidence-vault-interior__title">{EVIDENCE_VAULT_ROOM_NAME}</h2>
        <p className="evidence-vault-interior__hint">
          Your discoveries live here — preserved quietly, ready when you need them.
        </p>

        <button
          type="button"
          className={[
            "evidence-vault-interior__journal",
            journalActive ? "evidence-vault-interior__journal--active" : "",
          ].join(" ")}
          onClick={onOpenJournal}
          data-testid="evidence-vault-journal"
          aria-pressed={journalActive}
        >
          <span className="evidence-vault-interior__journal-cover" aria-hidden>
            <span className="evidence-vault-interior__journal-spine" />
            <span className="evidence-vault-interior__journal-pages" />
          </span>
          <span className="evidence-vault-interior__journal-label">
            {EVIDENCE_VAULT_JOURNAL_LABEL}
          </span>
          <span className="evidence-vault-interior__journal-prompt">
            Click to begin guided discovery
          </span>
        </button>

        {showSecondaryActions && onBrowseArchive ? (
          <button
            type="button"
            className="evidence-vault-interior__browse"
            onClick={onBrowseArchive}
            data-testid="evidence-vault-browse-link"
          >
            Browse preserved discoveries
          </button>
        ) : null}
      </div>
    </section>
  );
}
