import type { SparkNoteCatalogEntry } from "./types";

export const DEFAULT_SPARK_NOTE_COOLDOWN_DAYS = 45;

/**
 * Seed Spark Note library for spark-library export — inventions, people, holidays, quotes, fun facts.
 * Date-based entries activate only on their monthDay.
 */
export const SEED_SPARK_NOTE_CATALOG: readonly SparkNoteCatalogEntry[] = [
  // — Inventions —
  {
    id: "SPARK-INV-001",
    category: "invention",
    categoryLabel: "History of Inventions",
    sparkType: "story",
    title: "The Post-it® Note",
    shortTitle: "The Post-it® Note",
    teaser: "A failed experiment became one of the world's favorite productivity tools.",
    whatHappened:
      "In 1968, 3M scientist Dr. Spencer Silver was trying to create a super-strong adhesive — but instead invented a reusable, low-tack glue. For years, nobody knew what to do with it.",
    whyInteresting:
      "Then Art Fry, a fellow 3M scientist, needed bookmarks that wouldn't fall out of his church choir hymnal. He applied Silver's 'failed' adhesive to small paper squares — and the Post-it Note was born.",
    whyItMatters:
      "The Post-it Note changed how people capture ideas, leave reminders, and organize information. What started as a 'failed' experiment became a tool used in over 200 countries.",
    sparkApplication:
      "What idea have you been ignoring because it didn't work the first time? Sometimes ideas that seem wrong just need a different use.",
    thumbnailAlt: "Colorful sticky notes",
    tags: ["invention", "productivity", "3m"],
  },
  {
    id: "SPARK-INV-002",
    category: "invention",
    categoryLabel: "History of Inventions",
    title: "The First Computer Mouse",
    teaser: "A wooden block that changed how we interact with computers.",
    whatHappened:
      "In 1964, Douglas Engelbart built the first computer mouse from a wooden block, two metal wheels, and a single button. He called it a mouse because the cord looked like a tail. His goal was to make computers feel more intuitive — something you could point at, not just type at.",
    whyItMatters:
      "The mouse made personal computing accessible to everyone. Point-and-click became the bridge between human intention and digital action.",
    sparkApplication:
      "What tool could make something complicated feel simple for the people you serve?",
    thumbnailAlt: "Vintage computer mouse",
  },
  {
    id: "SPARK-INV-003",
    category: "invention",
    categoryLabel: "History of Inventions",
    title: "Velcro®",
    teaser: "Inspired by burrs stuck to a dog's fur after a walk.",
    whatHappened:
      "Swiss engineer George de Mestral noticed burrs clinging to his dog's coat after a hike in 1941. Under a microscope, he saw tiny hooks — and spent years perfecting a fabric fastener that mimicked nature's design.",
    whyItMatters:
      "Velcro showed that the best innovations often come from paying attention to ordinary moments. Nature had solved the problem long before we did.",
    sparkApplication:
      "What everyday annoyance could become your next breakthrough if you looked at it more closely?",
    thumbnailAlt: "Burrs and fabric",
  },

  // — Entrepreneurs & business —
  {
    id: "SPARK-ENT-001",
    category: "entrepreneur",
    categoryLabel: "Inspiring People",
    sparkType: "deep",
    title: "Walt Disney",
    teaser: "A storyteller who built an entertainment empire.",
    whatHappened:
      "Walt Disney started with a mouse, a pencil, and a belief that imagination deserved a place in the world. He faced bankruptcy, skeptics, and setbacks — but kept building experiences that combined storytelling, technology, and wonder.",
    whyItMatters:
      "Disney changed entertainment by proving that customer experience, not just product, could create lasting magic. He built worlds people wanted to step into.",
    sparkApplication:
      "What experience can you create for people instead of just selling something?",
    thumbnailAlt: "Castle silhouette",
  },
  {
    id: "SPARK-BIZ-001",
    category: "business",
    categoryLabel: "Business Sparks",
    title: "The IKEA Effect",
    teaser: "Why we value things more when we build them ourselves.",
    whatHappened:
      "Researchers found that people place higher value on furniture they assemble themselves — even when the result is imperfect. The effort of creation creates emotional ownership.",
    whyItMatters:
      "Involving customers in the creation process builds loyalty and satisfaction. People support what they help build.",
    sparkApplication:
      "Where could you invite your customers or team to co-create instead of just consume?",
    thumbnailAlt: "Assembled furniture",
  },

  // — Quotes —
  {
    id: "SPARK-QTE-001",
    category: "quote",
    categoryLabel: "Meaningful Quotes",
    title: "Start Where You Are",
    teaser: "Arthur Ashe on beginning with what you have.",
    whatHappened:
      '"Start where you are. Use what you have. Do what you can." — Arthur Ashe, tennis champion and civil rights advocate. Ashe faced barriers throughout his career but never waited for perfect conditions to begin.',
    whyItMatters:
      "Ashe's words remind us that action doesn't require ideal circumstances — only willingness to begin with what's in front of us.",
    sparkApplication:
      "What small step could you take today with exactly the resources you already have?",
    thumbnailAlt: "Tennis court",
  },
  {
    id: "SPARK-QTE-002",
    category: "quote",
    categoryLabel: "Meaningful Quotes",
    title: "Creativity Takes Courage",
    teaser: "Henri Matisse on the bravery of making art.",
    whatHappened:
      '"Creativity takes courage." — Henri Matisse, one of the most influential artists of the 20th century. Matisse spent decades pushing past comfort, reinventing his style even when the world resisted change.',
    whyItMatters:
      "Sharing creative work means risking judgment. Matisse reminds us that the act of creating is itself an act of bravery.",
    sparkApplication:
      "What small experiment could you share before it feels 'ready'?",
    thumbnailAlt: "Artist palette",
  },

  // — Fun facts —
  {
    id: "SPARK-FUN-001",
    category: "fun_fact",
    categoryLabel: "Fun Facts",
    sparkType: "quick",
    title: "Honey Never Spoils",
    teaser: "Archaeologists found edible honey in ancient Egyptian tombs.",
    whatHappened:
      "Honey's low moisture and natural acidity make it nearly impossible for bacteria to survive in it. Archaeologists have discovered 3,000-year-old honey in Egyptian tombs that was still perfectly edible.",
    whyItMatters:
      "Nature sometimes creates solutions more durable than anything we engineer. Patience and the right conditions can preserve value for millennia.",
    sparkApplication:
      "What work are you building that could still matter years from now?",
    thumbnailAlt: "Honey jar",
  },
  {
    id: "SPARK-FUN-002",
    category: "fun_fact",
    categoryLabel: "Fun Facts",
    sparkType: "quick",
    title: "Octopus Hearts",
    teaser: "Three hearts, blue blood, and a surprising level of intelligence.",
    whatHappened:
      "Octopuses have three hearts and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body. When they swim, the main heart stops — which is why they prefer crawling.",
    whyItMatters:
      "The natural world is full of designs that challenge our assumptions. Different problems call for different architectures.",
    sparkApplication:
      "What assumption about 'how things should work' might be worth questioning today?",
    thumbnailAlt: "Octopus",
  },

  // — Personal growth —
  {
    id: "SPARK-GRO-001",
    category: "personal_growth",
    categoryLabel: "Personal Growth",
    title: "The Two-Minute Rule",
    teaser: "Small actions beat perfect plans.",
    whatHappened:
      "Productivity researchers found that if a task takes less than two minutes, doing it immediately prevents the mental overhead of tracking it. The rule isn't about speed — it's about reducing friction between intention and action.",
    whyItMatters:
      "Momentum often starts with the smallest possible step. Finishing tiny tasks builds confidence for bigger ones.",
    sparkApplication:
      "What two-minute action could you finish right now instead of adding it to a list?",
    thumbnailAlt: "Checklist",
  },
  {
    id: "SPARK-CRE-001",
    category: "creativity",
    categoryLabel: "Creativity",
    title: "Constraints Spark Creativity",
    teaser: "Limits can be the best muse.",
    whatHappened:
      "Dr. Seuss wrote Green Eggs and Ham using only 50 words — on a bet. Twitter's 140-character limit spawned new forms of wit. Haiku's rigid structure has produced centuries of beauty.",
    whyItMatters:
      "Unlimited options can paralyze. Constraints force focus and often produce the most memorable results.",
    sparkApplication:
      "What artificial limit could you set today to unlock a more creative solution?",
    thumbnailAlt: "Green eggs illustration",
  },

  // — Date-based holidays —
  {
    id: "SPARK-HOL-001",
    category: "holiday",
    categoryLabel: "Weird & Fun Holidays",
    title: "National Donut Day",
    teaser: "A sweet tradition with a surprising origin.",
    whatHappened:
      "National Donut Day began in 1938 to honor the Salvation Army 'Donut Lassies' who served donuts to soldiers during World War I. What started as comfort food in the trenches became an annual celebration of small joys.",
    whyItMatters:
      "Sometimes the sweetest traditions come from simple acts of care during hard times.",
    sparkApplication:
      "Who could you surprise with a small treat or kind gesture today?",
    monthDay: { month: 6, day: 6 },
    priority: 80,
    thumbnailAlt: "Donuts",
  },
  {
    id: "SPARK-HOL-002",
    category: "holiday",
    categoryLabel: "Weird & Fun Holidays",
    title: "National Ice Cream Day",
    teaser: "A presidential proclamation for something cold and sweet.",
    whatHappened:
      "President Ronald Reagan declared the third Sunday in July as National Ice Cream Day in 1984. Americans consume about 23 gallons of ice cream per person each year — making it one of the most beloved treats in the country.",
    whyItMatters:
      "Celebrating small pleasures reminds us that joy doesn't need a grand occasion.",
    sparkApplication:
      "What simple pleasure could you savor today without guilt or rush?",
    monthDay: { month: 7, day: 21 },
    priority: 80,
    thumbnailAlt: "Ice cream cone",
  },
  {
    id: "SPARK-HOL-003",
    category: "holiday",
    categoryLabel: "Weird & Fun Holidays",
    title: "National Book Lovers Day",
    teaser: "A day to celebrate stories that change us.",
    whatHappened:
      "August 9 is National Book Lovers Day — a quiet celebration of reading, discovery, and the worlds we enter through pages. No one knows exactly who started it, which feels fitting for a holiday about getting lost in someone else's words.",
    whyItMatters:
      "Books let us live other lives, learn from distant minds, and return changed. A single sentence can shift a perspective.",
    sparkApplication:
      "What book, article, or story has been waiting for your attention?",
    monthDay: { month: 8, day: 9 },
    priority: 80,
    thumbnailAlt: "Open book",
  },
  {
    id: "SPARK-HOL-004",
    category: "holiday",
    categoryLabel: "Weird & Fun Holidays",
    title: "National Chocolate Chip Cookie Day",
    teaser: "The accidental invention that became America's favorite cookie.",
    whatHappened:
      "Ruth Wakefield invented the chocolate chip cookie in 1938 at the Toll House Inn in Massachusetts. She broke a Nestlé chocolate bar into her butter cookie dough, expecting it to melt — but the chunks held their shape, creating something entirely new.",
    whyItMatters:
      "Another reminder that happy accidents often become beloved traditions.",
    sparkApplication:
      "What 'mistake' in your work might actually be your best idea?",
    monthDay: { month: 8, day: 4 },
    priority: 80,
    thumbnailAlt: "Chocolate chip cookies",
  },
  {
    id: "SPARK-HOL-005",
    category: "holiday",
    categoryLabel: "Weird & Fun Holidays",
    title: "International Coffee Day",
    teaser: "A global toast to the bean that fuels mornings.",
    whatHappened:
      "International Coffee Day on September 29 celebrates one of the world's most traded commodities. From Ethiopian highlands to your favorite mug, coffee has shaped cultures, economies, and countless morning rituals.",
    whyItMatters:
      "Rituals around food and drink connect us across cultures and give structure to our days.",
    sparkApplication:
      "What daily ritual helps you pause and reset — even for just a minute?",
    monthDay: { month: 9, day: 29 },
    priority: 80,
    thumbnailAlt: "Coffee cup",
  },
  {
    id: "SPARK-HOL-006",
    category: "holiday",
    categoryLabel: "Weird & Fun Holidays",
    title: "National Puzzle Day",
    teaser: "A day for pieces that fit together — eventually.",
    whatHappened:
      "January 29 is National Puzzle Day, celebrating jigsaws, crosswords, and brain teasers. Puzzles exercise patience, pattern recognition, and the satisfaction of finding where things belong.",
    whyItMatters:
      "Sometimes the best break is something that lets your hands work while your mind unwinds.",
    sparkApplication:
      "What problem are you trying to solve all at once that might benefit from one piece at a time?",
    monthDay: { month: 1, day: 29 },
    priority: 80,
    thumbnailAlt: "Jigsaw puzzle",
  },

  // — History —
  {
    id: "SPARK-HIS-001",
    category: "history",
    categoryLabel: "Today in History",
    title: "The Moon Landing",
    teaser: "One small step that inspired generations.",
    whatHappened:
      "On July 20, 1969, Neil Armstrong became the first human to walk on the Moon. The Apollo 11 mission fulfilled a promise made years earlier and proved that audacious goals, backed by persistence, can become reality.",
    whyItMatters:
      "The moon landing showed humanity what focused collaboration can achieve — and gave every child permission to dream bigger.",
    sparkApplication:
      "What 'impossible' goal deserves another look with fresh eyes?",
    monthDay: { month: 7, day: 20 },
    priority: 85,
    thumbnailAlt: "Moon landing",
  },

  // — Seasonal (month-based) —
  {
    id: "SPARK-HOL-SEASON-12",
    category: "holiday",
    categoryLabel: "Seasonal Spark",
    title: "December's Quiet Glow",
    shortTitle: "December's Quiet Glow",
    teaser: "A season of light, reflection, and small rituals.",
    whatHappened:
      "December has carried meaning across cultures for centuries — from winter solstice gatherings to festivals of light. Long nights invite slower pacing, warmer rooms, and traditions that reconnect us to people we love.",
    whyInteresting:
      "Many December traditions began as practical responses to darkness — candles, feasts, and gatherings that made the coldest month feel survivable, even beautiful.",
    whyItMatters:
      "Seasons shape how we work and rest. December reminds us that endings and celebrations can coexist — that closing a year is its own kind of beginning.",
    sparkApplication:
      "What small ritual could make this week feel warmer — for you or for someone else?",
    months: [12],
    priority: 60,
    tags: ["seasonal", "december", "holiday"],
    thumbnailAlt: "Winter candles",
  },

  // — Seasonal personality (spring / summer / autumn / winter) —
  {
    id: "SPARK-SEA-SPRING",
    category: "creativity",
    categoryLabel: "Seasonal Spark",
    sparkType: "quick",
    title: "Spring Begins Again",
    shortTitle: "Spring Begins Again",
    teaser: "New beginnings are already quietly starting.",
    whatHappened:
      "Every spring, the world rehearses a familiar miracle — bare branches bud, soil softens, and daylight stretches a little further. Cultures across history have celebrated renewal long before calendars marked the equinox.",
    whyItMatters:
      "Spring reminds us that dormant seasons don't last forever. What feels stuck can still move again with patience and light.",
    sparkApplication:
      "What small beginning could you nurture this week — even if it still looks tiny from the outside?",
    seasons: ["spring"],
    priority: 55,
    tags: ["seasonal", "spring", "creativity"],
  },
  {
    id: "SPARK-SEA-SUMMER",
    category: "personal_growth",
    categoryLabel: "Seasonal Spark",
    sparkType: "quick",
    title: "Summer's Open Door",
    shortTitle: "Summer's Open Door",
    teaser: "Adventure doesn't always require a plane ticket.",
    whatHappened:
      "Summer has long been the season of exploration — longer days, open schedules, and the feeling that something unexpected might be waiting just outside routine.",
    whyItMatters:
      "A change of pace can reset creativity. Adventure sometimes means curiosity in a familiar place seen with fresh eyes.",
    sparkApplication:
      "Where could you explore for twenty minutes today — a new path, a new recipe, a conversation you have been putting off?",
    seasons: ["summer"],
    priority: 55,
    tags: ["seasonal", "summer", "adventure"],
  },
  {
    id: "SPARK-SEA-AUTUMN",
    category: "personal_growth",
    categoryLabel: "Seasonal Spark",
    sparkType: "story",
    title: "Autumn's Gentle Pause",
    shortTitle: "Autumn's Gentle Pause",
    teaser: "Learning season — harvest what you have grown.",
    whatHappened:
      "Autumn invites reflection. Trees release what they no longer need; harvest traditions remind communities to notice what the year produced before rushing into the next chapter.",
    whyItMatters:
      "Reflection is not slowing down for its own sake — it helps us carry forward what worked and release what did not.",
    sparkApplication:
      "What is one thing from this year worth keeping — and one thing you are ready to let go?",
    seasons: ["autumn"],
    priority: 55,
    tags: ["seasonal", "autumn", "reflection"],
  },
  {
    id: "SPARK-SEA-WINTER",
    category: "creativity",
    categoryLabel: "Seasonal Spark",
    sparkType: "story",
    title: "Winter's Quiet Inspiration",
    shortTitle: "Winter's Quiet Inspiration",
    teaser: "Traditions and warmth when the world slows down.",
    whatHappened:
      "Winter has always been a season for gathering — firelight, stories, handmade gifts, and rituals that turn cold months into something human and hopeful.",
    whyItMatters:
      "Quiet seasons create space for imagination. Not every productive season looks busy from the outside.",
    sparkApplication:
      "What tradition — old or new — could make this week feel warmer for you or someone you care about?",
    seasons: ["winter"],
    priority: 55,
    tags: ["seasonal", "winter", "inspiration"],
  },

  // — ADHD-friendly (spark-notes-files/SPARK_NOTE_ADHD_FRIENDLY_SPARKS_LIBRARY.md) —
  {
    id: "SPARK-ADHD-001",
    category: "adhd_friendly",
    categoryLabel: "ADHD-Friendly Spark",
    sparkType: "story",
    title: "Different Thinking Creates Different Solutions",
    shortTitle: "Different Thinking",
    teaser: "Some of the world's best ideas came from people who saw things differently.",
    whatHappened:
      "Many innovations happen because someone notices something others overlook. Different perspectives can reveal connections, possibilities, and solutions that may not be obvious to everyone.",
    whyItMatters:
      "A different approach is not automatically a disadvantage. Sometimes the ability to see patterns and possibilities becomes a strength.",
    sparkApplication: "What is something you notice that others may miss?",
    tags: ["adhd", "creativity", "innovation", "strengths"],
  },
  {
    id: "SPARK-ADHD-002",
    category: "adhd_friendly",
    categoryLabel: "ADHD-Friendly Spark",
    sparkType: "quick",
    title: "The Idea Flood",
    shortTitle: "The Idea Flood",
    teaser: "Having many ideas can be a challenge and a gift.",
    whatHappened:
      "Many creative entrepreneurs experience moments when ideas arrive quickly. The challenge is not always creating ideas — it is capturing, organizing, and choosing which ideas deserve attention.",
    whyItMatters: "Ideas are valuable when they are captured and given a place to grow.",
    sparkApplication: "What idea do you want to capture before it disappears?",
    tags: ["ideas", "creativity", "entrepreneurship"],
  },
  {
    id: "SPARK-ADHD-003",
    category: "adhd_friendly",
    categoryLabel: "ADHD-Friendly Spark",
    sparkType: "quick",
    title: "Curiosity Is a Superpower",
    shortTitle: "Curiosity Superpower",
    teaser: "Questions can lead you toward your next breakthrough.",
    whatHappened:
      "Curious minds often explore topics deeply, make unexpected connections, and discover new possibilities. That curiosity can become a powerful creative advantage.",
    whyItMatters: "Many entrepreneurs succeed because they keep asking better questions.",
    sparkApplication: "What are you curious about right now?",
    tags: ["curiosity", "learning", "creativity"],
  },
  {
    id: "SPARK-ADHD-004",
    category: "adhd_friendly",
    categoryLabel: "ADHD-Friendly Spark",
    sparkType: "story",
    title: "Follow the Energy",
    shortTitle: "Follow the Energy",
    teaser: "Understanding when you work best can change everything.",
    whatHappened:
      "People do not all have the same energy patterns. Some create best in the morning; others find their best ideas later in the day. Learning your patterns can help you work with yourself instead of against yourself.",
    whyItMatters: "Better self-awareness can reduce unnecessary struggle.",
    sparkApplication: "When does your best thinking usually happen?",
    tags: ["energy", "motivation", "productivity"],
  },
  {
    id: "SPARK-ADHD-005",
    category: "adhd_friendly",
    categoryLabel: "ADHD-Friendly Spark",
    sparkType: "story",
    title: "Hyperfocus Can Become a Strength",
    shortTitle: "Hyperfocus Strength",
    teaser: "Deep interest can create incredible progress.",
    whatHappened:
      "Many people experience periods where they become deeply absorbed in something meaningful. That intense focus can lead to learning, creativity, and breakthroughs when directed intentionally.",
    whyItMatters: "Understanding your strengths helps you use them more effectively.",
    sparkApplication: "What topic makes you lose track of time?",
    tags: ["focus", "creativity", "strengths"],
  },
  {
    id: "SPARK-ADHD-006",
    category: "adhd_friendly",
    categoryLabel: "ADHD-Friendly Spark",
    sparkType: "quick",
    title: "Progress Over Perfection",
    shortTitle: "Progress Over Perfection",
    teaser: "Finished and improving beats waiting forever.",
    whatHappened:
      "Many creative people struggle because they want the final version before creating the first version. Small completed steps create momentum.",
    whyItMatters: "Action creates information that thinking alone cannot provide.",
    sparkApplication: "What could you finish imperfectly today?",
    tags: ["perfectionism", "action", "momentum"],
  },
  {
    id: "SPARK-ADHD-007",
    category: "adhd_friendly",
    categoryLabel: "ADHD-Friendly Spark",
    sparkType: "story",
    title: "Your Brain Needs the Right Environment",
    shortTitle: "Right Environment",
    teaser: "Sometimes changing the surroundings changes the results.",
    whatHappened:
      "Different environments affect attention, creativity, and energy. Small adjustments — reducing distractions, changing locations, or adding helpful reminders — can make tasks easier.",
    whyItMatters: "The environment can support the brain instead of fighting it.",
    sparkApplication: "What small change could make something easier?",
    tags: ["environment", "focus", "productivity"],
  },
  {
    id: "SPARK-ADHD-008",
    category: "adhd_friendly",
    categoryLabel: "ADHD-Friendly Spark",
    sparkType: "story",
    title: "Celebrate Evidence of Progress",
    shortTitle: "Celebrate Progress",
    teaser: "Your accomplishments deserve to be remembered.",
    whatHappened:
      "Many people move quickly to the next challenge and forget what they have already achieved. Keeping evidence of wins creates a reminder of capability.",
    whyItMatters: "Past success can become fuel for future confidence.",
    sparkApplication:
      "What is one thing you have accomplished that you should celebrate?",
    tags: ["confidence", "achievements", "encouragement"],
  },
];
