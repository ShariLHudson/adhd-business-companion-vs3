// Unified pending action — stays visible until opened, accepted, or dismissed.

import type { ArtifactExportOffer } from "./artifactType";
import { filterAssistedActionForArtifact } from "./artifactType";
import type { ActionBridge } from "./companionActionBridge";
import type { AssistedAction } from "./assistedActionBridge";
import { isActionAcceptance } from "./assistedActionBridge";
import type { ToolSuggestion } from "./companionToolSuggestions";
import type { AppSection } from "./companionUi";
import type { DoItNowOffer } from "./doItNowActions";
import {
  WORKSPACE_EMOJI,
  supportsWorkspace,
  type WorkspaceOffer,
} from "./workspaceMode";
import {
  detectAudioRequest,
  isRhetoricalSoundUsage,
} from "./audioSuggestions";

export type MakeBridge = {
  type: string;
  brief: string;
  label: string;
};

export type PendingAction =
  | { kind: "workspace"; offer: WorkspaceOffer }
  | { kind: "artifact-export"; offer: ArtifactExportOffer }
  | { kind: "assisted"; action: AssistedAction }
  | { kind: "do-it-now"; offer: DoItNowOffer }
  | { kind: "tool"; suggestion: ToolSuggestion }
  | { kind: "action-bridge"; bridge: ActionBridge }
  | { kind: "make-bridge"; bridge: MakeBridge };

const PRIORITY: Record<PendingAction["kind"], number> = {
  workspace: 100,
  "artifact-export": 95,
  assisted: 90,
  "do-it-now": 80,
  tool: 70,
  "action-bridge": 60,
  "make-bridge": 50,
};

export type PendingActionInput = {
  workspaceOffer: WorkspaceOffer | null;
  artifactExportOffer: ArtifactExportOffer | null;
  assistedActionOffer: AssistedAction | null;
  doItNowOffer: DoItNowOffer | null;
  toolSuggestion: ToolSuggestion | null;
  actionBridge: ActionBridge | null;
  bridge: MakeBridge | null;
  lockedArtifactType?: string | null;
};

export function resolvePendingAction(
  input: PendingActionInput,
): PendingAction | null {
  const candidates: PendingAction[] = [];
  if (input.workspaceOffer) {
    candidates.push({ kind: "workspace", offer: input.workspaceOffer });
  }
  if (input.artifactExportOffer) {
    candidates.push({
      kind: "artifact-export",
      offer: input.artifactExportOffer,
    });
  }
  const assisted = filterAssistedActionForArtifact(
    input.assistedActionOffer,
    input.lockedArtifactType,
  );
  if (assisted) {
    candidates.push({ kind: "assisted", action: assisted });
  }
  if (input.doItNowOffer) {
    candidates.push({ kind: "do-it-now", offer: input.doItNowOffer });
  }
  if (input.toolSuggestion) {
    candidates.push({ kind: "tool", suggestion: input.toolSuggestion });
  }
  if (input.actionBridge) {
    candidates.push({ kind: "action-bridge", bridge: input.actionBridge });
  }
  if (input.bridge) {
    candidates.push({ kind: "make-bridge", bridge: input.bridge });
  }
  if (!candidates.length) return null;
  return candidates.sort((a, b) => PRIORITY[b.kind] - PRIORITY[a.kind])[0]!;
}

export function pendingActionEmoji(action: PendingAction): string {
  switch (action.kind) {
    case "workspace":
      return WORKSPACE_EMOJI[action.offer.section] ?? "🛠";
    case "artifact-export":
      return "📄";
    case "assisted":
      return action.action.emoji;
    case "do-it-now":
      return action.offer.emoji;
    case "tool":
      return action.suggestion.toolEmoji;
    case "action-bridge":
      return action.bridge.emoji;
    case "make-bridge":
      return "✨";
  }
}

export function pendingActionLabel(action: PendingAction): string {
  switch (action.kind) {
    case "workspace":
      return action.offer.buttonLabel;
    case "artifact-export":
      return `Save ${action.offer.artifactType}`;
    case "assisted":
      return action.action.buttonLabel;
    case "do-it-now":
      return action.offer.label;
    case "tool":
      return action.suggestion.toolLabel;
    case "action-bridge":
      return action.bridge.label;
    case "make-bridge":
      return action.bridge.label;
  }
}

export function pendingActionLine(action: PendingAction): string | undefined {
  switch (action.kind) {
    case "workspace":
      return action.offer.line || undefined;
    case "artifact-export":
      return action.offer.line;
    case "assisted":
      return action.action.offerLine;
    case "tool":
      return action.suggestion.line;
    default:
      return undefined;
  }
}

const SHORT_ACCEPT_RE =
  /^(?:open it|do it|schedule it|let'?s go|let'?s do it|sounds good|okay|ok)\.?$/i;

const SAVE_READY_RE =
  /^(?:yes|yep|yeah|ok(?:ay)?|sure|save it|let'?s save|go ahead|please do|do it)\.?$/i;

function labelFragmentMatches(text: string, label: string): boolean {
  const words = label
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  return words.some((w) => text.includes(w));
}

export function matchesPendingAcceptance(
  text: string,
  action: PendingAction,
): boolean {
  const t = text.trim();
  if (!t) return false;
  const lower = t.toLowerCase();

  if (isActionAcceptance(t) || SHORT_ACCEPT_RE.test(t)) return true;

  switch (action.kind) {
    case "workspace": {
      const { section, buttonLabel } = action.offer;
      if (/\bopen\b/i.test(t) && labelFragmentMatches(lower, buttonLabel)) {
        return true;
      }
      if (
        section === "time-block" &&
        /\b(?:time ?block|planning|calendar|schedule)\b/i.test(t)
      ) {
        return true;
      }
      if (
        section === "brain-dump" &&
        /\b(?:clear my mind|brain dump)\b/i.test(t)
      ) {
        return true;
      }
      if (
        section === "content-generator" &&
        /\b(?:create|content builder|draft)\b/i.test(t)
      ) {
        return true;
      }
      if (section === "projects" && /\bprojects?\b/i.test(t)) return true;
      if (
        section === "templates-library" &&
        /\btemplates?\b/i.test(t)
      ) {
        return true;
      }
      if (section === "playbook" && /\b(?:strategies|playbook)\b/i.test(t)) {
        return true;
      }
      if (section === "focus-audio") {
        if (isRhetoricalSoundUsage(t)) return false;
        if (/\b(?:yes|yeah|yep|sure|ok|okay|open)\b/i.test(t)) return true;
        return detectAudioRequest(t).isAudio;
      }
      return false;
    }
    case "artifact-export":
      return (
        SAVE_READY_RE.test(t) ||
        /\b(?:google doc|print|save|export|copy)\b/i.test(t)
      );
    case "assisted":
      return (
        /\b(?:help me|draft it|open create|build together|continue proposal)\b/i.test(t) ||
        labelFragmentMatches(lower, action.action.buttonLabel)
      );
    case "do-it-now":
      return /\b(?:do it|do that|now)\b/i.test(t);
    case "tool":
      if (action.suggestion.action.type === "tool") {
        const tool = action.suggestion.action.tool;
        if (
          tool === "time-block" &&
          /\b(?:time ?block|schedule|planning|calendar)\b/i.test(t)
        ) {
          return true;
        }
        if (
          tool === "brain-dump" &&
          /\b(?:clear my mind|brain dump)\b/i.test(t)
        ) {
          return true;
        }
        if (
          tool === "breathe" &&
          /\b(?:breath|breathing|breathe|reset|let me try|try (?:the )?breathing)\b/i.test(
            t,
          )
        ) {
          return true;
        }
        if (tool === "focus-audio") {
          if (isRhetoricalSoundUsage(t)) return false;
          if (/\b(?:yes|yeah|yep|sure|ok|okay|open)\b/i.test(t)) return true;
          return detectAudioRequest(t).isAudio;
        }
        if (
          tool === "focus-timer" &&
          /\b(?:focus session|focus timer|timer)\b/i.test(t)
        ) {
          return true;
        }
      }
      return (
        (/\bopen\b/i.test(t) || /\blet me try\b/i.test(t)) &&
        labelFragmentMatches(lower, action.suggestion.toolLabel)
      );
    case "action-bridge":
      return (
        /\b(?:open|start|do it|try it)\b/i.test(t) &&
        labelFragmentMatches(lower, action.bridge.label)
      );
    case "make-bridge":
      return (
        /\b(?:open create|turn this into|yes|open it)\b/i.test(t) ||
        labelFragmentMatches(lower, action.bridge.label)
      );
  }
}

/** User explicitly asks to open a workspace section in split view. */
export function detectOpenSectionRequest(text: string): AppSection | null {
  const t = text.trim().toLowerCase();
  if (
    /\bopen (?:the )?time ?block\b/.test(t) ||
    /\bopen (?:the )?planning\b/.test(t)
  ) {
    return "time-block";
  }
  if (/\bopen (?:the )?(?:clear my mind|brain dump)\b/.test(t)) {
    return "brain-dump";
  }
  if (/\bopen (?:the )?create\b/.test(t)) return "content-generator";
  if (
    /\bopen (?:my )?(?:client avatar|ideal client|icp)\b/.test(t) ||
    /\bopen (?:the )?client avatars?\b/.test(t)
  ) {
    return "client-avatars";
  }
  if (
    /\bopen (?:my )?workshop\b/.test(t) ||
    /\bopen (?:the )?workshop\b/.test(t)
  ) {
    return "projects";
  }
  if (/\bopen (?:my )?projects?\b/.test(t)) return "projects";
  if (/\bopen (?:my )?saved work\b/.test(t)) return "saved-work";
  if (/\bopen (?:the )?templates?\b/.test(t)) return "templates-library";
  if (/\bopen (?:the )?(?:strategies|playbook)\b/.test(t)) return "playbook";
  if (/\bopen (?:the )?snippets?\b/.test(t)) return "snippets";
  if (
    /\bopen (?:the )?(?:focus audio|focus music)\b/.test(t) ||
    /\bopen focus audio\b/.test(t)
  ) {
    return "focus-audio";
  }
  if (
    /\bopen (?:the )?(?:breathe|breathing|breathe & reset)\b/.test(t) ||
    /\bstart (?:the )?breathing\b/.test(t)
  ) {
    return "breathe";
  }
  return null;
}

export function workspaceOpenAck(section: AppSection): string {
  const title =
    section === "time-block"
      ? "Momentum Appointments"
      : section === "brain-dump"
        ? "Clear My Mind"
        : section === "content-generator"
          ? "Create"
          : section === "playbook"
            ? "Strategies"
            : section === "templates-library"
              ? "Templates"
              : section === "projects"
              ? "Projects"
              : section === "saved-work"
                ? "Saved Work"
                : "workspace";
  return `Opening **${title}** beside us — chat stays right here.`;
}

export function isSplitWorkspaceSection(section: AppSection): boolean {
  return supportsWorkspace(section);
}
