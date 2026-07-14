"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import "./evidence-vault-entrance.css";
import {
  EVIDENCE_VAULT_ARRIVAL_MS,
  EVIDENCE_VAULT_CLOSED_DOOR_BG,
  EVIDENCE_VAULT_DOOR_LEFT_BG,
  EVIDENCE_VAULT_DOOR_LEFT_BOUNDS,
  EVIDENCE_VAULT_DOOR_RIGHT_BG,
  EVIDENCE_VAULT_DOOR_RIGHT_BOUNDS,
  EVIDENCE_VAULT_DOOR_STATUS,
  EVIDENCE_VAULT_DOOR_STAGGER_MS,
  EVIDENCE_VAULT_INTERIOR_REVEAL_BG,
  EVIDENCE_VAULT_OPEN_MS,
  EVIDENCE_VAULT_ROOM_STATIC_BG,
  evidenceVaultDoorLeafStyle,
  resetEvidenceVaultAccessStateForDev,
  type EvidenceVaultDoorState,
} from "@/lib/estate/evidenceVaultDoor";
import {
  EVIDENCE_VAULT_DOOR_ACTION_LABEL,
  EVIDENCE_VAULT_EXTERIOR_WELCOME,
  EVIDENCE_VAULT_KEY_INVITATION,
} from "@/lib/estate/evidenceVaultExperience";
import { playEvidenceVaultUnlockSound } from "@/lib/estate/evidenceVaultUnlockSound";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  doorState: EvidenceVaultDoorState;
  onUnlock: () => void;
  onSkip: () => void;
  onBack?: () => void;
};

/**
 * Evidence Vault entrance — hinged door reveal over stationary room.
 * Portaled so it sits above chat stacking contexts.
 */
export function EvidenceVaultEntrance({
  doorState,
  onUnlock,
  onSkip,
  onBack,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const keyRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const unlockStartedRef = useRef(false);
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const busy = doorState === "unlocking" || doorState === "opening";
  const idle =
    (doorState === "locked" || doorState === "key_ready") && keyRevealed;
  const doorsOpen = doorState === "opening" || doorState === "open";
  const status = EVIDENCE_VAULT_DOOR_STATUS[doorState];
  const leftStyle = evidenceVaultDoorLeafStyle(EVIDENCE_VAULT_DOOR_LEFT_BOUNDS);
  const rightStyle = evidenceVaultDoorLeafStyle(
    EVIDENCE_VAULT_DOOR_RIGHT_BOUNDS,
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    preloadRoomBackground(EVIDENCE_VAULT_CLOSED_DOOR_BG);
    preloadRoomBackground(EVIDENCE_VAULT_ROOM_STATIC_BG);
    preloadRoomBackground(EVIDENCE_VAULT_DOOR_LEFT_BG);
    preloadRoomBackground(EVIDENCE_VAULT_DOOR_RIGHT_BG);
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

  /* State 1 — arrival pause, then reveal key (already in lock). */
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
    if (idle) keyRef.current?.focus({ preventScroll: true });
  }, [idle]);

  useEffect(() => {
    if (doorState === "unlocking" && !unlockStartedRef.current) {
      unlockStartedRef.current = true;
      playEvidenceVaultUnlockSound();
    }
    if (doorState === "locked" || doorState === "key_ready") {
      unlockStartedRef.current = false;
    }
  }, [doorState]);

  if (!mounted || doorState === "open") return null;

  function activateUnlock() {
    if (!idle || busy) return;
    onUnlock();
  }

  function activateSkip() {
    onSkip();
  }

  const openDuration = EVIDENCE_VAULT_OPEN_MS / 1000;
  const stagger = EVIDENCE_VAULT_DOOR_STAGGER_MS / 1000;

  const entrance = (
    <div
      className={[
        "evidence-vault-entrance",
        `evidence-vault-entrance--${doorState}`,
        keyRevealed ? "evidence-vault-entrance--key-ready" : "",
        reduceMotion ? "evidence-vault-entrance--reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="evidence-vault-entrance"
      data-vault-door-state={doorState}
      data-key-revealed={keyRevealed ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby="evidence-vault-entrance-welcome"
    >
      <div className="evidence-vault-entrance__art" aria-hidden>
        {/* Stationary surroundings — never rotate */}
        <div className="evidence-vault-entrance__plate evidence-vault-entrance__plate--room">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={EVIDENCE_VAULT_ROOM_STATIC_BG}
            alt=""
            decoding="async"
            data-testid="evidence-vault-room-static-image"
          />
        </div>

        {/* Interior already behind doors */}
        <div
          className={[
            "evidence-vault-entrance__plate",
            "evidence-vault-entrance__plate--interior",
            doorsOpen ? "evidence-vault-entrance__plate--interior-visible" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={EVIDENCE_VAULT_INTERIOR_REVEAL_BG}
            alt=""
            decoding="async"
            data-testid="evidence-vault-interior-reveal-image"
          />
        </div>

        {/* Full closed plate under leaves — covers crop seams at arrival */}
        <div
          className={[
            "evidence-vault-entrance__plate",
            "evidence-vault-entrance__plate--closed",
            doorsOpen ? "evidence-vault-entrance__plate--closed-hidden" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-testid="evidence-vault-closed-composite"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={EVIDENCE_VAULT_CLOSED_DOOR_BG}
            alt=""
            decoding="async"
            data-testid="evidence-vault-closed-door-image"
          />
        </div>

        <div className="evidence-vault-entrance__door-stage">
          <motion.div
            className="evidence-vault-entrance__door evidence-vault-entrance__door--left"
            style={{
              ...leftStyle,
              transformOrigin: "left center",
            }}
            initial={false}
            animate={
              reduceMotion
                ? { rotateY: 0, opacity: doorsOpen ? 0 : 1 }
                : {
                    rotateY: doorsOpen ? -110 : 0,
                    opacity: doorsOpen ? 0.35 : 1,
                  }
            }
            transition={
              reduceMotion
                ? { duration: 0.28, ease: "easeOut" }
                : {
                    duration: openDuration,
                    ease: [0.42, 0, 0.58, 1],
                    delay: 0,
                  }
            }
            data-testid="evidence-vault-door-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={EVIDENCE_VAULT_DOOR_LEFT_BG} alt="" draggable={false} />
            <span className="evidence-vault-entrance__door-shade" />
          </motion.div>

          <motion.div
            className="evidence-vault-entrance__door evidence-vault-entrance__door--right"
            style={{
              ...rightStyle,
              transformOrigin: "right center",
            }}
            initial={false}
            animate={
              reduceMotion
                ? { rotateY: 0, opacity: doorsOpen ? 0 : 1 }
                : {
                    rotateY: doorsOpen ? 110 : 0,
                    opacity: doorsOpen ? 0.35 : 1,
                  }
            }
            transition={
              reduceMotion
                ? { duration: 0.28, ease: "easeOut" }
                : {
                    duration: openDuration,
                    ease: [0.42, 0, 0.58, 1],
                    delay: stagger,
                  }
            }
            data-testid="evidence-vault-door-right"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={EVIDENCE_VAULT_DOOR_RIGHT_BG} alt="" draggable={false} />
            <span className="evidence-vault-entrance__door-shade" />
          </motion.div>
        </div>

        <div className="evidence-vault-entrance__lock-glow" />
        <div className="evidence-vault-entrance__key-glint" />
      </div>

      <button
        ref={skipRef}
        type="button"
        className="evidence-vault-entrance__skip"
        onClick={activateSkip}
        data-testid="evidence-vault-entrance-skip"
      >
        Skip
      </button>

      <div className="evidence-vault-entrance__scene">
        <header className="evidence-vault-entrance__copy">
          <p className="evidence-vault-entrance__kicker" id={titleId}>
            Evidence Vault
          </p>
          <p
            id="evidence-vault-entrance-welcome"
            className="evidence-vault-entrance__welcome"
          >
            {EVIDENCE_VAULT_EXTERIOR_WELCOME}
          </p>
        </header>

        {/* Key already inserted in lock — hotspot over painted key */}
        <button
          ref={keyRef}
          type="button"
          className={[
            "evidence-vault-entrance__key-btn",
            keyRevealed ? "evidence-vault-entrance__key-btn--revealed" : "",
            doorState === "unlocking"
              ? "evidence-vault-entrance__key-btn--turning"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={activateUnlock}
          disabled={!idle}
          aria-label={EVIDENCE_VAULT_DOOR_ACTION_LABEL}
          aria-describedby="evidence-vault-key-invite"
          data-testid="evidence-vault-use-key"
        >
          <span className="evidence-vault-entrance__key-hit" aria-hidden />
        </button>

        <p
          id="evidence-vault-key-invite"
          className={[
            "evidence-vault-entrance__invite",
            keyRevealed ? "evidence-vault-entrance__invite--visible" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {EVIDENCE_VAULT_KEY_INVITATION}
        </p>

        {idle ? (
          <button
            type="button"
            className="evidence-vault-entrance__primary"
            onClick={activateUnlock}
            data-testid="evidence-vault-unlock-action"
          >
            {EVIDENCE_VAULT_DOOR_ACTION_LABEL}
          </button>
        ) : null}

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
