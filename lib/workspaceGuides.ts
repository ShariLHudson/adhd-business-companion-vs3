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
    what: "ADHD strategies to apply now, or business strategies to create with Shari.",
    why: "Your brain needs techniques; your business needs plans — they're different jobs.",
    how: "Open **ADHD Strategies** to use a technique now, or **Business Strategies** to build a plan one question at a time.",
    example: "Overwhelmed → Body Double. Growing visibility → Create a Marketing Strategy.",
  },
  "content-generator": {
    id: "content-generator",
    title: "Create",
    what: "Tell Shari what you want to make — one question, then a draft you can shape.",
    why: "Conversation first beats blank-page configuration.",
    how: "Pick an outcome (Email, Proposal, SOP…) → **Build With Shari** → answer one question → build your draft. Change structure later if you want.",
    example: "Proposal → who it's for → Build Draft → refine in chat.",
  },
  "templates-library": {
    id: "templates-library",
    title: "Templates",
    what: "Reusable starting points saved on this device — not finished documents.",
    why: "Templates give structure so you don't start from zero.",
    how: "Browse templates saved on this device. Build With Shari opens a conversation to adapt one together — nothing drafts or opens in Create until you agree. Start from blank is for users who want to edit the framework directly.",
    example: "Welcome email template → Build With Shari → answer one question → agree before drafting.",
  },
  "brain-dump": {
    id: "brain-dump",
    title: "Clear My Mind",
    what: "A safe place to empty your head — capture without organizing first, then see everything safely held.",
    why: "Mental clutter blocks focus; holding thoughts somewhere safe creates relief before any action.",
    how: "Add thoughts (commas are fine) → See what's held → explore clusters → view thoughts or take action when ready.",
    example: "Head full of errands → comma dump → Separate Them → Everything is held → tap Health → View thoughts.",
  },
  energy: {
    id: "energy",
    title: "Today's Reality",
    what: "Current Reality Intelligence — share how you're showing up today so support fits your real energy.",
    why: "Rigid plans break; knowing today's reality keeps momentum without guilt.",
    how: "Open Today's Reality from the top navigation (🌤️); update energy, motivation, and how you feel anytime life shifts.",
    example: "Poor sleep morning → Today's Reality → lighter plan in Plan My Day.",
  },
  "time-block": {
    id: "time-block",
    title: "Momentum Appointments",
    what: "Gentle intentions for momentum — goal, time, and when. Every outcome counts.",
    why: "Plans change; self-trust matters more than perfect execution.",
    how: "Add an appointment, pick 15–45 min or Flexible, and check in with “How did it go?” — no guilt.",
    example: "Marketing plan → 30 min → Afternoon → Made progress counts as success.",
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
    example: "“How do I plan my day?” → steps + open Today's Reality from the top bar.",
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
