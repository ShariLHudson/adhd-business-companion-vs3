/**
 * Estate Expansion Engine™ (Phase H.2) — classify new concepts before canon adoption.
 *
 * Governance only. Does not add rooms, routes, or registry entries.
 * Every new Estate idea must pass through this engine first.
 *
 * @see docs/estate/PHASE_H2_EXPANSION_ENGINE.md
 * @see docs/estate/P0_CANON_ERRATA.md
 * @see lib/estate/canonicalEstateRegistry.ts
 */

import {
  CANONICAL_ESTATE_REGISTRY,
  getCanonicalEstatePlaceById,
  resolveCanonicalPlaceIdFromAlias,
} from "./canonicalEstateRegistry";

export type EstateExpansionClassification =
  | "Living Place"
  | "Destination"
  | "Collection"
  | "Object"
  | "Reject / Not Needed";

export type EstateExpansionInput = {
  name: string;
  description?: string;
  userIntent?: string;
};

export type EstateExpansionResult = {
  classification: EstateExpansionClassification;
  suggestedCanonicalName: string;
  aliases: string[];
  reasoning: string;
  conflictsWithExisting: string[];
  mergeRecommendation?: string;
  requiresHumanApproval: boolean;
};

/** Emotional / product purpose clusters — anti-duplication guardrails. */
const PURPOSE_CLUSTERS: readonly {
  id: string;
  label: string;
  placeIds: readonly string[];
  pattern: RegExp;
}[] = [
  {
    id: "celebration",
    label: "celebration / wins / honor",
    placeIds: ["celebration-room", "accomplishments-shelf", "gardens"],
    pattern:
      /\b(?:win(?:s)?|celebrat(?:e|ion)|honor|trophy|accomplish(?:ment)?s?)\b/i,
  },
  {
    id: "learning",
    label: "learning / institute",
    placeIds: ["momentum-institute", "library", "observatory"],
    pattern:
      /\b(?:learn(?:ing)?|institute|class(?:room)?|course|curriculum|study hall)\b/i,
  },
  {
    id: "memory",
    label: "memory / archive / proof",
    placeIds: [
      "evidence-vault",
      "accomplishments-shelf",
      "journal",
      "portfolio",
      "seeds-planted",
    ],
    pattern:
      /\b(?:memory|archive|vault|proof|record(?:s)?|log book|scrapbook)\b/i,
  },
  {
    id: "restorative",
    label: "quiet / restorative living",
    placeIds: [
      "reading-nook",
      "conservatory",
      "clear-my-mind",
      "peaceful-places",
      "back-deck",
      "porch-swing",
    ],
    pattern:
      /\b(?:quiet|peaceful|calm|think(?:ing)?|restor(?:e|ative)|breathe|stillness)\b/i,
  },
  {
    id: "creative",
    label: "creative work / gallery",
    placeIds: ["creative-studio", "portfolio"],
    pattern:
      /\b(?:gallery|studio|creative|portfolio|art(?:work)?|maker)\b/i,
  },
];

/** Definitive merge rules — P0 errata + Phase H.2 canon. */
const MERGE_RULES: readonly {
  pattern: RegExp;
  classification: EstateExpansionClassification;
  mergeIntoPlaceIds: readonly string[];
  mergeRecommendation: string;
  suggestedCanonicalName: string;
  aliases: readonly string[];
  reasoning: string;
  requiresHumanApproval: boolean;
}[] = [
  {
    pattern:
      /\b(?:wins?\s+room|room\s+(?:of\s+)?wins?|win\s+room|wins?\s+space|victory\s+room)\b/i,
    classification: "Reject / Not Needed",
    mergeIntoPlaceIds: ["celebration-room", "accomplishments-shelf"],
    mergeRecommendation:
      "Merge into Celebration Room™ (ritual / marking moments) and Accomplishments Book™ (honored chapters). Wins are not a separate Estate category (P0 §4).",
    suggestedCanonicalName: "Celebration Room™",
    aliases: ["wins", "my wins", "celebration room"],
    reasoning:
      "Duplicate celebration system — canon already routes wins to Celebration Room + Accomplishments Book.",
    requiresHumanApproval: false,
  },
  {
    pattern: /\b(?:^gallery$|art\s+gallery|photo\s+gallery|the\s+gallery)\b/i,
    classification: "Reject / Not Needed",
    mergeIntoPlaceIds: ["creative-studio", "portfolio"],
    mergeRecommendation:
      "No separate Gallery room. Active making → Creative Studio™; finished work archive → Portfolio™.",
    suggestedCanonicalName: "Creative Studio™",
    aliases: ["gallery", "creative studio", "portfolio"],
    reasoning:
      "Gallery duplicates creative purpose — split between studio (making) and portfolio (archive).",
    requiresHumanApproval: true,
  },
  {
    pattern:
      /\b(?:portfolio\s+room|new\s+portfolio\s+room|portfolio\s+space)\b/i,
    classification: "Collection",
    mergeIntoPlaceIds: ["portfolio"],
    mergeRecommendation:
      "Merge into Portfolio™ collection unless a distinct ritual is documented in canon first.",
    suggestedCanonicalName: "Portfolio™",
    aliases: ["portfolio", "my portfolio"],
    reasoning: "Portfolio Room duplicates the existing Portfolio™ collection.",
    requiresHumanApproval: true,
  },
  {
    pattern:
      /\b(?:guidebook\s+room|open\s+(?:the\s+)?guidebook\s+room|guidebook\s+place)\b/i,
    classification: "Object",
    mergeIntoPlaceIds: [],
    mergeRecommendation:
      "Guidebook™ is a portable Estate object — not a walkable room (P0 §5). Surface in any room via object layer.",
    suggestedCanonicalName: "Guidebook™",
    aliases: ["guidebook", "the guidebook", "estate guidebook"],
    reasoning: "Guidebook is an object, not a destination.",
    requiresHumanApproval: false,
  },
  {
    pattern:
      /\b(?:celebration\s+garden\s+room|new\s+celebration\s+garden|celebration\s+variation)\b/i,
    classification: "Reject / Not Needed",
    mergeIntoPlaceIds: ["celebration-room", "gardens"],
    mergeRecommendation:
      "Ritual celebration → Celebration Room™; outdoor walk → Gardens™. Do not add a third celebration space.",
    suggestedCanonicalName: "Celebration Room™",
    aliases: ["celebration room", "celebration garden", "gardens"],
    reasoning: "Celebration variations already split across room + living garden.",
    requiresHumanApproval: false,
  },
  {
    pattern:
      /\b(?:my\s+thoughts\s+room|thoughts\s+room|brain\s+dump\s+room)\b/i,
    classification: "Reject / Not Needed",
    mergeIntoPlaceIds: ["clear-my-mind", "journal"],
    mergeRecommendation:
      "Capture → Clear My Mind™; reflective writing → Journal™. My Thoughts is not canon (P0 §6).",
    suggestedCanonicalName: "Clear My Mind™",
    aliases: ["clear my mind", "journal"],
    reasoning: "My Thoughts as a room duplicates capture + journal homes.",
    requiresHumanApproval: false,
  },
  {
    pattern:
      /\b(?:reading\s+nook\s+library|library\s+nook|book\s+nook\s+library)\b/i,
    classification: "Reject / Not Needed",
    mergeIntoPlaceIds: ["reading-nook", "library"],
    mergeRecommendation:
      "Reading Nook (living pause) and Library (destination volumes) stay separate (P0 §3).",
    suggestedCanonicalName: "Reading Nook",
    aliases: ["reading nook", "library"],
    reasoning: "Merged nook/library violates canon — no cross-alias.",
    requiresHumanApproval: false,
  },
  {
    pattern:
      /\b(?:learning\s+center|school\s+room|classroom\s+room|training\s+room)\b/i,
    classification: "Destination",
    mergeIntoPlaceIds: ["momentum-institute"],
    mergeRecommendation:
      "Merge into Momentum Institute™ — the canonical learning destination.",
    suggestedCanonicalName: "Momentum Institute™",
    aliases: ["momentum institute", "institute", "library"],
    reasoning: "Duplicate learning system — institute already owns transformation learning.",
    requiresHumanApproval: true,
  },
  {
    pattern:
      /\b(?:memory\s+room|memory\s+palace|archive\s+room|proof\s+room)\b/i,
    classification: "Collection",
    mergeIntoPlaceIds: ["evidence-vault", "accomplishments-shelf"],
    mergeRecommendation:
      "Proof / impact → Evidence Vault™; honored chapters → Accomplishments Book™.",
    suggestedCanonicalName: "Evidence Vault™",
    aliases: ["evidence vault", "accomplishments book"],
    reasoning: "Multiple memory systems forbidden — route to existing collections.",
    requiresHumanApproval: true,
  },
];

const NEW_IDEA_PREFIX_RE = /^\s*new\s+idea\s*:\s*/i;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function combinedText(input: EstateExpansionInput): string {
  const name = input.name.replace(NEW_IDEA_PREFIX_RE, "").trim();
  return [name, input.description, input.userIntent]
    .filter(Boolean)
    .join(" — ");
}

function officialNameForPlaceId(placeId: string): string {
  return getCanonicalEstatePlaceById(placeId)?.officialName ?? placeId;
}

function placeIdsToConflictLabels(placeIds: readonly string[]): string[] {
  return placeIds.map((id) => `${officialNameForPlaceId(id)} (${id})`);
}

function registryAliasCollision(name: string): string[] {
  const normalized = normalize(name);
  const hits = new Set<string>();

  const exact = resolveCanonicalPlaceIdFromAlias(normalized);
  if (exact) hits.add(exact);

  for (const place of CANONICAL_ESTATE_REGISTRY) {
    const tokens = [
      normalize(place.officialName),
      ...place.aliases.map(normalize),
      place.id.replace(/-/g, " "),
    ];
    for (const token of tokens) {
      if (token.length < 4) continue;
      if (normalized.includes(token) || token.includes(normalized)) {
        hits.add(place.id);
      }
    }
  }

  return placeIdsToConflictLabels([...hits]);
}

function clusterConflicts(text: string): string[] {
  const hits = new Set<string>();
  for (const cluster of PURPOSE_CLUSTERS) {
    if (!cluster.pattern.test(text)) continue;
    for (const id of cluster.placeIds) hits.add(id);
  }
  return placeIdsToConflictLabels([...hits]);
}

function inferClassificationFromText(
  text: string,
): EstateExpansionClassification {
  if (/\b(?:guidebook|key|bell|map|folded map)\b/i.test(text)) {
    return "Object";
  }
  if (
    /\b(?:book|shelf|log|record|archive|collection|vault|portfolio|journal)\b/i.test(
      text,
    )
  ) {
    return "Collection";
  }
  if (
    /\b(?:ritual|celebration|institute|compass|builder|studio|observatory|cabinet)\b/i.test(
      text,
    )
  ) {
    return "Destination";
  }
  if (
    /\b(?:room|space|place|corner|nook|deck|path|garden|greenhouse|porch)\b/i.test(
      text,
    )
  ) {
    return "Living Place";
  }
  return "Living Place";
}

function restorativeMergeSuggestion(
  text: string,
): EstateExpansionResult | null {
  if (
    !/\b(?:quiet|peaceful|calm|think(?:ing)?|reflect(?:ion)?|still|hush|breathe)\b/i.test(
      text,
    )
  ) {
    return null;
  }

  const placeIds = ["reading-nook", "conservatory"] as const;
  return {
    classification: "Living Place",
    suggestedCanonicalName: "Reading Nook",
    aliases: ["reading nook", "conservatory", "quiet thinking"],
    reasoning:
      "Restorative thinking space overlaps existing living places — merge before creating a new room.",
    conflictsWithExisting: placeIdsToConflictLabels([
      ...placeIds,
      "clear-my-mind",
      "peaceful-places",
    ]),
    mergeRecommendation:
      "Suggest merge with Reading Nook (unhurried pause) and/or Conservatory (breathe, regain clarity). Not a new room without canon review.",
    requiresHumanApproval: true,
  };
}

function buildFromMergeRule(
  rule: (typeof MERGE_RULES)[number],
  text: string,
): EstateExpansionResult {
  const conflicts = [
    ...new Set([
      ...placeIdsToConflictLabels(rule.mergeIntoPlaceIds),
      ...registryAliasCollision(text),
    ]),
  ];

  return {
    classification: rule.classification,
    suggestedCanonicalName: rule.suggestedCanonicalName,
    aliases: [...rule.aliases],
    reasoning: rule.reasoning,
    conflictsWithExisting: conflicts,
    mergeRecommendation: rule.mergeRecommendation,
    requiresHumanApproval: rule.requiresHumanApproval,
  };
}

/**
 * Classify a proposed Estate concept before it enters canon or the registry.
 */
export function evaluateEstateExpansion(
  input: EstateExpansionInput,
): EstateExpansionResult {
  const text = combinedText(input);
  const name = input.name.replace(NEW_IDEA_PREFIX_RE, "").trim();

  if (!name) {
    return {
      classification: "Reject / Not Needed",
      suggestedCanonicalName: "",
      aliases: [],
      reasoning: "Empty concept name — nothing to ingest.",
      conflictsWithExisting: [],
      requiresHumanApproval: false,
    };
  }

  // Priority 1: definitive merge rules (P0 + known drift patterns)
  for (const rule of MERGE_RULES) {
    if (rule.pattern.test(text) || rule.pattern.test(name)) {
      return buildFromMergeRule(rule, text);
    }
  }

  // Priority 2: restorative / quiet thinking (success test path)
  const restorative = restorativeMergeSuggestion(text);
  if (restorative) {
    return restorative;
  }

  // Priority 3: registry alias collision → reject duplicate
  const aliasConflicts = registryAliasCollision(name);
  if (aliasConflicts.length > 0) {
    const existingId = resolveCanonicalPlaceIdFromAlias(normalize(name));
    return {
      classification: "Reject / Not Needed",
      suggestedCanonicalName: existingId
        ? officialNameForPlaceId(existingId)
        : aliasConflicts[0] ?? name,
      aliases: [],
      reasoning:
        "Name overlaps an existing canonical place — expand canon doc instead of duplicating.",
      conflictsWithExisting: aliasConflicts,
      mergeRecommendation: existingId
        ? `Use existing ${officialNameForPlaceId(existingId)} (${existingId}).`
        : "Resolve naming overlap before registry edit.",
      requiresHumanApproval: false,
    };
  }

  // Priority 4: purpose cluster overlap → merge recommendation, no new room
  const clusterHits = clusterConflicts(text);
  if (clusterHits.length >= 2) {
    const inferred = inferClassificationFromText(text);
    return {
      classification:
        inferred === "Living Place" ? "Reject / Not Needed" : inferred,
      suggestedCanonicalName: name,
      aliases: [normalize(name)],
      reasoning:
        "Concept overlaps an existing emotional/product cluster — anti-duplication rule applies.",
      conflictsWithExisting: clusterHits,
      mergeRecommendation:
        "Document intent in docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md and map to existing places before adding a room.",
      requiresHumanApproval: true,
    };
  }

  // Priority 5: novel concept — classify only; human approval always required
  const classification = inferClassificationFromText(text);
  const decorativeOnly =
    /\b(?:decoration|wallpaper|skin|theme|color)\b/i.test(text) &&
    !/\b(?:ritual|memory|learn|celebrat|journal|conversation)\b/i.test(text);

  if (decorativeOnly) {
    return {
      classification: "Reject / Not Needed",
      suggestedCanonicalName: name,
      aliases: [],
      reasoning: "Purely decorative without Estate meaning — not admitted.",
      conflictsWithExisting: [],
      requiresHumanApproval: false,
    };
  }

  return {
    classification,
    suggestedCanonicalName: name,
    aliases: [normalize(name)],
    reasoning:
      "Novel concept — classified for review. Does not enter registry until human approval and canon doc update.",
    conflictsWithExisting: clusterHits,
    mergeRecommendation:
      clusterHits.length > 0
        ? "Review overlap with existing places before Phase A registry edit."
        : undefined,
    requiresHumanApproval: true,
  };
}

/** True when the concept may proceed to canon/registry editing. */
export function isEstateExpansionApproved(
  result: EstateExpansionResult,
): boolean {
  return (
    !result.requiresHumanApproval &&
    result.classification !== "Reject / Not Needed"
  );
}

/** True when the engine recommends merging into existing canon instead of a new room. */
export function expansionRequiresMerge(
  result: EstateExpansionResult,
): boolean {
  return Boolean(result.mergeRecommendation);
}
