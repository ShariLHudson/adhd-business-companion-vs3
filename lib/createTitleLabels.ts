import { OTHER_OPTION } from "./createTypePickers";
import { NO_CATEGORY } from "./categoryRevealUx";

const TITLE_LABEL_BY_TYPE: Record<string, string> = {
  Workbook: "Workbook Title",
  PDF: "PDF Title",
  Document: "Document Title",
  Strategy: "Strategy Name",
  Spreadsheet: "Spreadsheet Name",
  Letter: "Letter Title",
  SOP: "Process Name",
  Calendar: "Calendar Name",
  "Blog Post": "Article Title",
  Email: "Email Title",
  Newsletter: "Newsletter Title",
  Presentation: "Presentation Title",
  "Sales Page": "Sales Page Title",
  "Landing Page": "Landing Page Title",
  "Lead Magnet": "Lead Magnet Title",
  Workshop: "Workshop Title",
  "Video Script": "Script Title",
  "Podcast Outline": "Episode Title",
  "Book Chapter": "Chapter Title",
};

/** User-facing title field label for a Create artifact type. */
export function createTitleLabelForType(type: string): string {
  const t = type.trim();
  if (!t || t === NO_CATEGORY || t === OTHER_OPTION) return "Title";
  return TITLE_LABEL_BY_TYPE[t] ?? `${t} Title`;
}
