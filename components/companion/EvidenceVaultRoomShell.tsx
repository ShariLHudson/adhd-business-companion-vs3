"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
import { EVIDENCE_VAULT_ROOM_BG } from "@/lib/growth/growthRoom";
import { resolveRoomFullBleedBackground } from "@/lib/estate/resolveRoomFullBleedBackground";
import { preferredBackgroundPreloadUrl } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Full-screen Evidence Vault — evidence-vault-background fills the viewport. */
export function EvidenceVaultRoomShell({ children }: Props) {
  const backdropRevision = useChatBackdropRevision();
  const backgroundImageUrl = useMemo(() => {
    void backdropRevision;
    return resolveRoomFullBleedBackground("evidence-vault", {
      backgroundId: "evidence-vault",
      imageUrl: EVIDENCE_VAULT_ROOM_BG,
    }).imageUrl;
  }, [backdropRevision]);

  useEffect(() => {
    preloadRoomBackground(preferredBackgroundPreloadUrl(backgroundImageUrl));
  }, [backgroundImageUrl]);

  return (
    <div
      className="evidence-vault-room"
      data-testid="evidence-vault-room"
      data-homestead-room="evidence-vault"
    >
      <EstateRoomFullBleedBackground
        roomId="evidence-vault"
        imageUrl={backgroundImageUrl}
        className="evidence-vault-room__plate"
      />
      <div className="evidence-vault-room__scroll">{children}</div>
    </div>
  );
}
