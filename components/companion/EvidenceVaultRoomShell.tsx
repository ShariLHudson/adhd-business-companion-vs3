"use client";

import { useEffect, type ReactNode } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { EVIDENCE_VAULT_ROOM_BG } from "@/lib/growth/growthRoom";
import { roomBackgroundImageStyle } from "@/lib/roomBackgroundAssets";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  children: ReactNode;
};

/** Full-screen Evidence Vault — evidence-vault-background fills the viewport. */
export function EvidenceVaultRoomShell({ children }: Props) {
  useEffect(() => {
    preloadRoomBackground(EVIDENCE_VAULT_ROOM_BG);
  }, []);

  return (
    <div
      className="evidence-vault-room"
      data-testid="evidence-vault-room"
      data-homestead-room="evidence-vault"
    >
      <CinematicBackground
        preset="evidence-vault"
        mode="image"
        scale={1}
        position="center center"
        imageUrl={EVIDENCE_VAULT_ROOM_BG}
        imageStyle={roomBackgroundImageStyle(EVIDENCE_VAULT_ROOM_BG)}
        placement="absolute"
        className="evidence-vault-room__cinematic"
        showBottomFade={false}
        gradientStrength={0}
      />
      <div className="evidence-vault-room__scroll">{children}</div>
    </div>
  );
}
