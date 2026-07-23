/**
 * Type-appropriate expansion for section ideas — catalog-based, no LLM.
 * Shared runtime; packages influence tone via workTypeId + sectionId.
 *
 * Packages may also author `expansion` strings on catalog entries; this
 * builder is the shared fallback when no pre-authored expansion exists.
 */

import type { SectionIdeasFocusInput } from "./sectionIdeas";

function sectionKey(focus: SectionIdeasFocusInput): string {
  return (focus.sectionId || focus.title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
}

function workType(focus: SectionIdeasFocusInput): string {
  return (focus.workTypeId || "").trim().toLowerCase();
}

/** Workshop / Event Plan agenda-style expansion. */
function expandAgenda(idea: string): string {
  return [
    idea.trim(),
    "",
    "Suggested timing: about 20–30 minutes for this segment (adjust to your day).",
    "Purpose of the segment: help people land one clear takeaway they can use.",
    "Facilitation approach: open with one question, teach briefly, then let them practice.",
    "Participant activity: a short pair share or solo note — keep it light.",
    "Transition to the next segment: close with one sentence of progress, then name what comes next.",
  ].join("\n");
}

function expandEventGeneric(idea: string, section: string): string {
  if (section.includes("agenda") || section.includes("schedule")) {
    return expandAgenda(idea);
  }
  if (section.includes("audience") || section.includes("attendee")) {
    return [
      idea.trim(),
      "",
      "Suggested timing: keep introductions short so energy stays with the people.",
      "Purpose of the segment: help each person feel expected and oriented.",
      "Facilitation approach: welcome by name, then one prompt everyone can answer.",
      "Participant activity: a quiet note or pair share — no performance required.",
      "Transition to the next segment: thank them, then name the first teaching block.",
    ].join("\n");
  }
  if (section.includes("outcome") || section.includes("purpose")) {
    return [
      idea.trim(),
      "",
      "Suggested timing: revisit this promise at open and close of the day.",
      "Purpose of the segment: make the hoped-for change feel concrete.",
      "Facilitation approach: ask what success would feel like in their words.",
      "Participant activity: write one sentence they want to be true after.",
      "Transition to the next segment: connect that sentence to the first practice.",
    ].join("\n");
  }
  return expandAgenda(idea);
}

/** Marketing Plan expansion — audience, message, channel, CTA, implementation. */
function expandMarketing(idea: string, _section: string): string {
  return [
    idea.trim(),
    "",
    "Audience angle: who needs this most right now — one real person, not a crowd.",
    "Message: one clear promise in language they already use.",
    "Channel: the place you can show up calmly and sustainably.",
    "Call to action: the smallest yes that starts a real conversation.",
    "Implementation note: one asset or post you can finish this week.",
  ].join("\n");
}

/** Business Plan expansion — rationale, assumptions, evidence, milestones, risks. */
function expandBusiness(idea: string, _section: string): string {
  return [
    idea.trim(),
    "",
    "Strategic rationale: why this matters in the next season of the business.",
    "Assumptions: what has to be true for this to work.",
    "Evidence needed: what you’d look for to know you’re on track.",
    "Milestones: one near-term proof and one longer checkpoint.",
    "Risks: what could slow this — and how you’ll notice early.",
  ].join("\n");
}

/** Facebook Community expansion — value, rhythm, engagement, moderation, success. */
function expandCommunity(idea: string, _section: string): string {
  return [
    idea.trim(),
    "",
    "Member value: what someone receives that makes belonging feel real.",
    "Recurring rhythm: a cadence you can keep when life is busy.",
    "Engagement prompt: one question that invites honest participation.",
    "Moderation consideration: how you’ll protect tone without policing joy.",
    "Success signal: a quiet sign the community is healthy (not vanity metrics).",
  ].join("\n");
}

/** Build a richer, type-appropriate expansion without auto-inserting. */
export function expandSectionIdeaText(
  focus: SectionIdeasFocusInput,
  ideaText: string,
): string {
  const idea = ideaText.trim();
  const section = sectionKey(focus);
  const wt = workType(focus);

  if (wt === "event_plan" || section.includes("agenda")) {
    return expandEventGeneric(idea, section);
  }
  if (wt === "marketing_plan") {
    return expandMarketing(idea, section);
  }
  if (wt === "business_plan") {
    return expandBusiness(idea, section);
  }
  if (wt === "facebook_community") {
    return expandCommunity(idea, section);
  }
  // Unknown work types — calm generic expansion
  return [
    idea,
    "",
    "Add one concrete detail someone could picture.",
    "Name the feeling or decision this supports.",
    "Close with one next step that stays small enough to keep.",
  ].join("\n");
}
