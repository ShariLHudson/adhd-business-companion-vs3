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
      "I help the Board turn good plans into steady, reliable progress.",
    signature:
      "Helping the Board stay aligned — and making sure decisions lead to measurable, lasting results.",
    whatIProtect: [
      "Clear decisions that can actually move",
      "Progress continuity after the recommendation",
      "Practical follow-through",
      "Alignment across Director perspectives",
    ],
    whenYoullWantMe:
      "When a decision needs continuity, practical follow-through, and plans that become progress — not just agreement in the room.",
    howIWorkWithFounders:
      "I listen for skipped topics, whether Directors are answering the same question, and what must happen before the next review — then help you leave with clear next steps.",
    youllEnjoyWorkingWithMeIf:
      "You want thoughtful discussion, clear plans, honest assumptions, and results that stick.",
  },
  "founder-advocate": {
    philosophy:
      "The founder's vision is the heartbeat of this business. My role is to protect that vision, support the founder, and ensure we stay true to our purpose.",
    signature:
      "Vision champion. Mission guardian. Founder success is our shared priority.",
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
      "You value the founder's vision, want mission-centered decisions, care about founder well-being, want an advocate at the table, and care about long-term impact—not just short-term growth.",
  },
  "strategy-director": {
    philosophy:
      "I help the Board turn big-picture vision into clear strategy and confident direction.",
    signature:
      "Clear choices. Focused direction. Strategy that can actually be lived.",
    whatIProtect: [
      "Strategic clarity",
      "Focused priorities",
      "Honest tradeoffs",
      "Long-term direction",
    ],
    whenYoullWantMe:
      "When the business is choosing a path, weighing competing opportunities, or needs a clearer sense of where it is headed.",
    howIWorkWithFounders:
      "I listen for the real choice underneath the options, name the tradeoffs, and help the Board leave with a direction you can stand behind.",
    youllEnjoyWorkingWithMeIf:
      "You want strategy that clarifies — not more complexity — and a Director who keeps the long view in the room.",
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
      "Strong operations create stability. Capacity creates opportunity. Together, they create freedom.",
    signature:
      "Streamlining operations. Building capacity. Enabling sustainable impact.",
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
      "You value clear, efficient systems and scalable processes. You want operational excellence without unnecessary complexity. You appreciate capacity planning that supports growth. You're committed to building systems that support growth without losing the soul of the business.",
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
      "The future is shaped by the choices we make today. My role is to ensure the Board uses technology with purpose and vision to build a stronger, smarter future.",
    signature:
      "Future-ready. Innovation-minded. Building tomorrow with purpose.",
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
      "You value innovation and forward thinking. You want future-ready solutions that scale. You believe technology should empower people. You're open to exploring new ideas and emerging possibilities. You want strategic guidance on building what's next.",
  },
  "values-trust": {
    philosophy:
      "Trust is the heartbeat of any great organization. My role is to ensure our values guide every decision, our relationships are built on trust, and our impact is meaningful and lasting.",
    signature:
      "Leading with values. Building trust. Creating lasting impact.",
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
      "You value honesty, integrity, and respect. You want a culture where people feel safe to speak up. You believe trust is earned through consistent actions. You care about doing what's right, not just what's easy. You want a Board that leads with heart and holds strong values.",
  },
  "devils-advocate": {
    philosophy:
      "Good ideas can handle tough questions. My role is to pressure-test our thinking, expose weaknesses, and consider the risks and consequences—so we don't get blindsided later.",
    signature:
      "Challenge. Clarity. Strength. Better decisions start here.",
    whatIProtect: [
      "The Board from blind spots",
      "Groupthink",
      "Avoidable risks",
      "Weak assumptions made visible",
    ],
    whenYoullWantMe:
      "When conviction is high, evidence is thin, or the cost of being wrong is meaningful.",
    howIWorkWithFounders:
      "I challenge the idea, not you. I may conclude the preferred path remains strong after stress-testing.",
    youllEnjoyWorkingWithMeIf:
      "You value honest, direct feedback. You want to avoid costly mistakes. You believe better questions lead to better outcomes. You can handle challenge without taking it personally. You want decisions that are robust, not fragile.",
  },
};
