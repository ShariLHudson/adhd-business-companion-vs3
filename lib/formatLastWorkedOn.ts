function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Human label for when work was last touched — e.g. "Last worked on yesterday". */
export function formatLastWorkedOn(iso: string, now = new Date()): string {
  const worked = startOfLocalDay(new Date(iso));
  const today = startOfLocalDay(now);
  const diffDays = Math.round(
    (today.getTime() - worked.getTime()) / 86_400_000,
  );

  if (diffDays <= 0) return "Last worked on today";
  if (diffDays === 1) return "Last worked on yesterday";
  if (diffDays < 7) {
    return `Last worked on ${worked.toLocaleDateString(undefined, {
      weekday: "long",
    })}`;
  }
  return `Last worked on ${worked.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}
