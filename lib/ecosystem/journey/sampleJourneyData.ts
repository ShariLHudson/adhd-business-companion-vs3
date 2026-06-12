// Founder Ecosystem — Phase 9 sample journey data.
// Five small event streams, one per business stage, so tests and UI can verify
// stage detection end to end. Deterministic. Pure.

import type { FounderEvent } from "../events";
import type { BusinessStage } from "./journeyTypes";
import type { BusinessProfileInput } from "./founderJourneyEngine";

let seq = 0;
function mk(
  founderId: string,
  type: FounderEvent["type"],
  text: string,
  dayOffset: number,
  refs?: FounderEvent["refs"],
): FounderEvent {
  const d = new Date("2026-06-01T09:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + dayOffset);
  return {
    id: `j${++seq}`,
    founderId,
    type,
    ts: d.toISOString(),
    refs,
    data: { text, title: text },
  };
}

export type JourneySample = {
  stage: BusinessStage;
  founderId: string;
  events: FounderEvent[];
  profile?: BusinessProfileInput;
};

export function sampleJourneySamples(): JourneySample[] {
  return [
    {
      stage: "idea",
      founderId: "founder-idea",
      events: [
        mk("founder-idea", "chat.coaching", "I'm exploring an idea for a coaching business", 0),
        mk("founder-idea", "chat.coaching", "Trying to validate the concept with a few people", 1),
        mk("founder-idea", "note.captured", "Brainstorm offers people might want", 1),
        mk("founder-idea", "chat.coaching", "Still figuring out what to build", 2),
      ],
    },
    {
      stage: "building",
      founderId: "founder-building",
      events: [
        mk("founder-building", "project.created", "Building the product", 0, { projectId: "p-build" }),
        mk("founder-building", "chat.coaching", "Working on building the website", 1, { projectId: "p-build" }),
        mk("founder-building", "chat.coaching", "Creating content and a draft SOP", 2, { projectId: "p-build" }),
        mk("founder-building", "chat.coaching", "Setting up the systems to deliver", 3, { projectId: "p-build" }),
      ],
      profile: { hasProduct: true },
    },
    {
      stage: "launching",
      founderId: "founder-launching",
      events: [
        mk("founder-launching", "chat.coaching", "Ready to launch the funnel", 0, { projectId: "p-launch" }),
        mk("founder-launching", "chat.coaching", "Working to generate leads and grow my audience", 1, { projectId: "p-launch" }),
        mk("founder-launching", "chat.coaching", "Pushing for the first sale this week", 2, { projectId: "p-launch" }),
        mk("founder-launching", "document.exported", "Launch campaign one-pager", 2, { projectId: "p-launch", documentId: "d1" }),
      ],
      profile: { hasAudience: true },
    },
    {
      stage: "growing",
      founderId: "founder-growing",
      events: [
        mk("founder-growing", "chat.coaching", "Focused on increasing revenue this quarter", 0, { projectId: "p-grow" }),
        mk("founder-growing", "chat.coaching", "Want to expand my offers and upsell clients", 1, { projectId: "p-grow" }),
        mk("founder-growing", "chat.coaching", "Improving operations so delivery is smoother", 2, { projectId: "p-grow" }),
        mk("founder-growing", "chat.coaching", "Thinking about hiring some help", 3, { projectId: "p-grow" }),
      ],
      profile: { hasRevenue: true, monthlyRevenue: 6000, teamSize: 1 },
    },
    {
      stage: "scaling",
      founderId: "founder-scaling",
      events: [
        mk("founder-scaling", "chat.coaching", "I need to delegate more to my team", 0),
        mk("founder-scaling", "chat.coaching", "Automating the high-volume tasks", 1),
        mk("founder-scaling", "chat.coaching", "Working on leadership and a manager hire", 2),
        mk("founder-scaling", "chat.coaching", "Systemize delivery and hand off ops", 3),
      ],
      profile: { teamSize: 4, monthlyRevenue: 25000 },
    },
  ];
}
