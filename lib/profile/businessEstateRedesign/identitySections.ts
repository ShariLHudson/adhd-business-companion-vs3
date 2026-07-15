import type { IdentitySectionDefinition } from "./types";

export const IDENTITY_OFFICE_BENEFIT =
  "Helps Shari keep suggestions aligned with your business, purpose, values, and direction.";

export const IDENTITY_SECTION_DEFINITIONS: readonly IdentitySectionDefinition[] =
  [
    {
      id: "business-basics",
      title: "Business Basics",
      benefit:
        "Gives Shari the foundation she needs to understand what your business is and where it stands today.",
      implemented: true,
      recommended: true,
    },
    {
      id: "business-story",
      title: "Business Story",
      benefit: "Helps Shari understand how your business came to be.",
      implemented: false,
    },
    {
      id: "purpose",
      title: "Purpose",
      benefit: "Keeps guidance aligned with why your business exists.",
      implemented: false,
    },
    {
      id: "mission",
      title: "Mission",
      benefit: "Clarifies what your business is here to do.",
      implemented: false,
    },
    {
      id: "vision",
      title: "Vision",
      benefit: "Holds the longer picture of where you are headed.",
      implemented: false,
    },
    {
      id: "values",
      title: "Values",
      benefit: "Protects what your business stands for in everyday choices.",
      implemented: false,
    },
    {
      id: "guiding-principles",
      title: "Guiding Principles",
      benefit: "Simple rules that keep decisions steady.",
      implemented: false,
    },
    {
      id: "boundaries",
      title: "Boundaries and Non-Negotiables",
      benefit: "Makes clear what you will and will not do.",
      implemented: false,
    },
    {
      id: "definition-of-success",
      title: "Definition of Success",
      benefit: "Defines what “working” looks like for your business.",
      implemented: false,
    },
  ] as const;
