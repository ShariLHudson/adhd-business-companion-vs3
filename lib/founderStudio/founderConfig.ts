/** Founder Studio visual + route constants */
export const FOUNDER_STUDIO_BASE = "/companion/founder" as const;

export const FOUNDER_OFFICE_BACKGROUND =
  "/backgrounds/founder-office-background.png" as const;

export const FOUNDER_COLORS = {
  teal: "#0F6F7C",
  aqua: "#30B6D5",
  gold: "#F5C16C",
  bronze: "#C8922E",
  charcoal: "#2E2E2E",
} as const;

export const FOUNDER_INTEL = {
  spark: {
    acronym: "SPARK",
    name: "Strategic Pattern Analysis & Recommendation Kernel",
    purpose: "Central intelligence and pattern recognition.",
  },
  flame: {
    acronym: "FLAME",
    name: "Founder Learning & Adaptive Mentoring Engine",
    purpose: "Learns Shari, adapts, remembers, mentors, and prioritizes.",
  },
  fire: {
    acronym: "FIRE",
    name: "Founder Intelligence Report Engine",
    purpose:
      "Daily briefings, reports, forecasts, recommendations, PDFs, and archives.",
  },
} as const;
