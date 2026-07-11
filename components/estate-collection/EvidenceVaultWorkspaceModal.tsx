"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import "./evidence-vault-workspace.css";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** When true, backdrop click and Escape do not close (unsaved edits). */
  closeBlocked?: boolean;
  testId?: string;
};

/**
 * Evidence Vault — modal workspace shell.
 * Room stays visible behind a dimmed backdrop; restores interaction on close.
 */
export function EvidenceVaultWorkspaceModal({
  open,
  onClose,
  title,
  children,
  closeBlocked = false,
  testId = "evidence-vault-workspace-modal",
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const requestClose = useCallback(() => {
    if (closeBlocked) return;
    onClose();
  }, [closeBlocked, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      requestClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, requestClose]);

  useEffect(() => {
    if (open) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && panelRef.current?.contains(active)) {
      active.blur();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="evidence-vault-workspace-modal"
      data-testid={testId}
      role="presentation"
    >
      <button
        type="button"
        className={[
          "evidence-vault-workspace-modal__backdrop",
          closeBlocked ? "evidence-vault-workspace-modal__backdrop--blocked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Close vault panel"
        onClick={requestClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="evidence-vault-workspace-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="evidence-vault-workspace-modal__header">
          <h2 id={titleId} className="evidence-vault-workspace-modal__title">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="evidence-vault-workspace-modal__close"
            aria-label="Close"
            onClick={requestClose}
            data-testid="evidence-vault-modal-close"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
        {closeBlocked ? (
          <p className="evidence-vault-workspace-modal__blocked-hint" role="status">
            Save or discard your discovery before closing.
          </p>
        ) : null}
        <div className="evidence-vault-workspace-modal__body">{children}</div>
        <div className="evidence-vault-workspace-modal__footer">
          <button
            type="button"
            className="evidence-vault-workspace-modal__return"
            onClick={requestClose}
            disabled={closeBlocked}
          >
            Return to Vault
          </button>
        </div>
      </div>
    </div>
  );
}
