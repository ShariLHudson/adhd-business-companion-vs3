/**
 * Parking Lot — organized destination for parked items.
 * Distinct from Park It (one-item capture) and Clear My Mind (many thoughts).
 */

export const PARKING_LOT_TITLE = "Parking Lot" as const;

export const PARKING_LOT_EXPLANATION =
  "Your Parking Lot is a safe place for things you are not ready to act on yet. Nothing here needs your attention until you are ready. You can leave items alone, organize them, move them to Today, create reminders, add them to projects, or remove them when they no longer matter." as const;

export const PARKING_LOT_SUPPORT_LINE =
  "This is where you review and organize what you parked." as const;

export const PARKING_LOT_PRIMARY_CTA = "View My Parking Lot" as const;

export const PARKING_LOT_EMPTY =
  "Your Parking Lot is empty. Anything you set aside will wait here until you are ready." as const;

export const PARKING_LOT_NO_ATTENTION_NEEDED =
  "Nothing here needs your attention right now. You can review one item, organize a few, or leave everything parked." as const;

export const PARKING_LOT_SUMMARY_TEMPLATE = (
  total: number,
  attention: number,
) =>
  attention > 0
    ? `You have ${total} parked item${total === 1 ? "" : "s"}. Only ${attention} need${attention === 1 ? "s" : ""} your attention today.`
    : `You have ${total} parked item${total === 1 ? "" : "s"}. Nothing here needs your attention right now.`;

export const PARKING_LOT_HOW_DO_I_COPY = [
  "Parking Lot is the organized place where parked items live. Review and organize later — nothing must be processed immediately.",
  "Leave Parked means the item stays here with no further action. Review dates are optional reminders for later; they are not overdue alarms unless you set one.",
  "You can move items to Today, create a reminder, add to a project, archive, or delete. Use filters and search when the list grows.",
  "Park It captures one item. Clear My Mind is for many thoughts competing for attention. Do not use Parking Lot as another capture-first experience when you only need to park one thing — open Park It instead.",
].join("\n\n");

/** @deprecated Prefer PARKING_LOT_HOW_DO_I_COPY — kept for older imports during migration. */
export const PARKING_LOT_HOW_DO_I_BODY = PARKING_LOT_HOW_DO_I_COPY;
