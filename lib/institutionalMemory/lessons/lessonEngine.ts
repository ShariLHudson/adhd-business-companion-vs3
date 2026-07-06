import type { LessonLearned } from "../types";
import { institutionalMemorySampleRepository } from "../repositories/sample";

export type LessonEngineResult = {
  whatWorked: string[];
  whatFailed: string[];
  whatSurprised: string[];
  shouldRepeat: string[];
  neverRepeat: string[];
};

export function findLessons(filter?: { missionId?: string }): LessonLearned[] {
  const list = filter?.missionId
    ? institutionalMemorySampleRepository.forMission(filter.missionId)
    : institutionalMemorySampleRepository.list();
  return list.filter((m): m is LessonLearned => m.kind === "lesson");
}

export function analyzeLessons(lessons: LessonLearned[]): LessonEngineResult {
  const result: LessonEngineResult = {
    whatWorked: [],
    whatFailed: [],
    whatSurprised: [],
    shouldRepeat: [],
    neverRepeat: [],
  };

  for (const lesson of lessons) {
    for (const line of lesson.lessonsLearned) {
      const lower = line.toLowerCase();
      if (lower.startsWith("what worked:")) result.whatWorked.push(line.replace(/^what worked:\s*/i, ""));
      else if (lower.startsWith("what failed:")) result.whatFailed.push(line.replace(/^what failed:\s*/i, ""));
      else if (lower.startsWith("surprise:")) result.whatSurprised.push(line.replace(/^surprise:\s*/i, ""));
      else if (lesson.wouldDoAgain === true) result.shouldRepeat.push(line);
      else if (lesson.wouldDoAgain === false) result.neverRepeat.push(line);
      else result.shouldRepeat.push(line);
    }
  }

  return result;
}
