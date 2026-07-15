"use client";

import {
  EVIDENCE_VAULT_ADD_ATTACHMENT_LABEL,
  EVIDENCE_VAULT_ADD_LINK_LABEL,
  EVIDENCE_VAULT_BROWSE_LABEL,
  EVIDENCE_VAULT_CREATE_LABEL,
  EVIDENCE_VAULT_HOME_KICKER,
  EVIDENCE_VAULT_HOME_LEAD,
  EVIDENCE_VAULT_HOME_TITLE,
} from "@/lib/estate/evidenceVaultHome";

type Props = {
  onCreateEvidence: () => void;
  onBrowseEvidence: () => void;
  onAddAttachment: () => void;
  onAddLink: () => void;
  createPressed?: boolean;
};

/**
 * Evidence Vault Home — primary choices in the centered frosted window.
 */
export function EvidenceVaultHome({
  onCreateEvidence,
  onBrowseEvidence,
  onAddAttachment,
  onAddLink,
  createPressed = false,
}: Props) {
  return (
    <div
      className="evidence-vault-home"
      data-testid="evidence-vault-home"
      aria-label={EVIDENCE_VAULT_HOME_TITLE}
    >
      <p className="evidence-vault-home__kicker">{EVIDENCE_VAULT_HOME_KICKER}</p>
      <h2 className="evidence-vault-home__title">{EVIDENCE_VAULT_HOME_TITLE}</h2>
      <p className="evidence-vault-home__lead">{EVIDENCE_VAULT_HOME_LEAD}</p>

      <div
        className="evidence-vault-home__objects"
        data-testid="evidence-vault-primary-actions"
      >
        <button
          type="button"
          className="evidence-vault-home__object evidence-vault-home__object--primary"
          onClick={onCreateEvidence}
          data-testid="evidence-vault-add-evidence"
          aria-pressed={createPressed}
        >
          <span className="evidence-vault-home__object-label">
            {EVIDENCE_VAULT_CREATE_LABEL}
          </span>
          <span className="evidence-vault-home__object-hint">New page</span>
        </button>
        <button
          type="button"
          className="evidence-vault-home__object"
          onClick={onBrowseEvidence}
          data-testid="evidence-vault-browse"
        >
          <span className="evidence-vault-home__object-label">
            {EVIDENCE_VAULT_BROWSE_LABEL}
          </span>
          <span className="evidence-vault-home__object-hint">Archive</span>
        </button>
        <button
          type="button"
          className="evidence-vault-home__object"
          onClick={onAddAttachment}
          data-testid="evidence-vault-add-attachment"
        >
          <span className="evidence-vault-home__object-label">
            {EVIDENCE_VAULT_ADD_ATTACHMENT_LABEL}
          </span>
          <span className="evidence-vault-home__object-hint">File · photo</span>
        </button>
        <button
          type="button"
          className="evidence-vault-home__object"
          onClick={onAddLink}
          data-testid="evidence-vault-add-link"
        >
          <span className="evidence-vault-home__object-label">
            {EVIDENCE_VAULT_ADD_LINK_LABEL}
          </span>
          <span className="evidence-vault-home__object-hint">Keep a link</span>
        </button>
      </div>
    </div>
  );
}
