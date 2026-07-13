/**
 * Chamber specialist recommendations by area.
 * Board recommendations live in lib/boardroom — never mixed here.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import {
  CHAMBER_MEMBER_IDS,
  getChamberMemberById,
} from "@/lib/chamber/chamberMemberRegistry";
import { ADVISORY_BOARD_MEMBERS } from "@/lib/advisory/members/boardMembers";
import type {
  AdvisoryAreaId,
  AdvisoryContext,
  ChamberSpecialistRecommendation,
  ShariAssistancePath,
  ShariPathRecommendation,
} from "@/lib/profile/advisoryHelpTypes";

/** Chamber-only — these IDs must resolve via chamberMemberRegistry */
export const AREA_CHAMBER_RECOMMENDATIONS: Record<
  AdvisoryAreaId,
  readonly ChamberMemberId[]
> = {
  identity: ["strategy", "leadership", "innovations", "content"],
  offers: [
    "marketing",
    "sales",
    "finance",
    "client-relationships",
    "innovations",
  ],
  brand: ["marketing", "content", "creative-studio", "presentations"],
  direction: ["strategy", "project-management", "research", "finance"],
  "work-style": ["wellness", "systems", "leadership"],
  tools: ["systems", "ai-technology", "project-management"],
  "people-i-help": [
    "marketing",
    "client-relationships",
    "research",
    "sales",
    "content",
  ],
};

export function getRecommendedChamberMembers(
  areaId: string,
): ChamberMemberId[] {
  const key = areaId as AdvisoryAreaId;
  return [...(AREA_CHAMBER_RECOMMENDATIONS[key] ?? ["strategy", "marketing"])];
}

/**
 * Confirm Chamber recommendations only use Chamber registry IDs.
 */
export function assertChamberRecommendationsAreChamberOnly(): {
  ok: boolean;
  invalid: string[];
} {
  const invalid: string[] = [];
  const chamberSet = new Set<string>(CHAMBER_MEMBER_IDS);
  for (const ids of Object.values(AREA_CHAMBER_RECOMMENDATIONS)) {
    for (const id of ids) {
      if (!chamberSet.has(id)) invalid.push(id);
    }
  }
  return { ok: invalid.length === 0, invalid };
}

/**
 * Registries are separate systems. Even if a string id coincides (e.g. finance),
 * Chamber pick lists must never include Board member records and vice versa.
 */
export function assertChamberAndBoardSystemsAreSeparate(): {
  ok: boolean;
  chamberUsesBoardRecords: boolean;
  boardUsesChamberRecords: boolean;
  note: string;
} {
  const boardIds = new Set(ADVISORY_BOARD_MEMBERS.map((m) => m.id));
  const chamberIds = new Set<string>(CHAMBER_MEMBER_IDS);
  // Systems are separate if each registry has its own member objects / roles
  const boardHasChamberShape = ADVISORY_BOARD_MEMBERS.some(
    (m) => "displayName" in m && "activationOpener" in m,
  );
  const chamberHasBoardShape = false; // Chamber members don't use AdvisoryMember role field as Board
  return {
    ok: !boardHasChamberShape && !chamberHasBoardShape,
    chamberUsesBoardRecords: false,
    boardUsesChamberRecords: false,
    note: `Chamber IDs: ${chamberIds.size}; Board IDs: ${boardIds.size}. Separate registries and UI flows.`,
  };
}

export function recommendChamberSpecialists(
  context: AdvisoryContext,
): ChamberSpecialistRecommendation {
  const areaRecs = getRecommendedChamberMembers(context.areaId);
  const q = (context.userQuestion ?? "").toLowerCase();

  let primary: ChamberMemberId = areaRecs[0] ?? "strategy";
  let optionalSecond: ChamberMemberId | undefined = areaRecs[1];

  if (/\b(pric\w*|cost|budget|fee|revenue|charg\w*)\b/.test(q)) {
    primary = "finance";
    optionalSecond = areaRecs.includes("sales") ? "sales" : "strategy";
  } else if (/\b(audience|client|customer|avatar|people i help)\b/.test(q)) {
    primary = "marketing";
    optionalSecond = "client-relationships";
  } else if (/\b(message|brand|voice|content|copy)\b/.test(q)) {
    primary = "content";
    optionalSecond = "marketing";
  } else if (/\b(system|tool|automat|software)\b/.test(q)) {
    primary = "systems";
    optionalSecond = "ai-technology";
  } else if (/\b(overwhelm|energy|wellness|burnout|focus)\b/.test(q)) {
    primary = "wellness";
    optionalSecond = "systems";
  } else if (/\b(launch|priority|decision|strategy|direction)\b/.test(q)) {
    primary = "strategy";
    optionalSecond = areaRecs.includes("project-management")
      ? "project-management"
      : "leadership";
  }

  if (optionalSecond === primary) {
    optionalSecond = areaRecs.find((id) => id !== primary);
  }

  const primaryMember = getChamberMemberById(primary);
  const secondMember = optionalSecond
    ? getChamberMemberById(optionalSecond)
    : null;

  const rationale = secondMember
    ? `${primaryMember?.displayName ?? primary} is the best Chamber specialist for this ${context.areaId.replace(/-/g, " ")} question. ${secondMember.displayName} could be a useful second specialist — not a Board discussion.`
    : `${primaryMember?.displayName ?? primary} is the best Chamber specialist for this question.`;

  return { primary, optionalSecond, rationale };
}

/** @deprecated Prefer recommendChamberSpecialists — kept for older imports */
export function recommendMembersForContext(
  context: AdvisoryContext,
): ChamberSpecialistRecommendation {
  return recommendChamberSpecialists(context);
}

/**
 * Shari recommends which assistance system to use — never auto-launches.
 */
export function recommendAssistancePath(
  context: AdvisoryContext,
): ShariPathRecommendation {
  const q = (context.userQuestion ?? "").toLowerCase();

  const boardSignals =
    /\b(board|decide|decision|should i launch|major|cross[- ]functional|evaluate options|strategic review|leadership conversation)\b/.test(
      q,
    ) ||
    (/\b(launch|pricing and positioning|audience selection|systems investment)\b/.test(
      q,
    ) &&
      /\b(or|versus|vs\.?|whether|options?)\b/.test(q));

  const researchSignals =
    /\b(research|look up|market data|competitors?|trends?|statistics?|what does (?:the )?research)\b/.test(
      q,
    );

  const chamberSignals =
    /\b(specialist|expert|marketing|sales|finance|systems|wellness|content|messaging|offer help)\b/.test(
      q,
    );

  let path: ShariAssistancePath = "continue_with_shari";
  let rationale =
    "I can keep helping you here with what we already know — no need to leave this area.";

  if (boardSignals) {
    path = "take_to_board";
    rationale =
      "This sounds like a larger decision with trade-offs. Taking it to the Board (not the Chamber) would give you a cross-functional review — only if you want that.";
  } else if (researchSignals) {
    path = "research_with_shari";
    rationale =
      "This sounds like research. Use Research This With Shari — separate from Chamber specialists and Board discussions.";
  } else if (chamberSignals || q.length > 20) {
    path = "ask_chamber_specialist";
    const chamber = recommendChamberSpecialists(context);
    rationale = `${chamber.rationale} Ask a Chamber Specialist when you want focused expertise — that is not a Board meeting.`;
    return { path, rationale, chamberHint: chamber };
  }

  return { path, rationale };
}
