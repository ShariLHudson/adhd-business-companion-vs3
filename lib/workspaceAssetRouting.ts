// Context-aware routing — business assets open in the right workspace, not generic chat.

import { allCatalogItems, matchCatalogFromText } from "./createCatalog";
import { blankScaffoldForType } from "./createInitialization";
import type { AppSection } from "./companionUi";
import { workspaceTitle } from "./workspaceMode";

export type AssetRoute = {
  section: AppSection;
  itemType?: string;
  draftContent?: string;
  title?: string;
  bootstrapProjects?: boolean;
  ack: string;
};

const ASSET_REQUEST_RE =
  /\b(?:need|want|create|build|make|write|draft|help me|start|open|design|put together)\b/i;

const ASSISTANT_OPENING_RE =
  /\b(?:let'?s open|i'?m opening|opening)\b/i;

const CATALOG_QUESTION_RE =
  /^\s*(?:what|how|why|when|where|who|which|is|are|does|do|can|could|would|should|tell me|explain)\b/i;

/** Menu picks and short type names — "client avatar", "SOP", "google form". */
export function isBareCatalogPick(text: string): boolean {
  const raw = text.trim();
  if (!matchCatalogFromText(raw)) return false;
  if (CATALOG_QUESTION_RE.test(raw)) return false;
  const t = raw
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return false;

  for (const item of allCatalogItems()) {
    const terms = [item.label.toLowerCase(), ...(item.matchTerms ?? [])];
    for (const term of terms) {
      if (t === term) return true;
    }
  }

  if (t.length > 56) return false;
  const stripped = t
    .replace(/\b(?:a|an|the|my|please|just|only|maybe|yes)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped && matchCatalogFromText(stripped) && stripped.length <= 40) {
    return true;
  }
  return t.length <= 24;
}

export function shouldAutoRouteAssetRequest(text: string): boolean {
  const t = text.trim();
  if (!t || !matchCatalogFromText(t)) return false;
  if (ASSET_REQUEST_RE.test(t)) return true;
  return isBareCatalogPick(t);
}

/** Assistant said it is opening a workspace — honor the user's catalog pick. */
export function detectAssistantWorkspaceLaunch(
  assistantText: string,
  userText: string,
): AssetRoute | null {
  if (!ASSISTANT_OPENING_RE.test(assistantText)) return null;
  const fromUser = resolveAssetRoute(userText);
  if (fromUser) return fromUser;
  return resolveAssetRoute(`${userText}\n${assistantText}`);
}

/** Map user text → workspace section + optional scaffold draft. */
export function resolveAssetRoute(text: string): AssetRoute | null {
  const catalog = matchCatalogFromText(text);
  if (!catalog) return null;

  if (catalog.route === "client-avatars") {
    return {
      section: "client-avatars",
      itemType: "Client Avatar",
      ack: "Opening **Client Avatar** beside us — build your ideal client here while we chat.",
    };
  }

  const workshop =
    catalog.route === "projects" ||
    catalog.type === "Workshop" ||
    catalog.type === "Workshop Plan";
  if (workshop) {
    return {
      section: "projects",
      itemType: catalog.type ?? "Workshop",
      bootstrapProjects: true,
      ack: "Opening **Workshop** in **Projects** beside us — your workshop plan lives here while we chat.",
    };
  }

  if (catalog.type) {
    const scaffold = blankScaffoldForType(catalog.type);
    return {
      section: "content-generator",
      itemType: catalog.type,
      title: `New ${catalog.type}`,
      draftContent: scaffold,
      ack: scaffold
        ? `Opening **${catalog.type}** in **Create** — blank scaffold ready beside us. Tell me what to fill in.`
        : `Opening **${catalog.type}** in **Create** beside us — this is your workspace for this asset.`,
    };
  }

  return null;
}

export function assetRouteAck(route: AssetRoute): string {
  return route.ack;
}

export function assetWorkspaceLabel(section: AppSection): string {
  return workspaceTitle(section);
}
