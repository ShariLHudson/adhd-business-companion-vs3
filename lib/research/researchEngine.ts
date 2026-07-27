/**
 * Shared research engine (Stage 3A foundation) — one engine, two honest modes.
 *
 * - "explore": Explore with Shari. A conversational reply plus optional findings
 *   labeled ONLY interpretation / user_provided / built_in_guidance. Never a
 *   citation, publisher, URL, or source-derived quality label.
 * - "sources": Research with Sources. Requires a REAL live-retrieval provider.
 *   With no provider (Stage 3A) it returns providerUnavailable + zero findings +
 *   an honest notice. It never silently falls back to model knowledge, Explore
 *   mode, or topic packs, and a retrieval failure never becomes model-generated
 *   "sourced" research.
 *
 * Honesty is enforced through the shared makeFinding / findingMayShowCitation
 * guardrails — this module does not re-implement that logic.
 *
 * Pure + injectable: the conversational model and the (future) retrieval
 * provider are passed in, so the contract is fully testable without a network.
 * Not wired into any experience in Stage 3A — Client Avatar is unchanged.
 */

import {
  findingMayShowCitation,
  isCitationEvidenceBasis,
  makeFinding,
  type ResearchEvidenceBasis,
  type ResearchFindingKind,
  type ResearchSourceCitation,
  type SharedResearchFinding,
  type SharedResearchMode,
} from "./types";

/** The only evidence bases Explore mode may emit. */
export const EXPLORE_EVIDENCE_BASES: readonly ResearchEvidenceBasis[] = [
  "interpretation",
  "user_provided",
  "built_in_guidance",
];

export const SOURCES_PROVIDER_UNAVAILABLE_NOTICE =
  "Live web research isn't connected yet, so I can't pull real, cited sources " +
  "right now — and I won't invent them. You can switch to Explore with Shari to " +
  "think this through together, or use built-in guidance.";

export type ResearchEngineMessage = { role: "user" | "assistant"; content: string };

/** A built-in reference item — always surfaced as built_in_guidance, never a citation. */
export type BuiltInGuidanceItem = {
  id: string;
  title: string;
  content: string;
  kind?: ResearchFindingKind;
};

export type ResearchEngineRequest = {
  mode: SharedResearchMode;
  /** Scoped conversational system prompt (Explore mode). */
  systemPrompt: string;
  messages: ResearchEngineMessage[];
  /** Optional built-in guidance to surface in Explore mode. */
  builtInGuidance?: BuiltInGuidanceItem[];
};

export type ResearchEngineResult = {
  mode: SharedResearchMode;
  reply: string;
  findings: SharedResearchFinding[];
  providerUnavailable?: boolean;
  notice?: string;
};

/** A live retrieval hit — produced ONLY by a real provider (Stage 3B). */
export type LiveRetrievalFinding = {
  id: string;
  title: string;
  content: string;
  kind?: ResearchFindingKind;
  sources: ResearchSourceCitation[];
  confidence?: SharedResearchFinding["confidence"];
  freshness?: SharedResearchFinding["freshness"];
  verificationStatus?: SharedResearchFinding["verificationStatus"];
};

/** Real retrieval provider. Absent/null until Stage 3B connects one. */
export type LiveRetrievalProvider = {
  retrieve: (input: {
    query: string;
    messages: ResearchEngineMessage[];
  }) => Promise<LiveRetrievalFinding[]>;
};

export type ResearchProviders = {
  /** Conversational model for Explore mode. */
  chat: (input: {
    systemPrompt: string;
    messages: ResearchEngineMessage[];
  }) => Promise<string>;
  /** Live retrieval — omitted/null in Stage 3A, so sources mode is unavailable. */
  liveRetrieval?: LiveRetrievalProvider | null;
};

/**
 * Construct an Explore finding. Refuses citation bases outright and never
 * carries sources (makeFinding strips them for non-citation bases). This is the
 * only way Explore findings are made, so they can never masquerade as sources.
 */
export function makeExploreFinding(input: {
  id: string;
  title: string;
  content: string;
  kind: ResearchFindingKind;
  evidenceBasis: ResearchEvidenceBasis;
}): SharedResearchFinding {
  if (isCitationEvidenceBasis(input.evidenceBasis)) {
    throw new Error(
      `Explore mode cannot emit a "${input.evidenceBasis}" finding.`,
    );
  }
  return makeFinding({
    id: input.id,
    title: input.title,
    content: input.content,
    kind: input.kind,
    evidenceBasis: input.evidenceBasis,
  });
}

function unavailableSourcesResult(): ResearchEngineResult {
  return {
    mode: "sources",
    reply: "",
    findings: [],
    providerUnavailable: true,
    notice: SOURCES_PROVIDER_UNAVAILABLE_NOTICE,
  };
}

function latestUserText(messages: ResearchEngineMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]!.role === "user") return messages[i]!.content;
  }
  return "";
}

async function runExplore(
  req: ResearchEngineRequest,
  providers: ResearchProviders,
): Promise<ResearchEngineResult> {
  const reply = await providers.chat({
    systemPrompt: req.systemPrompt,
    messages: req.messages,
  });
  const findings = (req.builtInGuidance ?? []).map((g) =>
    makeExploreFinding({
      id: g.id,
      title: g.title,
      content: g.content,
      kind: g.kind ?? "recommendation",
      evidenceBasis: "built_in_guidance",
    }),
  );
  return { mode: "explore", reply: (reply ?? "").trim(), findings };
}

async function runSources(
  req: ResearchEngineRequest,
  providers: ResearchProviders,
): Promise<ResearchEngineResult> {
  const provider = providers.liveRetrieval ?? null;
  // No provider → honest unavailable. No fallback to chat / topic packs.
  if (!provider) return unavailableSourcesResult();

  let hits: LiveRetrievalFinding[];
  try {
    hits = await provider.retrieve({
      query: latestUserText(req.messages),
      messages: req.messages,
    });
  } catch {
    // A retrieval failure is NEVER laundered into model-generated research.
    return unavailableSourcesResult();
  }
  if (!hits || !hits.length) return unavailableSourcesResult();

  // Only genuinely-cited findings survive; incomplete citations are dropped,
  // never fabricated or filled from memory.
  const findings = hits
    .map((h) =>
      makeFinding({
        id: h.id,
        title: h.title,
        content: h.content,
        kind: h.kind ?? "fact",
        evidenceBasis: "live_source",
        sources: h.sources,
        confidence: h.confidence,
        freshness: h.freshness,
        verificationStatus: h.verificationStatus,
      }),
    )
    .filter(findingMayShowCitation);

  if (!findings.length) return unavailableSourcesResult();
  return { mode: "sources", reply: "", findings };
}

/** The single shared research engine. */
export async function runResearch(
  req: ResearchEngineRequest,
  providers: ResearchProviders,
): Promise<ResearchEngineResult> {
  return req.mode === "sources"
    ? runSources(req, providers)
    : runExplore(req, providers);
}

/**
 * Default Explore chat provider — calls the existing companion research engine
 * endpoint. Provided for later wiring; not used by any experience in Stage 3A.
 */
export function createDefaultChatProvider(): ResearchProviders["chat"] {
  return async ({ systemPrompt, messages }) => {
    const res = await fetch("/api/companion-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        talkItOutShariEngine: true,
        systemPromptOverride: systemPrompt,
      }),
    });
    const data = await res.json();
    return typeof data.message === "string" ? data.message : "";
  };
}
