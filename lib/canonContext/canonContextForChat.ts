import {
  KINSEY_CANON_FACTS,
  SHARI_HUDSON_CANON_FACTS,
  SPARK_ESTATE_CANON_FACTS,
} from "./canonIdentity";
import { detectCanonTopics } from "./detectCanonTopics";
import { formatCanonContextBlock } from "./formatCanonContextBlock";
import {
  baselineCanonContext,
  retrieveCanonContext,
} from "./retrieveCanonContext";
import { formatCanonRoomsAnswer } from "./sparkEstateCanonKnowledgeSource";

export function buildCanonContextBlockForChat(input: {
  userText: string;
  roomId?: string | null;
}): string {
  const targeted = retrieveCanonContext(input);
  if (targeted.topics.length > 0) {
    return formatCanonContextBlock(targeted);
  }
  return formatCanonContextBlock(baselineCanonContext());
}

export function buildCanonResponseHint(userText: string): string {
  const topics = detectCanonTopics(userText);
  const lines = [
    "CANON IDENTITY LAYER (mandatory):",
    "Answer only from CANON_CONTEXT for Spark Estate, rooms, Kinsey, and Shari Hudson.",
    "Canon overrides general AI assumptions.",
    "Never claim Spark Estate is a real physical location.",
    "Separate canon facts from warm story invitations.",
  ];

  if (topics.includes("estate_identity")) {
    lines.push(`Use this answer shape: ${SPARK_ESTATE_CANON_FACTS.identityAnswer}`);
  }
  if (topics.includes("estate_purpose")) {
    lines.push(`Use this answer shape: ${SPARK_ESTATE_CANON_FACTS.purposeAnswer}`);
  }
  if (topics.includes("estate_reality")) {
    lines.push(`Use this answer shape: ${SPARK_ESTATE_CANON_FACTS.realPlaceAnswer}`);
  }
  if (topics.includes("estate_location")) {
    lines.push(`Use this answer shape: ${SPARK_ESTATE_CANON_FACTS.locationAnswer}`);
  }
  if (topics.includes("estate_creator")) {
    lines.push(`Use this answer shape: ${SPARK_ESTATE_CANON_FACTS.creatorAnswer}`);
  }
  if (topics.includes("shari")) {
    lines.push(`Use this answer shape: ${SHARI_HUDSON_CANON_FACTS.identifyAnswer}`);
  }
  if (topics.includes("kinsey_picture") || topics.includes("kinsey")) {
    lines.push(`Use Kinsey's name directly: ${KINSEY_CANON_FACTS.identifyAnswer}`);
  }
  if (topics.includes("rooms")) {
    lines.push(`Use live rooms from CANON_CONTEXT.liveRooms with approved purposes only.`);
  }

  return lines.join("\n");
}

/** High-confidence canon answers — bypass invention before the LLM. */
export function tryCanonLocalReply(userText: string): string | null {
  const topics = detectCanonTopics(userText);
  if (!topics.length) return null;

  if (topics.includes("kinsey_picture")) {
    return KINSEY_CANON_FACTS.pictureAnswer;
  }

  if (topics.includes("estate_reality")) {
    return SPARK_ESTATE_CANON_FACTS.realPlaceAnswer;
  }

  if (topics.includes("estate_location")) {
    return SPARK_ESTATE_CANON_FACTS.locationAnswer;
  }

  if (topics.includes("estate_creator")) {
    return SPARK_ESTATE_CANON_FACTS.creatorAnswer;
  }

  if (topics.includes("estate_identity")) {
    return SPARK_ESTATE_CANON_FACTS.identityAnswer;
  }

  if (topics.includes("estate_purpose")) {
    return SPARK_ESTATE_CANON_FACTS.purposeAnswer;
  }

  if (topics.includes("shari")) {
    return SHARI_HUDSON_CANON_FACTS.identifyAnswer;
  }

  if (topics.includes("rooms")) {
    return formatCanonRoomsAnswer();
  }

  if (topics.includes("kinsey")) {
    return KINSEY_CANON_FACTS.identifyAnswer;
  }

  return null;
}
