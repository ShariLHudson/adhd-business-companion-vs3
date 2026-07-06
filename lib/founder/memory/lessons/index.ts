import { sampleMemoryRepository } from "../repositories/sample";
import type { FounderLesson } from "../types";

export function listLessonsLearned(): FounderLesson[] {
  return sampleMemoryRepository.listLessons();
}

export function lessonsByKind(kind: FounderLesson["kind"]) {
  return listLessonsLearned().filter((lesson) => lesson.kind === kind);
}
