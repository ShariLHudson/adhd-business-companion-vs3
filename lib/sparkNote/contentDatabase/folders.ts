import type { SparkNoteCategory } from "../types";

/** `spark-library/` folder per SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL. */
export const SPARK_LIBRARY_FOLDER_BY_CATEGORY: Record<SparkNoteCategory, string> =
  {
    invention: "inventions",
    inventor: "inventions",
    entrepreneur: "inspiring-people",
    business: "small-business",
    history: "inventions",
    holiday: "holidays",
    fun_fact: "fun-facts",
    quote: "quotes",
    creativity: "creativity",
    personal_growth: "personal-growth",
    adhd_friendly: "adhd-friendly",
    personal: "personal-events",
  };

export function libraryFolderForCategory(category: SparkNoteCategory): string {
  return SPARK_LIBRARY_FOLDER_BY_CATEGORY[category];
}
