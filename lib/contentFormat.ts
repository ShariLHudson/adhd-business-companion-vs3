// Make AI output look exactly like it will when the person uses it: strip
// markdown markers most destinations (social, email) show literally, and
// normalize spacing so structure reads cleanly.
export function cleanText(s: string): string {
  if (!s) return "";
  return (
    s
      // bold/italic markers
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/(^|[\s(])\*(\S.*?\S|\S)\*(?=[\s).,!?]|$)/g, "$1$2")
      // stray leftover markers
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      // heading hashes at line start
      .replace(/^#{1,6}\s+/gm, "")
      // trailing spaces + excess blank lines
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
