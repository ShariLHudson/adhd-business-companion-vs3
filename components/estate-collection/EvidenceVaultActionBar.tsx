"use client";

import { ESTATE_ROOM_PRIMARY_CATALOG } from "@/lib/estate/estateRoomInvitationCatalog";
import type { EstateRoomInvitationItem } from "@/lib/estate/estateRoomInvitationTypes";

export type EvidenceVaultActionId =
  | "today-discovery"
  | "browse-archive"
  | "search-discoveries"
  | "view-insights"
  | "print-discoveries";

type Props = {
  onSelect: (actionId: EvidenceVaultActionId) => void;
};

const VAULT_ACTIONS = ESTATE_ROOM_PRIMARY_CATALOG["evidence-vault"] ?? [];

function isVaultActionId(id: string): id is EvidenceVaultActionId {
  return (
    id === "today-discovery" ||
    id === "browse-archive" ||
    id === "search-discoveries" ||
    id === "view-insights" ||
    id === "print-discoveries"
  );
}

/**
 * Compact vault controls — shown in the room after entrance, not as a default landing panel.
 */
export function EvidenceVaultActionBar({ onSelect }: Props) {
  const actions = VAULT_ACTIONS.filter((item): item is EstateRoomInvitationItem =>
    isVaultActionId(item.id),
  );

  return (
    <nav
      className="evidence-vault-action-bar"
      aria-label="Evidence Vault actions"
      data-testid="evidence-vault-action-bar"
    >
      <p className="evidence-vault-action-bar__lead">Vault actions</p>
      <ul className="evidence-vault-action-bar__list">
        {actions.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="evidence-vault-action-bar__btn"
              onClick={() => onSelect(item.id)}
            >
              <span className="evidence-vault-action-bar__emoji" aria-hidden>
                {item.emoji}
              </span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
