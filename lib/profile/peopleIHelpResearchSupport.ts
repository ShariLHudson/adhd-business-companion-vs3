/**
 * People I Help — which avatar questions may offer "Research this with Shari".
 * Personal reflection fields stay off the research path.
 */

const RESEARCH_SUPPORTED = new Set([
  "painPoints",
  "goals",
  "motivations",
  "triggers",
  "objections",
  "currentBehavior",
  "contentPrefs",
  "behaviorTraits",
]);

/** Personal reflection — research would invent rather than help. */
const RESEARCH_EXCLUDED = new Set(["who", "name", "tagline", "solution"]);

export function peopleIHelpFieldSupportsResearch(fieldKey: string): boolean {
  if (RESEARCH_EXCLUDED.has(fieldKey)) return false;
  return RESEARCH_SUPPORTED.has(fieldKey);
}
