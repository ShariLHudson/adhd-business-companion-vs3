"use client";

import { useEffect, type ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { EVIDENCE_VAULT_ROOM_BG } from "@/lib/growth/growthRoom";
import { preferredBackgroundPreloadUrl } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Full-screen Evidence Vault — evidence-vault-background fills the viewport. */
export function EvidenceVaultRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(preferredBackgroundPreloadUrl(EVIDENCE_VAULT_ROOM_BG));
  }, []);

  return (
    <div
      className="evidence-vault-room"
      data-testid="evidence-vault-room"
      data-homestead-room="evidence-vault"
    >
      <EstateRoomFullBleedBackground
        roomId="evidence-vault"
        imageUrl={EVIDENCE_VAULT_ROOM_BG}
        className="evidence-vault-room__plate"
      />
      <div className="evidence-vault-room__scroll">{children}</div>
    </div>
  );
}
