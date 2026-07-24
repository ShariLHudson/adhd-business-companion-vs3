/**
 * Wisdom selection — what should distinguish this answer from a generic AI reply.
 * Must not invent personal history, results, or unsupported expertise.
 */

import type { ShariResponseDecision } from "./types";
import type { ShariProfessionalRole } from "./professionalRoles";
import type { ResolvedShariContext } from "./contextResolver";
import type { ShariReasoningPlan } from "./reasoningPlan";
import type { ShariConversationThread } from "./conversationContinuity";

export type ShariWisdomPlan = {
  keyJudgment?: string;
  highestLeverageInsight?: string;
  importantTradeoffs: string[];
  likelyBlindSpots: string[];
  likelyMistakes: string[];
  usefulHeuristics: string[];
  practicalShortcuts: string[];
  personalizedImplications: string[];
  confidence: number;
  uncertainty: string[];
};

/**
 * Build a wisdom plan from goal, role, context, and reasoning — no invented biography.
 */
export function buildShariWisdomPlan(input: {
  decision: ShariResponseDecision;
  primaryRole: ShariProfessionalRole;
  context: ResolvedShariContext;
  reasoningPlan: ShariReasoningPlan;
  thread?: ShariConversationThread | null;
}): ShariWisdomPlan {
  const { decision, primaryRole, context, reasoningPlan, thread } = input;
  const t = decision.rawRequest.toLowerCase();
  const products = context.knownProducts.slice(0, 5);
  const productPhrase = products.length
    ? products
        .map((p) => p.split(/[,·|]/)[0]?.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join(", ")
    : null;

  const importantTradeoffs: string[] = [];
  const likelyBlindSpots: string[] = [];
  const likelyMistakes: string[] = [];
  const usefulHeuristics: string[] = [];
  const practicalShortcuts: string[] = [];
  const personalizedImplications: string[] = [];
  const uncertainty: string[] = [...reasoningPlan.uncertaintyNotes];

  let keyJudgment: string | undefined;
  let highestLeverageInsight: string | undefined;

  // Booth / craft fair
  if (/\b(?:booth|vendor|craft fair|table display)\b/.test(t)) {
    highestLeverageInsight =
      "A successful booth works like a small store: shoppers should understand what you sell within three to five seconds.";
    likelyMistakes.push(
      "Spreading every product type in flat equal rows so nothing becomes the hero.",
    );
    usefulHeuristics.push(
      "One clear hero zone at eye level beats a busy grid of everything.",
    );
    practicalShortcuts.push(
      "Sketch zones before packing: hero, browse, checkout, takeaway.",
    );
    if (productPhrase) {
      personalizedImplications.push(
        `Because you sell ${productPhrase}, group into themed gift collections rather than one row per product type.`,
      );
      keyJudgment =
        "Organize around gift moments and touchable samples, not SKU categories.";
    } else {
      uncertainty.push(
        "Product mix not confirmed — using general craft-vendor layout principles.",
      );
      keyJudgment =
        "Lead with one clear story of what you sell, then supporting pieces.";
    }
    if (thread?.corrections?.length) {
      personalizedImplications.push(
        `Honor their correction: ${thread.corrections[thread.corrections.length - 1]}`,
      );
    }
  }

  // Loom / video
  if (/\b(?:loom|screen record|record a video)\b/.test(t)) {
    highestLeverageInsight =
      "Viewers decide in the first five seconds whether this is worth watching — open with the promise, not the setup.";
    likelyMistakes.push(
      "Starting with a long hello or explaining the tool instead of showing the path.",
    );
    practicalShortcuts.push(
      "Script as: promise → show one path → one clear next step; trim the first two seconds.",
    );
    usefulHeuristics.push("If you cannot say the point in one sentence, the Loom is too broad.");
    if (/\bspark estate|companion\b/.test(t) || thread?.topicKeywords.some((k) => /spark|estate|loom/.test(k))) {
      personalizedImplications.push(
        "For Spark Estate demos, show the living place and glass conversation first — never dashboard language.",
      );
    }
    keyJudgment = "Teach the full beginner path once; adapt purpose on the follow-up turn.";
  }

  // Money / event advice
  if (
    /\b(?:\$\d+|should i (?:pay|spend|buy)|is it worth|worth (?:it|paying))\b/.test(
      t,
    )
  ) {
    highestLeverageInsight =
      "Price alone is incomplete — break-even needs average sale, conversion, lead value, and energy cost.";
    importantTradeoffs.push(
      "Cash break-even vs lead/brand value vs energy drain for the day.",
    );
    likelyBlindSpots.push(
      "Ignoring follow-up capacity after the event.",
    );
    usefulHeuristics.push(
      "If you cannot name a rough break-even units number, the decision is still foggy.",
    );
    keyJudgment =
      "Give a conditional recommendation with the one missing fact that would tip it.";
    if (productPhrase) {
      personalizedImplications.push(
        `Anchor estimates to what you actually sell (${productPhrase}) rather than generic booth math.`,
      );
    }
  }

  // Facebook groups
  if (/\bfacebook groups?\b/.test(t)) {
    highestLeverageInsight =
      "Search language should match how people describe their problem or identity — not only your product category.";
    likelyMistakes.push("Joining quiet groups or posting a pitch on day one.");
    practicalShortcuts.push(
      "Filter for recent posts and clear rules before you invest time.",
    );
    if (context.knownAudience) {
      personalizedImplications.push(
        `Aim search phrases at: ${context.knownAudience.slice(0, 120)}.`,
      );
    }
    if (decision.currentResearchRequired) {
      uncertainty.push(
        "Live group lists need current research — do not invent active group names.",
      );
    }
    keyJudgment = "Teach the method first; current lists only when research can be honest.";
  }

  // Strategic plan education
  if (/\bstrategic plan\b/.test(t) && !decision.explicitCreationRequested) {
    highestLeverageInsight =
      "A usable strategic plan is a short set of choices — not a binder of aspirational goals.";
    likelyMistakes.push("Writing a long document before choosing 1–3 priorities.");
    usefulHeuristics.push(
      "If it does not change what you say no to this quarter, it is not strategy yet.",
    );
    keyJudgment = "Teach the skeleton in chat; create a formal plan only if they ask.";
  }

  // Overwhelm / coaching
  if (primaryRole === "coach" || decision.primaryHelpMode === "reflective_thinking") {
    highestLeverageInsight =
      "When everything feels urgent, the kindest move is shrinking the field — not adding a better list.";
    likelyMistakes.push("Handing a ten-step productivity system to someone who cannot start.");
    usefulHeuristics.push("One next breath-sized step beats a perfect plan.");
    keyJudgment = "Reflect, reduce load, one question — shift to teaching when they ask for steps.";
    if (context.relevantContextKeys.some((k) => /priority|milestone/i.test(k))) {
      personalizedImplications.push(
        "Gently connect to their known current priority without turning it into a task dump.",
      );
    }
  }

  // QR troubleshooting
  if (/\bqr\b/.test(t)) {
    highestLeverageInsight =
      "Most QR failures are print contrast, distance, or URL destination — not mysterious tech.";
    likelyMistakes.push("Testing only on your own phone that already has the page cached.");
    practicalShortcuts.push(
      "Check: URL opens in a private/incognito window → print size/contrast → camera distance.");
    keyJudgment = "Ordered checks fastest-first; adapt to what they report.";
  }

  // Comparison
  if (decision.primaryHelpMode === "comparison") {
    highestLeverageInsight =
      "Comparisons help when they end in a lean — criteria without a conclusion leave the decision heavier.";
    importantTradeoffs.push("Depth vs simplicity; reach vs intimacy; prep time vs polish.");
    keyJudgment = "Name when each option fits, then a conditional lean.";
  }

  // Defaults when nothing topic-matched
  if (!highestLeverageInsight) {
    if (primaryRole === "teacher") {
      highestLeverageInsight =
        "Beginners need the whole path once — not a menu of areas to explore first.";
    } else if (primaryRole === "advisor") {
      highestLeverageInsight =
        "Advice without a recommendation is unfinished; preserve their agency after you lean.";
    } else {
      highestLeverageInsight =
        "Lead with the most useful principle for this request, then make it actionable.";
    }
  }
  if (!keyJudgment) {
    keyJudgment = reasoningPlan.whatMustBeIncluded[0] ?? "Be useful before asking.";
  }

  if (context.assumptions.length) {
    uncertainty.push(...context.assumptions.slice(0, 2));
  }

  const confidence = Math.min(
    0.95,
    (decision.confidence + (context.knownContextAvailable ? context.contextConfidence : 0.5)) /
      2,
  );

  return {
    keyJudgment,
    highestLeverageInsight,
    importantTradeoffs: importantTradeoffs.slice(0, 4),
    likelyBlindSpots: likelyBlindSpots.slice(0, 4),
    likelyMistakes: likelyMistakes.slice(0, 4),
    usefulHeuristics: usefulHeuristics.slice(0, 4),
    practicalShortcuts: practicalShortcuts.slice(0, 4),
    personalizedImplications: personalizedImplications.slice(0, 4),
    confidence,
    uncertainty: uncertainty.slice(0, 4),
  };
}
