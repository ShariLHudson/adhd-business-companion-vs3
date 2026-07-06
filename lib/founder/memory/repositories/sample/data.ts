import type { FounderMemoryVaultOverview } from "../../types";

const ref = (
  kind: import("../../types/links").FounderMemoryEntityKind,
  id: string,
  label: string,
) => ({ kind, id, label });

export const SAMPLE_MEMORY_VAULT: FounderMemoryVaultOverview = {
  memories: [
    {
      id: "mem-1",
      kind: "decision",
      title: "Conversation architecture freeze",
      summary: "Specs 105–131 complete — evolve from evidence only.",
      whyItMatters: "Protects the relationship product from feature churn.",
      recordedAt: "2026-06-15T10:00:00.000Z",
      tags: ["spark", "architecture", "relationship"],
      relatedRefs: [ref("decision", "dec-1", "Freeze conversation architecture")],
    },
    {
      id: "mem-2",
      kind: "milestone",
      title: "Founder Studio Phase 1 shipped",
      summary: "Private executive office at /companion/founder.",
      whyItMatters: "First dedicated founder thinking environment in Spark.",
      recordedAt: "2026-07-03T18:00:00.000Z",
      tags: ["founder-studio", "milestone"],
      relatedRefs: [ref("milestone", "ms-1", "Founder Studio launched")],
    },
  ],

  decisions: [
    {
      id: "dec-1",
      title: "Freeze conversation architecture",
      decidedAt: "2026-06-15T10:00:00.000Z",
      category: "product",
      reason:
        "Repeated redesign was costing relationship quality. Observation Mode proves what to refine.",
      supportingEvidence: [
        "Rule of Three across unrelated conversations",
        "CT-11 primary validation gate",
        "Member feedback: Spark feels like someone, not software",
      ],
      alternativesConsidered: [
        "Continue adding specs 132+",
        "Major prompt rewrite after single sessions",
        "Feature-first roadmap",
      ],
      finalDecision:
        "Freeze specs 105–131. Evolve only from evidence via Evolution Board.",
      expectedOutcome:
        "Warmer, more consistent conversations; fewer architectural regressions.",
      actualOutcome: "Observation Mode active; relationship protected.",
      status: "decided",
      related: {
        products: [ref("product-history", "ph-1", "Spark Companion")],
        research: [ref("research", "res-1", "Conversation gold standards")],
        projects: [ref("memory", "mem-1", "Architecture freeze memory")],
        reports: [ref("memory", "mem-1", "Freeze rationale")],
        people: [ref("relationship", "rel-1", "Shari — founder")],
        timeline: [ref("timeline", "tl-1", "Strategic shift recorded")],
        memories: [ref("memory", "mem-1", "Institutional memory anchor")],
      },
    },
    {
      id: "dec-2",
      title: "Founder Studio before full intelligence",
      decidedAt: "2026-07-01T14:00:00.000Z",
      category: "strategy",
      reason:
        "Executive environment must exist before SPARK/FLAME/FIRE plug in.",
      supportingEvidence: [
        "Intelligence Paradox — calm surface, deep backend",
        "Shari needs a thinking room, not another dashboard",
      ],
      alternativesConsidered: [
        "Build AI reasoning first",
        "Use member estate rooms for founder work",
        "External Notion workspace",
      ],
      finalDecision:
        "Ship Founder Studio phases: office, workspaces, FIRE, pipeline, strategy, memory.",
      expectedOutcome:
        "Shari has a private executive home inside Spark.",
      status: "decided",
      related: {
        products: [ref("product-history", "ph-2", "Founder Studio")],
        research: [],
        projects: [ref("milestone", "ms-1", "Founder Studio launch")],
        reports: [],
        people: [ref("relationship", "rel-1", "Shari — founder")],
        timeline: [ref("timeline", "tl-2", "Founder Studio launched")],
        memories: [ref("memory", "mem-2", "Founder Studio milestone")],
      },
    },
    {
      id: "dec-3",
      title: "Workshop narrative over feature tour",
      decidedAt: "2026-05-20T11:30:00.000Z",
      category: "workshop",
      reason: "Members buy transformation, not software walkthroughs.",
      supportingEvidence: [
        "Relationship Constitution passes",
        "Past workshops with story-first framing converted better",
      ],
      alternativesConsidered: [
        "Demo-heavy workshop",
        "Price-led offer",
      ],
      finalDecision: "Lead workshops with transformation arc and Spark Feeling™.",
      expectedOutcome: "Higher trust and clearer next steps for attendees.",
      status: "revisited",
      related: {
        products: [ref("idea", "idea-2", "Workshop curriculum arc")],
        research: [ref("research", "res-2", "Member transformation patterns")],
        projects: [],
        reports: [],
        people: [],
        timeline: [ref("timeline", "tl-3", "Workshop approved")],
        memories: [],
      },
    },
  ],

  lessons: [
    {
      id: "les-1",
      title: "Environment before intelligence",
      kind: "worked",
      summary: "Building the thinking room first made later AI integration obvious.",
      context: "Founder Studio phases 1–5",
      recordedAt: "2026-07-05T09:00:00.000Z",
      relatedRefs: [ref("decision", "dec-2", "Founder Studio sequencing")],
    },
    {
      id: "les-2",
      title: "Single-conversation prompt changes",
      kind: "avoid",
      summary: "One bad turn is not evidence. Rule of Three protects Spark.",
      context: "Observation Mode",
      recordedAt: "2026-06-18T16:00:00.000Z",
      relatedRefs: [ref("decision", "dec-1", "Architecture freeze")],
    },
    {
      id: "les-3",
      title: "Members feel dashboards instantly",
      kind: "failed",
      summary: "Split panels and room chrome broke the estate promise.",
      context: "Estate UI restoration",
      recordedAt: "2026-04-10T12:00:00.000Z",
      relatedRefs: [ref("insight", "ins-1", "Photograph Test")],
    },
    {
      id: "les-4",
      title: "ADHD founders need one surface",
      kind: "repeat",
      summary: "One question, one primary action — cognitive load wins.",
      context: "Universal Experience Standards",
      recordedAt: "2026-03-22T08:00:00.000Z",
      relatedRefs: [],
    },
    {
      id: "les-5",
      title: "Quiet wins compound trust",
      kind: "unexpected",
      summary: "Autosave certainty mattered more than feature announcements.",
      context: "Spec 113 Certainty",
      recordedAt: "2026-05-05T14:00:00.000Z",
      relatedRefs: [],
    },
  ],

  milestones: [
    {
      id: "ms-1",
      title: "Founder Studio launched",
      description: "Private executive office and room architecture live.",
      achievedAt: "2026-07-03T18:00:00.000Z",
      category: "product",
      relatedRefs: [ref("decision", "dec-2", "Founder Studio decision")],
    },
    {
      id: "ms-2",
      title: "Listening Rooms completed",
      description: "Estate listening experiences across key destinations.",
      achievedAt: "2026-06-28T12:00:00.000Z",
      category: "product",
      relatedRefs: [],
    },
    {
      id: "ms-3",
      title: "Executive Strategy Center shipped",
      description: "Visual thinking environment for executive decisions.",
      achievedAt: "2026-07-06T00:00:00.000Z",
      category: "product",
      relatedRefs: [ref("idea", "idea-1", "Strategy room concept")],
    },
    {
      id: "ms-4",
      title: "PostCraft integration path defined",
      description: "Architecture hooks ready; live sync future phase.",
      achievedAt: "2026-05-15T10:00:00.000Z",
      category: "integration",
      relatedRefs: [],
    },
  ],

  timeline: [
    {
      id: "tl-1",
      kind: "strategic-shift",
      title: "Conversation architecture frozen",
      summary: "Observation Mode becomes the default evolution path.",
      occurredAt: "2026-06-15T10:00:00.000Z",
      relatedRefs: [ref("decision", "dec-1", "Freeze decision")],
    },
    {
      id: "tl-2",
      kind: "feature-launched",
      title: "Founder Studio opened",
      summary: "Shari-only executive office at /companion/founder.",
      occurredAt: "2026-07-03T18:00:00.000Z",
      relatedRefs: [ref("milestone", "ms-1", "Launch milestone")],
    },
    {
      id: "tl-3",
      kind: "workshop-approved",
      title: "Transformation workshop approved",
      summary: "Story-first workshop narrative locked for next cohort.",
      occurredAt: "2026-05-20T11:30:00.000Z",
      relatedRefs: [ref("decision", "dec-3", "Workshop decision")],
    },
    {
      id: "tl-4",
      kind: "product-idea",
      title: "Decision Vault conceived",
      summary: "Institutional memory for every major company decision.",
      occurredAt: "2026-07-06T01:00:00.000Z",
      relatedRefs: [ref("idea", "idea-3", "Memory vault idea")],
    },
    {
      id: "tl-5",
      kind: "research-discovered",
      title: "Gold standards validated CT-11",
      summary: "Primary conversation test confirms relationship quality bar.",
      occurredAt: "2026-06-10T15:00:00.000Z",
      relatedRefs: [ref("research", "res-1", "Gold standards research")],
    },
    {
      id: "tl-6",
      kind: "customer-insight",
      title: "Members describe Spark as presence",
      summary: "Repeated phrase: someone not software.",
      occurredAt: "2026-05-28T09:00:00.000Z",
      relatedRefs: [ref("insight", "ins-2", "Presence insight")],
    },
    {
      id: "tl-7",
      kind: "pricing-changed",
      title: "Guild pricing reviewed",
      summary: "Value anchored to transformation, not seat count.",
      occurredAt: "2026-04-18T11:00:00.000Z",
      relatedRefs: [],
    },
    {
      id: "tl-8",
      kind: "lesson",
      title: "Estate restoration lesson logged",
      summary: "Scene hero, frosted chat — photograph test enforced.",
      occurredAt: "2026-04-10T12:00:00.000Z",
      relatedRefs: [ref("lesson", "les-3", "Dashboard lesson")],
    },
  ],

  wins: [
    {
      id: "win-1",
      title: "FIRE executive briefing live",
      summary: "Daily portfolio view on Founder home.",
      celebratedAt: "2026-07-04T10:00:00.000Z",
      relatedRefs: [],
    },
  ],

  challenges: [
    {
      id: "ch-1",
      title: "Production founder access",
      summary: "Allowlisted email required on deployed environment.",
      facedAt: "2026-07-05T20:00:00.000Z",
      resolution: "Document sign-in path for Shari emails.",
      relatedRefs: [],
    },
  ],

  ideas: [
    {
      id: "idea-1",
      title: "Executive Strategy Center",
      summary: "Boardroom-quality thinking environment inside Founder Studio.",
      capturedAt: "2026-07-01T08:00:00.000Z",
      status: "shipped",
      relatedRefs: [ref("milestone", "ms-3", "Shipped")],
    },
    {
      id: "idea-2",
      title: "Workshop curriculum arc",
      summary: "Three-chapter transformation journey per cohort.",
      capturedAt: "2026-05-01T10:00:00.000Z",
      status: "approved",
      relatedRefs: [ref("decision", "dec-3", "Workshop decision")],
    },
    {
      id: "idea-3",
      title: "Decision Vault institutional memory",
      summary: "Every major decision searchable with full reasoning chain.",
      capturedAt: "2026-07-06T01:00:00.000Z",
      status: "exploring",
      relatedRefs: [],
    },
  ],

  research: [
    {
      id: "res-1",
      title: "Conversation gold standards",
      source: "Spec 116 + CT tests",
      summary: "Reference turns for hospitality, iceberg, and voice.",
      discoveredAt: "2026-06-10T15:00:00.000Z",
      relatedRefs: [ref("timeline", "tl-5", "Research timeline event")],
    },
    {
      id: "res-2",
      title: "Member transformation patterns",
      source: "Observation Mode logs",
      summary: "Capability growth visible when Spark reduces EF load.",
      discoveredAt: "2026-05-12T11:00:00.000Z",
      relatedRefs: [],
    },
  ],

  reasoning: [
    {
      id: "rea-1",
      title: "Why memory before AI",
      question: "Should Founder remember before FLAME reasons?",
      reasoning:
        "Institutional memory is permanent infrastructure. Intelligence layers consume it.",
      conclusion: "Build Decision Vault architecture with sample data first.",
      recordedAt: "2026-07-06T01:30:00.000Z",
      relatedRefs: [ref("idea", "idea-3", "Decision Vault idea")],
    },
  ],

  revisions: [
    {
      id: "rev-1",
      title: "Knowledge Library scope",
      priorVersion: "Generic document folder",
      revisedTo: "Executive Archives for FIRE briefs",
      reason: "Separate institutional memory from daily brief archive.",
      revisedAt: "2026-07-04T09:00:00.000Z",
      relatedRefs: [],
    },
  ],

  meetings: [
    {
      id: "mtg-1",
      title: "Founder Studio phase review",
      heldAt: "2026-07-05T16:00:00.000Z",
      attendees: ["Shari"],
      summary: "Phases 1–5 complete. Memory vault is next institutional layer.",
      decisions: [ref("decision", "dec-2", "Sequencing confirmed")],
      relatedRefs: [],
    },
  ],

  journal: [
    {
      id: "jour-1",
      kind: "reflection",
      title: "Building the company archive",
      body: "Spark should remember why we chose each path — not just what we built.",
      writtenAt: "2026-07-06T02:00:00.000Z",
      relatedRefs: [ref("idea", "idea-3", "Decision Vault")],
    },
    {
      id: "jour-2",
      kind: "future-letter",
      title: "To future Shari",
      body: "If you are reading this years from now — trust the relationship product.",
      writtenAt: "2026-06-01T08:00:00.000Z",
      relatedRefs: [],
    },
  ],

  productHistory: [
    {
      id: "ph-1",
      productName: "Spark Companion",
      event: "Architecture freeze",
      summary: "Conversation specs 105–131 marked complete.",
      occurredAt: "2026-06-15T10:00:00.000Z",
      relatedRefs: [ref("decision", "dec-1", "Freeze")],
    },
    {
      id: "ph-2",
      productName: "Founder Studio",
      event: "Initial launch",
      summary: "Executive office and room system.",
      occurredAt: "2026-07-03T18:00:00.000Z",
      relatedRefs: [ref("milestone", "ms-1", "Launch")],
    },
  ],

  roadmapChanges: [
    {
      id: "rm-1",
      title: "Intelligence pipeline before live APIs",
      fromState: "Connect research APIs in phase 4",
      toState: "Plumbing + sample data only",
      reason: "Environment and memory precede automation.",
      changedAt: "2026-07-04T12:00:00.000Z",
      relatedRefs: [],
    },
  ],

  relationships: [
    {
      id: "rel-1",
      name: "Shari Hudson",
      role: "Founder",
      context: "Visual Spark Studios — product vision and relationship standard.",
      lastNotedAt: "2026-07-06T00:00:00.000Z",
      relatedRefs: [],
    },
  ],

  insights: [
    {
      id: "ins-1",
      insight: "Photograph Test — would you live here?",
      source: "Estate UI Philosophy",
      recordedAt: "2026-04-10T12:00:00.000Z",
      relatedRefs: [ref("lesson", "les-3", "Dashboard lesson")],
    },
    {
      id: "ins-2",
      insight: "Members experience Spark as presence",
      source: "Observation Mode",
      recordedAt: "2026-05-28T09:00:00.000Z",
      relatedRefs: [ref("timeline", "tl-6", "Customer insight event")],
    },
  ],

  links: [
    {
      id: "link-1",
      from: ref("decision", "dec-1", "Architecture freeze"),
      to: ref("lesson", "les-2", "Rule of Three lesson"),
      relationship: "resulted-in",
      notedAt: "2026-06-18T16:00:00.000Z",
    },
    {
      id: "link-2",
      from: ref("decision", "dec-2", "Founder Studio sequencing"),
      to: ref("milestone", "ms-1", "Founder Studio launch"),
      relationship: "resulted-in",
      notedAt: "2026-07-03T18:00:00.000Z",
    },
    {
      id: "link-3",
      from: ref("idea", "idea-3", "Decision Vault"),
      to: ref("reasoning", "rea-1", "Memory before AI"),
      relationship: "informed-by",
      notedAt: "2026-07-06T01:30:00.000Z",
    },
  ],
};
