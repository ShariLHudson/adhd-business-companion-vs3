import { getJournalGazeboVisitorName } from "./memberName";

const MORNING = [
  "Welcome back{name}. The Gazebo is especially peaceful this morning.",
  "Good morning{name}. I've prepared everything for you.",
  "Welcome back{name}. The light is gentle today — a good day to write.",
] as const;

const AFTERNOON = [
  "Welcome back{name}.",
  "It's nice to see you again{name}. Your journal is here whenever you're ready.",
  "Welcome back{name}. Take your time — your page is waiting.",
] as const;

const EVENING = [
  "Welcome back{name}. The Gazebo is quiet this evening.",
  "Good evening{name}. Take your time — there's nowhere you need to be.",
  "Welcome back{name}. The day can wait a little longer.",
] as const;

const ANYTIME = [
  "Welcome back{name}.",
  "I'm glad you're here{name}.",
  "Your page is waiting{name}, whenever you are.",
] as const;

function applyName(template: string, name: string): string {
  const suffix = name ? `, ${name}` : "";
  return template.replace("{name}", suffix);
}

/** Return-visit greeting — varies by time of day; never the welcome envelope again. */
export function pickJournalGazeboReturnGreeting(): string {
  const hour = new Date().getHours();
  const name = getJournalGazeboVisitorName();
  const pool =
    hour >= 5 && hour < 12
      ? MORNING
      : hour >= 12 && hour < 17
        ? AFTERNOON
        : hour >= 17 || hour < 5
          ? EVENING
          : ANYTIME;
  const line = pool[Math.floor(Math.random() * pool.length)] ?? ANYTIME[0]!;
  return applyName(line, name);
}
