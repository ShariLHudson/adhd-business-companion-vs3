"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import "./evidence-vault-entrance.css";
import {
  EVIDENCE_VAULT_ARRIVAL_MS,
  EVIDENCE_VAULT_CLOSED_DOOR_BG,
  EVIDENCE_VAULT_DOOR_HOLD_MS,
  EVIDENCE_VAULT_DOOR_LEFT_BG,
  EVIDENCE_VAULT_DOOR_RIGHT_BG,
  EVIDENCE_VAULT_DOOR_STATUS,
  EVIDENCE_VAULT_INTERIOR_REVEAL_BG,
  EVIDENCE_VAULT_ROOM_STATIC_BG,
  EVIDENCE_VAULT_WRITING_ROOM_BG,
  resetEvidenceVaultAccessStateForDev,
  type EvidenceVaultDoorState,
} from "@/lib/estate/evidenceVaultDoor";
import { EVIDENCE_VAULT_EXTERIOR_WELCOME } from "@/lib/estate/evidenceVaultExperience";
import { playEvidenceVaultUnlockSound } from "@/lib/estate/evidenceVaultUnlockSound";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";
import { VaultDoorAnimation } from "./VaultDoorAnimation";
import { VaultKeyInteraction } from "./VaultKeyInteraction";
import { VaultReveal } from "./VaultReveal";

type Props = {
  doorState: EvidenceVaultDoorState;
  onUnlock: () => void;
  onSkip: () => void;
  onBack?: () => void;
};

/**
 * Evidence Vault entrance — standing in front of real double doors.
 * Interior already exists behind the leaves; key unlocks, doors swing open.
 */
export function EvidenceVaultEntrance({
  doorState,
  onUnlock,
  onSkip,
  onBack,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [unlockStarted, setUnlockStarted] = useState(false);
  /** Keep doors framing the room after open before unmount. */
  const [holdingOpen, setHoldingOpen] = useState(false);
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const busy = doorState === "unlocking" || doorState === "opening";
  const idle =
    (doorState === "locked" || doorState === "key_ready") && keyRevealed;
  const doorsOpen =
    doorState === "opening" || doorState === "open" || holdingOpen;
  const status = EVIDENCE_VAULT_DOOR_STATUS[doorState];

  const keyPhase =
    doorState === "opening" || doorState === "open" || holdingOpen
      ? "done"
      : doorState === "unlocking"
        ? "unlocking"
        : idle
          ? "ready"
          : "hidden";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    preloadRoomBackground(EVIDENCE_VAULT_CLOSED_DOOR_BG);
    preloadRoomBackground(EVIDENCE_VAULT_ROOM_STATIC_BG);
    preloadRoomBackground(EVIDENCE_VAULT_DOOR_LEFT_BG);
    preloadRoomBackground(EVIDENCE_VAULT_DOOR_RIGHT_BG);
    preloadRoomBackground(EVIDENCE_VAULT_WRITING_ROOM_BG);
    preloadRoomBackground(EVIDENCE_VAULT_INTERIOR_REVEAL_BG);
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
    if (doorState !== "locked" && doorState !== "key_ready") {
      setKeyRevealed(true);
      return;
    }
    if (reduceMotion) {
      setKeyRevealed(true);
      return;
    }
    setKeyRevealed(false);
    const timer = window.setTimeout(
      () => setKeyRevealed(true),
      EVIDENCE_VAULT_ARRIVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [doorState, reduceMotion]);

  useEffect(() => {
    if (doorState === "unlocking" && !unlockStarted) {
      setUnlockStarted(true);
      playEvidenceVaultUnlockSound();
    }
    if (doorState === "locked" || doorState === "key_ready") {
      setUnlockStarted(false);
    }
  }, [doorState, unlockStarted]);

  /* State 4 — leave doors at the edges framing the room, then release. */
  useEffect(() => {
    if (doorState !== "open") {
      setHoldingOpen(false);
      return;
    }
    setHoldingOpen(true);
    const holdMs = reduceMotion
      ? EVIDENCE_VAULT_DOOR_HOLD_MS * 0.35
      : EVIDENCE_VAULT_DOOR_HOLD_MS;
    const timer = window.setTimeout(() => setHoldingOpen(false), holdMs);
    return () => window.clearTimeout(timer);
  }, [doorState, reduceMotion]);

  if (!mounted) return null;
  if (doorState === "open" && !holdingOpen) return null;

  function activateUnlock() {
    if (!idle || busy) return;
    onUnlock();
  }

  const entrance = (
    <div
      className={[
        "evidence-vault-entrance",
        `evidence-vault-entrance--${doorState}`,
        holdingOpen ? "evidence-vault-entrance--holding-open" : "",
        keyRevealed ? "evidence-vault-entrance--key-ready" : "",
        reduceMotion ? "evidence-vault-entrance--reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="evidence-vault-entrance"
      data-vault-door-state={doorState}
      data-key-revealed={keyRevealed ? "true" : "false"}
      data-holding-open={holdingOpen ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby="evidence-vault-entrance-welcome"
    >
      <div className="evidence-vault-entrance__art" aria-hidden>
        <div className="evidence-vault-entrance__art-inner">
          <VaultReveal revealed={doorsOpen || doorState === "unlocking"} />
          <VaultDoorAnimation open={doorsOpen} />
        </div>
      </div>

      {!holdingOpen ? (
        <button
          type="button"
          className="evidence-vault-entrance__skip"
          onClick={() => onSkip()}
          data-testid="evidence-vault-entrance-skip"
        >
          Skip
        </button>
      ) : null}

      <h1 id={titleId} className="sr-only">
        Evidence Vault
      </h1>
      <p id="evidence-vault-entrance-welcome" className="sr-only">
        {EVIDENCE_VAULT_EXTERIOR_WELCOME}
      </p>

      <VaultKeyInteraction phase={keyPhase} onUnlock={activateUnlock} />

      <p
        className="evidence-vault-entrance__status"
        role="status"
        aria-live="polite"
        data-testid="evidence-vault-door-status"
      >
        {status}
      </p>
    </div>
  );

  return createPortal(entrance, document.body);
}
