/**
 * Profile narrative fields for Board Directors (accordion + static panels).
 * Merged into BOARD_DIRECTORS — never hardcode in UI components.
 */

import type { BoardDirectorId } from "@/lib/board/types";

export type BoardDirectorNarrative = {
  philosophy: string;
  signature: string;
  whatIProtect: string[];
  whenYoullWantMe: string;
  howIWorkWithFounders: string;
  youllEnjoyWorkingWithMeIf: string;
};

export const BOARD_DIRECTOR_NARRATIVES: Record<
  BoardDirectorId,
  BoardDirectorNarrative
> = {
  "board-chair": {
    philosophy:
      "A strong decision protects both today’s opportunity and tomorrow’s stability.",
    signature: "Helping founders build businesses worth keeping.",
    whatIProtect: [
      "Long-term business strength",
      "Clear Board alignment before commitment",
      "A usable recommendation — not a pile of opinions",
      "Tomorrow’s stability when today feels urgent",
    ],
    whenYoullWantMe:
      "When a decision carries lasting consequences, several perspectives matter, and you need calm clarity before you choose.",
    howIWorkWithFounders:
      "I help the Board stay focused on long-term success. I clarify the real decision, surface agreement and disagreement, and leave you with a clear recommendation — without making the choice for you.",
    youllEnjoyWorkingWithMeIf:
      "You want wisdom over hurry, and a Chair who protects both today’s opportunity and tomorrow’s stability.",
  },
  "vice-chair": {
    philosophy:
      "Clarity grows when every important voice has been heard — and the unresolved questions are named.",
    signature:
      "Helping the Board stay aligned from first question to final recommendation.",
    whatIProtect: [
      "The integrity of the Board process",
      "Unresolved questions that would otherwise hide",
      "Follow-through after the recommendation",
    ],
    whenYoullWantMe:
      "Complex decisions with many moving parts, or when a prior discussion left open loops.",
    howIWorkWithFounders:
      "I listen for skipped topics, whether Directors are answering the same question, and what must happen before the next review.",
    youllEnjoyWorkingWithMeIf:
      "You want someone who notices the gaps without drowning you in process.",
  },
  "founder-advocate": {
    philosophy:
      "A successful business should never cost you the life you hoped it would create.",
    signature:
      "Protecting vision, capacity, and values — even when that means disagreeing with the preferred option.",
    whatIProtect: [
      "Founder vision fit",
      "Personal capacity and quality of life",
      "Values that define the business",
      "Right-sized growth",
    ],
    whenYoullWantMe:
      "When growth looks attractive but may ask more of you than the business can return — or when the decision may drift from the business you want.",
    howIWorkWithFounders:
      "I am on your side without colluding. I ask whether this still fits the life and business you want to keep.",
    youllEnjoyWorkingWithMeIf:
      "You want honesty about capacity and mission, not cheerleading for every opportunity.",
  },
  "financial-stewardship": {
    philosophy:
      "Sustainable growth is always better than impressive growth.",
    signature:
      "Testing affordability, exposure, and the smallest responsible financial test.",
    whatIProtect: [
      "Cash flow and downside exposure",
      "Honest revenue assumptions",
      "Proportionate investment",
      "Financial resilience",
    ],
    whenYoullWantMe:
      "Investment, pricing, hiring, or any commitment with meaningful financial downside.",
    howIWorkWithFounders:
      "I stay calm and practical. I ask what we can afford, what we assume, and what smallest test still tells the truth.",
    youllEnjoyWorkingWithMeIf:
      "You prefer grounded numbers over optimistic narratives.",
  },
  "operations-capacity": {
    philosophy:
      "Great ideas succeed because someone can actually deliver them.",
    signature:
      "Testing whether the business can carry the work — not only whether the idea sounds good.",
    whatIProtect: [
      "Delivery realism",
      "Workload and capacity",
      "Dependencies and bottlenecks",
      "Sustainable scope",
    ],
    whenYoullWantMe:
      "When a decision adds work, timeline pressure, or new dependencies to an already full plate.",
    howIWorkWithFounders:
      "I ask what this adds, what must be ready first, and where the plan is likely to break under real workload.",
    youllEnjoyWorkingWithMeIf:
      "You want execution honesty before commitment.",
  },
  "customer-market": {
    philosophy: "Customers decide whether our ideas matter.",
    signature:
      "Bringing customer and market reality into the room before the decision is made.",
    whatIProtect: [
      "Genuine demand",
      "Evidence quality",
      "Value clarity",
      "Customer trust",
    ],
    whenYoullWantMe:
      "Audience changes, offer shifts, positioning bets, or anything that rests on what customers will actually do.",
    howIWorkWithFounders:
      "I ask for evidence of demand, friction that may stop a buy, and how trust could be affected.",
    youllEnjoyWorkingWithMeIf:
      "You want the customer’s voice present before you build or spend.",
  },
  "growth-opportunity": {
    philosophy:
      "Every decision either opens or closes tomorrow’s opportunities.",
    signature:
      "Looking for durable upside without mistaking motion for progress.",
    whatIProtect: [
      "Long-term optionality",
      "Scalable possibilities",
      "Opportunity cost of saying yes",
      "Growth that compounds",
    ],
    whenYoullWantMe:
      "When you are choosing between paths and want to see which keeps future doors open.",
    howIWorkWithFounders:
      "I explore opportunity with discipline — what grows, what it costs, and what it quietly closes.",
    youllEnjoyWorkingWithMeIf:
      "You want optimistic thinking that still respects reality.",
  },
  "risk-resilience": {
    philosophy:
      "Confidence grows when risks are understood instead of ignored.",
    signature:
      "Naming vulnerabilities early and preparing sensible safeguards.",
    whatIProtect: [
      "Early risk visibility",
      "Resilience under stress",
      "Recoverability",
      "Proportionate safeguards",
    ],
    whenYoullWantMe:
      "Launches, partnerships, commitments, or any decision where failure would be costly to unwind.",
    howIWorkWithFounders:
      "I stay composed. I name what could go wrong and what would keep the business steady if it does.",
    youllEnjoyWorkingWithMeIf:
      "You prefer preparedness over surprise.",
  },
  "technology-future": {
    philosophy:
      "Build for where the world is going, not where it has been.",
    signature:
      "Asking whether this decision stays wise as technology and markets change.",
    whatIProtect: [
      "Future readiness",
      "Avoidable lock-in",
      "Durable approaches",
      "Technology that strengthens the plan",
    ],
    whenYoullWantMe:
      "Automation, platforms, tooling bets, or decisions that create long technical dependence.",
    howIWorkWithFounders:
      "I speak plainly about what strengthens the plan later — and what may quietly trap it.",
    youllEnjoyWorkingWithMeIf:
      "You want forward-looking counsel without hype.",
  },
  "values-trust": {
    philosophy: "Reputation is earned one decision at a time.",
    signature:
      "Protecting integrity, promises, and the trust your business is building.",
    whatIProtect: [
      "Values alignment",
      "Honesty of claims",
      "Customer and community trust",
      "Promises the business is making",
    ],
    whenYoullWantMe:
      "Growth tactics, claims, partnerships, or any choice that could stretch what you stand for.",
    howIWorkWithFounders:
      "I ask whether this keeps the promises your business makes — warmly, and firmly when needed.",
    youllEnjoyWorkingWithMeIf:
      "You care as much about how you grow as how fast.",
  },
  "devils-advocate": {
    philosophy: "The strongest ideas survive honest questions.",
    signature:
      "Testing the preferred option before the real world does — respectfully and specifically.",
    whatIProtect: [
      "Weak assumptions made visible",
      "Confirmation bias challenged",
      "The strongest opposing case heard",
      "Smaller tests that reduce uncertainty",
    ],
    whenYoullWantMe:
      "When conviction is high, evidence is thin, or the cost of being wrong is meaningful.",
    howIWorkWithFounders:
      "I challenge the idea, not you. I may conclude the preferred path remains strong after stress-testing.",
    youllEnjoyWorkingWithMeIf:
      "You want your thinking strengthened, not merely affirmed.",
  },
};
