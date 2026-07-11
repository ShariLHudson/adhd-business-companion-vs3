import type { EstateMenuActionId } from "@/lib/estateMenu";
import { EVIDENCE_VAULT_ROOM_BG, PORTFOLIO_ROOM_BG } from "@/lib/growth/growthRoom";

export type GrowthProfileEstatePlace = {
  actionId: EstateMenuActionId;
  title: string;
  description: string;
  image: string;
  cta: string;
};

/** Estate destinations surfaced from Growth Profile — room plate per place. */
export const GROWTH_PROFILE_ESTATE_PLACES: readonly GrowthProfileEstatePlace[] = [
  {
    actionId: "portfolio",
    title: "Hall of Accomplishments",
    description:
      "Major achievements, milestones, launches, and finished work — look what you've accomplished.",
    image: PORTFOLIO_ROOM_BG,
    cta: "Visit the Hall →",
  },
  {
    actionId: "evidence-vault",
    title: "Evidence Vault",
    description:
      "Private proof, testimonials, and encouragement for the days you need to remember who you are.",
    image: EVIDENCE_VAULT_ROOM_BG,
    cta: "Visit the Vault →",
  },
];
