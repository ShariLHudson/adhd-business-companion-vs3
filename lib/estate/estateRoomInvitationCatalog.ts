/**
 * Estate room invitation catalog — concierge suggestions per room.
 * Primary only (3–4 each); universal closers appended by resolver.
 *
 * @deprecated **Arrival authority (Phase B):** Living-place object-invitation grids conflict with
 * Constitution Art. VIII and canonical `arrivalBehavior`. Retained for current UI only — do not
 * treat as place registry. Migrate arrival to canon in a later phase.
 *
 * @see docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { StablesExperienceId } from "@/lib/stables/types";
import type { EstateRoomInvitationAction, EstateRoomInvitationItem } from "./estateRoomInvitationTypes";

function p(
  id: string,
  emoji: string,
  label: string,
  action: EstateRoomInvitationAction,
): EstateRoomInvitationItem {
  return { id, emoji, label, action, tier: "primary" };
}

const section = (id: string, emoji: string, label: string, section: AppSection) =>
  p(id, emoji, label, { kind: "section", section });

const stables = (
  id: string,
  emoji: string,
  label: string,
  experienceId: StablesExperienceId,
) => p(id, emoji, label, { kind: "stables-experience", experienceId });

/** Static primary suggestions — max 4 per room before dynamic slots. */
export const ESTATE_ROOM_PRIMARY_CATALOG: Record<string, EstateRoomInvitationItem[]> = {
  "welcome-home": [
    p("plan-my-day", "🌞", "Plan My Day", { kind: "plan-my-day" }),
    p("continue", "📋", "Continue Where I Left Off", { kind: "companion-continue" }),
    p("today-suggestions", "🌟", "Show Today's Suggestions", {
      kind: "show-suggestions",
    }),
    p("explore-estate", "🗺", "Explore the Estate", { kind: "estate-map" }),
  ],
  conservatory: [
    p("clear-my-mind", "🫧", "Clear My Mind", { kind: "brain-dump-engage" }),
    section("journal", "📝", "Journal Gazebo", "growth-journal"),
    section("peaceful-places", "🎵", "Peaceful Moments", "focus-audio"),
    p("talk-shari", "💬", "Talk with Shari", { kind: "conversation" }),
  ],
  "clear-my-mind": [
    p("clear-my-mind", "🫧", "Clear My Mind", { kind: "brain-dump-engage" }),
    section("journal", "📝", "Journal Gazebo", "growth-journal"),
    section("peaceful-places", "🎵", "Listen to Peaceful Places", "focus-audio"),
  ],
  "momentum-institute": [
    p("browse-drawers", "🗂", "Browse the Drawers", { kind: "institute-browse" }),
    p("apprenticeship", "🎓", "Continue My Apprenticeship", {
      kind: "institute-browse",
    }),
    p("learn-new", "📚", "Learn Something New", { kind: "institute-browse" }),
    p("search-topic", "🔍", "Search a Business Topic", { kind: "conversation" }),
  ],
  library: [
    section("browse", "📖", "Browse Resources", "growth-library"),
    p("find-specific", "🔍", "Find Something Specific", { kind: "conversation" }),
    section("continue-reading", "📚", "Continue Reading", "growth-library"),
    p("great-thinkers", "💡", "Learn from Great Thinkers", { kind: "conversation" }),
  ],
  "creative-studio": [
    section("start-new", "✨", "Start Something New", "content-generator"),
    p("continue-project", "📂", "Continue My Current Project", {
      kind: "companion-continue",
    }),
    p("brainstorm", "💡", "Brainstorm Ideas", { kind: "conversation" }),
    section("portfolio", "📁", "Achievement Library", "growth-portfolio"),
  ],
  observatory: [
    section("explore-ai", "🤖", "Explore AI", "grow-observatory"),
    p("business-trends", "📈", "Research Business Trends", { kind: "conversation" }),
    p("discover-new", "📰", "Discover What's New", { kind: "conversation" }),
    p("business-ideas", "💡", "Find Ideas for My Business", { kind: "conversation" }),
  ],
  "grow-observatory": [
    section("explore-ai", "🤖", "Explore AI", "grow-observatory"),
    p("business-trends", "📈", "Research Business Trends", { kind: "conversation" }),
    p("discover-new", "📰", "Discover What's New", { kind: "conversation" }),
    p("business-ideas", "💡", "Find Ideas for My Business", { kind: "conversation" }),
  ],
  "coffee-house": [
    p("catch-up", "☕", "Catch Up with Shari", { kind: "conversation" }),
    p("celebrate", "🎉", "Celebrate a Win", { kind: "conversation" }),
    p("talk-idea", "🤔", "Talk Through an Idea", { kind: "conversation" }),
    p("reflect-progress", "🌱", "Reflect on My Progress", { kind: "conversation" }),
  ],
  "apple-orchard": [
    p("reflect-journey", "🍎", "Reflect on My Journey", { kind: "conversation" }),
    section("journal", "📝", "Journal Gazebo", "growth-journal"),
    p("next-season", "🌱", "Think About My Next Season", { kind: "conversation" }),
    p("quiet-walk", "🚶", "Take a Quiet Walk with Shari", { kind: "conversation" }),
  ],
  "music-room": [
    section("focus-music", "🎧", "Focus Music", "focus-audio"),
    section("relaxing", "🌧", "Relaxing Sounds", "focus-audio"),
    p("reset-mind", "🧘", "Reset My Mind", { kind: "conversation" }),
    section("soundscape", "🎹", "Choose a Soundscape", "focus-audio"),
  ],
  stables: [
    stables("confidence", "🐎", "Build Confidence", "confidence-conversations"),
    stables("leadership", "🤝", "Explore Leadership", "leadership-lessons"),
    p("challenge", "💬", "Talk About a Challenge", { kind: "conversation" }),
    stables("courage", "🌟", "Practice Courage", "trust-challenges"),
  ],
  gardens: [
    p("grow-idea", "🌱", "Grow an Idea", { kind: "conversation" }),
    p("nurture-goal", "🌼", "Nurture a Goal", { kind: "conversation" }),
    section("journal", "📝", "Journal Gazebo", "growth-journal"),
    p("wander", "🚶", "Wander the Garden", { kind: "conversation" }),
  ],
  greenhouse: [
    p("plant-idea", "🌱", "Plant a New Idea", { kind: "conversation" }),
    p("nurture-idea", "🪴", "Nurture an Existing Idea", { kind: "conversation" }),
    section("seeds-planted", "📦", "Visit Seeds Planted", "grow-spark-cards"),
    p("explore-shari", "💡", "Explore Possibilities with Shari", {
      kind: "conversation",
    }),
  ],
  "seeds-planted": [
    p("review-ideas", "🌱", "Review My Ideas", { kind: "conversation" }),
    p("develop-seed", "🌿", "Develop a Seed", { kind: "conversation" }),
    section("organize", "📋", "Organize Future Projects", "projects"),
    p("add-idea", "💡", "Add a New Idea", { kind: "conversation" }),
  ],
  journal: [
    p("write-today", "✍", "Write Today's Thoughts", { kind: "section", section: "growth-journal" }),
    p("reflect", "💭", "Reflect on Something", { kind: "conversation" }),
    p("record-win", "🌟", "Record a Win", { kind: "conversation" }),
    p("gratitude", "❤️", "Express Gratitude", { kind: "conversation" }),
  ],
  "game-room": [
    p("quick-recharge", "🎮", "Quick Recharge", { kind: "section", section: "quick-recharge" }),
    p("brain-break", "🧠", "Take a Brain Break", { kind: "conversation" }),
    p("light-play", "✨", "Something Light and Fun", { kind: "conversation" }),
  ],
  "evidence-vault": [
    p("today-discovery", "📖", "Open Today's Discovery File", {
      kind: "evidence-today",
    }),
    p("browse-archive", "📂", "Browse Archive", { kind: "evidence-browse" }),
    p("search-discoveries", "🔍", "Search Discoveries", {
      kind: "evidence-search",
    }),
    p("view-insights", "✨", "View Insights", { kind: "evidence-insights" }),
    p("print-discoveries", "🖨", "Print Discoveries", {
      kind: "evidence-print",
    }),
  ],
  "institute-cabinet": [
    p("review-cards", "📇", "Review Saved Knowledge Cards", {
      kind: "institute-browse",
    }),
    p("continue-learning", "🎓", "Continue Saved Learning", {
      kind: "institute-browse",
    }),
    p("favorites", "⭐", "Browse My Favorites", { kind: "institute-browse" }),
    p("find-saved", "🔍", "Find Something I Saved", { kind: "institute-browse" }),
  ],
  portfolio: [
    section("review-work", "📂", "Achievement Library", "growth-portfolio"),
    section("continue-create", "✨", "Continue Creating", "content-generator"),
    p("prepare-share", "📤", "Prepare Something to Share", { kind: "conversation" }),
    p("improve-project", "📝", "Improve a Project", { kind: "conversation" }),
  ],
  "growth-profile": [
    p("see-progress", "🌟", "See My Progress", { kind: "conversation" }),
    p("competencies", "🎯", "Review My Competencies", { kind: "conversation" }),
    p("learning-journey", "📚", "View My Learning Journey", { kind: "conversation" }),
    p("milestones", "🏆", "Celebrate Milestones", { kind: "conversation" }),
  ],
  "goals-projects": [
    section("active-goals", "📋", "Review Active Goals", "projects"),
    section("continue-project", "🚀", "Continue a Project", "projects"),
    p("start-new", "🌟", "Start Something New", { kind: "conversation" }),
    p("organize", "🗂", "Organize My Priorities", { kind: "conversation" }),
  ],
  "decision-compass": [
    p("work-decision", "🧭", "Work Through a Decision", { kind: "conversation" }),
    p("compare-options", "⚖", "Compare Options", { kind: "conversation" }),
    p("think-through", "💭", "Think It Through", { kind: "conversation" }),
    p("clarify-priorities", "🎯", "Clarify My Priorities", { kind: "conversation" }),
  ],
  "peaceful-places": [
    p("new-place", "🌅", "Visit a New Place", { kind: "section", section: "focus-audio" }),
    section("listen", "🎧", "Listen and Relax", "focus-audio"),
    p("mental-break", "🌿", "Take a Mental Break", { kind: "conversation" }),
    p("reset-focus", "🧘", "Reset My Focus", { kind: "conversation" }),
  ],
  "momentum-builder": [
    p("plan-today", "📋", "Plan Today's Path", { kind: "conversation" }),
    section("activities", "🎯", "Browse Activities", "grow-momentum-builders"),
    p("one-step", "🌟", "Find One Honest Next Step", { kind: "conversation" }),
  ],
  sunroom: [
    section("welcome-letter", "💌", "Read Welcome Letter", "welcome-room"),
    p("quiet-hello", "☀", "Sit with Shari a Moment", { kind: "conversation" }),
  ],
  "tea-room": [
    p("quiet-tea", "🍵", "Quiet Tea and Talk", { kind: "conversation" }),
    p("reflect", "🌿", "Reflect Over Tea", { kind: "conversation" }),
  ],
  /** Empty — Cartographer's Studio welcome guide lives in the room UI */
  "focus-studio": [],
  "cartographers-studio": [],
};

/** Per-room universal closer copy — concierge, never menu-like. */
export const ESTATE_UNIVERSAL_CLOSER_COPY: Record<
  string,
  {
    chat?: string;
    navigate?: string;
    presence?: string;
    includePresence?: boolean;
    includeChat?: boolean;
  }
> = {
  "welcome-home": {
    chat: "Just Chat with Shari",
    navigate: "Go Somewhere Else",
    includePresence: false,
  },
  conservatory: {
    navigate: "Visit Another Room",
    includePresence: false,
    includeChat: false,
  },
  "clear-my-mind": {
    chat: "Just Talk with Shari",
    presence: "I'd Just Like to Sit Here",
  },
  "momentum-institute": {
    chat: "Ask Shari a Business Question",
  },
  library: {
    chat: "Ask Shari a Question",
  },
  "creative-studio": {
    chat: "Create Together with Shari",
  },
  observatory: {
    chat: "Ask a Research Question",
  },
  "grow-observatory": {
    chat: "Ask a Research Question",
  },
  "coffee-house": {
    chat: "Just Have a Conversation",
  },
  "apple-orchard": {
    presence: "I'd Like Some Quiet Time",
  },
  "music-room": {
    presence: "Just Listen",
  },
  stables: {
    presence: "Sit and Reflect",
  },
  gardens: {
    chat: "Talk with Shari",
  },
  greenhouse: {
    presence: "Just Enjoy the Greenhouse",
    includeChat: false,
  },
  "seeds-planted": {
    chat: "Explore an Idea with Shari",
  },
  journal: {
    chat: "Talk Before Writing",
  },
  "game-room": {
    chat: "Just Hang Out",
  },
  "evidence-vault": {
    includeChat: false,
    includePresence: false,
  },
  "institute-cabinet": {
    chat: "Ask Shari About a Saved Topic",
  },
  portfolio: {
    chat: "Review It with Shari",
  },
  "growth-profile": {
    chat: "Talk About My Growth",
  },
  "goals-projects": {
    chat: "Plan with Shari",
  },
  "decision-compass": {
    chat: "Talk It Out with Shari",
  },
  "peaceful-places": {
    presence: "Simply Enjoy the View",
  },
  /** Cartographer's Studio — orientation panel owns arrival; no Welcome Home closers */
  "focus-studio": {
    includeChat: false,
    includePresence: false,
  },
  "cartographers-studio": {
    includeChat: false,
    includePresence: false,
  },
};

export const ESTATE_INVITATION_LEAD = "While you're here…" as const;
export const ESTATE_INVITATION_PREAMBLE =
  "You might enjoy…" as const;
export const ESTATE_INVITATION_MAX_PRIMARY = 5 as const;
export const ESTATE_INVITATION_MAX_DYNAMIC = 2 as const;
