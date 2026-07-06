"use client";

import type { FounderLesson } from "@/lib/founder/memory/types";

type LessonsPanelProps = {
  lessons: FounderLesson[];
};

const KIND_LABELS: Record<FounderLesson["kind"], string> = {
  worked: "What Worked",
  failed: "What Failed",
  unexpected: "Unexpected",
  repeat: "Repeat",
  avoid: "Avoid",
};

export function LessonsPanel({ lessons }: LessonsPanelProps) {
  return (
    <section className="memory-lessons" aria-labelledby="memory-lessons-heading">
      <h2 className="memory-lessons__heading" id="memory-lessons-heading">
        Lessons Learned
      </h2>
      <ul className="memory-lessons__grid">
        {lessons.map((lesson) => (
          <li key={lesson.id} className={`memory-lessons__card memory-lessons__card--${lesson.kind}`}>
            <span className="memory-lessons__kind">{KIND_LABELS[lesson.kind]}</span>
            <h3 className="memory-lessons__title">{lesson.title}</h3>
            <p className="memory-lessons__summary">{lesson.summary}</p>
            <p className="memory-lessons__context">{lesson.context}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
