export type WorkspaceGuideContent = {
  id: string;
  title: string;
  what: string;
  why: string;
  how: string;
  example: string;
};

export const WORKSPACE_GUIDES: Record<string, WorkspaceGuideContent> = {
  focus: {
    id: "focus",
    title: "Focus",
    what: "A calm place to do one thing — timer, audio, and breathing when you need them.",
    why: "ADHD brains start hard; a dedicated focus space removes decision fatigue.",
    how: "Pick one task, start a timer or calming audio, and let everything else wait.",
    example: "“I need 25 minutes on this proposal” → Focus timer + one line goal.",
  },
  projects: {
    id: "projects",
    title: "Projects",
    what: "Active work in one place — tasks, time blocks, notes, and files together.",
    why: "Scattered tabs create overwhelm; projects keep context in one home.",
    how: "Open a project, expand only the section you need, add one next action.",
    example: "VIP Offer Launch → Tasks → “Write outline” → schedule a Time Block.",
  },
  playbook: {
    id: "playbook",
    title: "Strategies",
    what: "Short coaching playbooks for your brain and your business.",
    why: "When you're stuck, a proven pattern beats inventing from scratch.",
    how: "Read what it is, why it helps, and when to use it — then say what you're struggling with and open the matching workspace.",
    example: "Too many ideas → Open Clear My Mind. Too many tasks → Open Adjust My Day.",
  },
  "content-generator": {
    id: "content-generator",
    title: "Create",
    what: "Guided creation — category, a few questions, then a draft you approve.",
    why: "Blank-page generation overwhelms ADHD brains; shaping first builds trust.",
    how: "Pick category → type → answer one question at a time → build draft → improve → save.",
    example: "Proposal → who it's for → what you're solving → Build my draft → Update draft.",
  },
  "templates-library": {
    id: "templates-library",
    title: "Templates",
    what: "Reusable frameworks you open in Create — not finished documents.",
    why: "Templates give structure so you don't start from zero.",
    how: "Search, filter by category, open one in Create, customize the draft.",
    example: "Welcome email template → Open in Create → personalize → export.",
  },
  "brain-dump": {
    id: "brain-dump",
    title: "Clear My Mind",
    what: "Pour everything out — thoughts, tasks, worries — without organizing yet.",
    why: "Getting it out of your head lowers cognitive load before sorting.",
    how: "Type or talk freely; Shari helps sort into tasks, ideas, or reminders later.",
    example: "“Client email, buy milk, launch idea, anxious about pricing…”",
  },
  energy: {
    id: "energy",
    title: "Adjust My Day",
    what: "Tune today's plan to how you actually feel and what energy you have.",
    why: "Rigid plans break; adjusting keeps momentum without guilt.",
    how: "Tell Shari your energy; accept a lighter plan or one priority shift.",
    example: "Low energy morning → keep one must-do, move the rest gently.",
  },
  "time-block": {
    id: "time-block",
    title: "Time Bank",
    what: "Tasks waiting for a time slot — assign when you're ready, not all at once.",
    why: "Unscheduled work stays visible without cluttering today's calendar.",
    how: "Add blocks to the bank, filter by project, drag or assign to a day.",
    example: "“Record module 2” sits in the bank until Thursday afternoon.",
  },
  relationships: {
    id: "relationships",
    title: "Relationships",
    what: "People context — who matters, what you discussed, gentle follow-up cues.",
    why: "ADHD makes “I should reach out” easy to forget; light memory helps.",
    how: "Mention someone in chat; Shari can remember and nudge when relevant.",
    example: "“Follow up with Sarah about the workshop” → remembered for next week.",
  },
  calendar: {
    id: "calendar",
    title: "Calendar",
    what: "See time blocks and commitments in one view.",
    why: "Visual time reduces double-booking and surprise overload.",
    how: "Review the day, move blocks, or ask Shari to plan around what’s fixed.",
    example: "Busy afternoon → morning deep work block for the proposal.",
  },
  "how-do-i": {
    id: "how-do-i",
    title: "How Do I",
    what: "Searchable answers for how the app works — or ask Shari in chat.",
    why: "You shouldn't have to memorize features to use them.",
    how: "Search a question, read the short guide, or tap Ask Shari.",
    example: "“How do I plan my day?” → steps + open Adjust My Day.",
  },
};

export function getWorkspaceGuide(section: string): WorkspaceGuideContent | null {
  return WORKSPACE_GUIDES[section] ?? null;
}

const DISMISS_KEY = "companion-guide-dismissed";

export function isGuideDismissed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) && list.includes(id);
  } catch {
    return false;
  }
}

export function dismissGuide(id: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(list) ? [...new Set([...list, id])] : [id];
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}
