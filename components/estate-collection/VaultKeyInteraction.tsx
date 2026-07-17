"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  EVIDENCE_VAULT_DOOR_ACTION_LABEL,
  EVIDENCE_VAULT_KEY_OPEN_INSTRUCTION,
} from "@/lib/estate/evidenceVaultExperience";
import { EVIDENCE_VAULT_UNLOCK_MS } from "@/lib/estate/evidenceVaultDoor";
import { EvidenceVaultKey } from "./EvidenceVaultKey";

type Props = {
  phase: "hidden" | "ready" | "unlocking" | "done";
  onUnlock: () => void;
};

/**
 * Physical key invitation — the object is clickable (no button chrome).
 * Locked state: doors + moving key + one instruction only.
 */
export function VaultKeyInteraction({ phase, onUnlock }: Props) {
  const keyRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const ready = phase === "ready";
  const unlocking = phase === "unlocking";
  const visible = phase === "ready" || phase === "unlocking";
  const duration = EVIDENCE_VAULT_UNLOCK_MS / 1000;

  useEffect(() => {
    if (ready) keyRef.current?.focus({ preventScroll: true });
  }, [ready]);

  if (phase === "done" || phase === "hidden") {
    return null;
  }

  return (
    <div
      className={[
        "vault-key-interaction",
        ready ? "vault-key-interaction--ready" : "",
        unlocking ? "vault-key-interaction--unlocking" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="vault-key-interaction"
    >
      <span className="vault-key-interaction__lock-glow" aria-hidden />
      <span className="vault-key-interaction__lock-plate" aria-hidden />

      <motion.button
        ref={keyRef}
        type="button"
        className="vault-key-interaction__key"
        onClick={() => {
          if (!ready) return;
          onUnlock();
        }}
        onKeyDown={(event) => {
          if (!ready) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onUnlock();
          }
        }}
        disabled={!ready}
        aria-label={EVIDENCE_VAULT_DOOR_ACTION_LABEL}
        aria-describedby="evidence-vault-key-invite"
        data-testid="evidence-vault-use-key"
        initial={false}
        animate={
          unlocking
            ? reduceMotion
              ? {
                  left: "48.5%",
                  top: "51%",
                  x: "-50%",
                  y: "-35%",
                  rotate: 90,
                  scale: 0.55,
                  opacity: 0.25,
                }
              : {
                  left: ["62%", "55%", "48.5%", "48.5%"],
                  top: ["44%", "48%", "51%", "51%"],
                  x: ["-50%", "-50%", "-50%", "-50%"],
                  y: ["0%", "-10%", "-35%", "-35%"],
                  rotate: [0, -12, 20, 95],
                  scale: [1, 1.08, 0.7, 0.5],
                  opacity: [1, 1, 1, 0.15],
                }
            : {
                left: "62%",
                top: "44%",
                x: "-50%",
                y: "0%",
                rotate: 0,
                scale: 1,
                opacity: 1,
              }
        }
        transition={
          unlocking
            ? reduceMotion
              ? { duration: 0.28 }
              : {
                  duration,
                  times: [0, 0.3, 0.58, 1],
                  ease: "easeInOut",
                }
            : { type: "spring", stiffness: 120, damping: 18 }
        }
      >
        <span className="vault-key-interaction__key-glow" aria-hidden />
        <EvidenceVaultKey
          glowing={visible}
          className="vault-key-interaction__key-art"
        />
      </motion.button>

      {unlocking ? (
        <span
          className="vault-key-interaction__flash"
          aria-hidden
          data-testid="vault-key-flash"
        />
      ) : null}

      {ready ? (
        <div
          id="evidence-vault-key-invite"
          className="vault-key-interaction__invite vault-key-interaction__invite--visible"
          data-testid="evidence-vault-locked-copy"
        >
          <p
            className="vault-key-interaction__invite-lead"
            data-testid="evidence-vault-key-instruction"
          >
            {EVIDENCE_VAULT_KEY_OPEN_INSTRUCTION}
          </p>
        </div>
      ) : (
        <span id="evidence-vault-key-invite" className="sr-only">
          {EVIDENCE_VAULT_KEY_OPEN_INSTRUCTION}
        </span>
      )}
    </div>
  );
}
