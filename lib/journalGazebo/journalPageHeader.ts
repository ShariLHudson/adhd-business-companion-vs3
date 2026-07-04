/** Handwritten-style page header — memory, not metadata. */

export type JournalPageHeader = {
  lines: readonly string[];
};

function seasonPhrase(month: number): string | null {
  if (month >= 2 && month <= 4) return "A Spring Morning";
  if (month >= 5 && month <= 7) return "A Summer Evening";
  if (month >= 8 && month <= 10) return "An Autumn Afternoon";
  return "A Winter Evening";
}

function momentPhrase(hour: number, month: number): string {
  if (hour >= 5 && hour < 8) return "Early Light";
  if (hour >= 8 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 14) return "Midday";
  if (hour >= 14 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 19) return "Golden Hour";
  if (hour >= 19 && hour < 22) return seasonPhrase(month) ?? "Evening";
  if (hour >= 22 || hour < 5) return "Quiet Night";
  return "This Moment";
}

function fullDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function clockTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Varies layout by day — always warm, never like a system timestamp. */
export function buildJournalPageHeader(
  date = new Date(),
  showTime = true,
): JournalPageHeader {
  const moment = momentPhrase(date.getHours(), date.getMonth());
  const variant = date.getDate() % 3;

  if (!showTime) {
    return { lines: [shortDate(date)] };
  }

  if (variant === 0) {
    return { lines: [fullDate(date), moment] };
  }
  if (variant === 1) {
    return { lines: [moment, shortDate(date), clockTime(date)] };
  }
  return { lines: [fullDate(date), clockTime(date)] };
}
