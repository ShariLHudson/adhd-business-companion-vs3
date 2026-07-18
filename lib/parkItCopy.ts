/**
 * Park It — one-item capture so attention can return to what matters now.
 * Distinct from Clear My Mind (many thoughts) and Parking Lot (review destination).
 */

export const PARK_IT_TITLE = "Park It" as const;

export const PARK_IT_EXPLANATION =
  "Have one thing you are not ready to deal with? Park it here so you can stop carrying it in your head. It will stay safely in your Parking Lot until you decide what to do with it." as const;

export const PARK_IT_SUPPORT_LINE =
  "Best for one task, idea, worry, follow-up, or reminder." as const;

export const PARK_IT_PRIMARY_CTA = "Park This" as const;

export const PARK_IT_FIELD_LABEL = "What would you like to park?" as const;

export const PARK_IT_FIELD_PLACEHOLDER =
  "One task, idea, worry, follow-up, or reminder…" as const;

export const PARK_IT_NOTE_LABEL = "Optional note" as const;

export const PARK_IT_NOTE_PLACEHOLDER =
  "Anything else you want future-you to remember…" as const;

export const PARK_IT_CONFIRM =
  "Parked. You can let this go for now—it will be waiting in your Parking Lot." as const;

export const PARK_IT_DONE_LABEL = "Done" as const;

export const PARK_IT_SECONDARY_REVIEW_DATE = "Add a Review Date" as const;

export const PARK_IT_SECONDARY_MOVE = "Move It Somewhere Else" as const;

export const PARK_IT_SECONDARY_EDIT = "Edit" as const;

export const PARK_IT_HOW_DO_I_BODY = [
  "Use Park It when there is one specific thing you want to stop thinking about for now.",
  "Title is enough. Notes, category, and review date are optional — never required to park.",
  "After you park, you can leave. The item waits in your Parking Lot until you are ready.",
  "Use Clear My Mind when many thoughts are competing. Use Parking Lot when you want to review what you already parked.",
].join("\n\n");
