export type WelcomeRoomAccent =
  | "birthday"
  | "vacation"
  | "milestone"
  | null;

function isSameMonthDay(
  month: number,
  day: number,
  now: Date,
): boolean {
  return month === now.getMonth() + 1 && day === now.getDate();
}

export function resolveWelcomeRoomAccent(input: {
  birthday?: { month: number; day: number } | null;
  recognitionType?: string | null;
  now?: Date;
}): WelcomeRoomAccent {
  const now = input.now ?? new Date();
  if (input.birthday && isSameMonthDay(input.birthday.month, input.birthday.day, now)) {
    return "birthday";
  }
  if (
    input.recognitionType === "project_milestone" ||
    input.recognitionType === "business_milestone"
  ) {
    return "milestone";
  }
  return null;
}
