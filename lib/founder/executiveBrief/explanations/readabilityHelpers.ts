/** Readability helpers — plain English executive copy standards. */

const AI_BUZZWORDS = [
  /\bLLM\b/gi,
  /\bGPT\b/gi,
  /\bmachine learning\b/gi,
  /\bneural\b/gi,
  /\bprompt engineering\b/gi,
  /\bagents?\b/gi,
  /\borchestrat(e|ion)\b/gi,
  /\bembedding(s)?\b/gi,
  /\bRAG\b/g,
  /\bfine-?tun(e|ing)\b/gi,
];

const ENTERPRISE_JARGON = [
  /\bsynerg(y|ies)\b/gi,
  /\bleverage\b/gi,
  /\boptimize\b/gi,
  /\bKPI\b/g,
  /\bOKR\b/g,
  /\bstakeholder alignment\b/gi,
  /\bparadigm\b/gi,
];

export function stripExecutiveJargon(text: string): string {
  let result = text;
  for (const pattern of [...AI_BUZZWORDS, ...ENTERPRISE_JARGON]) {
    result = result.replace(pattern, (match) => {
      const lower = match.toLowerCase();
      if (lower.includes("leverage")) return "use";
      if (lower.includes("optimize")) return "improve";
      if (lower.includes("orchestrat")) return "coordinate";
      if (lower.includes("agent")) return "helper";
      return "";
    });
  }
  return result.replace(/\s{2,}/g, " ").trim();
}

export function isPlainEnglish(text: string): boolean {
  const cleaned = stripExecutiveJargon(text);
  if (!cleaned) return false;
  const words = cleaned.split(/\s+/);
  if (words.length > 45) return false;
  const avgWordLength = words.reduce((s, w) => s + w.length, 0) / words.length;
  return avgWordLength < 8;
}

export function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}

export function ensureShortSentences(text: string, maxSentences = 3): string {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.slice(0, maxSentences).join(" ");
}

export function readabilityScore(text: string): number {
  let score = 100;
  if (!isPlainEnglish(text)) score -= 25;
  if (sentenceCount(text) > 4) score -= 15;
  if (text.length > 280) score -= 10;
  return Math.max(0, Math.min(100, score));
}
