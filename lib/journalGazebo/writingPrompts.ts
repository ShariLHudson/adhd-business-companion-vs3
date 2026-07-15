/** Rotating journal prompts — short questions at the top of blank pages. */

import {
  DEFAULT_JOURNAL_INTENTION,
  resolveJournalIntention,
  type JournalIntentionId,
} from "./journalIntentions";

const JOURNEY_PROMPTS = [
  "What is on your heart today?",
  "What surprised you today?",
  "What do you want to remember?",
  "What gave you a little hope?",
  "What would you tell tomorrow-you?",
  "What felt quietly good today?",
  "What can wait until later?",
  "Who crossed your mind today?",
  "What felt heavy — and what felt lighter?",
  "What are you proud of, even quietly?",
  "What would feel like enough for today?",
  "What do you want to notice more often?",
  "What helped you keep going?",
  "What story from today do you want to keep?",
  "What is asking for your attention gently?",
  "What did you learn about yourself today?",
  "What would make tomorrow feel a little easier?",
  "Where did you feel most like yourself?",
  "What do you want to celebrate, however small?",
] as const;

const PRAYER_PROMPTS = [
  "What do you want to bring into prayer today?",
  "Where do you need peace?",
  "Who are you holding in your heart?",
  "What are you thankful to God for today?",
  "What feels heavy enough to hand over?",
  "Where did you sense a quiet answer?",
  "What Scripture or truth is staying with you?",
  "What do you need courage for?",
  "What mercy did you notice today?",
  "What would surrender look like, gently?",
  "Who needs your intercession right now?",
  "What are you listening for?",
  "Where do you need forgiveness — given or received?",
  "What hope are you clinging to?",
  "How did faith meet you today, even quietly?",
] as const;

const GRATITUDE_PROMPTS = [
  "What are you grateful for today?",
  "What made you smile?",
  "What felt like a small gift?",
  "Who made today a little kinder?",
  "What ordinary thing are you glad exists?",
  "What beauty did you almost miss?",
  "What comfort showed up when you needed it?",
  "What are you glad happened?",
  "What do you want to thank yourself for?",
  "What made today feel lighter?",
  "What abundance do you already have?",
  "What moment would you bottle if you could?",
  "What kindness did you give or receive?",
  "What simple pleasure grounded you?",
  "What are you noticing with a fuller heart?",
] as const;

const HEALTH_PROMPTS = [
  "How does your body feel right now?",
  "What would rest look like today?",
  "What helped your energy, even a little?",
  "What is your body asking for?",
  "What felt nourishing today?",
  "Where do you need gentleness with yourself?",
  "What movement felt good — or what stillness?",
  "What drained you, and what restored you?",
  "How was your sleep, honestly?",
  "What would care for yourself look like next?",
  "What symptom or signal deserves kindness?",
  "What boundary would protect your health?",
  "What are you celebrating about healing, however small?",
  "What does enough capacity look like today?",
  "How can tomorrow ask a little less of you?",
] as const;

const CREATIVE_PROMPTS = [
  "What idea is tugging at you?",
  "What would you make if nobody was watching?",
  "What color, image, or phrase is staying with you?",
  "What are you curious about creating?",
  "What spark showed up today?",
  "What would you try if it did not have to be good?",
  "What story wants the next sentence?",
  "What inspired you, even briefly?",
  "What would you sketch in the margin?",
  "Where did imagination open a door?",
  "What creative fear can you set down for a page?",
  "What would play look like in your work today?",
  "What fragment do you want to keep?",
  "What would you make just for joy?",
  "What is asking to be finished — or begun?",
] as const;

const BUSINESS_PROMPTS = [
  "What decision is waiting for clarity?",
  "What feels most important in the business today?",
  "Who needs a thoughtful follow-up?",
  "What would move one thing forward?",
  "What are you avoiding that might be simpler than it seems?",
  "What win, however small, happened recently?",
  "What would make tomorrow’s work feel clearer?",
  "Where do you need a boundary with clients or time?",
  "What idea deserves one honest next step?",
  "What are you learning about how you work best?",
  "What can wait so something better can breathe?",
  "What would “enough for today” look like in the business?",
  "Who crossed your mind that you want to remember?",
  "What pattern are you noticing in your work?",
  "What would help you trust your next decision?",
] as const;

const PROMPTS_BY_INTENTION: Record<JournalIntentionId, readonly string[]> = {
  journey: JOURNEY_PROMPTS,
  prayer: PRAYER_PROMPTS,
  gratitude: GRATITUDE_PROMPTS,
  health: HEALTH_PROMPTS,
  creative: CREATIVE_PROMPTS,
  business: BUSINESS_PROMPTS,
};

function promptsFor(intention?: JournalIntentionId | null): readonly string[] {
  return PROMPTS_BY_INTENTION[resolveJournalIntention(intention)];
}

function pickFrom(
  prompts: readonly string[],
  seed: number,
): string {
  const index = ((seed % prompts.length) + prompts.length) % prompts.length;
  return prompts[index] ?? prompts[0]!;
}

/** Same prompt all day; rotates naturally day to day. */
export function pickJournalWritingPrompt(
  date = new Date(),
  intention: JournalIntentionId = DEFAULT_JOURNAL_INTENTION,
): string {
  const seed =
    date.getFullYear() * 372 +
    date.getMonth() * 31 +
    date.getDate();
  return pickFrom(promptsFor(intention), seed);
}

/** Short question on blank writing pages — varies by page, day, and journal type. */
export function pickJournalPageTip(
  pageIndex: number,
  date = new Date(),
  intention?: JournalIntentionId | null,
): string {
  const seed =
    date.getFullYear() * 372 +
    date.getMonth() * 31 +
    date.getDate() +
    pageIndex * 17;
  return pickFrom(promptsFor(intention), seed);
}
