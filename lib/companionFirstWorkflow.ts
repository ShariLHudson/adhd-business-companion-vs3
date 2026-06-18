/**
 * Companion First Workflow — guide into doing, never stop at documentation.
 */

import type { AppFeatureId } from "./appFeatureKnowledge";
import { matchAppFeatures, isAppHowToQuestion } from "./appFeatureKnowledge";
import type { AppSection } from "./companionUi";
import { supportsWorkspace } from "./workspaceMode";
import { workspaceTitle } from "./workspaceMode";
import type { WorkspaceOffer } from "./workspaceMode";

export type CompanionFirstTarget = {
  section: AppSection;
  label: string;
  /** One-sentence what it does — not a manual. */
  briefAnswer: string;
  offerLine: string;
  coachAfterOpen: string;
  /** When opening Create for a specific asset type. */
  itemType?: string;
  featureId?: AppFeatureId;
};

export const COMPANION_FIRST_CORE_RULE = `COMPANION FIRST (mandatory — never behave like documentation):
The companion guides users into DOING, not just explaining.
Flow: brief answer (1–2 sentences) → identify best workspace/tool → offer to open beside chat → coach + auto-fill → complete → next step.
NEVER open Create to draft an explanation of how to use a feature.
NEVER send users to documentation when a workspace or tool exists.
NEVER hide or close chat when opening a workspace — chat stays visible on the left.
If a workspace, builder, tool, game, template, strategy, project, avatar, or snippet can help — offer it. Do not stop after answering.`;

export const COMPANION_FIRST_UNIVERSAL_RULES = `COMPANION FIRST UNIVERSAL RULES:
- Feature how-to → brief explanation + offer to open the real tool/workspace beside chat.
- Teaching → brief teach + offer the matching builder (Client Avatar, Create, Strategies, Projects).
- Workspace open → auto-populate from conversation, confirm, ask only for gaps.
- Section complete → offer next logical step (Review, Improve, Export, Create content, etc.).
- Behave like a guide sitting beside the user — not a search engine.`;

/** Feature-specific routes — checked before generic app feature match. */
const EXPLICIT_FEATURE_ROUTES: {
  re: RegExp;
  target: Omit<CompanionFirstTarget, "briefAnswer"> & {
    briefAnswer?: string;
  };
}[] = [
  {
    re: /\b(?:how (?:do|can) i|how to)\s+(?:create|make|build|write|add)\s+(?:a |an |my )?snippets?\b/i,
    target: {
      section: "snippets",
      label: "Snippet Builder",
      offerLine:
        "Want me to open **Snippets** beside us so we can build one together?",
      coachAfterOpen: "What should this snippet help you do — one line is enough.",
      featureId: undefined,
    },
  },
  {
    re: /\b(?:how (?:do|can) i|how to)\s+(?:use|try|spin)\s+(?:the )?spin(?:ning)? (?:the )?wheel\b/i,
    target: {
      section: "spin-wheel",
      label: "Spin The Wheel",
      briefAnswer:
        "Spin The Wheel picks one next step when everything feels equally important.",
      offerLine: "Want me to open **Spin The Wheel** beside us?",
      coachAfterOpen:
        "Give it a spin and tell me what comes up — we can do it now, break it smaller, or spin again.",
    },
  },
  {
    re: /\b(?:how (?:do|can) i|how to)\s+(?:create|make|build|write)\s+(?:a |an |my )?(?:client avatar|ideal client|icp|buyer persona)\b/i,
    target: {
      section: "client-avatars",
      label: "Client Avatar Builder",
      offerLine:
        "Want me to open the **Client Avatar** builder beside us?",
      coachAfterOpen:
        "Tell me about the person you help most — I'll fill the avatar as we talk.",
    },
  },
  {
    re: /\b(?:how (?:do|can) i|how to)\s+(?:create|make|build|write)\s+(?:a |an |my )?(?:sop|standard operating procedure)\b/i,
    target: {
      section: "content-generator",
      label: "Create",
      itemType: "SOP",
      offerLine:
        "Want me to open **Create** for your **SOP** beside us?",
      coachAfterOpen:
        "What's this SOP for — one sentence — and I'll start the draft while we talk.",
    },
  },
  {
    re: /\b(?:how (?:do|can) i|how to)\s+(?:create|make|build|start)\s+(?:a |an |my )?projects?\b/i,
    target: {
      section: "projects",
      label: "Projects",
      offerLine: "Want me to open **Projects** beside us?",
      coachAfterOpen:
        "What are you calling this project — and what's the outcome when it's done?",
    },
  },
  {
    re: /\b(?:how (?:do|can) i|how to)\s+(?:create|make|build|write)\s+(?:a |an |my )?(?:strateg(?:y|ies)|marketing plan|business plan)\b/i,
    target: {
      section: "playbook",
      label: "Strategy Builder",
      offerLine:
        "Want me to open **Strategies** beside us to build your plan?",
      coachAfterOpen:
        "What's the business goal behind this plan — we'll build it one piece at a time.",
    },
  },
  {
    re: /\b(?:how (?:do|can) i|how to)\s+(?:create|make|build|write)\s+(?:a |an |my )?(?:newsletter|offer|funnel|sales page|email)\b/i,
    target: {
      section: "content-generator",
      label: "Create",
      offerLine: "Want me to open **Create** beside us?",
      coachAfterOpen:
        "What is this piece about — I'll draft it in the panel while we chat.",
    },
  },
  {
    re: /\b(?:how (?:do|can) i|how to)\s+(?:use|work with|open)\s+(?:the )?templates?\b/i,
    target: {
      section: "templates-library",
      label: "Templates",
      offerLine: "Want me to open **Templates** beside us?",
      coachAfterOpen:
        "Pick a starting point or tell me what you're making — we'll adapt it together.",
    },
  },
];

const FEATURE_ID_TO_SECTION: Partial<
  Record<AppFeatureId, { section: AppSection; itemType?: string }>
> = {
  "client-avatars": { section: "client-avatars" },
  strategies: { section: "playbook" },
  projects: { section: "projects" },
  create: { section: "content-generator" },
  templates: { section: "templates-library" },
  "spin-wheel": { section: "spin-wheel" },
  "clear-my-mind": { section: "brain-dump" },
  "focus-session": { section: "focus-timer" },
  breathe: { section: "breathe" },
  "focus-audio": { section: "focus-audio" },
  "time-block": { section: "time-block" },
  "momentum-games": { section: "games" },
  "help-me-right-now": { section: "activities" },
  snippets: { section: "snippets" },
};

const DEFAULT_BRIEF: Partial<Record<AppFeatureId, string>> = {
  strategies:
    "Strategies holds ADHD techniques and business plans you build with Shari one question at a time.",
  projects:
    "Projects is where active work lives — outcome, tasks, time blocks, and files in one place.",
  create:
    "Create is your draft canvas — SOPs, posts, plans, funnels, and more beside chat.",
  templates:
    "Templates are reusable starting points on this device — adapt them with Shari before drafting.",
  "client-avatars":
    "Client Avatars capture who you help — Shari fills it in as you describe them.",
  "spin-wheel":
    "Spin The Wheel picks one thing when you can't choose — chance breaks the tie.",
  snippets:
    "Snippets store reusable text you use again and again — build them here beside chat.",
};

/** User is asking how to use/create something in the app — companion-first applies. */
export function isCompanionFirstQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (detectCompanionFirstTarget(t)) return true;
  return isAppHowToQuestion(t);
}

export function detectCompanionFirstTarget(
  text: string,
): CompanionFirstTarget | null {
  const t = text.trim();
  if (!t) return null;

  for (const route of EXPLICIT_FEATURE_ROUTES) {
    if (route.re.test(t)) {
      const itemType = inferCreateItemType(t) ?? route.target.itemType;
      return {
        ...route.target,
        briefAnswer:
          route.target.briefAnswer ??
          DEFAULT_BRIEF[route.target.featureId ?? "create"] ??
          `${route.target.label} helps you get this done inside the app.`,
        itemType,
      };
    }
  }

  if (!isAppHowToQuestion(t)) return null;

  const features = matchAppFeatures(t);
  const primary = features[0];
  if (!primary) return null;

  const mapped = FEATURE_ID_TO_SECTION[primary.id];
  if (!mapped) {
    return {
      section: "how-do-i",
      label: primary.name,
      briefAnswer: primary.howTo.split(".")[0] + ".",
      offerLine: `Want me to walk you through **${primary.name}** beside us?`,
      coachAfterOpen: "What are you trying to accomplish right now?",
      featureId: primary.id,
    };
  }

  const label = workspaceTitle(mapped.section);
  const itemType = inferCreateItemType(t) ?? mapped.itemType;
  return {
    section: mapped.section,
    label,
    briefAnswer:
      DEFAULT_BRIEF[primary.id] ?? `${primary.name}: ${primary.howTo.split(".")[0]}.`,
    offerLine: `Want me to open **${label}** beside us so we can do it together?`,
    coachAfterOpen: defaultCoachForSection(mapped.section, itemType),
    itemType,
    featureId: primary.id,
  };
}

export function buildCompanionFirstOfferReply(target: CompanionFirstTarget): string {
  return `${target.briefAnswer}\n\n${target.offerLine}`;
}

export function toWorkspaceOffer(target: CompanionFirstTarget): WorkspaceOffer {
  return {
    section: target.section,
    buttonLabel: `Open ${target.label}`,
    line: target.offerLine,
  };
}

/** Whether this target should use split walkthrough (chat left, tool right). */
export function usesSplitWalkthrough(target: CompanionFirstTarget): boolean {
  return (
    supportsWorkspace(target.section) ||
    target.section === "spin-wheel" ||
    target.section === "breathe" ||
    target.section === "focus-timer" ||
    target.section === "focus-audio" ||
    target.section === "activities" ||
    target.section === "games"
  );
}

export function companionFirstWorkflowHintForChat(
  text: string,
  activePanel: AppSection | null,
): string {
  const target = detectCompanionFirstTarget(text);
  const parts = [COMPANION_FIRST_CORE_RULE, COMPANION_FIRST_UNIVERSAL_RULES];

  if (target) {
    parts.push(
      `COMPANION FIRST — THIS TURN (mandatory):`,
      `User asked about **${target.label}**.`,
      `1. Reply with ONLY: "${target.briefAnswer}"`,
      `2. Then offer: "${target.offerLine}"`,
      `3. Do NOT give navigation-only instructions or a documentation walkthrough.`,
      `4. Do NOT open Create to write an explanation — open it only to BUILD the asset.`,
      `5. If they accept, coach: "${target.coachAfterOpen}"`,
      activePanel === target.section
        ? `6. **${target.label}** is already open — coach in the panel, auto-fill fields, do not re-offer to open.`
        : `6. Chat must stay visible when workspace opens.`,
    );
  } else if (isCompanionFirstQuestion(text)) {
    parts.push(
      "COMPANION FIRST — THIS TURN: Brief answer, then offer the best workspace or tool beside chat. Do not stop at explanation.",
    );
  }

  return parts.join("\n");
}

function inferCreateItemType(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/\bsop\b|standard operating procedure/.test(t)) return "SOP";
  if (/\bnewsletter\b/.test(t)) return "Newsletter";
  if (/\boffer\b/.test(t)) return "Offer";
  if (/\bfunnel\b/.test(t)) return "Sales Funnel";
  if (/\bmarketing plan\b/.test(t)) return "Marketing Plan";
  if (/\bsales page\b|landing page/.test(t)) return "Sales Page";
  if (/\bemail\b/.test(t)) return "Email";
  return undefined;
}

function defaultCoachForSection(
  section: AppSection,
  itemType?: string,
): string {
  if (section === "content-generator") {
    return itemType
      ? `What's this **${itemType}** about — I'll draft it beside us as we talk.`
      : "What are we making — I'll build the draft in the panel while we chat.";
  }
  if (section === "client-avatars") {
    return "Tell me about the person you help most — I'll fill the avatar as we go.";
  }
  if (section === "playbook") {
    return "What's the goal — we'll build the plan one question at a time.";
  }
  if (section === "projects") {
    return "What are you calling this project — and what's the outcome?";
  }
  if (section === "snippets") {
    return "What should this snippet say — or what job should it do for you?";
  }
  if (section === "spin-wheel") {
    return "Give it a spin and tell me what comes up.";
  }
  return "What should we do first?";
}
