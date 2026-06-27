import type { SparkCatalogEntry } from "./types";

/**
 * Curated sparks — quality over quantity. No obscure novelty holidays.
 * Global Events → Country → Regional → Personal (personal built at runtime).
 */
export const SPARK_CATALOG: readonly SparkCatalogEntry[] = [
  // — Fun holidays (US-centric where noted; many are widely celebrated) —
  {
    id: "holiday-ice-cream-day",
    category: "fun_holiday",
    priority: 40,
    monthDay: { month: 7, day: 21 },
    interestTags: ["chocolate"],
    bodies: [
      "Before we get started… apparently today is National Ice Cream Day. I think life is better when we celebrate little things once in a while. 🍦",
      "Something small made me smile — it's National Ice Cream Day. No agenda. Just a good excuse for something sweet if you feel like it.",
    ],
  },
  {
    id: "holiday-coffee-day",
    category: "fun_holiday",
    priority: 42,
    monthDay: { month: 9, day: 29 },
    interestTags: ["coffee"],
    bodies: [
      "I thought of you when I saw today's little celebration… it's International Coffee Day. If you have a favorite mug, today feels like a good day to use it.",
      "Before we dive in — it's Coffee Day. I don't need a reason to mention coffee, but today gave me one.",
    ],
    environmentObjects: [{ kind: "coffee", placement: "table" }],
  },
  {
    id: "holiday-book-lovers",
    category: "fun_holiday",
    priority: 44,
    monthDay: { month: 8, day: 9 },
    interestTags: ["books"],
    bodies: [
      "I thought of you when I saw today's little celebration… it's National Book Lovers Day. If you find a quiet moment later, maybe spend it with a really good book.",
      "Something gentle for today — it's Book Lovers Day. No pressure to read anything heavy. Just… books are nice sometimes.",
    ],
    environmentObjects: [{ kind: "book", placement: "table" }],
  },
  {
    id: "holiday-popcorn-day",
    category: "fun_holiday",
    priority: 38,
    monthDay: { month: 1, day: 19 },
    bodies: [
      "I almost didn't mention this, but it's National Popcorn Day — and that felt worth a small smile before we get into anything serious.",
    ],
  },
  {
    id: "holiday-puzzle-day",
    category: "fun_holiday",
    priority: 41,
    monthDay: { month: 1, day: 29 },
    interestTags: ["puzzles"],
    bodies: [
      "Today's little thing: National Puzzle Day. Sometimes the best break is something that lets your hands work while your mind unwinds.",
    ],
  },
  {
    id: "holiday-chocolate-chip",
    category: "fun_holiday",
    priority: 39,
    monthDay: { month: 8, day: 4 },
    interestTags: ["chocolate", "cooking"],
    bodies: [
      "Before we get started… it's National Chocolate Chip Cookie Day. Life has enough hard edges — cookies are allowed to be soft.",
    ],
    environmentObjects: [{ kind: "cookies", placement: "table" }],
  },
  {
    id: "holiday-gardening",
    category: "fun_holiday",
    priority: 43,
    monthDay: { month: 4, day: 14 },
    interestTags: ["gardening", "nature"],
    bodies: [
      "It's National Gardening Day — even a windowsill plant counts. Green things have a way of quietly cheering us up.",
    ],
    environmentObjects: [{ kind: "flowers", placement: "table" }],
  },
  {
    id: "holiday-journal-day",
    category: "fun_holiday",
    priority: 40,
    monthDay: { month: 4, day: 6 },
    bodies: [
      "National Journal Day is today — not everything needs to be solved out loud. Sometimes a few honest lines on paper is enough.",
    ],
    environmentObjects: [{ kind: "journal", placement: "table" }],
  },
  // UK / global
  {
    id: "holiday-afternoon-tea-gb",
    category: "fun_holiday",
    priority: 36,
    regions: ["GB"],
    monthDay: { month: 4, day: 21 },
    interestTags: ["tea"],
    bodies: [
      "It's National Tea Day here — a small reminder that pausing for a cup is sometimes the most productive thing we do.",
    ],
    environmentObjects: [{ kind: "tea-set", placement: "table" }],
  },

  // — Nature & seasons —
  {
    id: "nature-cherry-blossom",
    category: "nature",
    priority: 35,
    seasons: ["spring"],
    months: [3, 4],
    interestTags: ["nature", "photography"],
    bodies: [
      "Spring is doing its quiet work — cherry blossoms are out in so many places. Worth noticing, even for a second.",
    ],
    environmentObjects: [{ kind: "tulips", placement: "window" }],
  },
  {
    id: "nature-full-moon",
    category: "nature",
    priority: 38,
    requiresFullMoon: true,
    timeOfDay: ["evening", "night"],
    bodies: [
      "There's a full moon tonight. I don't know why that still feels a little magical — but it does.",
    ],
  },
  {
    id: "season-autumn-colors",
    category: "season",
    priority: 34,
    seasons: ["autumn"],
    months: [9, 10, 11],
    interestTags: ["nature", "photography"],
    bodies: [
      "Autumn is showing off — leaves turning, air getting crisp. Sometimes the season itself is the small joy.",
    ],
    environmentObjects: [{ kind: "pumpkins", placement: "window" }],
  },
  {
    id: "season-winter-cocoa",
    category: "season",
    priority: 33,
    seasons: ["winter"],
    months: [12, 1, 2],
    bodies: [
      "Cold days have their own kind of comfort — warm mug, soft light, nowhere urgent to be for a minute.",
    ],
    environmentObjects: [{ kind: "tea-set", placement: "table" }, { kind: "blanket", placement: "floor" }],
  },
  {
    id: "season-summer-evening",
    category: "season",
    priority: 32,
    seasons: ["summer"],
    timeOfDay: ["evening"],
    bodies: [
      "Summer evenings have a particular softness — long light, slower pace. I hope you catch a piece of that today.",
    ],
  },
  {
    id: "season-holiday-lights",
    category: "season",
    priority: 37,
    seasons: ["holiday"],
    bodies: [
      "The season has its own glow — lights, warmth, little rituals. I hope something about it feels good to you.",
    ],
    environmentObjects: [{ kind: "holiday-decor", placement: "window" }],
  },
  {
    id: "season-spring-planting",
    category: "season",
    priority: 31,
    seasons: ["spring"],
    interestTags: ["gardening"],
    bodies: [
      "Spring planting season — even a small pot on a windowsill counts as hope taking root.",
    ],
    environmentObjects: [{ kind: "flowers", placement: "table" }],
  },

  // — Interesting moments —
  {
    id: "interesting-kindness",
    category: "interesting",
    priority: 28,
    bodies: [
      "I read about someone who left free books on a park bench with a note: 'Take one if you need a story.' Small kindness still travels.",
    ],
  },
  {
    id: "interesting-invention-postit",
    category: "interesting",
    priority: 26,
    bodies: [
      "Post-it notes were invented by accident — a 'failed' adhesive became one of the gentlest tools for remembering we're human.",
    ],
  },
  {
    id: "interesting-tradition-tea",
    category: "interesting",
    priority: 27,
    interestTags: ["tea", "travel"],
    bodies: [
      "In Morocco, mint tea is poured from high above the glass — part ceremony, part hospitality. I like traditions built around slowing down.",
    ],
    environmentObjects: [{ kind: "tea-set", placement: "table" }],
  },

  // — Inspiration —
  {
    id: "inspiration-small-joys",
    category: "inspiration",
    priority: 25,
    bodies: [
      "Not everything meaningful is loud. Some of the best parts of a day are the ones we almost miss.",
      "You don't have to earn small joys. They're part of what makes the hard days survivable.",
    ],
    cooldownDays: 21,
  },
  {
    id: "inspiration-notice-beauty",
    category: "inspiration",
    priority: 24,
    interestTags: ["nature", "photography"],
    bodies: [
      "If your eyes land on something beautiful today — a sky, a leaf, light through a window — that's not a distraction. That's living.",
    ],
    cooldownDays: 21,
  },
  {
    id: "inspiration-hope",
    category: "inspiration",
    priority: 23,
    bodies: [
      "Hope doesn't always arrive as a grand feeling. Sometimes it's just: I'm still here, and today might hold something good.",
    ],
    cooldownDays: 28,
  },

  // — Humor (gentle, never sarcastic) —
  {
    id: "humor-socks",
    category: "humor",
    priority: 22,
    bodies: [
      "True story: mismatched socks are statistically more interesting than matched ones. I will not be taking questions.",
    ],
    cooldownDays: 45,
  },
  {
    id: "humor-coffee-serious",
    category: "humor",
    priority: 21,
    interestTags: ["coffee"],
    bodies: [
      "Coffee doesn't solve problems. But it does sit beside you while you figure them out — which is arguably more loyal.",
    ],
    environmentObjects: [{ kind: "coffee", placement: "table" }],
    cooldownDays: 45,
  },
  {
    id: "humor-plants",
    category: "humor",
    priority: 20,
    interestTags: ["gardening"],
    bodies: [
      "Houseplants are just quiet roommates who judge your watering schedule and still look decorative.",
    ],
    cooldownDays: 45,
  },
] as const;

export const DEFAULT_SPARK_COOLDOWN_DAYS = 45;

export const SPARK_FREQUENCY_TARGET_PERCENT = 27;
