/** Executive Search™ — future universal search architecture (V1: scope definition only). */

export type ExecutiveSearchScopeId =
  | "documents"
  | "prompts"
  | "research"
  | "projects"
  | "products"
  | "missions"
  | "emails"
  | "calendars"
  | "drive"
  | "postcraft"
  | "gohighlevel"
  | "github"
  | "cursor"
  | "notebooklm";

export type ExecutiveSearchScope = {
  id: ExecutiveSearchScopeId;
  label: string;
  description: string;
  status: "planned" | "partial" | "live";
};

export const EXECUTIVE_SEARCH_HEADLINE = "Executive Search™";
export const EXECUTIVE_SEARCH_SUMMARY =
  "One search box — documents, prompts, research, missions, email, calendars, Drive, PostCraft, GoHighLevel, GitHub, Cursor, and NotebookLM libraries. Architecture prepared; universal search ships in a future sprint.";

export const EXECUTIVE_SEARCH_SCOPES: readonly ExecutiveSearchScope[] = [
  { id: "documents", label: "Documents", description: "Knowledge Vault and Master Library", status: "partial" },
  { id: "prompts", label: "Prompts", description: "Master Prompt Library and vault prompts", status: "partial" },
  { id: "research", label: "Research", description: "Executive Research Center reports", status: "planned" },
  { id: "projects", label: "Projects", description: "Active initiatives and work packets", status: "planned" },
  { id: "products", label: "Products", description: "Spark products and ecosystem map", status: "planned" },
  { id: "missions", label: "Missions", description: "Executive missions and priorities", status: "planned" },
  { id: "emails", label: "Emails", description: "Gmail — unread and threads", status: "planned" },
  { id: "calendars", label: "Calendars", description: "Google Calendar — today and upcoming", status: "planned" },
  { id: "drive", label: "Drive", description: "Google Drive master files", status: "planned" },
  { id: "postcraft", label: "PostCraft", description: "Campaigns and content assets", status: "planned" },
  { id: "gohighlevel", label: "GoHighLevel", description: "CRM, funnels, automations", status: "planned" },
  { id: "github", label: "GitHub", description: "Issues, milestones, repositories", status: "planned" },
  { id: "cursor", label: "Cursor", description: "Implementation context and rules", status: "partial" },
  { id: "notebooklm", label: "NotebookLM Libraries", description: "Large document collection synthesis", status: "planned" },
] as const;

export type ExecutiveSearchArchitectureView = {
  headline: string;
  summary: string;
  scopes: readonly ExecutiveSearchScope[];
};

export function composeExecutiveSearchArchitecture(): ExecutiveSearchArchitectureView {
  return {
    headline: EXECUTIVE_SEARCH_HEADLINE,
    summary: EXECUTIVE_SEARCH_SUMMARY,
    scopes: EXECUTIVE_SEARCH_SCOPES,
  };
}
