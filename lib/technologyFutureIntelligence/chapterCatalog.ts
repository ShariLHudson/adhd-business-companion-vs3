import type { TechFutureChapter } from "./types";

/** Compact catalog — prefer deeper TF-AI / TF-AUTO / TF-KM when both match. */
export const TECH_FUTURE_CHAPTERS: readonly TechFutureChapter[] = [
  {
    id: "TF-001",
    title: "Need new tech or chasing shiny objects?",
    topic: "shiny_object",
    offerHint:
      "Name the outcome first. Prefer keeping what works. Do not recommend a new tool by default.",
  },
  {
    id: "TF-002",
    title: "How many software programs are too many?",
    topic: "tool_count",
    offerHint:
      "Count maintenance cost and context-switching. Fewer tools with clear jobs usually win.",
  },
  {
    id: "TF-003",
    title: "Should I build my own app?",
    topic: "build_vs_buy",
    offerHint:
      "Build only when the problem is unique and you can maintain it. Default to buy/adapt.",
  },
  {
    id: "TF-004",
    title: "Will AI actually save me time?",
    topic: "ai_time",
    offerHint:
      "Measure before/after. AI helps drafting and sorting — not skipping judgment or review.",
  },
  {
    id: "TF-AI-001",
    title: "What should I use AI for in my business?",
    topic: "ai_time",
    offerHint:
      "Use AI for drafts, summaries, and options. Keep decisions, relationships, and final send human-owned.",
  },
  {
    id: "TF-AI-002",
    title: "Tasks that should never go fully to AI",
    topic: "ai_time",
    offerHint:
      "Never fully hand off pricing, legal, sensitive client care, or irreversible sends.",
  },
  {
    id: "TF-AI-004",
    title: "What never to put into an AI tool",
    topic: "ai_time",
    offerHint:
      "Keep secrets, client PII, and credentials out of tools unless the member has a clear policy.",
  },
  {
    id: "TF-AI-008",
    title: "Keep AI from becoming procrastination",
    topic: "ai_time",
    offerHint:
      "One small real-world next step beats more prompting. Cap research loops.",
  },
  {
    id: "TF-007",
    title: "Do I really need a CRM?",
    topic: "crm",
    offerHint:
      "Ask what customer-management problem exists. A CRM is optional — not a status symbol.",
  },
  {
    id: "TF-008",
    title: "Choosing between software programs",
    topic: "choose_software",
    offerHint:
      "Score fit to today’s workflow, switching cost, and who will maintain it — not feature lists.",
  },
  {
    id: "TF-010",
    title: "Is it time to replace current software?",
    topic: "switch_replace",
    offerHint:
      "Replace only when the current tool blocks a real outcome and migration cost is paid for.",
  },
  {
    id: "TF-011",
    title: "Overwhelmed by technology — where to start",
    topic: "tech_overwhelm",
    offerHint:
      "One system, one job. Stabilize the source of truth before adding anything new.",
  },
  {
    id: "TF-012",
    title: "Am I solving the right problem?",
    topic: "right_problem",
    offerHint:
      "Restate the business outcome before any tool. Wrong problem → shiny tooling.",
  },
  {
    id: "TF-013",
    title: "Should all software be connected?",
    topic: "integrations",
    offerHint:
      "Connect only high-value, reliable paths. Manual is often smarter for rare fragile steps.",
  },
  {
    id: "TF-AUTO-001",
    title: "Is an automation ready to build?",
    topic: "automation_ready",
    offerHint:
      "Automate after the process is stable, owned, and failure-safe — not to escape confusion.",
  },
  {
    id: "TF-AUTO-012",
    title: "When manual work is smarter",
    topic: "manual_smarter",
    offerHint:
      "Prefer manual for low-volume, high-risk, or frequently changing steps.",
  },
  {
    id: "TF-014",
    title: "Source of truth in my business",
    topic: "source_of_truth",
    offerHint:
      "Pick one home for each critical fact. Duplicates create ADHD maintenance drag.",
  },
  {
    id: "TF-KM-001",
    title: "Where to keep files, notes, tasks, knowledge",
    topic: "knowledge_home",
    offerHint:
      "One calm home per kind of information. Search + light structure over complex folders.",
  },
  {
    id: "TF-005",
    title: "Is this business idea worth building?",
    topic: "right_problem",
    offerHint:
      "Test demand and delivery cost before tooling the idea.",
  },
  {
    id: "TF-006",
    title: "Why does my business feel scattered?",
    topic: "tool_count",
    offerHint:
      "Scatter is often too many half-used tools. Consolidate before adding.",
  },
  {
    id: "TF-009",
    title: "Why tech feels more complicated every year",
    topic: "tool_count",
    offerHint:
      "Complexity compounds from unused features and weak ownership. Simplify deliberately.",
  },
] as const;

export function getTechFutureChapter(
  id: string,
): TechFutureChapter | undefined {
  return TECH_FUTURE_CHAPTERS.find((c) => c.id === id);
}
