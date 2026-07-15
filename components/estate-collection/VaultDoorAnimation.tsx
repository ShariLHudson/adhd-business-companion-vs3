"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  EVIDENCE_VAULT_DOOR_LEFT_BG,
  EVIDENCE_VAULT_DOOR_LEFT_BOUNDS,
  EVIDENCE_VAULT_DOOR_OPEN_DEGREES,
  EVIDENCE_VAULT_DOOR_RIGHT_BG,
  EVIDENCE_VAULT_DOOR_RIGHT_BOUNDS,
  EVIDENCE_VAULT_DOOR_STAGGER_MS,
  EVIDENCE_VAULT_OPEN_MS,
  evidenceVaultDoorLeafStyle,
} from "@/lib/estate/evidenceVaultDoor";

type Props = {
  open: boolean;
};

/**
 * Physical double vault doors — separate left/right leaves that swing on hinges.
 * Interior stays behind them; no image swap replaces the opening.
 */
export function VaultDoorAnimation({ open }: Props) {
  const reduceMotion = useReducedMotion();
  const openDuration = EVIDENCE_VAULT_OPEN_MS / 1000;
  const stagger = EVIDENCE_VAULT_DOOR_STAGGER_MS / 1000;
  const degrees = EVIDENCE_VAULT_DOOR_OPEN_DEGREES;
  const leftStyle = evidenceVaultDoorLeafStyle(EVIDENCE_VAULT_DOOR_LEFT_BOUNDS);
  const rightStyle = evidenceVaultDoorLeafStyle(EVIDENCE_VAULT_DOOR_RIGHT_BOUNDS);

  return (
    <div
      className="evidence-vault-entrance__door-stage"
      data-testid="evidence-vault-door-stage"
      style={{ perspective: 1600 }}
    >
      <motion.div
        className="evidence-vault-entrance__door evidence-vault-entrance__door--left"
        style={{
          ...leftStyle,
          transformOrigin: "left center",
          transformPerspective: 1600,
        }}
        initial={false}
        animate={
          reduceMotion
            ? { rotateY: 0, opacity: open ? 0 : 1 }
            : { rotateY: open ? -degrees : 0, opacity: 1 }
        }
        transition={
          reduceMotion
            ? { duration: 0.28, ease: "easeOut" }
            : {
                duration: openDuration,
                ease: [0.33, 0.08, 0.25, 1],
                delay: 0,
              }
        }
        data-testid="evidence-vault-door-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={EVIDENCE_VAULT_DOOR_LEFT_BG} alt="" draggable={false} />
        <span className="evidence-vault-entrance__door-shade" aria-hidden />
        <span className="evidence-vault-entrance__door-edge" aria-hidden />
      </motion.div>

      <motion.div
        className="evidence-vault-entrance__door evidence-vault-entrance__door--right"
        style={{
          ...rightStyle,
          transformOrigin: "right center",
          transformPerspective: 1600,
        }}
        initial={false}
        animate={
          reduceMotion
            ? { rotateY: 0, opacity: open ? 0 : 1 }
            : { rotateY: open ? degrees : 0, opacity: 1 }
        }
        transition={
          reduceMotion
            ? { duration: 0.28, ease: "easeOut" }
            : {
                duration: openDuration,
                ease: [0.33, 0.08, 0.25, 1],
                delay: stagger,
              }
        }
        data-testid="evidence-vault-door-right"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={EVIDENCE_VAULT_DOOR_RIGHT_BG} alt="" draggable={false} />
        <span className="evidence-vault-entrance__door-shade" aria-hidden />
        <span className="evidence-vault-entrance__door-edge" aria-hidden />
      </motion.div>
    </div>
  );
}
