/**
 * Chamber Member card display copy — presentation layer only.
 * Feature logic lives in chamberMemberRegistry.ts and chamberMemberActivation.ts.
 */

import type { ChamberMember, ChamberMemberId } from "./chamberMemberRegistry";

export type ChamberMemberCardDisplay = {
  /** Short specialty line under the member name. */
  specialtyLine: string;
  /** Readable purpose paragraph — understandable without opening the card. */
  purposeStatement: string;
  specialties: readonly string[];
};

const DISPLAY_OVERRIDES: Partial<
  Record<ChamberMemberId, ChamberMemberCardDisplay>
> = {
  finance: {
    specialtyLine: "Helping ADHD entrepreneurs reduce financial friction.",
    purposeStatement:
      "Making money decisions easier by reducing overwhelm and creating simple next steps.",
    specialties: [
      "Budgeting",
      "Cash Flow",
      "Pricing",
      "Automation",
      "Financial Clarity",
    ],
  },
  momentum: {
    specialtyLine:
      "Helping ADHD entrepreneurs turn intention into sustainable movement.",
    purposeStatement:
      "When momentum stalls, we find the smallest honest next step and protect it from friction.",
    specialties: [
      "Getting unstuck",
      "Restarting after interruption",
      "Reducing friction",
      "Maintaining progress",
    ],
  },
  systems: {
    specialtyLine:
      "Helping ADHD entrepreneurs build workflows that actually stick.",
    purposeStatement:
      "Simple systems beat heroic effort — we map what works and remove what fights your brain.",
    specialties: [
      "Process mapping",
      "Bottleneck removal",
      "Documentation",
      "ADHD-friendly execution",
    ],
  },
};

function deriveSpecialties(howTheyHelp: string): string[] {
  const parts = howTheyHelp
    .replace(/\band\b/gi, ",")
    .split(/[,;]/)
    .map((part) =>
      part
        .trim()
        .replace(/^to /i, "")
        .replace(/\.$/, ""),
    )
    .filter((part) => part.length > 2 && part.length < 48);

  const unique = [...new Set(parts)];
  return unique.slice(0, 5);
}

export function getChamberMemberCardDisplay(
  member: ChamberMember,
): ChamberMemberCardDisplay {
  const override = DISPLAY_OVERRIDES[member.id];
  if (override) return override;

  const specialtyLine = `Helping ADHD entrepreneurs with ${member.specialty.toLowerCase()}.`;
  return {
    specialtyLine,
    purposeStatement: member.howTheyHelp,
    specialties: deriveSpecialties(member.howTheyHelp),
  };
}

export function chamberMemberTalkLabel(member: ChamberMember): string {
  return `Talk With ${member.displayName}`;
}
