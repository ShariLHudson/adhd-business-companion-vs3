export function generateResearchNote(
  topic: string,
  context?: string,
): { title: string; body: string } {
  const clean = topic
    .replace(/^research\s+/i, "")
    .replace(/\.$/, "")
    .trim();
  const subject = clean || "this topic";

  const questions = [
    `What are proven patterns and best practices for ${subject}?`,
    `What do competitors or adjacent products do well here?`,
    `What is the smallest test that would teach us something useful?`,
    `What would success look like — and how would we measure it?`,
    `What can safely wait while we learn more?`,
  ];

  const body = [
    `# Research: ${subject}`,
    "",
    context ? `Context: ${context}` : null,
    "",
    "## Questions to explore",
    ...questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    "## Findings",
    "(add notes here)",
    "",
    "## Next step",
    "(one concrete action after research)",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    title: `Research: ${subject}`,
    body,
  };
}
