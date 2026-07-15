"use client";

import {
  EVIDENCE_VAULT_INTERIOR_REVEAL_BG,
  EVIDENCE_VAULT_ROOM_STATIC_BG,
  EVIDENCE_VAULT_WRITING_ROOM_BG,
} from "@/lib/estate/evidenceVaultDoor";

type Props = {
  /** Doors are swinging or open — doorway frames the room. */
  revealed: boolean;
};

/**
 * Vault interior already exists behind the doors.
 * Layer order: estate surroundings → writing room in the portal → soft light.
 * Writing room is never faded in — doors reveal it.
 */
export function VaultReveal({ revealed }: Props) {
  return (
    <>
      <div
        className="evidence-vault-entrance__plate evidence-vault-entrance__plate--room"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={EVIDENCE_VAULT_ROOM_STATIC_BG}
          alt=""
          decoding="async"
          data-testid="evidence-vault-room-static-image"
        />
      </div>

      <div
        className={[
          "evidence-vault-entrance__plate",
          "evidence-vault-entrance__plate--writing-room",
          revealed
            ? "evidence-vault-entrance__plate--writing-room-open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
        data-testid="evidence-vault-reveal"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={EVIDENCE_VAULT_WRITING_ROOM_BG}
          alt=""
          decoding="async"
          data-testid="evidence-vault-writing-room-image"
        />
      </div>

      <div
        className={[
          "evidence-vault-entrance__plate",
          "evidence-vault-entrance__plate--interior",
          revealed ? "evidence-vault-entrance__plate--interior-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={EVIDENCE_VAULT_INTERIOR_REVEAL_BG}
          alt=""
          decoding="async"
          data-testid="evidence-vault-interior-reveal-image"
        />
      </div>
    </>
  );
}
