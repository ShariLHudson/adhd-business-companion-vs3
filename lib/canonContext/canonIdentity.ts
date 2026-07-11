import type {
  CanonCharacterFacts,
  CanonEstateFacts,
  CanonShariFacts,
} from "./types";

/** Authoritative Spark Estate identity — overrides model assumptions. */
export const SPARK_ESTATE_CANON_FACTS: CanonEstateFacts = {
  nature:
    "Spark Estate is a fictional estate — an immersive story world, not a physical property.",
  purpose:
    "Spark Estate exists to help people build meaningful lives and meaningful businesses while feeling less alone.",
  location:
    "Within the Spark Estate story world, the estate is set in Iowa.",
  inspiration:
    "Inspired by Shari's interests, experiences, creativity, and vision.",
  role: "A symbolic home for Companion Intelligence.",
  isRealPlace: false,
  identityAnswer:
    "Spark Estate™ is a fictional country estate — an immersive story world and the symbolic home of Companion Intelligence. It is not a physical property you can visit. Within the story world it is set in Iowa, and it was imagined by Shari Hudson as a place where members feel welcomed home rather than navigating software.",
  purposeAnswer:
    "Spark Estate exists to help people build meaningful lives and meaningful businesses while feeling less alone. It is designed for clarity, confidence, growth, peace, and impact — not to maximize productivity for its own sake.",
  realPlaceAnswer:
    "Spark Estate is a fictional estate created as the immersive home of Companion Intelligence. It is inspired by real things Shari loves, but it is not an actual physical location.",
  locationAnswer:
    "Spark Estate exists in the Spark Estate story world as a fictional estate in Iowa.",
  creatorAnswer:
    "Shari Hudson created Spark Estate as part of Visual Spark Studios.",
  fictionVsReality: [
    "Fictional: Spark Estate as a physical country estate — it is an immersive story world.",
    "Fictional: The Iowa estate setting — story-world geography, not a real address.",
    "Real: Shari Hudson is the creator and founder behind Visual Spark Studios, Spark Estate, and Companion Intelligence.",
    "Real: Kinsey is Shari's white Lhasa Poo in real life and appears in the Estate story.",
    "Inspired by real life: Rooms, objects, and seasons grow from Shari's interests, experiences, creativity, and vision — not a literal map of one property.",
  ],
};

export const KINSEY_CANON_FACTS: CanonCharacterFacts = {
  name: "Kinsey",
  species: "white Lhasa Poo",
  relationship: "Shari's real dog and a beloved companion connected to Spark Estate",
  traits: [
    "Friendly and welcoming",
    "Loves popcorn and ice",
    "Loves walks",
    "Pulls on her leash",
    "Knows when she is heading home and slows down",
  ],
  pictureAnswer:
    "That is Kinsey. She is Shari's white Lhasa Poo — a real dog and a beloved part of Spark Estate. She is friendly and welcoming, loves popcorn and ice, loves walks, and has her own gentle habits at home.",
  identifyAnswer:
    "Kinsey is Shari's white Lhasa Poo — a real dog and a beloved companion in Spark Estate. She is friendly and welcoming, loves popcorn and ice, loves walks, and has her own gentle habits at home.",
};

export const SHARI_HUDSON_CANON_FACTS: CanonShariFacts = {
  name: "Shari Hudson",
  roles: [
    "Creator and founder of Visual Spark Studios",
    "Creator of Spark Estate",
    "Builder of Companion Intelligence",
  ],
  inspirationRole:
    "The inspiration behind the Spark Estate concept — her interests, experiences, creativity, and vision.",
  identifyAnswer:
    "Shari Hudson is the creator and founder of Visual Spark Studios. She created Spark Estate™ and Companion Intelligence. The Estate grows from her interests, experiences, creativity, and vision — a symbolic home where members feel welcomed rather than directed.",
};

export const ESTATE_PHILOSOPHY_CANON = [
  "Spark Estate is not a place you use — it is a place where you are welcomed home.",
  "The relationship is the product; technology exists to support that experience.",
  "Canon facts and story experience can coexist — never confuse a fictional estate with a real address.",
  "Welcome members into the world warmly without claiming Spark Estate is a physical place.",
  "Use canon for identity questions; use story voice for invitations to explore.",
  "Conversation comes first — places before features.",
];

export const ESTATE_HISTORY_CANON = [
  "Spark Estate was imagined as a lasting symbolic home for members and Companion Intelligence.",
  "Rooms and environments grow from Shari's creative vision and member care.",
];
