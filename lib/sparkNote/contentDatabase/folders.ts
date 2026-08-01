import type { SparkNoteCategory } from "../types";

/** `spark-library/` folder per SPARK_NOTE_CONTENT_DATABASE_STRUCTURE_PROTOCOL.
    One folder per numbered Spark Edition (001–012). */
export const SPARK_LIBRARY_FOLDER_BY_CATEGORY: Record<SparkNoteCategory, string> =
  {
    "001": "001-discovery",
    "002": "002-people-stories",
    "003": "003-creativity-inspiration",
    "004": "004-nature-places",
    "005": "005-curiosity",
    "006": "006-words-origins",
    "007": "007-strategy",
    "008": "008-reflection",
    "009": "009-adventure",
    "010": "010-business",
    "011": "011-innovation",
    "012": "012-wonder",
  };

export function libraryFolderForCategory(category: SparkNoteCategory): string {
  return SPARK_LIBRARY_FOLDER_BY_CATEGORY[category];
}
