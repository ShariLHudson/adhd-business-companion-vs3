"use client";

import type { ReactNode } from "react";
import { EstateRoomChatChrome } from "@/components/companion/estate/EstateRoomChatChrome";
import type { EvidenceVaultWorkspaceMode } from "@/lib/estate/evidenceVaultArrival";
import { EstateCollectionRoomEngine } from "./EstateCollectionRoomEngine";

type Nav = {
  onBack: () => void;
  backLabel?: string | null;
};

type Props = {
  nav?: Nav;
  onBack?: () => void;
  backLabel?: string | null;
  /** Remount engine so door/key entrance runs on each arrive visit. */
  arrivalKey?: number;
  evidenceVaultMode?: EvidenceVaultWorkspaceMode;
  chatVisible?: boolean;
  thread: ReactNode;
  footer: ReactNode;
  conversationScrollKey?: string | number;
};

/** Evidence Vault — collection engine + frosted estate chat (toggle via menu). */
export function EvidenceVaultRoomPanel({
  nav,
  onBack,
  backLabel,
  arrivalKey = 0,
  evidenceVaultMode = "arrive",
  chatVisible = false,
  thread,
  footer,
  conversationScrollKey,
}: Props) {
  const back = nav?.onBack ?? onBack ?? (() => {});
  const label = nav?.backLabel ?? backLabel ?? "Companion";

  return (
    <>
      <EstateCollectionRoomEngine
        key={`evidence-vault-arrival-${arrivalKey}`}
        roomId="evidence-vault"
        evidenceVaultMode={evidenceVaultMode}
        onBack={back}
        backLabel={label}
      />
      {chatVisible ? (
        <EstateRoomChatChrome
          roomId="evidence-vault"
          thread={thread}
          footer={footer}
          conversationScrollKey={conversationScrollKey}
          panelClassName="evidence-vault-room__chat-panel"
        />
      ) : null}
    </>
  );
}
