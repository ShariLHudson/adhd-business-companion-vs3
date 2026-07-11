import { getEstateObjectById } from "@/lib/estateObjectIntelligence/estateObjects";
import { matchObjectAlias } from "@/lib/estateObjectIntelligence/objectAliases";
import {
  ESTATE_HISTORY_CANON,
  ESTATE_PHILOSOPHY_CANON,
  KINSEY_CANON_FACTS,
  SHARI_HUDSON_CANON_FACTS,
  SPARK_ESTATE_CANON_FACTS,
} from "./canonIdentity";
import { detectCanonTopics } from "./detectCanonTopics";
import { getCanonLiveRooms } from "./sparkEstateCanonKnowledgeSource";
import type {
  CanonContextPayload,
  CanonRetrievalInput,
  CanonRetrievalResult,
  CanonTopic,
} from "./types";

function roomHintsFromObject(): string[] {
  const kinsey = getEstateObjectById("kinsey");
  return kinsey?.appearsInLocations ?? [];
}

function mergeKinseyFromKnowledgeBase(): typeof KINSEY_CANON_FACTS {
  const kinsey = getEstateObjectById("kinsey");
  if (!kinsey) return KINSEY_CANON_FACTS;
  return {
    ...KINSEY_CANON_FACTS,
    identifyAnswer: `Kinsey is Shari's white Lhasa Poo — a real dog and a beloved companion in Spark Estate. ${kinsey.description}`,
  };
}

function buildPayload(
  topics: CanonTopic[],
  userText: string,
): CanonContextPayload {
  const retrievalNotes: string[] = [
    "Knowledge priority: 1) Canon files 2) Approved user memory 3) Conversation history 4) General AI knowledge.",
    "Canon overrides assumptions — never invent estate facts, characters, or history.",
    "Separate canon facts (fictional estate) from story experience (welcome, explore).",
  ];

  const includeEstate = topics.some((topic) =>
    [
      "estate",
      "estate_identity",
      "estate_purpose",
      "estate_reality",
      "estate_location",
      "estate_creator",
      "rooms",
    ].includes(topic),
  );
  const includeKinsey = topics.some((topic) =>
    ["kinsey", "kinsey_picture"].includes(topic),
  );
  const includeShari = topics.some((topic) =>
    ["shari", "estate_creator"].includes(topic),
  );
  const includeRooms = topics.includes("rooms");

  if (matchObjectAlias(userText)?.objectId === "kinsey") {
    retrievalNotes.push("Matched Kinsey via estate object aliases.");
  }

  return {
    estate: {
      facts: SPARK_ESTATE_CANON_FACTS,
      rooms: includeEstate ? roomHintsFromObject() : [],
      liveRooms: includeRooms || includeEstate ? getCanonLiveRooms() : [],
      history: includeEstate ? [...ESTATE_HISTORY_CANON] : [],
      philosophy: includeEstate ? [...ESTATE_PHILOSOPHY_CANON] : [],
    },
    characters: {
      kinsey: includeKinsey ? mergeKinseyFromKnowledgeBase() : KINSEY_CANON_FACTS,
      shari: includeShari ? SHARI_HUDSON_CANON_FACTS : SHARI_HUDSON_CANON_FACTS,
    },
    matchedTopics: topics,
    retrievalNotes,
  };
}

/** Retrieve structured canon for the current member turn. */
export function retrieveCanonContext(
  input: CanonRetrievalInput,
): CanonRetrievalResult {
  const topics = detectCanonTopics(input.userText);
  const alwaysInclude =
    topics.length === 0 &&
    /\bspark\b/i.test(input.userText) &&
    /\b(?:estate|companion|kinsey|shari)\b/i.test(input.userText);

  const resolvedTopics = alwaysInclude ? (["estate"] as CanonTopic[]) : topics;
  const payload = buildPayload(resolvedTopics, input.userText);

  return {
    payload,
    topics: resolvedTopics,
  };
}

/** Minimal always-on estate identity for companion turns. */
export function baselineCanonContext(): CanonRetrievalResult {
  return {
    topics: ["estate"],
    payload: buildPayload(["estate"], ""),
  };
}
