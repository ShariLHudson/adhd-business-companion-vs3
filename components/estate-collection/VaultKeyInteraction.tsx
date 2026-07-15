"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  EVIDENCE_VAULT_BEGIN_DISCOVERY_LABEL,
  EVIDENCE_VAULT_DOOR_ACTION_LABEL,
  EVIDENCE_VAULT_KEY_INVITATION,
  EVIDENCE_VAULT_LEARN_WHY_BODY,
  EVIDENCE_VAULT_LEARN_WHY_LABEL,
  EVIDENCE_VAULT_WHAT_IT_IS,
  EVIDENCE_VAULT_WHY_LOCKED,
} from "@/lib/estate/evidenceVaultExperience";
import { EVIDENCE_VAULT_UNLOCK_MS } from "@/lib/estate/evidenceVaultDoor";
import { EvidenceVaultKey } from "./EvidenceVaultKey";

type Props = {
  phase: "hidden" | "ready" | "unlocking" | "done";
  onUnlock: () => void;
};

/**
 * Physical key invitation — the object is clickable (no button chrome).
 * Hangs near the lock, then moves into the keyhole, turns, and clicks open.
 */
export function VaultKeyInteraction({ phase, onUnlock }: Props) {
  const keyRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [showWhy, setShowWhy] = useState(false);
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
      {/* Glow over the painted lock / keyhole at the door seam */}
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

      <div
        id="evidence-vault-key-invite"
        className={[
          "vault-key-interaction__invite",
          ready ? "vault-key-interaction__invite--visible" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-testid="evidence-vault-locked-copy"
      >
        <p className="vault-key-interaction__invite-lead">
          {EVIDENCE_VAULT_WHAT_IT_IS}
        </p>
        <p className="vault-key-interaction__invite-why">
          {EVIDENCE_VAULT_WHY_LOCKED}
        </p>
        {showWhy ? (
          <p
            className="vault-key-interaction__invite-why-body"
            data-testid="evidence-vault-learn-why-body"
          >
            {EVIDENCE_VAULT_LEARN_WHY_BODY}
          </p>
        ) : null}
        {ready ? (
          <div className="vault-key-interaction__actions mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
              onClick={() => {
                if (!ready) return;
                onUnlock();
              }}
              data-testid="evidence-vault-begin-discovery"
            >
              {EVIDENCE_VAULT_BEGIN_DISCOVERY_LABEL}
            </button>
            <button
              type="button"
              className="rounded-xl border border-[#d4cdc3] bg-white/90 px-4 py-2 text-sm font-semibold text-[#1f1c19]"
              onClick={() => setShowWhy((v) => !v)}
              data-testid="evidence-vault-learn-why"
            >
              {EVIDENCE_VAULT_LEARN_WHY_LABEL}
            </button>
          </div>
        ) : null}
        <span className="sr-only">{EVIDENCE_VAULT_KEY_INVITATION}</span>
      </div>
    </div>
  );
}
