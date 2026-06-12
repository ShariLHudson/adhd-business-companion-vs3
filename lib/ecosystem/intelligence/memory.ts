// Founder Ecosystem — Phase 4 Founder Memory.
// A lightweight, derived memory of what the founder keeps coming back to.
// Improves recommendations over time. Counts only — no profiling, no diagnosis.

import type { FounderEvent, ID } from "../events";
import type { FounderMemory, MentionCount } from "./intelligenceTypes";
import { asStr, eventText } from "./signals";

function topCounts(
  map: Map<string, { label: string; n: number }>,
  limit = 5,
): MentionCount[] {
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: v.label, mentions: v.n }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, limit);
}

export function buildFounderMemory(events: FounderEvent[]): FounderMemory {
  // Frequently touched projects (by any event referencing them).
  const projects = new Map<string, { label: string; n: number }>();
  const titleOf = new Map<ID, string>();
  for (const e of events) {
    if (e.type === "project.created" && e.refs?.projectId) {
      titleOf.set(e.refs.projectId, asStr(e.data?.title) || e.refs.projectId);
    }
  }
  for (const e of events) {
    const pid = e.refs?.projectId;
    if (!pid) continue;
    const label = titleOf.get(pid) ?? pid;
    const cur = projects.get(pid) ?? { label, n: 0 };
    cur.n += 1;
    projects.set(pid, cur);
  }

  // Frequently mentioned goals (chat cues).
  const goals = new Map<string, { label: string; n: number }>();
  const goalRe = /\b(?:i want to|my goal is to|trying to|working toward|i need to)\s+([^.?!\n]{4,60})/gi;
  // Frequently mentioned people (action + Name).
  const people = new Map<string, { label: string; n: number }>();
  const personRe = /\b(?:call|email|meet|message|follow up with|text)\s+([A-Z][a-z]+)\b/g;

  for (const e of events.filter((x) => x.type === "chat.coaching")) {
    const text = e.userMessage ?? "";
    for (const m of text.matchAll(goalRe)) {
      const phrase = m[1]!.trim().toLowerCase();
      const cur = goals.get(phrase) ?? { label: m[1]!.trim(), n: 0 };
      cur.n += 1;
      goals.set(phrase, cur);
    }
    for (const m of text.matchAll(personRe)) {
      const name = m[1]!;
      const cur = people.get(name.toLowerCase()) ?? { label: name, n: 0 };
      cur.n += 1;
      people.set(name.toLowerCase(), cur);
    }
  }

  // Frequently mentioned struggles (pain points by their text).
  const struggles = new Map<string, { label: string; n: number }>();
  for (const e of events.filter((x) => x.type === "painpoint.observed")) {
    const text = (asStr(e.data?.text) || "").toLowerCase();
    if (!text) continue;
    const key = text.slice(0, 40);
    const cur = struggles.get(key) ?? { label: asStr(e.data?.text), n: 0 };
    cur.n += 1;
    struggles.set(key, cur);
  }

  // Frequently mentioned opportunities (idea texts).
  const opps = new Map<string, { label: string; n: number }>();
  for (const e of events.filter((x) => x.type === "opportunity.created")) {
    const text = asStr(e.data?.text);
    if (!text) continue;
    const key = text.toLowerCase().slice(0, 40);
    const cur = opps.get(key) ?? { label: text, n: 0 };
    cur.n += 1;
    opps.set(key, cur);
  }

  return {
    frequentProjects: topCounts(projects),
    frequentGoals: topCounts(goals),
    frequentStruggles: topCounts(struggles),
    frequentOpportunities: topCounts(opps),
    frequentPeople: topCounts(people),
  };
}

// Mention count of a project across chat + refs (used by the recommender).
export function projectMentionEvents(
  events: FounderEvent[],
  projectId: ID,
): FounderEvent[] {
  const title = events.find(
    (e) => e.type === "project.created" && e.refs?.projectId === projectId,
  )?.data?.title;
  const titleStr = typeof title === "string" ? title.toLowerCase() : null;
  return events.filter(
    (e) =>
      e.refs?.projectId === projectId ||
      (titleStr ? eventText(e).toLowerCase().includes(titleStr) : false),
  );
}
