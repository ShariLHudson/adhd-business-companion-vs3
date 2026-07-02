import type { EstateMenuActionId } from "@/lib/estateMenu";
import { EVIDENCE_VAULT_ROOM_BG, PORTFOLIO_ROOM_BG } from "@/lib/growth/growthRoom";

export type GrowthProfileEstatePlace = {
  actionId: EstateMenuActionId;
  title: string;
  description: string;
  image: string;
  cta: string;
};

/** Estate destinations surfaced from Growth Profile™ — room plate per place. */
export const GROWTH_PROFILE_ESTATE_PLACES: readonly GrowthProfileEstatePlace[] = [
  {
    actionId: "portfolio",
    title: "Portfolio™",
    description: "Creative work and projects — what you've built, in one thoughtful place.",
    image: PORTFOLIO_ROOM_BG,
    cta: "Visit Portfolio →",
  },
  {
    actionId: "evidence-vault",
    title: "Evidence Vault™",
    description: "Proof of growth for harder days — wins preserved with dignity.",
    image: EVIDENCE_VAULT_ROOM_BG,
    cta: "Visit the Vault →",
  },
];
