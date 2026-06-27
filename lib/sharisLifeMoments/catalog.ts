/**
 * Shari's Life Moments — first-person experiences, never advice.
 * @see docs/companion-homestead/SHARIS_LIFE_MOMENTS.md
 */

export type LifeMomentCategory =
  | "brain_wont_slow"
  | "working_too_long"
  | "overwhelmed"
  | "cant_decide"
  | "need_encouragement"
  | "need_joy";

export type LifeMomentEntry = {
  id: string;
  category: LifeMomentCategory;
  /** First-person Shari — invitation into her life, not instruction. */
  text: string;
};

export const LIFE_MOMENT_CATEGORIES: readonly {
  id: LifeMomentCategory;
  label: string;
  when: string;
}[] = [
  {
    id: "brain_wont_slow",
    label: "When my brain won't slow down",
    when: "Racing thoughts, hyperfocus hangover, mental static",
  },
  {
    id: "working_too_long",
    label: "When I've been working too long",
    when: "Screen fatigue, too many hours at the desk",
  },
  {
    id: "overwhelmed",
    label: "When I'm overwhelmed",
    when: "Flooded, carrying too much, isolated",
  },
  {
    id: "cant_decide",
    label: "When I can't make a decision",
    when: "Stuck between options, circling the same choice",
  },
  {
    id: "need_encouragement",
    label: "When I need encouragement",
    when: "Discouraged, middle of something hard",
  },
  {
    id: "need_joy",
    label: "When I need a little joy",
    when: "Flat, gray, or ready to celebrate small things",
  },
];

export const LIFE_MOMENT_CATALOG: readonly LifeMomentEntry[] = [
  // brain won't slow down
  {
    id: "brain-crochet",
    category: "brain_wont_slow",
    text: "When my brain won't slow down, I pick up my crocheting for a while. Doesn't fix everything — just gives my hands something honest to do.",
  },
  {
    id: "brain-jewelry",
    category: "brain_wont_slow",
    text: "Sometimes I make jewelry for a little while — nothing fancy, just something my hands can finish while my head quiets down.",
  },
  {
    id: "brain-color",
    category: "brain_wont_slow",
    text: "I color sometimes when my thoughts won't line up. It's not profound. It just helps.",
  },
  {
    id: "brain-journal",
    category: "brain_wont_slow",
    text: "I'll work on one of my journals — not to solve anything, just to put something on paper.",
  },
  {
    id: "brain-aquarium",
    category: "brain_wont_slow",
    text: "I watch the fish in the aquarium for a few minutes. Something about that slow movement helps my brain unclench.",
  },
  {
    id: "brain-coffee-nook",
    category: "brain_wont_slow",
    text: "I sit with a cup of coffee in my kitchen nook and let the room be quiet. No fixing. Just sitting.",
  },
  // working too long
  {
    id: "work-kinsey",
    category: "working_too_long",
    text: "When I've been at the desk too long, I take Kinsey outside. She doesn't care about my to-do list — and that's kind of the point.",
  },
  {
    id: "work-etrike",
    category: "working_too_long",
    text: "If I've been staring at the same problem too long, I'll grab my e-trike and go for a ride. Fresh air has a way of helping me untangle my thoughts.",
  },
  {
    id: "work-garden",
    category: "working_too_long",
    text: "I walk around the garden for a few minutes — not to accomplish anything, just to notice there's a world outside the screen.",
  },
  {
    id: "work-deck",
    category: "working_too_long",
    text: "I sit on the deck for a few minutes. Wind, birds, nothing urgent. It resets me better than another cup of coffee.",
  },
  {
    id: "work-birds",
    category: "working_too_long",
    text: "I watch the birds at the feeder until my shoulders drop a little. Small thing. Real thing.",
  },
  // overwhelmed
  {
    id: "overwhelm-write",
    category: "overwhelmed",
    text: "When everything's piled up, I clear my mind by writing it all down — not to solve it, just to get it out of my head.",
  },
  {
    id: "overwhelm-call",
    category: "overwhelmed",
    text: "When I start feeling isolated, I'll call a friend just to hear another voice. I don't always feel like it beforehand, but I'm usually glad I did.",
  },
  {
    id: "overwhelm-nap",
    category: "overwhelmed",
    text: "You know what I do when my brain gets to that point? Sometimes I quit fighting it and take a nap. Doesn't always fix everything, but I almost always think more clearly afterward.",
  },
  {
    id: "overwhelm-crime-show",
    category: "overwhelmed",
    text: "Sometimes I watch a crime show for an hour and let someone else's problem be loud for a while. Weird, but it works for me.",
  },
  {
    id: "overwhelm-hands",
    category: "overwhelmed",
    text: "I'll work on something creative with my hands — crochet, jewelry, whatever's closest. Motion without a deadline.",
  },
  {
    id: "overwhelm-not-today",
    category: "overwhelmed",
    text: "Sometimes I simply decide today's not the day, and that's okay too.",
  },
  // can't decide
  {
    id: "decide-step-away",
    category: "cant_decide",
    text: "When I can't make a decision, I step away from it for a while. The answer usually isn't where I'm staring.",
  },
  {
    id: "decide-different",
    category: "cant_decide",
    text: "I'll work on something completely different for a bit — not avoidance, just giving the decision room to breathe.",
  },
  {
    id: "decide-outside",
    category: "cant_decide",
    text: "I go outside. Iowa air, Kinsey, the garden — something about moving my body loosens a stuck choice.",
  },
  {
    id: "decide-pray",
    category: "cant_decide",
    text: "I pray about it — not dramatically, just honestly. Sometimes that's the only quiet left in the house.",
  },
  {
    id: "decide-sleep",
    category: "cant_decide",
    text: "If I can, I sleep on it. Morning Shari is usually kinder than tired Shari.",
  },
  // need encouragement
  {
    id: "encourage-figured-out",
    category: "need_encouragement",
    text: "When I'm in the middle of something hard, I remind myself how many times I've figured things out before — even when I couldn't see how yet.",
  },
  {
    id: "encourage-created",
    category: "need_encouragement",
    text: "I look back at something I've made — a piece of jewelry, a journal page, anything — and know I'm not starting from zero.",
  },
  {
    id: "encourage-helped",
    category: "need_encouragement",
    text: "I think about someone I've helped. Not to inflate myself — just proof I've been useful before.",
  },
  {
    id: "encourage-progress",
    category: "need_encouragement",
    text: "I know progress isn't always obvious in the middle of it. The middle is supposed to feel messy.",
  },
  // need joy
  {
    id: "joy-hummingbirds",
    category: "need_joy",
    text: "I watch hummingbirds at the feeder for a few minutes. Fast little miracles — hard to stay gray when they're around.",
  },
  {
    id: "joy-cardinals",
    category: "need_joy",
    text: "I look for cardinals or goldfinches at the feeder. Small hunt, small delight.",
  },
  {
    id: "joy-kinsey",
    category: "need_joy",
    text: "I spend time with Kinsey — brush, walk, whatever she wants. Dogs don't do performance reviews.",
  },
  {
    id: "joy-flowers",
    category: "need_joy",
    text: "I buy fresh flowers — not for an occasion, just because the kitchen table deserves something alive.",
  },
  {
    id: "joy-music-craft",
    category: "need_joy",
    text: "I listen to music while I craft. No outcome required.",
  },
  {
    id: "joy-make-fun",
    category: "need_joy",
    text: "I make something just because it's fun — not for the business, not for anyone else. Just because.",
  },
];

export function lifeMomentTag(category: LifeMomentCategory): string {
  return `life_moment_${category}`;
}
