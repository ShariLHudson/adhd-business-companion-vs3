"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./evidence-vault-entrance.css";
import { EvidenceVaultKey } from "./EvidenceVaultKey";
import {
  EVIDENCE_VAULT_CLOSED_DOOR_BG,
  EVIDENCE_VAULT_DOOR_STATUS,
  EVIDENCE_VAULT_INTERIOR_BG,
  resetEvidenceVaultAccessStateForDev,
  type EvidenceVaultDoorState,
} from "@/lib/estate/evidenceVaultDoor";
import {
  EVIDENCE_VAULT_DOOR_ACTION_LABEL,
  EVIDENCE_VAULT_EXTERIOR_WELCOME,
  EVIDENCE_VAULT_KEY_INVITATION,
  EVIDENCE_VAULT_LOCKED_INDICATOR,
} from "@/lib/estate/evidenceVaultExperience";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  doorState: EvidenceVaultDoorState;
  onUnlock: () => void;
  onBack?: () => void;
};

/**
 * Evidence Vault entrance — approved closed doors + ornate key ritual.
 * Portaled so it sits above chat stacking contexts.
 */
export function EvidenceVaultEntrance({ doorState, onUnlock, onBack }: Props) {
  const [mounted, setMounted] = useState(false);
  const keyRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const busy = doorState === "unlocking" || doorState === "opening";
  const keyReady = doorState === "locked" || doorState === "key_ready";
  const revealInterior = doorState === "opening" || doorState === "open";
  const status = EVIDENCE_VAULT_DOOR_STATUS[doorState];

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    preloadRoomBackground(EVIDENCE_VAULT_CLOSED_DOOR_BG);
    preloadRoomBackground(EVIDENCE_VAULT_INTERIOR_BG);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const w = window as Window & {
      __resetEvidenceVaultAccess?: () => void;
    };
    w.__resetEvidenceVaultAccess = () => {
      resetEvidenceVaultAccessStateForDev();
      window.location.reload();
    };
    return () => {
      delete w.__resetEvidenceVaultAccess;
    };
  }, []);

  useEffect(() => {
    if (!onBack) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onBack();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onBack]);

  useEffect(() => {
    if (keyReady) keyRef.current?.focus({ preventScroll: true });
  }, [keyReady]);

  if (!mounted || doorState === "open") return null;

  function activateUnlock() {
    if (!keyReady || busy) return;
    onUnlock();
  }

  const entrance = (
    <div
      className={[
        "evidence-vault-entrance",
        `evidence-vault-entrance--${doorState}`,
      ].join(" ")}
      data-testid="evidence-vault-entrance"
      data-vault-door-state={doorState}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby="evidence-vault-entrance-welcome"
    >
      <div
        className={[
          "evidence-vault-entrance__plate",
          "evidence-vault-entrance__plate--closed",
          revealInterior ? "evidence-vault-entrance__plate--fading" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={EVIDENCE_VAULT_CLOSED_DOOR_BG}
          alt=""
          decoding="async"
          data-testid="evidence-vault-closed-door-image"
        />
      </div>

      {revealInterior ? (
        <div
          className="evidence-vault-entrance__plate evidence-vault-entrance__plate--interior"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={EVIDENCE_VAULT_INTERIOR_BG}
            alt=""
            decoding="async"
            data-testid="evidence-vault-interior-image"
          />
        </div>
      ) : null}

      <div className="evidence-vault-entrance__door-stage" aria-hidden>
        <div className="evidence-vault-entrance__light-seam" />
        <div className="evidence-vault-entrance__lock-glow" />
        <div className="evidence-vault-entrance__open-glow" />
      </div>

      <div className="evidence-vault-entrance__scene">
        <header className="evidence-vault-entrance__copy">
          <p className="evidence-vault-entrance__kicker" id={titleId}>
            Evidence Vault
          </p>
          <p
            className="evidence-vault-entrance__locked"
            data-testid="evidence-vault-locked-indicator"
          >
            {EVIDENCE_VAULT_LOCKED_INDICATOR}
          </p>
          <p
            id="evidence-vault-entrance-welcome"
            className="evidence-vault-entrance__welcome"
          >
            {EVIDENCE_VAULT_EXTERIOR_WELCOME}
          </p>
        </header>

        <div className="evidence-vault-entrance__key-stage">
          <div className="evidence-vault-entrance__pedestal" aria-hidden>
            <span className="evidence-vault-entrance__pedestal-tray" />
          </div>

          <button
            ref={keyRef}
            type="button"
            className="evidence-vault-entrance__key-btn"
            onClick={activateUnlock}
            disabled={!keyReady}
            aria-label={EVIDENCE_VAULT_DOOR_ACTION_LABEL}
            aria-describedby="evidence-vault-key-invite"
            data-testid="evidence-vault-use-key"
          >
            <EvidenceVaultKey glowing={keyReady || doorState === "unlocking"} />
            <span className="evidence-vault-entrance__key-particles" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </button>

          <p
            id="evidence-vault-key-invite"
            className="evidence-vault-entrance__invite"
          >
            {EVIDENCE_VAULT_KEY_INVITATION}
          </p>

          {keyReady ? (
            <button
              type="button"
              className="evidence-vault-entrance__primary"
              onClick={activateUnlock}
              data-testid="evidence-vault-unlock-action"
            >
              {EVIDENCE_VAULT_DOOR_ACTION_LABEL}
            </button>
          ) : null}
        </div>

        <p
          className="evidence-vault-entrance__status"
          role="status"
          aria-live="polite"
          data-testid="evidence-vault-door-status"
        >
          {status}
        </p>
      </div>
    </div>
  );

  return createPortal(entrance, document.body);
}
