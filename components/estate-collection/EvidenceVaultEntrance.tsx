"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./evidence-vault-entrance.css";
import type { EvidenceVaultEntrancePhase } from "@/lib/estate/evidenceVaultArrival";
import {
  EVIDENCE_VAULT_EXTERIOR_WELCOME,
  EVIDENCE_VAULT_KEY_ACTION_LABEL,
} from "@/lib/estate/evidenceVaultExperience";
import {
  EVIDENCE_VAULT_ENTRANCE_BG,
  EVIDENCE_VAULT_ROOM_BG,
} from "@/lib/growth/growthRoom";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  phase: Exclude<EvidenceVaultEntrancePhase, "inside">;
  onUseKey: () => void;
};

/**
 * Evidence Vault — full-viewport exterior doors. Clicking the key opens the vault.
 * Portaled to document.body so it sits above chat and room stacking contexts.
 */
export function EvidenceVaultEntrance({ phase, onUseKey }: Props) {
  const [mounted, setMounted] = useState(false);
  const animating =
    phase === "unlocking" || phase === "opening" || phase === "entering";
  const keyReady = phase === "door";
  const revealInterior =
    phase === "opening" || phase === "entering";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    preloadRoomBackground(EVIDENCE_VAULT_ENTRANCE_BG);
    preloadRoomBackground(EVIDENCE_VAULT_ROOM_BG);
  }, []);

  if (!mounted) return null;

  const entrance = (
    <div
      className={[
        "evidence-vault-entrance",
        `evidence-vault-entrance--${phase}`,
      ].join(" ")}
      data-testid="evidence-vault-entrance"
      data-vault-entrance-phase={phase}
      aria-label="Evidence Vault entrance"
    >
      <div
        className={[
          "evidence-vault-entrance__plate",
          "evidence-vault-entrance__plate--exterior",
          revealInterior ? "evidence-vault-entrance__plate--fading" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={EVIDENCE_VAULT_ENTRANCE_BG} alt="" decoding="async" />
      </div>
      {revealInterior ? (
        <div
          className="evidence-vault-entrance__plate evidence-vault-entrance__plate--interior"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={EVIDENCE_VAULT_ROOM_BG} alt="" decoding="async" />
        </div>
      ) : null}

      <div className="evidence-vault-entrance__scene">
        <header className="evidence-vault-entrance__copy">
          <p className="evidence-vault-entrance__kicker">Evidence Vault</p>
          <p className="evidence-vault-entrance__welcome">
            {EVIDENCE_VAULT_EXTERIOR_WELCOME}
          </p>
        </header>

        <div className="evidence-vault-entrance__doors" aria-hidden>
          <span className="evidence-vault-entrance__door evidence-vault-entrance__door--left" />
          <span className="evidence-vault-entrance__door evidence-vault-entrance__door--right" />
          <button
            type="button"
            className="evidence-vault-entrance__key-btn"
            onClick={onUseKey}
            disabled={!keyReady}
            aria-label={EVIDENCE_VAULT_KEY_ACTION_LABEL}
            data-testid="evidence-vault-use-key"
          >
            <span className="evidence-vault-entrance__lock-plate" aria-hidden />
            <span className="evidence-vault-entrance__key-shaft" aria-hidden />
            <span className="evidence-vault-entrance__key-glow" aria-hidden />
          </button>
        </div>

        {keyReady ? (
          <p className="evidence-vault-entrance__action-label">
            {EVIDENCE_VAULT_KEY_ACTION_LABEL}
          </p>
        ) : null}

        {animating ? (
          <p className="evidence-vault-entrance__status" aria-live="polite">
            {phase === "unlocking"
              ? "Turning the key…"
              : phase === "entering"
                ? "Stepping inside…"
                : "Opening…"}
          </p>
        ) : null}
      </div>
    </div>
  );

  return createPortal(entrance, document.body);
}
