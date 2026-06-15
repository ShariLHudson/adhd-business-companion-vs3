import type { LastActivity } from "@/lib/companionStore";

/** One-line memory cue for the calm home screen — no cards, no pressure. */
export function memoryCueFromLastActivity(
  act: LastActivity | null,
): string | null {
  if (!act?.title?.trim()) return null;

  const title = act.title.trim();
  const lower = title.charAt(0).toLowerCase() + title.slice(1);

  if (act.summary?.trim()) {
    const s = act.summary.trim();
    if (/^last time/i.test(s)) return s.endsWith(".") ? s : `${s}.`;
    if (/^i remember/i.test(s)) return s.endsWith(".") ? s : `${s}.`;
    return `Last time we talked about ${s.endsWith(".") ? s.slice(0, -1) : s}.`;
  }

  if (act.kind === "chat") {
    return `Last time we talked about ${lower}.`;
  }
  if (act.kind === "draft") {
    const kind = act.contentType?.trim();
    if (kind) return `Last time you were working on your ${kind.toLowerCase()}.`;
    return `Last time you were working on ${lower}.`;
  }
  if (act.kind === "project") {
    return `Last time we were working on ${lower}.`;
  }
  return `Last time we were working on ${lower}.`;
}
