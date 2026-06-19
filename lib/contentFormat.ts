// Make AI output look exactly like it will when the person uses it: strip
// markdown markers most destinations (social, email) show literally, and
// normalize spacing so structure reads cleanly.
import { toPlainLanguageDisplay } from "./plainLanguageFormatting";

export function cleanText(s: string): string {
  return toPlainLanguageDisplay(s);
}
