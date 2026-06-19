/**
 * Decision Compass V2.1 — synthesize user answers into companion observations.
 * Reports should demonstrate understanding, not replay transcripts.
 */

const FIRST_PERSON_RE =
  /\b(i|i'm|i've|i'd|i'll|me|my|mine)\b/i;

const FRAGMENT_RE =
  /^[a-z].{0,12}$|^(because|and|but|so)\s/i;

export function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").trim();
}

export function containsFirstPerson(text: string): boolean {
  return FIRST_PERSON_RE.test(text);
}

export function looksLikeRawFragment(text: string): boolean {
  const t = stripMarkdown(text);
  if (!t) return true;
  if (FRAGMENT_RE.test(t)) return true;
  if (t.length < 18 && !t.includes(" ")) return true;
  return false;
}

function normalize(text: string): string {
  return stripMarkdown(text).replace(/\s+/g, " ").trim();
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ensurePeriod(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Pattern-based concern synthesis — maps common raw phrases to observations. */
export function synthesizeConcern(raw: string): string {
  const t = normalize(raw).toLowerCase();
  if (!t) return "";

  if (/\b(don'?t like|hate|dislike)\b.*\bsales\b|\bsales\b.*\b(drain|energy|hate)\b/.test(t)) {
    return "A recurring theme throughout the discussion was that sales activities appear to drain energy and pull attention away from work that feels more natural, rewarding, and sustainable.";
  }
  if (/\bsuck at\b|\bbad at\b|\bnot good at\b|\bstruggle with\b/.test(t)) {
    return "The discussion suggests there is limited confidence and enjoyment around continuing to handle this responsibility personally.";
  }
  if (/\bdon'?t know how much\b.*\bcost\b|\bcost\b.*\b(don'?t know|uncertain|unsure)\b|\buncertain.*\bcost\b/.test(t)) {
    return "The primary reason for hesitation appears to be uncertainty around cost, structure, and implementation rather than a strong desire to continue managing this directly.";
  }
  if (/\bwould rather\b.*\b(create|building|making)\b|\brather be\b.*\b(create|building)\b/.test(t)) {
    return "The conversation suggests a strong preference for spending time on creative, generative work rather than activities that feel misaligned with natural strengths.";
  }
  if (/\bcost\b/.test(t) && /\b(understand|explain|communicate|sell)\b/.test(t)) {
    return "The most significant concerns appear to be the financial investment required and whether another person could accurately communicate the value and uniqueness of the business.";
  }
  if (/\bcost\b/.test(t)) {
    return "Financial investment and ongoing expense emerged as an important concern worth weighing carefully.";
  }
  if (/\b(burnout|overwhelm|exhaust|tired|stress)\b/.test(t)) {
    return "Sustainability and personal capacity appear to be a meaningful factor — the current approach may be difficult to maintain long-term.";
  }
  if (/\b(time|hours|bandwidth|capacity)\b/.test(t)) {
    return "Available time and energy emerged as a constraint that shapes how realistic each path feels.";
  }
  if (/\b(trust|control|quality|standards)\b/.test(t)) {
    return "Questions about quality, control, and whether someone else could represent the work well surfaced as a meaningful hesitation.";
  }

  return genericObservation("concern", raw);
}

export function synthesizeMotivation(raw: string): string {
  const t = normalize(raw).toLowerCase();
  if (!t) return "";

  if (/\b(freedom|time back|less time)\b/.test(t)) {
    return "More freedom and reclaimed time emerged as a meaningful pull toward this direction.";
  }
  if (/\b(growth|scale|revenue|income)\b/.test(t)) {
    return "Business growth and the potential to scale beyond current limits appeared important in the discussion.";
  }
  if (/\b(create|building|making|content|product)\b/.test(t)) {
    return "The conversation suggests a desire to spend more time on creative, high-value work that aligns with natural strengths.";
  }
  if (/\b(save money|cheaper|budget|afford)\b/.test(t)) {
    return "Keeping costs manageable and protecting cash flow appeared to weigh in favor of the more conservative path.";
  }

  return genericObservation("motivation", raw);
}

export function synthesizeAdvantage(
  raw: string,
  recommendedLabel?: string,
): string {
  const t = normalize(raw).toLowerCase();
  if (!t) return "";

  if (/\b(don'?t like|hate|dislike)\b.*\bsales\b/.test(t)) {
    return "Delegating sales responsibilities could create more time and energy for work that aligns with your strengths and interests.";
  }
  if (/\b(create|creating|building)\b/.test(t)) {
    return "One potential benefit is the ability to spend more time developing ideas, creating content, building products, and focusing on high-value activities.";
  }
  if (/\b(save money|cheaper|budget|afford)\b/.test(t)) {
    return "Keeping costs manageable and protecting cash flow may be a meaningful advantage of the more conservative path.";
  }
  if (/\b(freedom|time)\b/.test(t)) {
    return "This direction may create more bandwidth for strategic and creative work rather than operational tasks.";
  }
  if (/\b(growth|scale)\b/.test(t)) {
    return "The evidence currently points toward meaningful growth potential if this path is executed well.";
  }
  if (recommendedLabel && t.includes(recommendedLabel.toLowerCase().slice(0, 8))) {
    return `Choosing **${recommendedLabel}** appears to align with several of the priorities discussed.`;
  }

  const obs = genericObservation("advantage", raw);
  if (obs && !containsFirstPerson(obs)) return obs;
  return "This path appears to offer meaningful upside based on the priorities discussed.";
}

export function synthesizeWhatWeNotice(input: {
  decision: string;
  optionA: string;
  optionB: string;
  motivationCount: number;
  concernCount: number;
  dimensions: string[];
}): string[] {
  const items: string[] = [];
  const decision = normalize(input.decision);

  if (decision) {
    if (/\bhire\b.*\bsales\b|\bsales\b.*\b(hire|myself)\b/i.test(decision)) {
      items.push(
        "You're exploring whether bringing in sales support would create more freedom and growth than continuing to manage sales yourself.",
      );
    } else if (/\bor\b/i.test(decision)) {
      items.push(
        `The conversation centers on a meaningful tradeoff between **${input.optionA}** and **${input.optionB}**.`,
      );
    } else {
      items.push(
        `The discussion focuses on clarifying the best path forward around **${decision}**.`,
      );
    }
  } else if (input.optionA && input.optionB) {
    items.push(
      `Two distinct paths are on the table: **${input.optionA}** and **${input.optionB}**.`,
    );
  }

  if (input.motivationCount > 0) {
    items.push(
      "Several motivations and priorities surfaced — not all of them point in the same direction.",
    );
  }

  if (input.dimensions.length) {
    items.push(
      `Multiple dimensions were considered, including ${input.dimensions.slice(0, 3).join(", ")}.`,
    );
  }

  if (input.concernCount > 0) {
    items.push(
      `${input.concernCount} concern${input.concernCount > 1 ? "s" : ""} deserve attention alongside the potential upside.`,
    );
  }

  return items;
}

const COMPANION_QUESTIONS = [
  "What would success look like six months after making this decision?",
  "What would need to happen for this investment to feel worthwhile?",
  "Is there a way to test this idea before making a larger commitment?",
  "What information would make this decision easier?",
  "What is the risk of maintaining the current approach?",
  "What assumption are you making that might be worth testing first?",
  "What would Future You want you to prioritize?",
];

export function synthesizeQuestions(
  dimensions: string[],
  hasCostConcern: boolean,
  existing: string[] = [],
): string[] {
  const asked = new Set(existing.map(normalize));
  const out: string[] = [];

  if (hasCostConcern) {
    const q =
      "What would need to be true for the financial investment to feel justified?";
    if (!asked.has(q)) out.push(q);
  }
  if (dimensions.includes("Stress and sustainability")) {
    const q =
      "Can you sustain this direction for the next 90 days without burning out?";
    if (!asked.has(q)) out.push(q);
  }
  if (dimensions.includes("Business growth")) {
    const q =
      "Does this direction actually move the business — or mainly feel productive?";
    if (!asked.has(q)) out.push(q);
  }

  for (const q of COMPANION_QUESTIONS) {
    if (out.length >= 5) break;
    if (!asked.has(q)) out.push(q);
  }

  return out.slice(0, 5);
}

export function synthesizeAlternativePaths(input: {
  optionA: string;
  optionB: string;
  recommendedChoice: string;
  recommendedLabel: string;
  otherLabel: string;
}): string[] {
  const choice = input.recommendedChoice.toLowerCase();
  const paths: string[] = [];

  if (/\bhire\b.*\bsales\b|\bsalesperson\b|\bsales rep\b/.test(choice)) {
    paths.push(
      "Start with a commission-only arrangement before committing to a full hire",
      "Bring in part-time support while you document the sales process",
      "Outsource lead generation while you handle closing conversations",
      "Test demand with a small pilot before expanding the team",
      "Delay the hire until the offer and process are clearly documented",
    );
  } else if (/\bmyself|diy|keep doing|solo\b/.test(choice)) {
    paths.push(
      "Batch sales into focused weekly blocks instead of constant context-switching",
      "Hire fractional help for admin only while you keep relationship sales",
      "Automate one repeatable step before revisiting a larger hire",
      "Track time on sales for two weeks, then revisit with real data",
    );
  } else {
    paths.push(
      `Pilot **${input.recommendedLabel}** at a smaller scale before going all-in`,
      `Keep **${input.otherLabel}** while gathering one more decisive data point`,
      "Set a review date in two weeks with a clear success metric",
      "Blend both paths with a time-boxed experiment",
    );
  }

  return paths;
}

export function synthesizeOverallSummary(
  choice: string,
  headline: string,
  rawSummary: string,
): string {
  const base = normalize(rawSummary);
  if (containsFirstPerson(base) || looksLikeRawFragment(base)) {
    return ensurePeriod(
      `Based on the information available so far, **${choice}** appears to align more closely with the priorities and tradeoffs discussed (${headline.toLowerCase()}).`,
    );
  }
  if (!/^based on/i.test(base)) {
    return ensurePeriod(
      `Based on the information available so far, ${base.charAt(0).toLowerCase()}${base.slice(1)}`,
    );
  }
  return ensurePeriod(base);
}

function genericObservation(
  kind: "concern" | "motivation" | "advantage",
  raw: string,
): string {
  let t = normalize(raw);
  t = t.replace(/^because\s+/i, "");
  t = t.replace(/\bi\b/gi, "you");
  t = t.replace(/\bmy\b/gi, "your");
  t = t.replace(/\bme\b/gi, "you");
  t = t.replace(/\s+/g, " ").trim();
  if (!t) return "";

  const prefixes: Record<typeof kind, string> = {
    concern: "An important concern that emerged:",
    motivation: "A recurring theme in the discussion:",
    advantage: "One potential benefit to consider:",
  };

  const body = capitalize(t);
  if (body.length < 20) return "";
  return ensurePeriod(`${prefixes[kind]} ${body}`);
}

/** Test helper — report should not contain verbatim user phrases. */
export function reportContainsRawUserPhrase(
  reportBlob: string,
  userPhrases: string[],
): string | null {
  const blob = reportBlob.toLowerCase();
  for (const phrase of userPhrases) {
    const p = phrase.trim().toLowerCase();
    if (p.length >= 8 && blob.includes(p)) return phrase;
  }
  return null;
}

export function reportUsesSecondPersonVoice(reportBlob: string): boolean {
  return /\byou\b|\byour\b/i.test(reportBlob);
}
