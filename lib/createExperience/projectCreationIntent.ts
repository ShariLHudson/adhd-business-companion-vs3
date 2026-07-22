/**
 * Client-safe project-creation intent detection.
 *
 * Kept separate from createExperienceRouting so estate / intent-first
 * navigation can classify without pulling the full Create routing graph
 * into the companion client bundle.
 */

import { hasLeadingExplicitNavigationVerb } from "@/lib/estate/explicitNavigationVerb";

const PROJECT_CREATE_RE =
  /\b(?:create|start|new|add|begin)\s+(?:a\s+)?(?:new\s+)?project\b|\b(?:want|need|like)\s+to\s+(?:create|start|begin)\s+(?:a\s+)?(?:new\s+)?project\b|\bturn\s+(?:this|it|that)\s+into\s+a\s+project\b|\borganize\s+(?:this|it|that)\s+as\s+a\s+project\b|\bhelp\s+me\s+(?:start|create|organize)\s+(?:a\s+)?(?:new\s+)?project\b/i;

export function isProjectCreationIntent(userText: string): boolean {
  const text = userText.trim();
  if (!text) return false;
  // "Go to Create / Projects…" is destination routing, not project-create workflow.
  if (hasLeadingExplicitNavigationVerb(text)) return false;
  return PROJECT_CREATE_RE.test(text);
}
