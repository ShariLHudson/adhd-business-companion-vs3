import { BUSINESS_CANVAS_SECTION_GUIDANCE } from "./guidance";
import { BUSINESS_CANVAS_SECTION_ORDER } from "./types";

export const BUSINESS_CANVAS_GLOBAL_GUIDES = [
  {
    id: "how-to-use",
    title: "How To Use Business Canvas",
    body: [
      "Tap Open on any box to add sticky-note entries for that part of your business.",
      "Only one box expands at a time — stay focused on one area.",
      "When enough boxes have entries, Generate Business Canvas for insights and next steps.",
      "Map your current business first. Explore changes after you generate.",
    ],
  },
  {
    id: "what-sections-mean",
    title: "What Each Section Means",
    body: BUSINESS_CANVAS_SECTION_ORDER.map(
      (id) =>
        `${BUSINESS_CANVAS_SECTION_GUIDANCE[id].title}: ${BUSINESS_CANVAS_SECTION_GUIDANCE[id].explanation}`,
    ),
  },
  {
    id: "future-predictions",
    title: "How Future Predictions Work",
    body: [
      "After you generate your current canvas, you can explore a business change.",
      "The companion asks a few follow-up questions — not a long survey.",
      "Impact analysis shows which boxes may shift and why, using ripple-effect guidance.",
      "Living Canvas and simulations will highlight related boxes visually in the future.",
    ],
  },
  {
    id: "after-generate",
    title: "What You'll Receive After Generate",
    body: [
      "Visual canvas with your entries in place",
      "Business summary and key relationships",
      "Risks and opportunities",
      "Recommendations and suggested next steps",
      "Board of Directors observations",
      "What-If Analysis placeholder for change exploration",
    ],
  },
] as const;
