/**
 * Momentum Institute — six colleges (orientation copy; drawer wall remains navigation).
 */

export type InstituteCollege = {
  id: string;
  title: string;
};

export const MOMENTUM_INSTITUTE_COLLEGES: InstituteCollege[] = [
  { id: "business-growth", title: "College of Business Growth" },
  { id: "entrepreneurial-leadership", title: "College of Entrepreneurial Leadership" },
  { id: "strategic-thinking", title: "College of Strategic Thinking" },
  { id: "adhd-entrepreneurship", title: "College of ADHD Entrepreneurship" },
  { id: "ai-innovation", title: "College of AI & Innovation" },
  { id: "business-operations", title: "College of Business Operations" },
] as const;

export const MOMENTUM_INSTITUTE_ARRIVAL = {
  title: "Momentum Institute",
  invitation: "Choose a drawer to begin.",
} as const;
