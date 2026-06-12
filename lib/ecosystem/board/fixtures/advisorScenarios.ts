// Founder Ecosystem — Phase 5 sample advisor scenarios.
// Canonical founder messages and the advisor(s) the board should engage. Used
// by tests and as living documentation of the routing intent.

import type { AdvisorId } from "../advisorTypes";

export type AdvisorScenario = {
  message: string;
  primary: AdvisorId;
  secondaryIncludes?: AdvisorId;
};

export const ADVISOR_SCENARIOS: AdvisorScenario[] = [
  { message: "I need more clients", primary: "sales", secondaryIncludes: "marketing" },
  { message: "I'm overwhelmed", primary: "productivity", secondaryIncludes: "wellness" },
  { message: "I have too many ideas", primary: "ceo", secondaryIncludes: "operations" },
  {
    message: "I don't know what to work on",
    primary: "productivity",
    secondaryIncludes: "ceo",
  },
  {
    message: "I keep starting things and never finishing them",
    primary: "accountability",
  },
  { message: "I'm exhausted and running on empty", primary: "wellness" },
  { message: "How do I get more visibility for my offer?", primary: "marketing" },
  {
    message: "This onboarding is so repetitive — can I systemize it?",
    primary: "operations",
  },
];
