import { assertShariVoice, sanitizeShariVoice } from "./rules";

export function interpolateVoiceTemplate(
  text: string,
  vars: Record<string, string>,
): string {
  const filled = sanitizeShariVoice(
    text.replace(/\{(\w+)\}/g, (_, key: string) => vars[key]?.trim() ?? ""),
  );
  return assertShariVoice(filled, "template");
}

export function shortTopicLabel(topic: string, max = 48): string {
  const trimmed = topic.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}
