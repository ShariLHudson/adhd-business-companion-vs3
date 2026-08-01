import type { SparkNoteCatalogEntry } from "./types";

export const DEFAULT_SPARK_NOTE_COOLDOWN_DAYS = 45;

/**
 * Seed Spark Note library for spark-library export — inventions, people, holidays, quotes, fun facts.
 * Date-based entries activate only on their monthDay.
 */
export const SEED_SPARK_NOTE_CATALOG: readonly SparkNoteCatalogEntry[] = [
  // — Starter set (spark-notes-files/SPARK_NOTE_STARTER_SPARK_LIBRARY.md) —
  // SPARK-INV-001, SPARK-INV-002, SPARK-PER-001, SPARK-BIZ-001, SPARK-HIST-001,
  // SPARK-FACT-001, SPARK-CREAT-001, SPARK-GROW-001

  // — Inventions —
  {
    id: "SPARK-INV-001",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "The Post-it® Note",
    shortTitle: "The Post-it® Note",
    teaser:
      "A failed experiment became one of the world's favorite tools for capturing ideas.",
    whatHappened:
      "A scientist was trying to create a very strong adhesive. Instead, he created something unusual â an adhesive that could stick but also be removed. For years, the discovery did not have an obvious purpose. Another employee saw the possibility and realized it could solve an everyday problem: marking pages without damaging them. The mistake became an invention. A failed experiment became one of the world's favorite tools for capturing ideas. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: some of the best ideas are not created by having the perfect plan. Sometimes innovation comes from noticing a possibility hidden inside an unexpected result.",
    whyItMatters:
      "Some of the best ideas are not created by having the perfect plan. Sometimes innovation comes from noticing a possibility hidden inside an unexpected result. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What idea have you dismissed because it did not work the way you originally imagined? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Colorful sticky notes",
    tags: ["innovation", "creativity", "productivity", "accidental-discovery"],
  },
  {
    id: "SPARK-INV-002",
    category: "001",
    categoryLabel: "Discovery",
    sparkType: "story",
    title: "The Microwave Oven Accident",
    shortTitle: "Microwave Accident",
    teaser: "A melted candy bar helped create a kitchen revolution.",
    whatHappened:
      "Engineer Percy Spencer was working with radar technology when he noticed that a candy bar in his pocket had melted. Instead of ignoring it, he investigated. His curiosity led to the discovery that microwave energy could heat food. A melted candy bar helped create a kitchen revolution. The deeper value of this story is not only the event itself, but the moment someone noticed that something unexpected deserved a second look. Discovery often begins before there is certainty; it begins with attention. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: many breakthroughs begin with someone asking: \"Why did that happen?\" Curiosity turns ordinary moments into discoveries.",
    whyItMatters:
      "Many breakthroughs begin with someone asking: \"Why did that happen?\" Curiosity turns ordinary moments into discoveries. The useful question is not only “What did they discover?” but “What allowed them to notice it?” This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What everyday problem around you might contain an opportunity? Pause long enough to notice one unexpected result, overlooked detail, or unanswered question. Write down what it might be inviting you to explore. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Microwave oven",
    tags: ["innovation", "curiosity", "science", "accidental-discovery"],
  },
  {
    id: "SPARK-INV-010",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "The First Computer Mouse",
    shortTitle: "First Computer Mouse",
    teaser: "A wooden block that changed how we interact with computers.",
    whatHappened:
      "In 1964, Douglas Engelbart built the first computer mouse from a wooden block, two metal wheels, and a single button. He called it a mouse because the cord looked like a tail. His goal was to make computers feel more intuitive â something you could point at, not just type at. A wooden block that changed how we interact with computers. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: the mouse made personal computing accessible to everyone. Point-and-click became the bridge between human intention and digital action.",
    whyItMatters:
      "The mouse made personal computing accessible to everyone. Point-and-click became the bridge between human intention and digital action. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What tool could make something complicated feel simple for the people you serve? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Vintage computer mouse",
    tags: ["invention", "technology", "computing"],
  },
  {
    id: "SPARK-INV-003",
    category: "011",
    categoryLabel: "Innovation",
    title: "Velcro®",
    teaser: "Inspired by burrs stuck to a dog's fur after a walk.",
    whatHappened:
      "Swiss engineer George de Mestral noticed burrs clinging to his dog's coat after a hike in 1941. Under a microscope, he saw tiny hooks â and spent years perfecting a fabric fastener that mimicked nature's design. Inspired by burrs stuck to a dog's fur after a walk. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: velcro showed that the best innovations often come from paying attention to ordinary moments. Nature had solved the problem long before we did.",
    whyItMatters:
      "Velcro showed that the best innovations often come from paying attention to ordinary moments. Nature had solved the problem long before we did. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What everyday annoyance could become your next breakthrough if you looked at it more closely? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Burrs and fabric",
  },

  // — Innovation & discovery (spark-notes-files/SPARK_NOTE_INNOVATION_AND_DISCOVERY_SPARK_LIBRARY.md) —
  {
    id: "SPARK-INNOV-001",
    category: "001",
    categoryLabel: "Discovery",
    sparkType: "story",
    title: "The Discovery of Penicillin",
    shortTitle: "Penicillin Discovery",
    teaser: "A forgotten experiment became one of the most important discoveries in medicine.",
    whatHappened:
      "Alexander Fleming noticed that mold had affected a bacterial culture in his laboratory. Instead of throwing away the experiment, he investigated what had happened. That observation eventually led to the development of penicillin. A forgotten experiment became one of the most important discoveries in medicine. The deeper value of this story is not only the event itself, but the moment someone noticed that something unexpected deserved a second look. Discovery often begins before there is certainty; it begins with attention. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: important discoveries are not always planned. Sometimes progress comes from paying attention to unexpected results.",
    whyItMatters:
      "Important discoveries are not always planned. Sometimes progress comes from paying attention to unexpected results. The useful question is not only “What did they discover?” but “What allowed them to notice it?” This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What unexpected result in your life or business might be worth exploring? Pause long enough to notice one unexpected result, overlooked detail, or unanswered question. Write down what it might be inviting you to explore. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["science", "discovery", "curiosity", "medicine"],
  },
  {
    id: "SPARK-INNOV-002",
    category: "001",
    categoryLabel: "Discovery",
    sparkType: "story",
    title: "The Camera That Saw Beyond Visible Light",
    shortTitle: "Beyond Visible Light",
    teaser: "Scientists discovered that the world contains information we cannot see with our eyes.",
    whatHappened:
      "Different types of cameras and sensors allow people to observe things beyond normal human vision. These technologies have helped scientists study space, nature, health, and the environment. Scientists discovered that the world contains information we cannot see with our eyes. The deeper value of this story is not only the event itself, but the moment someone noticed that something unexpected deserved a second look. Discovery often begins before there is certainty; it begins with attention. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: new tools allow us to discover possibilities that were always there but hidden.",
    whyItMatters:
      "New tools allow us to discover possibilities that were always there but hidden. The useful question is not only “What did they discover?” but “What allowed them to notice it?” This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What opportunity might exist that you have not noticed yet? Pause long enough to notice one unexpected result, overlooked detail, or unanswered question. Write down what it might be inviting you to explore. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["science", "technology", "exploration"],
  },
  {
    id: "SPARK-INNOV-003",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "The Accidental Creation of the Super Soaker",
    shortTitle: "Super Soaker",
    teaser: "A toy came from an idea that was never supposed to become a toy.",
    whatHappened:
      "Engineer Lonnie Johnson was working on technology related to energy systems when he experimented with water pressure. The idea eventually became the Super Soaker, one of the most popular toys of its time. A toy came from an idea that was never supposed to become a toy. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: ideas can travel unexpected paths. A solution for one problem may become something completely different.",
    whyItMatters:
      "Ideas can travel unexpected paths. A solution for one problem may become something completely different. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What idea could have another purpose you have not considered? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["invention", "creativity", "play"],
  },
  {
    id: "SPARK-INNOV-004",
    category: "012",
    categoryLabel: "Wonder",
    sparkType: "story",
    title: "The Telescope Changed How We See the Universe",
    shortTitle: "The Telescope",
    teaser: "A simple tool changed humanity's understanding of space.",
    whatHappened:
      "The telescope allowed people to observe distant planets, stars, and galaxies. It transformed astronomy by allowing humans to explore beyond what they could see with their own eyes. A simple tool changed humanity's understanding of space. Wonder gives us permission to pause before explaining everything away. It restores scale, surprise, and imagination, reminding us that the world still contains more than we have noticed. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: the right tool can expand what is possible.",
    whyItMatters: "The right tool can expand what is possible. Wonder can renew energy because it shifts us from rushing past life to actually noticing it. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What tool, resource, or relationship could help you see something differently? Spend five quiet minutes noticing something that creates awe, surprise, or delight. Save one sentence about what it changed in your perspective. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["science", "exploration", "curiosity"],
  },
  {
    id: "SPARK-INNOV-005",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "quick",
    title: "The Sticky Note Lesson",
    shortTitle: "Sticky Note Lesson",
    teaser: "A product can become valuable after someone discovers its purpose.",
    whatHappened:
      "The adhesive behind the Post-it Note was not originally created for sticky notes. It became useful when someone recognized a different possibility. A product can become valuable after someone discovers its purpose. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. The lasting importance is simple: innovation often comes from connecting an existing idea with a new need.",
    whyItMatters:
      "Innovation often comes from connecting an existing idea with a new need. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What resource do you already have that could be used differently? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["creativity", "experimentation", "ideas"],
  },
  {
    id: "SPARK-INNOV-006",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "The First 3D Printer",
    shortTitle: "First 3D Printer",
    teaser: "A machine changed how people think about creating objects.",
    whatHappened:
      "3D printing introduced a new approach to manufacturing by building objects layer by layer. The technology opened possibilities for prototypes, education, design, and production. A machine changed how people think about creating objects. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: new tools can change not only what we make but how we think.",
    whyItMatters:
      "New tools can change not only what we make but how we think. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What new tool could change the way you create? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["technology", "creativity", "manufacturing"],
  },
  {
    id: "SPARK-INNOV-007",
    category: "009",
    categoryLabel: "Adventure",
    sparkType: "story",
    title: "The Space Program and Everyday Inventions",
    shortTitle: "Space to Everyday",
    teaser: "Exploring space helped create technologies used on Earth.",
    whatHappened:
      "Many technologies developed for space exploration influenced everyday products and systems. Research often creates benefits beyond its original purpose. Exploring space helped create technologies used on Earth. Adventure does not always begin with certainty. It often begins with movement: one step beyond routine, one question asked, or one willingness to enter unfamiliar territory and learn from what happens. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: investing in exploration can create unexpected possibilities.",
    whyItMatters:
      "Investing in exploration can create unexpected possibilities. Adventure expands our sense of what is possible because action teaches what imagination alone cannot. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What experiment today could create tomorrow's solution? Take one safe step beyond routine today. Make it small enough to begin and meaningful enough to teach you something. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["space", "technology", "invention"],
  },
  {
    id: "SPARK-INNOV-008",
    category: "005",
    categoryLabel: "Curiosity",
    sparkType: "quick",
    title: "Curiosity Before Expertise",
    shortTitle: "Curiosity First",
    teaser: "Many discoveries begin with a question, not an answer.",
    whatHappened:
      "Innovators often begin without knowing exactly how something will work. They learn through testing, adjusting, and continuing to explore. Many discoveries begin with a question, not an answer. Curiosity changes an ordinary fact into an invitation. Instead of stopping at what happened, it asks what else might be true, what assumptions may be incomplete, and what becomes visible when we look again. The lasting importance is simple: you do not always need to know everything before you begin.",
    whyItMatters:
      "You do not always need to know everything before you begin. Curiosity loosens the grip of assumptions and creates room for better questions. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What could you learn by experimenting? Write three questions about something you have been assuming is fixed. Choose the question that opens the most possibility. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["learning", "creativity", "experimentation"],
  },

  // — Inspiring people (spark-notes-files/SPARK_NOTE_INSPIRING_PEOPLE_SPARK_LIBRARY.md) —
  {
    id: "SPARK-PER-001",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "deep",
    title: "Walt Disney: The Power of Imagination",
    shortTitle: "Walt Disney",
    teaser: "A dreamer changed entertainment by believing stories could become experiences.",
    whatHappened:
      "Walt Disney started with a simple idea: create stories that brought people joy. Through animation, characters, and experiences, he built something much larger than movies. He created emotional connections with audiences around the world. A dreamer changed entertainment by believing stories could become experiences. The story of Walt Disney: The Power of Imagination matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. There is also a second lesson here. Meaningful progress usually includes uncertainty, incomplete information, and a period when the value of an idea is not obvious. The people who continue are not always the ones with the most confidence; they are often the ones willing to stay curious long enough to learn. The lasting importance is simple: great businesses often begin by understanding how people want to feel. Disney was not only selling entertainment. He was creating experiences.",
    whyItMatters:
      "Great businesses often begin by understanding how people want to feel. Disney was not only selling entertainment. He was creating experiences. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What feeling do you want people to experience when they interact with your work? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["creativity", "storytelling", "entrepreneurship"],
  },
  {
    id: "SPARK-PER-002",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "story",
    title: "The Wright Brothers: Believing the Impossible",
    shortTitle: "Wright Brothers",
    teaser: "Two bicycle makers changed transportation forever.",
    whatHappened:
      "Orville and Wilbur Wright were not famous scientists or wealthy inventors. They studied flight, tested ideas, built models, and kept improving. Their persistence led to the first successful powered airplane flight. Two bicycle makers changed transportation forever. The story of The Wright Brothers: Believing the Impossible matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: big changes often begin with ordinary people who are willing to experiment.",
    whyItMatters:
      "Big changes often begin with ordinary people who are willing to experiment. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What idea seems impossible until you take the first step? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["innovation", "courage", "experimentation"],
  },
  {
    id: "SPARK-PER-003",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "story",
    title: "Maya Angelou: Finding Strength Through Words",
    shortTitle: "Maya Angelou",
    teaser: "A difficult life became a source of powerful wisdom.",
    whatHappened:
      "Maya Angelou became a celebrated writer, poet, and speaker. Her experiences shaped her ability to connect with people through honesty, courage, and compassion. A difficult life became a source of powerful wisdom. The story of Maya Angelou: Finding Strength Through Words matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: personal experiences can become sources of wisdom and connection.",
    whyItMatters:
      "Personal experiences can become sources of wisdom and connection. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "How could your own experiences become something meaningful for others? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["creativity", "courage", "storytelling"],
  },
  {
    id: "SPARK-PER-004",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "story",
    title: "Albert Einstein: Curiosity Changed Physics",
    shortTitle: "Einstein's Curiosity",
    teaser: "A curious mind changed how we understand the universe.",
    whatHappened:
      "Albert Einstein questioned ideas that many people accepted. His imagination and curiosity helped him develop theories that transformed modern physics. A curious mind changed how we understand the universe. The story of Albert Einstein: Curiosity Changed Physics matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: questioning assumptions can lead to discoveries.",
    whyItMatters: "Questioning assumptions can lead to discoveries. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What is something you could look at differently? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["science", "curiosity", "imagination"],
  },
  {
    id: "SPARK-PER-005",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "deep",
    title: "Madam C.J. Walker: Building Opportunity",
    shortTitle: "Madam C.J. Walker",
    teaser: "A personal solution became a groundbreaking business.",
    whatHappened:
      "Madam C.J. Walker created hair care products and built one of the first major businesses led by an African American woman. She also created opportunities for others through employment and training. A personal solution became a groundbreaking business. The story of Madam C.J. Walker: Building Opportunity matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. There is also a second lesson here. Meaningful progress usually includes uncertainty, incomplete information, and a period when the value of an idea is not obvious. The people who continue are not always the ones with the most confidence; they are often the ones willing to stay curious long enough to learn. The lasting importance is simple: successful businesses can create impact beyond the product itself.",
    whyItMatters:
      "Successful businesses can create impact beyond the product itself. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "How can your work create value for others? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["entrepreneurship", "leadership", "resilience"],
  },
  {
    id: "SPARK-PER-006",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "story",
    title: "Steve Jobs: Thinking Differently",
    shortTitle: "Steve Jobs",
    teaser: "Technology became more human through design and imagination.",
    whatHappened:
      "Steve Jobs focused on combining technology with simplicity and user experience. His work helped shape personal computing, music, and mobile technology. Technology became more human through design and imagination. The story of Steve Jobs: Thinking Differently matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: innovation is not only about what something does. It is also about how people experience it.",
    whyItMatters:
      "Innovation is not only about what something does. It is also about how people experience it. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "How could you make something easier or more enjoyable? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["innovation", "creativity", "design"],
  },
  {
    id: "SPARK-PER-007",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "story",
    title: "Temple Grandin: Seeing the World Differently",
    shortTitle: "Temple Grandin",
    teaser: "A different way of thinking became a strength.",
    whatHappened:
      "Temple Grandin used her unique perspective to improve animal science and advocate for understanding different ways of thinking. Her work showed the value of different minds. A different way of thinking became a strength. The story of Temple Grandin: Seeing the World Differently matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: different perspectives can create solutions others may not see.",
    whyItMatters:
      "Different perspectives can create solutions others may not see. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What strength comes from the way you see the world? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["neurodiversity", "creativity", "problem-solving"],
  },
  {
    id: "SPARK-PER-008",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "story",
    title: "Beethoven: Creating Through Challenges",
    shortTitle: "Beethoven",
    teaser: "Some of the greatest creations come from overcoming obstacles.",
    whatHappened:
      "Ludwig van Beethoven continued composing even after experiencing significant hearing loss. His dedication allowed him to create some of history's most recognized music. Some of the greatest creations come from overcoming obstacles. The story of Beethoven: Creating Through Challenges matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: challenges do not always remove possibility. Sometimes they shape it.",
    whyItMatters:
      "Challenges do not always remove possibility. Sometimes they shape it. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What strength have you discovered because of a challenge? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["creativity", "perseverance", "music"],
  },
  {
    id: "SPARK-PER-009",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "deep",
    title: "Thomas Edison: Persistence Through Failure",
    shortTitle: "Edison's Persistence",
    teaser: "Thousands of attempts can lead to one world-changing idea.",
    whatHappened:
      "Thomas Edison is remembered for inventions like the practical electric light bulb, but his journey included many unsuccessful experiments. He viewed failed attempts as information that helped him understand what did not work. His approach was based on curiosity and persistence. Thousands of attempts can lead to one world-changing idea. The story of Thomas Edison: Persistence Through Failure matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. There is also a second lesson here. Meaningful progress usually includes uncertainty, incomplete information, and a period when the value of an idea is not obvious. The people who continue are not always the ones with the most confidence; they are often the ones willing to stay curious long enough to learn. The lasting importance is simple: progress rarely happens perfectly the first time. Innovation often requires patience, experimentation, and learning.",
    whyItMatters:
      "Progress rarely happens perfectly the first time. Innovation often requires patience, experimentation, and learning. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What could you learn from something that did not work yet? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["innovation", "resilience", "invention", "persistence"],
  },

  // — Entrepreneurs & business (spark-notes-files/SPARK_NOTE_ENTREPRENEUR_BUSINESS_SPARK_LIBRARY.md) —
  {
    id: "SPARK-ENT-001",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "deep",
    title: "Walt Disney",
    teaser: "A storyteller who built an entertainment empire.",
    whatHappened:
      "Walt Disney started with a mouse, a pencil, and a belief that imagination deserved a place in the world. He faced bankruptcy, skeptics, and setbacks â but kept building experiences that combined storytelling, technology, and wonder. A storyteller who built an entertainment empire. The story of Walt Disney matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. There is also a second lesson here. Meaningful progress usually includes uncertainty, incomplete information, and a period when the value of an idea is not obvious. The people who continue are not always the ones with the most confidence; they are often the ones willing to stay curious long enough to learn. The lasting importance is simple: disney changed entertainment by proving that customer experience, not just product, could create lasting magic. He built worlds people wanted to step into.",
    whyItMatters:
      "Disney changed entertainment by proving that customer experience, not just product, could create lasting magic. He built worlds people wanted to step into. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What experience can you create for people instead of just selling something? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Castle silhouette",
  },
  {
    id: "SPARK-BIZ-001",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "The Airbnb Idea",
    shortTitle: "The Airbnb Idea",
    teaser: "A simple solution to a personal problem became a worldwide business.",
    whatHappened:
      "The founders of Airbnb struggled to pay rent and noticed that visitors needed places to stay when hotels were full. They started by offering a simple alternative: staying in someone's home. The idea grew by focusing on trust, experience, and belonging. A simple solution to a personal problem became a worldwide business. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: many successful businesses begin by solving a problem the founder personally understands.",
    whyItMatters:
      "Many successful businesses begin by solving a problem the founder personally understands. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What frustration in your own life might reveal a need others share? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["entrepreneurship", "innovation", "customer-experience"],
  },
  {
    id: "SPARK-BIZ-002",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "Airbnb: Creating Belonging",
    shortTitle: "Airbnb Belonging",
    teaser: "A simple idea about extra space became a global company.",
    whatHappened:
      "Airbnb began when the founders needed a way to earn money and noticed travelers needed affordable places to stay. The idea grew beyond a place to sleep. They focused on creating connection, trust, and a feeling of belonging. A simple idea about extra space became a global company. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: great businesses often sell more than a product. They create an experience.",
    whyItMatters:
      "Great businesses often sell more than a product. They create an experience. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What feeling do you want customers to experience when they interact with your business? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["customer-experience", "entrepreneurship", "innovation"],
  },
  {
    id: "SPARK-BIZ-003",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "Disney: Selling Experiences, Not Just Products",
    shortTitle: "Disney Experiences",
    teaser: "The magic was never just the movie. It was the feeling.",
    whatHappened:
      "Disney built a powerful brand by focusing on imagination and emotional connection. Movies, parks, characters, and experiences all worked together to create memories. The magic was never just the movie. It was the feeling. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: people remember how something made them feel. Businesses that create meaningful experiences build stronger relationships.",
    whyItMatters:
      "People remember how something made them feel. Businesses that create meaningful experiences build stronger relationships. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What emotion should people associate with your work? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["branding", "storytelling", "customer-experience"],
  },
  {
    id: "SPARK-BIZ-004",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "story",
    title: "Amazon: Starting With Customer Obsession",
    shortTitle: "Amazon Customer Focus",
    teaser:
      "A bookstore became one of the world's largest companies by focusing on the customer.",
    whatHappened: "Amazon began as an online bookstore. The company expanded by continually asking: \"What does the customer need next?\" That mindset influenced everything from delivery speed to technology. A bookstore became one of the world's largest companies by focusing on the customer. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: growth often comes from understanding people deeply. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    whyItMatters: "Growth often comes from understanding people deeply. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What does your customer need that you could understand better? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["customer-service", "innovation", "leadership"],
  },
  {
    id: "SPARK-BIZ-005",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "story",
    title: "The LEGO Comeback",
    shortTitle: "LEGO Comeback",
    teaser: "A company nearly failed by returning to what made it special.",
    whatHappened:
      "LEGO struggled when it expanded too far away from its core strengths. The company recovered by returning focus to creativity, building, and imagination. A company nearly failed by returning to what made it special. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: sometimes growth comes from adding more. Sometimes it comes from returning to what works.",
    whyItMatters:
      "Sometimes growth comes from adding more. Sometimes it comes from returning to what works. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What part of your business deserves more attention? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["resilience", "creativity", "innovation"],
  },
  {
    id: "SPARK-BIZ-006",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "The Starbucks Experience",
    shortTitle: "Starbucks Experience",
    teaser: "A coffee company created a place people wanted to belong.",
    whatHappened:
      "Starbucks focused on creating a consistent experience beyond the drink itself. The environment, service, and feeling became part of the product. A coffee company created a place people wanted to belong. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: a business can become memorable through the experience around what it sells.",
    whyItMatters:
      "A business can become memorable through the experience around what it sells. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What makes your business experience different from everyone else? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["branding", "customer-experience", "community"],
  },
  {
    id: "SPARK-BIZ-007",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "quick",
    title: "The Accidental Success of Post-it Notes",
    shortTitle: "Post-it Business Lesson",
    teaser: "A product without a purpose found its purpose.",
    whatHappened:
      "The Post-it Note was not created from a perfect plan. It became successful because someone recognized a new use for an unexpected discovery. A product without a purpose found its purpose. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. The lasting importance is simple: entrepreneurs often need the ability to adapt when reality changes.",
    whyItMatters:
      "Entrepreneurs often need the ability to adapt when reality changes. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What could you rethink instead of abandoning? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["innovation", "flexibility", "creativity"],
  },
  {
    id: "SPARK-BIZ-008",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "quick",
    title: "The Customer Complaint That Built A Better Business",
    shortTitle: "Complaints as Clues",
    teaser: "Complaints can become clues.",
    whatHappened:
      "Many successful companies use customer complaints as information instead of criticism. Problems reveal where improvement is needed. Complaints can become clues. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. The lasting importance is simple: feedback can become a roadmap for growth.",
    whyItMatters: "Feedback can become a roadmap for growth. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What feedback could help you improve? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["customer-feedback", "improvement", "growth"],
  },
  {
    id: "SPARK-BIZ-009",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "The IKEA Effect",
    teaser: "Why we value things more when we build them ourselves.",
    whatHappened:
      "Researchers found that people place higher value on furniture they assemble themselves â even when the result is imperfect. The effort of creation creates emotional ownership. Why we value things more when we build them ourselves. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: involving customers in the creation process builds loyalty and satisfaction. People support what they help build.",
    whyItMatters:
      "Involving customers in the creation process builds loyalty and satisfaction. People support what they help build. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "Where could you invite your customers or team to co-create instead of just consume? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Assembled furniture",
    tags: ["psychology", "customer-experience", "co-creation"],
  },
  {
    id: "SPARK-BIZ-010",
    category: "010",
    categoryLabel: "Business",
    sparkType: "deep",
    title: "Sara Blakely: Turning an Annoyance Into Spanx",
    shortTitle: "Sara Blakely & Spanx",
    teaser: "A simple frustration became a billion-dollar business.",
    whatHappened:
      "Sara Blakely noticed a problem while getting dressed for an event. She wanted clothing that looked smoother under her outfit, but existing solutions did not work. Instead of accepting the problem, she experimented and created her own solution. She invested her savings, researched the product herself, and built Spanx into a global brand. A simple frustration became a billion-dollar business. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. There is also a second lesson here. Meaningful progress usually includes uncertainty, incomplete information, and a period when the value of an idea is not obvious. The people who continue are not always the ones with the most confidence; they are often the ones willing to stay curious long enough to learn. The lasting importance is simple: many successful businesses begin with someone solving a problem they personally understand. The founder's frustration became a customer's solution.",
    whyItMatters:
      "Many successful businesses begin with someone solving a problem they personally understand. The founder's frustration became a customer's solution. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What everyday frustration could reveal a business opportunity? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["entrepreneurship", "innovation", "resilience", "creativity"],
  },

  // — Small business (spark-notes-files/SPARK_NOTE_SMALL_BUSINESS_ENTREPRENEUR_SPARK_LIBRARY.md) —
  {
    id: "SPARK-SMB-001",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "The Homemade Product That Became a Business",
    shortTitle: "Homemade to Business",
    teaser: "Many businesses begin with someone creating something they love.",
    whatHappened:
      "Some entrepreneurs begin by making something for themselves, friends, or family. A craft, recipe, design, or solution solves a small problem. Over time, others see the value and the idea grows. Many businesses begin with someone creating something they love. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: a business does not always begin with a large plan. Sometimes it begins with one person creating something useful.",
    whyItMatters:
      "A business does not always begin with a large plan. Sometimes it begins with one person creating something useful. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What do you already create, solve, or help with that others might value? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["entrepreneurship", "creativity", "small-business", "makers"],
  },
  {
    id: "SPARK-SMB-002",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "story",
    title: "The Customer Who Gives You Your Next Idea",
    shortTitle: "Customer Insight",
    teaser: "Your customers often show you where your business can grow.",
    whatHappened:
      "Many successful small businesses improve because they listen carefully to customers. Questions, requests, and feedback reveal opportunities. Your customers often show you where your business can grow. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: customers are not just buyers. They are sources of insight.",
    whyItMatters: "Customers are not just buyers. They are sources of insight. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What question from a customer could inspire your next improvement? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["customers", "improvement", "business-growth"],
  },
  {
    id: "SPARK-SMB-003",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "quick",
    title: "The Power of Starting Small",
    shortTitle: "Start Small",
    teaser: "Big businesses often begin with one small step.",
    whatHappened:
      "Many entrepreneurs start with limited resources. They test ideas, learn from customers, improve their offer, and grow over time. Big businesses often begin with one small step. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. The lasting importance is simple: small beginnings create opportunities for learning.",
    whyItMatters: "Small beginnings create opportunities for learning. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What small version of your idea could you test? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["entrepreneurship", "momentum", "action"],
  },
  {
    id: "SPARK-SMB-004",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "A Better Way to Solve an Everyday Problem",
    shortTitle: "Everyday Problem",
    teaser: "Businesses often begin by noticing frustrations.",
    whatHappened: "Entrepreneurs frequently discover opportunities by asking: \"Why is this harder than it needs to be?\" A better solution can become a valuable product or service. Businesses often begin by noticing frustrations. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: problems can become possibilities. The strongest businesses create value people can feel, understand, and trustânot just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    whyItMatters: "Problems can become possibilities. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What problem do you notice that others accept? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["problem-solving", "innovation", "creativity"],
  },
  {
    id: "SPARK-SMB-005",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "The Handmade Business Advantage",
    shortTitle: "Handmade Advantage",
    teaser: "People often buy the story behind what you create.",
    whatHappened:
      "Small handmade businesses offer something beyond a product. They provide creativity, personality, and connection. People often buy the story behind what you create. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: a personal touch can become a competitive advantage.",
    whyItMatters: "A personal touch can become a competitive advantage. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What makes your work uniquely yours? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["crafts", "creativity", "connection"],
  },
  {
    id: "SPARK-SMB-006",
    category: "010",
    categoryLabel: "Business",
    sparkType: "quick",
    title: "The Power of the First Customer",
    shortTitle: "First Customer",
    teaser: "One customer can change how you see your idea.",
    whatHappened:
      "The first person who pays for a product or service provides more than income. They provide evidence that the idea has value. One customer can change how you see your idea. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. The lasting importance is simple: small wins create confidence and momentum.",
    whyItMatters: "Small wins create confidence and momentum. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What evidence of progress have you overlooked? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["validation", "confidence", "entrepreneurship"],
  },
  {
    id: "SPARK-SMB-007",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "The Business That Listened",
    shortTitle: "The Business That Listened",
    teaser: "Listening can become a business advantage.",
    whatHappened:
      "Many small businesses succeed because they build relationships with customers. They remember preferences, respond personally, and create trust. Listening can become a business advantage. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: relationships are often the foundation of loyalty.",
    whyItMatters: "Relationships are often the foundation of loyalty. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "How can you make someone feel valued today? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["customer-service", "relationships", "growth"],
  },
  {
    id: "SPARK-SMB-008",
    category: "010",
    categoryLabel: "Business",
    sparkType: "story",
    title: "Your Experience Is an Asset",
    shortTitle: "Your Experience",
    teaser: "What you know may be more valuable than you realize.",
    whatHappened:
      "Many entrepreneurs build businesses from skills developed through life experiences, careers, hobbies, and challenges. Those experiences can become valuable solutions for others. What you know may be more valuable than you realize. Business lessons become useful when they move beyond success stories and reveal the decisions underneath: what problem was noticed, what value was created, what relationship was strengthened, and what changed because someone listened. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: your journey may contain knowledge someone else needs.",
    whyItMatters: "Your journey may contain knowledge someone else needs. The strongest businesses create value people can feel, understand, and trust—not just products people can buy. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What have you learned that could help someone else? Apply the lesson to one customer, offer, process, or decision. Ask what would make the experience more useful, clear, or trustworthy. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["skills", "knowledge", "expertise"],
  },

  // — Quotes (spark-notes-files/SPARK_NOTE_QUOTES_WITH_STORIES_SPARK_LIBRARY.md) —
  {
    id: "SPARK-QUOTE-001",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "Stay Hungry. Stay Foolish.",
    shortTitle: "Steve Jobs",
    teaser:
      "A reminder that curiosity and willingness to learn can change what is possible.",
    whatHappened:
      "Steve Jobs shared this message during a commencement speech at Stanford University. The phrase encouraged people to remain curious, continue learning, and avoid becoming limited by what they already know. A reminder that curiosity and willingness to learn can change what is possible. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: growth requires staying open to new ideas. Curiosity keeps possibilities alive.",
    whyItMatters:
      "Growth requires staying open to new ideas. Curiosity keeps possibilities alive. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What is something new you are willing to explore? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["curiosity", "learning", "courage", "innovation"],
  },
  {
    id: "SPARK-QUOTE-002",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "The Only Way to Do Great Work Is to Love What You Do.",
    shortTitle: "Steve Jobs",
    teaser: "Meaningful work often begins with caring deeply about what you create.",
    whatHappened:
      "Steve Jobs often emphasized the connection between passion and excellence. His belief was that people create their best work when they feel connected to the purpose behind it. Meaningful work often begins with caring deeply about what you create. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: passion does not mean every day is easy. It means the work matters enough to continue.",
    whyItMatters:
      "Passion does not mean every day is easy. It means the work matters enough to continue. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What part of your work feels most meaningful? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["purpose", "passion", "creativity"],
  },
  {
    id: "SPARK-QUOTE-003",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "Success Is Not Final. Failure Is Not Fatal.",
    shortTitle: "Winston Churchill",
    teaser: "Both success and setbacks are moments in a longer journey.",
    whatHappened:
      "Winston Churchill reflected on the idea that life and leadership involve constant movement. A victory does not mean the journey ends, and a setback does not mean the journey is over. Both success and setbacks are moments in a longer journey. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: progress requires continuing through changing circumstances.",
    whyItMatters:
      "Progress requires continuing through changing circumstances. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What challenge are you still moving through? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["resilience", "perseverance", "growth"],
  },
  {
    id: "SPARK-QUOTE-004",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "Creativity Is Intelligence Having Fun.",
    shortTitle: "Albert Einstein",
    teaser: "Creative thinking combines knowledge with playfulness.",
    whatHappened:
      "Often attributed to Albert Einstein, this quote captures an idea many innovators understand: imagination grows when people explore, experiment, and make connections. Creative thinking combines knowledge with playfulness. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: play and curiosity are powerful parts of learning.",
    whyItMatters: "Play and curiosity are powerful parts of learning. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "Where could you add more curiosity or play into your work? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["creativity", "imagination", "learning"],
  },
  {
    id: "SPARK-QUOTE-005",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "The Way to Get Started Is to Quit Talking and Begin Doing.",
    shortTitle: "Walt Disney",
    teaser: "Ideas become real when we take the first step.",
    whatHappened:
      "Walt Disney built a creative empire by moving ideas into action. The quote reflects the importance of beginning rather than waiting forever for perfect conditions. Ideas become real when we take the first step. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: action creates information. You learn by doing.",
    whyItMatters: "Action creates information. You learn by doing. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What small action could move an idea forward today? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["action", "momentum", "progress"],
  },
  {
    id: "SPARK-QUOTE-006",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "Imagination Is More Important Than Knowledge.",
    shortTitle: "Albert Einstein",
    teaser: "Imagining new possibilities creates the beginning of change.",
    whatHappened:
      "Albert Einstein valued imagination because discoveries often begin before there is proof. Someone first has to imagine what might be possible. Imagining new possibilities creates the beginning of change. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: every invention begins as an idea.",
    whyItMatters: "Every invention begins as an idea. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What possibility can you imagine before you know exactly how it will happen? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["creativity", "possibility", "innovation"],
  },
  {
    id: "SPARK-QUOTE-007",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "Whether You Think You Can or Think You Can't, You're Right.",
    shortTitle: "Henry Ford",
    teaser: "The beliefs we carry can influence the actions we take.",
    whatHappened:
      "Henry Ford highlighted the role confidence and perspective play in pursuing goals. Believing something is possible often changes how people approach challenges. The beliefs we carry can influence the actions we take. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: mindset affects effort, persistence, and willingness to try.",
    whyItMatters:
      "Mindset affects effort, persistence, and willingness to try. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What belief would help you move forward? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["mindset", "confidence", "belief"],
  },
  {
    id: "SPARK-QUOTE-008",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "Be Yourself; Everyone Else Is Already Taken.",
    shortTitle: "Oscar Wilde",
    teaser: "Your uniqueness can become your greatest strength.",
    whatHappened:
      "Oscar Wilde was known for creativity, humor, and individuality. The quote reflects the value of embracing what makes each person different. Your uniqueness can become your greatest strength. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: authenticity builds connection.",
    whyItMatters: "Authenticity builds connection. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What part of yourself deserves more room to show up? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["authenticity", "confidence", "individuality"],
  },
  {
    id: "SPARK-QTE-003",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "Start Where You Are",
    shortTitle: "Arthur Ashe",
    teaser: "Arthur Ashe on beginning with what you have.",
    whatHappened: "\"Start where you are. Use what you have. Do what you can.\" — Arthur Ashe, tennis champion and civil rights advocate. Ashe faced barriers throughout his career but never waited for perfect conditions to begin. Arthur Ashe on beginning with what you have. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: ashe's words remind us that action doesn't require ideal circumstances Ã¢ÂÂ only willingness to begin with what's in front of us. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    whyItMatters:
      "Ashe's words remind us that action doesn't require ideal circumstances â only willingness to begin with what's in front of us. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What small step could you take today with exactly the resources you already have? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Tennis court",
    tags: ["resilience", "action", "beginning"],
  },
  {
    id: "SPARK-QTE-004",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "story",
    title: "Creativity Takes Courage",
    shortTitle: "Henri Matisse",
    teaser: "Henri Matisse on the bravery of making art.",
    whatHappened: "\"Creativity takes courage.\" — Henri Matisse, one of the most influential artists of the 20th century. Matisse spent decades pushing past comfort, reinventing his style even when the world resisted change. Henri Matisse on the bravery of making art. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: sharing creative work means risking judgment. Matisse reminds us that the act of creating is itself an act of bravery. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    whyItMatters:
      "Sharing creative work means risking judgment. Matisse reminds us that the act of creating is itself an act of bravery. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What small experiment could you share before it feels 'ready'? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Artist palette",
    tags: ["creativity", "courage", "art"],
  },

  // — Fun facts (spark-notes-files/SPARK_NOTE_FUN_FACTS_AND_WONDER_SPARK_LIBRARY.md) —
  {
    id: "SPARK-FACT-001",
    category: "004",
    categoryLabel: "Nature & Places",
    sparkType: "quick",
    title: "Honey Never Spoils",
    shortTitle: "Honey Never Spoils",
    teaser: "A food discovered thousands of years ago can still be preserved today.",
    whatHappened:
      "Honey has natural properties that help prevent spoilage, including low moisture and acidity. Archaeologists have found ancient honey that remained preserved. A food discovered thousands of years ago can still be preserved today. Nature and place can teach without speaking. When we slow down enough to observe patterns, seasons, structures, and relationships, the familiar world becomes a source of perspective. The lasting importance is simple: nature often contains solutions that inspire science and innovation.",
    whyItMatters:
      "Nature often contains solutions that inspire science and innovation. The natural world often models patience, interdependence, adaptation, and change more clearly than advice ever could. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "Where might you find inspiration by looking at something familiar in a new way? Step outside or look closely at a natural object, place, or seasonal change. Note one pattern that offers a lesson for your own pace or direction. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["nature", "science", "curiosity"],
    thumbnailAlt: "Honey jar",
  },
  {
    id: "SPARK-FACT-002",
    category: "005",
    categoryLabel: "Curiosity",
    sparkType: "quick",
    title: "Bananas Are Berries, But Strawberries Are Not",
    shortTitle: "Berry Surprise",
    teaser: "The way we name fruits is not always how science classifies them.",
    whatHappened:
      "Botanically speaking, bananas meet the scientific definition of a berry. Strawberries do not because their structure develops differently. The way we name fruits is not always how science classifies them. Curiosity changes an ordinary fact into an invitation. Instead of stopping at what happened, it asks what else might be true, what assumptions may be incomplete, and what becomes visible when we look again. The lasting importance is simple: sometimes what we assume is true is worth exploring. Looking closer can reveal something unexpected.",
    whyItMatters:
      "Sometimes what we assume is true is worth exploring. Looking closer can reveal something unexpected. Curiosity loosens the grip of assumptions and creates room for better questions. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What assumption in your life or business might be worth questioning? Write three questions about something you have been assuming is fixed. Choose the question that opens the most possibility. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["nature", "science", "curiosity"],
  },
  {
    id: "SPARK-FACT-003",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "quick",
    title: "The Smell After Rain Has a Name",
    shortTitle: "Petrichor",
    teaser: "That fresh smell after rain is a real phenomenon.",
    whatHappened:
      "The smell after rainfall is called petrichor. It comes from a combination of plant oils, soil compounds, and chemical reactions that happen when rain reaches dry ground. That fresh smell after rain is a real phenomenon. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. The lasting importance is simple: small details in everyday life can lead to fascinating discoveries.",
    whyItMatters:
      "Small details in everyday life can lead to fascinating discoveries. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What ordinary moment could you slow down and notice today? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["nature", "senses", "science"],
  },
  {
    id: "SPARK-FACT-004",
    category: "012",
    categoryLabel: "Wonder",
    sparkType: "quick",
    title: "Octopuses Have Three Hearts",
    shortTitle: "Three Hearts",
    teaser: "One ocean creature has a surprisingly unusual design.",
    whatHappened:
      "Octopuses have three hearts. Two pump blood toward the gills, while one pumps blood through the rest of the body. Their unique biology helps them survive in the ocean. One ocean creature has a surprisingly unusual design. Wonder gives us permission to pause before explaining everything away. It restores scale, surprise, and imagination, reminding us that the world still contains more than we have noticed. The lasting importance is simple: nature solves problems in creative ways.",
    whyItMatters: "Nature solves problems in creative ways. Wonder can renew energy because it shifts us from rushing past life to actually noticing it. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "Where could a different approach create a better solution? Spend five quiet minutes noticing something that creates awe, surprise, or delight. Save one sentence about what it changed in your perspective. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["animals", "science", "wonder"],
    thumbnailAlt: "Octopus",
  },
  {
    id: "SPARK-FACT-005",
    category: "005",
    categoryLabel: "Curiosity",
    sparkType: "quick",
    title: "The Eiffel Tower Changes Size",
    shortTitle: "Eiffel Tower Size",
    teaser: "A famous landmark moves more than you might expect.",
    whatHappened:
      "Because metal expands when heated, the Eiffel Tower can become taller during warm weather. Temperature changes cause the structure to expand and contract. A famous landmark moves more than you might expect. Curiosity changes an ordinary fact into an invitation. Instead of stopping at what happened, it asks what else might be true, what assumptions may be incomplete, and what becomes visible when we look again. The lasting importance is simple: even things that appear permanent are constantly changing.",
    whyItMatters:
      "Even things that appear permanent are constantly changing. Curiosity loosens the grip of assumptions and creates room for better questions. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What small changes are happening around you that you might not notice? Write three questions about something you have been assuming is fixed. Choose the question that opens the most possibility. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["engineering", "science", "curiosity"],
  },
  {
    id: "SPARK-FACT-006",
    category: "006",
    categoryLabel: "Words & Origins",
    sparkType: "quick",
    title: "A Group of Flamingos Has a Special Name",
    shortTitle: "A Flamboyance",
    teaser: "Even groups of animals can have creative names.",
    whatHappened:
      "A group of flamingos is called a flamboyance. Many collective animal names were created because people noticed unique behaviors or appearances. Even groups of animals can have creative names. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. The lasting importance is simple: language itself is full of creativity.",
    whyItMatters: "Language itself is full of creativity. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What ordinary thing could you describe in a more creative way? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["animals", "language", "humor"],
  },
  {
    id: "SPARK-FACT-007",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "quick",
    title: "The First Computer Mouse Was Wooden",
    shortTitle: "Wooden Mouse",
    teaser: "One of the most familiar computer tools started as a simple wooden box.",
    whatHappened:
      "The first computer mouse was created in the 1960s and was made from wood. It was named because the cord looked similar to a mouse tail. One of the most familiar computer tools started as a simple wooden box. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. The lasting importance is simple: many technologies begin as simple prototypes.",
    whyItMatters: "Many technologies begin as simple prototypes. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What simple version of an idea could you create first? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["technology", "invention", "history"],
  },
  {
    id: "SPARK-FACT-008",
    category: "004",
    categoryLabel: "Nature & Places",
    sparkType: "quick",
    title: "Trees Communicate",
    shortTitle: "Talking Trees",
    teaser: "Forests are more connected than they appear.",
    whatHappened:
      "Research has shown that trees and plants can exchange resources and chemical signals through underground fungal networks. Scientists continue studying these complex relationships. Forests are more connected than they appear. Nature and place can teach without speaking. When we slow down enough to observe patterns, seasons, structures, and relationships, the familiar world becomes a source of perspective. The lasting importance is simple: systems often work together in ways we cannot immediately see.",
    whyItMatters:
      "Systems often work together in ways we cannot immediately see. The natural world often models patience, interdependence, adaptation, and change more clearly than advice ever could. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What connections in your life or business might you be overlooking? Step outside or look closely at a natural object, place, or seasonal change. Note one pattern that offers a lesson for your own pace or direction. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["nature", "science", "connection"],
  },

  // — Gratitude & meaning (spark-notes-files/SPARK_NOTE_GRATITUDE_AND_MEANING_SPARK_LIBRARY.md) —
  {
    id: "SPARK-MEAN-001",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "quick",
    title: "The Power of Saying Thank You",
    shortTitle: "Say Thank You",
    teaser: "Two simple words can have a lasting impact.",
    whatHappened:
      "A sincere thank you can change how people feel about their effort, their work, and their relationship with us. Small moments of appreciation often become the memories people carry with them. Two simple words can have a lasting impact. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. The lasting importance is simple: people want to know they are seen and valued. Gratitude strengthens connections.",
    whyItMatters:
      "People want to know they are seen and valued. Gratitude strengthens connections. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "Who is someone you could thank today? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["gratitude", "relationships", "kindness", "connection"],
  },
  {
    id: "SPARK-MEAN-002",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Small Moments Become Big Memories",
    shortTitle: "Small Moments",
    teaser: "The moments we remember are often the simple ones.",
    whatHappened:
      "A conversation, a laugh, a shared meal, or a small act of kindness can become a meaningful memory. Life is often shaped by ordinary moments we recognize as special. The moments we remember are often the simple ones. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: paying attention helps us appreciate what is already around us.",
    whyItMatters:
      "Paying attention helps us appreciate what is already around us. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What small moment recently brought you joy? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["memories", "appreciation", "mindfulness"],
  },
  {
    id: "SPARK-MEAN-003",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "quick",
    title: "The Ripple Effect of Kindness",
    shortTitle: "Kindness Ripples",
    teaser: "A small action can travel farther than we realize.",
    whatHappened:
      "A kind word or thoughtful action can influence someone else's day. That person may then pass that kindness forward. A small action can travel farther than we realize. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. The lasting importance is simple: our actions affect people in ways we may never see.",
    whyItMatters:
      "Our actions affect people in ways we may never see. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What small kindness could you share today? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["kindness", "impact", "connection"],
  },
  {
    id: "SPARK-MEAN-004",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Your Story Has Value",
    shortTitle: "Your Story Matters",
    teaser: "Your experiences can become something meaningful.",
    whatHappened:
      "Every person carries lessons from challenges, successes, relationships, and discoveries. Those experiences shape how we help and connect with others. Your experiences can become something meaningful. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: your journey may contain wisdom that someone else needs.",
    whyItMatters:
      "Your journey may contain wisdom that someone else needs. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What lesson from your life could help another person? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["purpose", "experiences", "growth"],
  },
  {
    id: "SPARK-MEAN-005",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "quick",
    title: "The Gift of Being Present",
    shortTitle: "Being Present",
    teaser: "Sometimes the greatest gift is simply paying attention.",
    whatHappened:
      "Being fully present with someone communicates that they matter. Small moments of attention can create strong connections. Sometimes the greatest gift is simply paying attention. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. The lasting importance is simple: people remember how we made them feel.",
    whyItMatters: "People remember how we made them feel. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "Who deserves your full attention today? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["presence", "awareness", "relationships"],
  },
  {
    id: "SPARK-MEAN-006",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Celebrate How Far You Have Come",
    shortTitle: "Celebrate Progress",
    teaser: "Growth deserves recognition along the way.",
    whatHappened:
      "People often focus on what remains unfinished and forget to recognize what they have already accomplished. Looking back reveals progress. Growth deserves recognition along the way. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: acknowledging growth builds confidence and appreciation.",
    whyItMatters:
      "Acknowledging growth builds confidence and appreciation. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What is something you can celebrate about your journey? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["progress", "reflection", "achievement"],
  },
  {
    id: "SPARK-MEAN-007",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Making a Difference Does Not Require Being Famous",
    shortTitle: "Quiet Impact",
    teaser: "Small contributions can create meaningful change.",
    whatHappened:
      "Many people improve the world through everyday actions: helping someone, teaching, creating, encouraging, and serving. Impact is not measured only by recognition. Small contributions can create meaningful change. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: meaning comes from how we use what we have.",
    whyItMatters: "Meaning comes from how we use what we have. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "How can you make one person's day better? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["purpose", "impact", "service"],
  },
  {
    id: "SPARK-MEAN-008",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "quick",
    title: "Find Meaning in the Ordinary",
    shortTitle: "Ordinary Meaning",
    teaser: "Meaning is often found in places we overlook.",
    whatHappened:
      "A familiar place, a routine moment, or a simple experience can become meaningful when we slow down enough to notice it. Meaning is often found in places we overlook. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. The lasting importance is simple: a meaningful life is built from many small moments.",
    whyItMatters:
      "A meaningful life is built from many small moments. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What ordinary thing are you grateful for today? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["gratitude", "perspective", "awareness"],
  },

  // — Personal growth (spark-notes-files/SPARK_NOTE_PERSONAL_GROWTH_AND_ENCOURAGEMENT_SPARK_LIBRARY.md) —
  {
    id: "SPARK-GROW-001",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "story",
    title: "Small Steps Create Momentum",
    shortTitle: "Small Steps",
    teaser: "Tiny actions repeated over time can create surprising results.",
    whatHappened:
      "Many meaningful accomplishments are created through consistent small steps rather than one dramatic moment. Progress builds confidence. Tiny actions repeated over time can create surprising results. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: small wins create evidence that you are moving forward.",
    whyItMatters:
      "Small wins create evidence that you are moving forward. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What is one small action you could complete today? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["growth", "progress", "motivation"],
  },
  {
    id: "SPARK-GROW-002",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "quick",
    title: "The Power of Starting Before You Are Ready",
    shortTitle: "Start Before Ready",
    teaser: "Many opportunities begin before we feel completely prepared.",
    whatHappened:
      "Creators, entrepreneurs, and leaders often begin with uncertainty. Confidence frequently comes after taking action, not before. Many opportunities begin before we feel completely prepared. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. The lasting importance is simple: waiting until everything is perfect can prevent meaningful progress.",
    whyItMatters:
      "Waiting until everything is perfect can prevent meaningful progress. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What would you begin if you allowed yourself to learn along the way? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["courage", "action", "confidence", "growth"],
  },
  {
    id: "SPARK-GROW-003",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Your Past Can Become Wisdom",
    shortTitle: "Past as Wisdom",
    teaser: "Every chapter of life can teach something valuable.",
    whatHappened:
      "Experiences, challenges, successes, and mistakes all contribute to the person we become. The lessons we gain can become strengths we use later. Every chapter of life can teach something valuable. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: your history is not only what happened to you. It is also what you learned from it.",
    whyItMatters:
      "Your history is not only what happened to you. It is also what you learned from it. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What lesson from your past helps you today? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["resilience", "experience", "learning"],
  },
  {
    id: "SPARK-GROW-004",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Progress Is Not Always Visible",
    shortTitle: "Invisible Progress",
    teaser: "Some of the most important growth happens quietly.",
    whatHappened:
      "Seeds grow underground before anything appears above the surface. People often experience the same thing. Learning, healing, and building can happen before results become obvious. Some of the most important growth happens quietly. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: invisible progress is still progress.",
    whyItMatters: "Invisible progress is still progress. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What might be growing in your life that you cannot see yet? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["patience", "growth", "encouragement"],
  },
  {
    id: "SPARK-GROW-005",
    category: "005",
    categoryLabel: "Curiosity",
    sparkType: "quick",
    title: "The Strength of Curiosity",
    shortTitle: "Strength of Curiosity",
    teaser: "Questions can open doors that answers cannot.",
    whatHappened:
      "Curious people continue learning because they remain open to possibilities. Many discoveries begin with someone asking a simple question. Questions can open doors that answers cannot. Curiosity changes an ordinary fact into an invitation. Instead of stopping at what happened, it asks what else might be true, what assumptions may be incomplete, and what becomes visible when we look again. The lasting importance is simple: curiosity keeps people growing.",
    whyItMatters: "Curiosity keeps people growing. Curiosity loosens the grip of assumptions and creates room for better questions. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What question are you curious about today? Write three questions about something you have been assuming is fixed. Choose the question that opens the most possibility. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["curiosity", "learning", "discovery"],
  },
  {
    id: "SPARK-GROW-006",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "quick",
    title: "Celebrate Small Wins",
    shortTitle: "Celebrate Small Wins",
    teaser: "Small accomplishments deserve recognition.",
    whatHappened:
      "People often overlook progress because they focus only on the final goal. But every completed step builds confidence and momentum. Small accomplishments deserve recognition. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. The lasting importance is simple: recognizing progress helps create motivation for the next step.",
    whyItMatters:
      "Recognizing progress helps create motivation for the next step. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What is something you accomplished that deserves more credit? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["achievement", "confidence", "encouragement"],
  },
  {
    id: "SPARK-GROW-007",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    sparkType: "story",
    title: "Different Does Not Mean Wrong",
    shortTitle: "Different Strength",
    teaser: "A different way of thinking can become an advantage.",
    whatHappened:
      "Many innovations come from people who see problems differently. Unique perspectives can reveal solutions others miss. A different way of thinking can become an advantage. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: the way you think may be part of your strength.",
    whyItMatters: "The way you think may be part of your strength. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What is something unique about how you approach the world? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["strengths", "individuality", "neurodiversity"],
  },
  {
    id: "SPARK-GROW-008",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "quick",
    title: "Give Yourself Room To Learn",
    shortTitle: "Room To Learn",
    teaser: "Growth requires permission to be a beginner.",
    whatHappened:
      "Every expert started by not knowing. Learning includes mistakes, questions, and adjustments. Growth requires permission to be a beginner. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. The lasting importance is simple: allowing yourself to learn creates more opportunities.",
    whyItMatters:
      "Allowing yourself to learn creates more opportunities. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What would you try if you did not need to be good at it immediately? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["learning", "patience", "self-compassion"],
  },
  {
    id: "SPARK-GRO-009",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "quick",
    title: "The Two-Minute Rule",
    teaser: "Small actions beat perfect plans.",
    whatHappened:
      "Productivity researchers found that if a task takes less than two minutes, doing it immediately prevents the mental overhead of tracking it. The rule isn't about speed â it's about reducing friction between intention and action. Small actions beat perfect plans. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. The lasting importance is simple: momentum often starts with the smallest possible step. Finishing tiny tasks builds confidence for bigger ones.",
    whyItMatters:
      "Momentum often starts with the smallest possible step. Finishing tiny tasks builds confidence for bigger ones. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What two-minute action could you finish right now instead of adding it to a list? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Checklist",
    tags: ["productivity", "momentum", "action"],
  },
  {
    id: "SPARK-CRE-001",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    title: "Constraints Spark Creativity",
    teaser: "Limits can be the best muse.",
    whatHappened:
      "Dr. Seuss wrote Green Eggs and Ham using only 50 words â on a bet. Twitter's 140-character limit spawned new forms of wit. Haiku's rigid structure has produced centuries of beauty. Limits can be the best muse. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: unlimited options can paralyze. Constraints force focus and often produce the most memorable results.",
    whyItMatters:
      "Unlimited options can paralyze. Constraints force focus and often produce the most memorable results. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What artificial limit could you set today to unlock a more creative solution? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    thumbnailAlt: "Green eggs illustration",
  },

  // — Date-based holidays (spark-notes-files/SPARK_NOTE_HOLIDAY_DATE_BASED_SPARK_LIBRARY.md) —
  {
    id: "SPARK-HOL-001",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    sparkType: "story",
    title: "National Creativity Day",
    shortTitle: "Creativity Day",
    teaser: "A day dedicated to the ideas hiding inside every person.",
    whatHappened:
      "Creativity is not limited to artists. Every invention, business, solution, and improvement begins with someone imagining a different possibility. National Creativity Day celebrates the act of creating something new. A day dedicated to the ideas hiding inside every person. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: many people believe creativity belongs only to certain people. In reality, creativity is a skill that grows through curiosity and practice.",
    whyItMatters:
      "Many people believe creativity belongs only to certain people. In reality, creativity is a skill that grows through curiosity and practice. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What is one idea you have been waiting to explore? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 5, day: 30 },
    priority: 82,
    tags: ["creativity", "ideas", "imagination"],
  },
  {
    id: "SPARK-HOL-002",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "World Creativity and Innovation Day",
    shortTitle: "Innovation Day",
    teaser: 'The world changes when someone asks, "What if?"',
    whatHappened: "Innovation often begins with a simple question. What if something could work differently? Across history, inventors, entrepreneurs, and creators have changed the world by challenging assumptions. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: new ideas create new possibilities. Every business improvement starts with someone seeing an opportunity. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    whyItMatters:
      "New ideas create new possibilities. Every business improvement starts with someone seeing an opportunity. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What is one thing in your life or business you would redesign? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 4, day: 21 },
    priority: 82,
    tags: ["innovation", "creativity", "entrepreneurship"],
  },
  {
    id: "SPARK-HOL-003",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "National Inventors Day",
    shortTitle: "Inventors Day",
    teaser: "A day celebrating the people who imagined something different.",
    whatHappened:
      "Inventors throughout history solved problems by looking at the world differently. Their ideas often started as simple questions. A day celebrating the people who imagined something different. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: innovation begins with curiosity.",
    whyItMatters: "Innovation begins with curiosity. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What problem around you deserves a creative solution? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 2, day: 11 },
    priority: 82,
    tags: ["inventions", "creativity", "entrepreneurship"],
  },
  {
    id: "SPARK-HOL-010",
    category: "001",
    categoryLabel: "Discovery",
    title: "National Donut Day",
    teaser: "A sweet tradition with a surprising origin.",
    whatHappened:
      "National Donut Day began in 1938 to honor the Salvation Army 'Donut Lassies' who served donuts to soldiers during World War I. What started as comfort food in the trenches became an annual celebration of small joys. A sweet tradition with a surprising origin. The deeper value of this story is not only the event itself, but the moment someone noticed that something unexpected deserved a second look. Discovery often begins before there is certainty; it begins with attention. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: sometimes the sweetest traditions come from simple acts of care during hard times.",
    whyItMatters:
      "Sometimes the sweetest traditions come from simple acts of care during hard times. The useful question is not only “What did they discover?” but “What allowed them to notice it?” This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "Who could you surprise with a small treat or kind gesture today? Pause long enough to notice one unexpected result, overlooked detail, or unanswered question. Write down what it might be inviting you to explore. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 6, day: 6 },
    priority: 80,
    thumbnailAlt: "Donuts",
  },
  {
    id: "SPARK-HOL-011",
    category: "012",
    categoryLabel: "Wonder",
    title: "National Ice Cream Day",
    teaser: "A presidential proclamation for something cold and sweet.",
    whatHappened:
      "President Ronald Reagan declared the third Sunday in July as National Ice Cream Day in 1984. Americans consume about 23 gallons of ice cream per person each year â making it one of the most beloved treats in the country. A presidential proclamation for something cold and sweet. Wonder gives us permission to pause before explaining everything away. It restores scale, surprise, and imagination, reminding us that the world still contains more than we have noticed. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: celebrating small pleasures reminds us that joy doesn't need a grand occasion.",
    whyItMatters:
      "Celebrating small pleasures reminds us that joy doesn't need a grand occasion. Wonder can renew energy because it shifts us from rushing past life to actually noticing it. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What simple pleasure could you savor today without guilt or rush? Spend five quiet minutes noticing something that creates awe, surprise, or delight. Save one sentence about what it changed in your perspective. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 7, day: 21 },
    priority: 80,
    thumbnailAlt: "Ice cream cone",
  },
  {
    id: "SPARK-HOL-012",
    category: "006",
    categoryLabel: "Words & Origins",
    title: "National Book Lovers Day",
    teaser: "A day to celebrate stories that change us.",
    whatHappened:
      "August 9 is National Book Lovers Day â a quiet celebration of reading, discovery, and the worlds we enter through pages. No one knows exactly who started it, which feels fitting for a holiday about getting lost in someone else's words. A day to celebrate stories that change us. Words give shape to ideas that might otherwise remain difficult to hold. A phrase, name, or story can become a doorway into memory, meaning, identity, and a new way of seeing. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: books let us live other lives, learn from distant minds, and return changed. A single sentence can shift a perspective.",
    whyItMatters:
      "Books let us live other lives, learn from distant minds, and return changed. A single sentence can shift a perspective. The words we choose can preserve meaning, change perspective, and help an idea travel from one person to another. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What book, article, or story has been waiting for your attention? Capture one phrase, word, or sentence that stays with you. Add a note about why it matters and how you might use it. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 8, day: 9 },
    priority: 80,
    thumbnailAlt: "Open book",
  },
  {
    id: "SPARK-HOL-013",
    category: "001",
    categoryLabel: "Discovery",
    title: "National Chocolate Chip Cookie Day",
    teaser: "The accidental invention that became America's favorite cookie.",
    whatHappened:
      "Ruth Wakefield invented the chocolate chip cookie in 1938 at the Toll House Inn in Massachusetts. She broke a NestlÃ© chocolate bar into her butter cookie dough, expecting it to melt â but the chunks held their shape, creating something entirely new. The accidental invention that became America's favorite cookie. The deeper value of this story is not only the event itself, but the moment someone noticed that something unexpected deserved a second look. Discovery often begins before there is certainty; it begins with attention. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: another reminder that happy accidents often become beloved traditions.",
    whyItMatters:
      "Another reminder that happy accidents often become beloved traditions. The useful question is not only “What did they discover?” but “What allowed them to notice it?” This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What 'mistake' in your work might actually be your best idea? Pause long enough to notice one unexpected result, overlooked detail, or unanswered question. Write down what it might be inviting you to explore. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 8, day: 4 },
    priority: 80,
    thumbnailAlt: "Chocolate chip cookies",
  },
  {
    id: "SPARK-HOL-014",
    category: "004",
    categoryLabel: "Nature & Places",
    title: "International Coffee Day",
    teaser: "A global toast to the bean that fuels mornings.",
    whatHappened:
      "International Coffee Day on September 29 celebrates one of the world's most traded commodities. From Ethiopian highlands to your favorite mug, coffee has shaped cultures, economies, and countless morning rituals. A global toast to the bean that fuels mornings. Nature and place can teach without speaking. When we slow down enough to observe patterns, seasons, structures, and relationships, the familiar world becomes a source of perspective. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: rituals around food and drink connect us across cultures and give structure to our days.",
    whyItMatters:
      "Rituals around food and drink connect us across cultures and give structure to our days. The natural world often models patience, interdependence, adaptation, and change more clearly than advice ever could. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What daily ritual helps you pause and reset â even for just a minute? Step outside or look closely at a natural object, place, or seasonal change. Note one pattern that offers a lesson for your own pace or direction. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 9, day: 29 },
    priority: 80,
    thumbnailAlt: "Coffee cup",
  },
  {
    id: "SPARK-HOL-015",
    category: "005",
    categoryLabel: "Curiosity",
    title: "National Puzzle Day",
    teaser: "A day for pieces that fit together — eventually.",
    whatHappened:
      "January 29 is National Puzzle Day, celebrating jigsaws, crosswords, and brain teasers. Puzzles exercise patience, pattern recognition, and the satisfaction of finding where things belong. A day for pieces that fit together â eventually. Curiosity changes an ordinary fact into an invitation. Instead of stopping at what happened, it asks what else might be true, what assumptions may be incomplete, and what becomes visible when we look again. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: sometimes the best break is something that lets your hands work while your mind unwinds.",
    whyItMatters:
      "Sometimes the best break is something that lets your hands work while your mind unwinds. Curiosity loosens the grip of assumptions and creates room for better questions. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What problem are you trying to solve all at once that might benefit from one piece at a time? Write three questions about something you have been assuming is fixed. Choose the question that opens the most possibility. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 1, day: 29 },
    priority: 80,
    thumbnailAlt: "Jigsaw puzzle",
  },

  // — History (date-based) —
  {
    id: "SPARK-HIST-001",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "The First Email",
    shortTitle: "The First Email",
    teaser: "A simple message changed how the world communicates.",
    whatHappened:
      "In 1971, Ray Tomlinson sent the first network email and helped create a new way for people to communicate. A small technical experiment became part of everyday life. A simple message changed how the world communicates. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: many technologies we take for granted started as simple experiments.",
    whyItMatters:
      "Many technologies we take for granted started as simple experiments. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What small experiment could lead to something bigger? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["technology", "communication", "innovation"],
  },
  {
    id: "SPARK-HIS-001",
    category: "009",
    categoryLabel: "Adventure",
    title: "The Moon Landing",
    teaser: "One small step that inspired generations.",
    whatHappened:
      "On July 20, 1969, Neil Armstrong became the first human to walk on the Moon. The Apollo 11 mission fulfilled a promise made years earlier and proved that audacious goals, backed by persistence, can become reality. One small step that inspired generations. Adventure does not always begin with certainty. It often begins with movement: one step beyond routine, one question asked, or one willingness to enter unfamiliar territory and learn from what happens. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: the moon landing showed humanity what focused collaboration can achieve â and gave every child permission to dream bigger.",
    whyItMatters:
      "The moon landing showed humanity what focused collaboration can achieve â and gave every child permission to dream bigger. Adventure expands our sense of what is possible because action teaches what imagination alone cannot. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What 'impossible' goal deserves another look with fresh eyes? Take one safe step beyond routine today. Make it small enough to begin and meaningful enough to teach you something. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 7, day: 20 },
    priority: 85,
    thumbnailAlt: "Moon landing",
  },
  {
    id: "SPARK-HIST-002",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "The Birth of the Internet",
    shortTitle: "Birth of the Internet",
    teaser: "A small message helped begin a connected world.",
    whatHappened:
      "On October 29, 1969, the first message was sent between two computers on ARPANET, an early foundation of today's internet. The system crashed after only two letters were transmitted, but the experiment represented a huge step forward. A small message helped begin a connected world. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: major changes often begin with small first attempts. The first version does not need to be perfect.",
    whyItMatters:
      "Major changes often begin with small first attempts. The first version does not need to be perfect. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What first step could you take even if it is not the final version? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 10, day: 29 },
    priority: 85,
    tags: ["technology", "innovation", "communication"],
  },
  {
    id: "SPARK-HIST-003",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "The First iPhone",
    shortTitle: "First iPhone",
    teaser: "A phone became a pocket-sized computer.",
    whatHappened:
      "In 2007, Apple introduced the first iPhone and changed expectations for what a mobile device could do. It combined communication, internet access, music, and applications into one device. A phone became a pocket-sized computer. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: innovation often happens when existing ideas are combined in a new way.",
    whyItMatters:
      "Innovation often happens when existing ideas are combined in a new way. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What ideas could you combine to create something new? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 1, day: 9 },
    priority: 85,
    tags: ["technology", "business", "innovation"],
  },

  // — Seasonal equinox (protocol) —
  {
    id: "SPARK-SEASON-001",
    category: "004",
    categoryLabel: "Nature & Places",
    sparkType: "story",
    title: "Spring: New Beginnings",
    shortTitle: "Spring Beginnings",
    teaser: "A new season reminds us that growth happens gradually.",
    whatHappened:
      "Nature does not rush. Seeds grow quietly before anything appears above the surface. Spring reminds us that progress is often happening before results are visible. A new season reminds us that growth happens gradually. Nature and place can teach without speaking. When we slow down enough to observe patterns, seasons, structures, and relationships, the familiar world becomes a source of perspective. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: personal and business growth also requires patience.",
    whyItMatters:
      "Personal and business growth also requires patience. The natural world often models patience, interdependence, adaptation, and change more clearly than advice ever could. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What are you growing that needs more time? Step outside or look closely at a natural object, place, or seasonal change. Note one pattern that offers a lesson for your own pace or direction. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 3, day: 20 },
    priority: 75,
    tags: ["growth", "renewal", "creativity"],
  },
  {
    id: "SPARK-SEASON-002",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Autumn Reflection Spark",
    shortTitle: "Autumn Reflection",
    teaser: "A season for noticing how far you have come.",
    whatHappened:
      "Autumn is a reminder that change is part of growth. Trees let go of what they no longer need before beginning a new cycle. A season for noticing how far you have come. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: growth sometimes means releasing old habits, ideas, or expectations.",
    whyItMatters:
      "Growth sometimes means releasing old habits, ideas, or expectations. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What is something you are ready to let go of? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    monthDay: { month: 9, day: 22 },
    priority: 75,
    tags: ["reflection", "gratitude", "learning"],
  },

  // — Seasonal (month-based) —
  {
    id: "SPARK-HOL-SEASON-12",
    category: "012",
    categoryLabel: "Wonder",
    title: "December's Quiet Glow",
    shortTitle: "December's Quiet Glow",
    teaser: "A season of light, reflection, and small rituals.",
    whatHappened:
      "December has carried meaning across cultures for centuries â from winter solstice gatherings to festivals of light. Long nights invite slower pacing, warmer rooms, and traditions that reconnect us to people we love. A season of light, reflection, and small rituals. Wonder gives us permission to pause before explaining everything away. It restores scale, surprise, and imagination, reminding us that the world still contains more than we have noticed. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: seasons shape how we work and rest. December reminds us that endings and celebrations can coexist â that closing a year is its own kind of beginning.",
    whyInteresting:
      "Many December traditions began as practical responses to darkness — candles, feasts, and gatherings that made the coldest month feel survivable, even beautiful.",
    whyItMatters:
      "Seasons shape how we work and rest. December reminds us that endings and celebrations can coexist â that closing a year is its own kind of beginning. Wonder can renew energy because it shifts us from rushing past life to actually noticing it. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What small ritual could make this week feel warmer â for you or for someone else? Spend five quiet minutes noticing something that creates awe, surprise, or delight. Save one sentence about what it changed in your perspective. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    months: [12],
    priority: 60,
    tags: ["seasonal", "december", "holiday"],
    thumbnailAlt: "Winter candles",
  },

  // — Seasonal personality (spring / summer / autumn / winter) —
  {
    id: "SPARK-SEA-SPRING",
    category: "004",
    categoryLabel: "Nature & Places",
    sparkType: "quick",
    title: "Spring Begins Again",
    shortTitle: "Spring Begins Again",
    teaser: "New beginnings are already quietly starting.",
    whatHappened:
      "Every spring, the world rehearses a familiar miracle â bare branches bud, soil softens, and daylight stretches a little further. Cultures across history have celebrated renewal long before calendars marked the equinox. New beginnings are already quietly starting. Nature and place can teach without speaking. When we slow down enough to observe patterns, seasons, structures, and relationships, the familiar world becomes a source of perspective. The lasting importance is simple: spring reminds us that dormant seasons don't last forever. What feels stuck can still move again with patience and light.",
    whyItMatters:
      "Spring reminds us that dormant seasons don't last forever. What feels stuck can still move again with patience and light. The natural world often models patience, interdependence, adaptation, and change more clearly than advice ever could. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What small beginning could you nurture this week â even if it still looks tiny from the outside? Step outside or look closely at a natural object, place, or seasonal change. Note one pattern that offers a lesson for your own pace or direction. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    seasons: ["spring"],
    priority: 55,
    tags: ["seasonal", "spring", "creativity"],
  },
  {
    id: "SPARK-SEA-SUMMER",
    category: "009",
    categoryLabel: "Adventure",
    sparkType: "quick",
    title: "Summer's Open Door",
    shortTitle: "Summer's Open Door",
    teaser: "Adventure doesn't always require a plane ticket.",
    whatHappened:
      "Summer has long been the season of exploration â longer days, open schedules, and the feeling that something unexpected might be waiting just outside routine. Adventure doesn't always require a plane ticket. Adventure does not always begin with certainty. It often begins with movement: one step beyond routine, one question asked, or one willingness to enter unfamiliar territory and learn from what happens. The lasting importance is simple: a change of pace can reset creativity. Adventure sometimes means curiosity in a familiar place seen with fresh eyes.",
    whyItMatters:
      "A change of pace can reset creativity. Adventure sometimes means curiosity in a familiar place seen with fresh eyes. Adventure expands our sense of what is possible because action teaches what imagination alone cannot. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "Where could you explore for twenty minutes today â a new path, a new recipe, a conversation you have been putting off? Take one safe step beyond routine today. Make it small enough to begin and meaningful enough to teach you something. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    // Explicit hero so live expanded card never depends only on topic regex match.
    imageSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Arch_door_and_portal_in_Walled_Garden_at_Goodnestone_Park_Kent_England.jpg/960px-Arch_door_and_portal_in_Walled_Garden_at_Goodnestone_Park_Kent_England.jpg",
    thumbnailAlt:
      "An open garden doorway in warm light — adventure close to home",
    seasons: ["summer"],
    priority: 55,
    tags: ["seasonal", "summer", "adventure"],
  },
  {
    id: "SPARK-SEA-AUTUMN",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Autumn's Gentle Pause",
    shortTitle: "Autumn's Gentle Pause",
    teaser: "Learning season — harvest what you have grown.",
    whatHappened:
      "Autumn invites reflection. Trees release what they no longer need; harvest traditions remind communities to notice what the year produced before rushing into the next chapter. Learning season â harvest what you have grown. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: reflection is not slowing down for its own sake â it helps us carry forward what worked and release what did not.",
    whyItMatters:
      "Reflection is not slowing down for its own sake â it helps us carry forward what worked and release what did not. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What is one thing from this year worth keeping â and one thing you are ready to let go? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    seasons: ["autumn"],
    priority: 55,
    tags: ["seasonal", "autumn", "reflection"],
  },
  {
    id: "SPARK-SEA-WINTER",
    category: "012",
    categoryLabel: "Wonder",
    sparkType: "story",
    title: "Winter's Quiet Inspiration",
    shortTitle: "Winter's Quiet Inspiration",
    teaser: "Traditions and warmth when the world slows down.",
    whatHappened:
      "Winter has always been a season for gathering â firelight, stories, handmade gifts, and rituals that turn cold months into something human and hopeful. Traditions and warmth when the world slows down. Wonder gives us permission to pause before explaining everything away. It restores scale, surprise, and imagination, reminding us that the world still contains more than we have noticed. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: quiet seasons create space for imagination. Not every productive season looks busy from the outside.",
    whyItMatters:
      "Quiet seasons create space for imagination. Not every productive season looks busy from the outside. Wonder can renew energy because it shifts us from rushing past life to actually noticing it. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What tradition â old or new â could make this week feel warmer for you or someone you care about? Spend five quiet minutes noticing something that creates awe, surprise, or delight. Save one sentence about what it changed in your perspective. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    seasons: ["winter"],
    priority: 55,
    tags: ["seasonal", "winter", "inspiration"],
  },

  // — Creativity & ideas (spark-notes-files/SPARK_NOTE_CREATIVITY_AND_IDEAS_SPARK_LIBRARY.md) —
  {
    id: "SPARK-CREAT-001",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    sparkType: "quick",
    title: "The Power of the Bad First Draft",
    shortTitle: "Bad First Draft",
    teaser: "Great ideas rarely begin perfectly.",
    whatHappened:
      "Many creators, writers, and inventors begin with rough versions. The first version is not meant to be the final version. It is meant to create something that can be improved. Great ideas rarely begin perfectly. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. The lasting importance is simple: waiting for perfection prevents many ideas from ever becoming real.",
    whyItMatters:
      "Waiting for perfection prevents many ideas from ever becoming real. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What could you create if the first version was allowed to be imperfect? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["creativity", "perfectionism", "action", "ideas"],
  },
  {
    id: "SPARK-CREAT-002",
    category: "011",
    categoryLabel: "Innovation",
    sparkType: "story",
    title: "The Accidental Invention of Velcro",
    shortTitle: "Velcro Curiosity",
    teaser: "A walk in nature inspired a worldwide invention.",
    whatHappened:
      "Engineer George de Mestral noticed burrs sticking to his clothing and his dog's fur after a walk. Instead of simply removing them, he became curious about how they worked. That curiosity led to the development of Velcro. A walk in nature inspired a worldwide invention. Innovation is rarely a single flash of brilliance. It is more often a chain of observations, experiments, revisions, and connections that gradually turn possibility into something useful. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: innovation often begins by paying attention to ordinary things.",
    whyItMatters:
      "Innovation often begins by paying attention to ordinary things. Innovation grows when people treat imperfect results as information rather than proof that an idea should be abandoned. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What small detail around you might inspire a new idea? Choose one idea and run a tiny experiment. Decide in advance what you want to learn, not only what you hope will succeed. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["innovation", "curiosity", "invention"],
  },
  {
    id: "SPARK-CREAT-003",
    category: "002",
    categoryLabel: "People & Stories",
    sparkType: "story",
    title: "Leonardo da Vinci: The Original Creative Thinker",
    shortTitle: "Leonardo's Curiosity",
    teaser: "An artist who also imagined the future.",
    whatHappened:
      "Leonardo da Vinci explored art, science, engineering, anatomy, and invention. He did not separate creativity from knowledge. He believed curiosity connected everything. An artist who also imagined the future. The story of Leonardo da Vinci: The Original Creative Thinker matters because people are rarely remembered only for what they accomplished. They are remembered for the choices, persistence, perspective, and humanity that shaped what they did. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: creativity grows when different ideas come together.",
    whyItMatters: "Creativity grows when different ideas come together. A life story becomes most valuable when it helps us recognize courage, choices, and possibility in our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What two unrelated ideas could you combine? Choose one quality from this person’s story that you want to practice today. Name one small way it could show up in your own life or work. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["art", "invention", "curiosity", "imagination"],
  },
  {
    id: "SPARK-CREAT-004",
    category: "005",
    categoryLabel: "Curiosity",
    sparkType: "quick",
    title: 'The Power of Asking "What If?"',
    shortTitle: "What If?",
    teaser: "Many breakthroughs begin with one simple question.",
    whatHappened: "Inventors and creators often begin by challenging what already exists. \"What if this worked differently?\" \"What if there was another way?\" Questions create possibilities. Many breakthroughs begin with one simple question. Curiosity changes an ordinary fact into an invitation. Instead of stopping at what happened, it asks what else might be true, what assumptions may be incomplete, and what becomes visible when we look again. The lasting importance is simple: curiosity is the beginning of innovation. Curiosity loosens the grip of assumptions and creates room for better questions. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    whyItMatters: "Curiosity is the beginning of innovation. Curiosity loosens the grip of assumptions and creates room for better questions. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What assumption could you challenge today? Write three questions about something you have been assuming is fixed. Choose the question that opens the most possibility. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["innovation", "imagination", "problem-solving"],
  },
  {
    id: "SPARK-CREAT-005",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    sparkType: "story",
    title: "The Idea Notebook",
    shortTitle: "Idea Notebook",
    teaser: "Great ideas are often captured before they are understood.",
    whatHappened:
      "Many creators keep notebooks filled with unfinished thoughts, questions, sketches, and possibilities. Not every idea becomes something, but collecting ideas creates a resource for the future. Great ideas are often captured before they are understood. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: an idea does not need to be complete before it deserves attention.",
    whyItMatters:
      "An idea does not need to be complete before it deserves attention. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What ideas have you been saving for later? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["ideas", "journaling", "creativity"],
  },
  {
    id: "SPARK-CREAT-006",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "quick",
    title: "The Power of Constraints",
    shortTitle: "Power of Constraints",
    teaser: "Sometimes limits create better ideas.",
    whatHappened:
      "Many creative solutions appear because people have restrictions. Limited time, money, or resources force people to think differently. Sometimes limits create better ideas. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. The lasting importance is simple: constraints can encourage creativity instead of stopping it.",
    whyItMatters:
      "Constraints can encourage creativity instead of stopping it. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What limitation could become an opportunity? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["innovation", "problem-solving", "design"],
  },
  {
    id: "SPARK-CREAT-007",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    sparkType: "story",
    title: "Steal Like an Artist",
    shortTitle: "Steal Like an Artist",
    teaser: "Creative people build by connecting ideas.",
    whatHappened:
      "Artists and innovators often study what came before them. They learn, adapt, combine, and transform ideas into something new. Creative people build by connecting ideas. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: creativity is often about making new connections.",
    whyItMatters: "Creativity is often about making new connections. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What ideas could you combine in a new way? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["learning", "inspiration", "creativity"],
  },
  {
    id: "SPARK-CREAT-008",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    sparkType: "quick",
    title: "The Ten-Minute Idea Challenge",
    shortTitle: "Ten-Minute Ideas",
    teaser: "Small creative moments can create big possibilities.",
    whatHappened:
      "Setting aside a short amount of time to explore ideas removes pressure. The goal is not to create something perfect. The goal is to create movement. Small creative moments can create big possibilities. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. The lasting importance is simple: consistency builds creative confidence.",
    whyItMatters: "Consistency builds creative confidence. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What idea could you explore for just ten minutes? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["action", "ideas", "momentum"],
  },

  // — ADHD-friendly (spark-notes-files/SPARK_NOTE_ADHD_FRIENDLY_SPARKS_LIBRARY.md) —
  {
    id: "SPARK-ADHD-001",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    sparkType: "story",
    title: "Different Thinking Creates Different Solutions",
    shortTitle: "Different Thinking",
    teaser: "Some of the world's best ideas came from people who saw things differently.",
    whatHappened:
      "Many innovations happen because someone notices something others overlook. Different perspectives can reveal connections, possibilities, and solutions that may not be obvious to everyone. Some of the world's best ideas came from people who saw things differently. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: a different approach is not automatically a disadvantage. Sometimes the ability to see patterns and possibilities becomes a strength.",
    whyItMatters:
      "A different approach is not automatically a disadvantage. Sometimes the ability to see patterns and possibilities becomes a strength. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What is something you notice that others may miss? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["adhd", "creativity", "innovation", "strengths"],
  },
  {
    id: "SPARK-ADHD-002",
    category: "003",
    categoryLabel: "Creativity & Inspiration",
    sparkType: "quick",
    title: "The Idea Flood",
    shortTitle: "The Idea Flood",
    teaser: "Having many ideas can be a challenge and a gift.",
    whatHappened:
      "Many creative entrepreneurs experience moments when ideas arrive quickly. The challenge is not always creating ideas â it is capturing, organizing, and choosing which ideas deserve attention. Having many ideas can be a challenge and a gift. Creativity is often described as inspiration, but stories like this show that it is also attention, courage, play, and the willingness to keep shaping an idea before anyone else can fully see it. The lasting importance is simple: ideas are valuable when they are captured and given a place to grow.",
    whyItMatters: "Ideas are valuable when they are captured and given a place to grow. Inspiration becomes meaningful when it gives us permission to make, explore, or express something of our own. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What idea do you want to capture before it disappears? Make a small version, sketch, list, draft, or experiment before judging the idea. Let curiosity lead for ten minutes. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["ideas", "creativity", "entrepreneurship"],
  },
  {
    id: "SPARK-ADHD-003",
    category: "005",
    categoryLabel: "Curiosity",
    sparkType: "quick",
    title: "Curiosity Is a Superpower",
    shortTitle: "Curiosity Superpower",
    teaser: "Questions can lead you toward your next breakthrough.",
    whatHappened:
      "Curious minds often explore topics deeply, make unexpected connections, and discover new possibilities. That curiosity can become a powerful creative advantage. Questions can lead you toward your next breakthrough. Curiosity changes an ordinary fact into an invitation. Instead of stopping at what happened, it asks what else might be true, what assumptions may be incomplete, and what becomes visible when we look again. The lasting importance is simple: many entrepreneurs succeed because they keep asking better questions.",
    whyItMatters: "Many entrepreneurs succeed because they keep asking better questions. Curiosity loosens the grip of assumptions and creates room for better questions. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What are you curious about right now? Write three questions about something you have been assuming is fixed. Choose the question that opens the most possibility. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["curiosity", "learning", "creativity"],
  },
  {
    id: "SPARK-ADHD-004",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "story",
    title: "Follow the Energy",
    shortTitle: "Follow the Energy",
    teaser: "Understanding when you work best can change everything.",
    whatHappened:
      "People do not all have the same energy patterns. Some create best in the morning; others find their best ideas later in the day. Learning your patterns can help you work with yourself instead of against yourself. Understanding when you work best can change everything. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: better self-awareness can reduce unnecessary struggle.",
    whyItMatters: "Better self-awareness can reduce unnecessary struggle. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "When does your best thinking usually happen? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["energy", "motivation", "productivity"],
  },
  {
    id: "SPARK-ADHD-005",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "story",
    title: "Hyperfocus Can Become a Strength",
    shortTitle: "Hyperfocus Strength",
    teaser: "Deep interest can create incredible progress.",
    whatHappened:
      "Many people experience periods where they become deeply absorbed in something meaningful. That intense focus can lead to learning, creativity, and breakthroughs when directed intentionally. Deep interest can create incredible progress. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: understanding your strengths helps you use them more effectively.",
    whyItMatters: "Understanding your strengths helps you use them more effectively. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What topic makes you lose track of time? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["focus", "creativity", "strengths"],
  },
  {
    id: "SPARK-ADHD-006",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "quick",
    title: "Progress Over Perfection",
    shortTitle: "Progress Over Perfection",
    teaser: "Finished and improving beats waiting forever.",
    whatHappened:
      "Many creative people struggle because they want the final version before creating the first version. Small completed steps create momentum. Finished and improving beats waiting forever. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. The lasting importance is simple: action creates information that thinking alone cannot provide.",
    whyItMatters: "Action creates information that thinking alone cannot provide. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What could you finish imperfectly today? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["perfectionism", "action", "momentum"],
  },
  {
    id: "SPARK-ADHD-007",
    category: "007",
    categoryLabel: "Strategy",
    sparkType: "story",
    title: "Your Brain Needs the Right Environment",
    shortTitle: "Right Environment",
    teaser: "Sometimes changing the surroundings changes the results.",
    whatHappened:
      "Different environments affect attention, creativity, and energy. Small adjustments â reducing distractions, changing locations, or adding helpful reminders â can make tasks easier. Sometimes changing the surroundings changes the results. Strategy is not simply making a plan. It is noticing what matters most, choosing where to place effort, learning from evidence, and being willing to adjust before more time or energy is spent. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: the environment can support the brain instead of fighting it.",
    whyItMatters: "The environment can support the brain instead of fighting it. A strong strategy reduces noise by helping us choose what deserves attention now and what can wait. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication: "What small change could make something easier? Identify the decision underneath your current activity. Choose the one next move that would create the clearest useful information. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["environment", "focus", "productivity"],
  },
  {
    id: "SPARK-ADHD-008",
    category: "008",
    categoryLabel: "Reflection",
    sparkType: "story",
    title: "Celebrate Evidence of Progress",
    shortTitle: "Celebrate Progress",
    teaser: "Your accomplishments deserve to be remembered.",
    whatHappened:
      "Many people move quickly to the next challenge and forget what they have already achieved. Keeping evidence of wins creates a reminder of capability. Your accomplishments deserve to be remembered. Reflection turns experience into wisdom. Without reflection, a moment passes; with reflection, it can reveal a pattern, clarify a value, or help us decide what to carry forward. What makes the moment especially useful is the pattern beneath it: attention came before understanding, and understanding came before change. That pattern is available in everyday life too, whenever we resist the urge to dismiss something simply because it does not yet fit the plan. The lasting importance is simple: past success can become fuel for future confidence.",
    whyItMatters: "Past success can become fuel for future confidence. Reflection is not dwelling on the past; it is using experience to make the next choice with greater awareness. This matters because the lesson is transferable. It can help someone recognize a pattern, make a more thoughtful choice, or see possibility where they previously saw only a problem.",
    sparkApplication:
      "What is one thing you have accomplished that you should celebrate? Write one sentence about what this brings up for you, one lesson you want to remember, and one thing you are ready to do differently. Afterward, save a short note about what you noticed, what surprised you, or what you may want to revisit.",
    tags: ["confidence", "achievements", "encouragement"],
  },
];
