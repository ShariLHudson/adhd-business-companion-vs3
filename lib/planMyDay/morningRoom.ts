import { STUDY_ROOM_BG } from "@/lib/companionHomestead";

/** Plan My Day Morning Room — full-screen planning sanctuary (Study). */
export const PLAN_MY_DAY_MORNING_BG = STUDY_ROOM_BG;

export const PLAN_MY_DAY_WORKSPACE_MAX_WIDTH = "35rem" as const; /* 560px */
export const PLAN_MY_DAY_WORKSPACE_MIN_WIDTH = "27.5rem" as const; /* 440px */

export const PLAN_MY_DAY_MORNING_COPY = {
  title: "Plan My Day",
  adaptMyDay: "Adapt My Day",
  dayQuestion: "What deserves your attention today?",
  dayHelper:
    "Don't worry about organizing anything. Just tell me what's on your mind, and we'll figure it out together.",
  previousScreen: "Previous Screen",
  yesFeelsRight: "Yes — This feels right",
  notRightNow: "Not Right Now",
  helpMeFigureItOut: "Help Me Figure It Out",
} as const;
