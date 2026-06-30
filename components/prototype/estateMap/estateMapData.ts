import type { EstateLocation } from "./types";

export const CONSERVATORY_BG = "/backgrounds/clear-my-mind-background.png";

export const ESTATE_LOCATIONS: EstateLocation[] = [
  { id: "welcome-house", name: "Welcome House", tagline: "Arrival & Belonging", region: "center", x: 50, y: 48 },
  { id: "conservatory", name: "The Conservatory", tagline: "Clarity & Possibility", region: "east", x: 72, y: 42, youAreHere: true },
  { id: "pond", name: "Pond & Waterfall", tagline: "Reflection & Flow", region: "east", x: 78, y: 52 },
  { id: "reflection-garden", name: "Reflection Garden", tagline: "Quiet Insight", region: "east", x: 68, y: 58 },
  { id: "apple-orchard", name: "The Apple Orchard", tagline: "Fresh Ideas & Possibility", region: "south", x: 52, y: 72 },
  { id: "butterfly-garden", name: "Butterfly Garden", tagline: "Gentle Wonder", region: "south", x: 62, y: 68 },
  { id: "garden-pavilion", name: "Garden Pavilion", tagline: "Gathering & Rest", region: "south", x: 42, y: 66 },
  { id: "stables", name: "The Stables", tagline: "Grounding & Perspective", region: "southwest", x: 22, y: 62 },
  { id: "meadow-path", name: "Meadow Path", tagline: "Slow Momentum", region: "southwest", x: 28, y: 72 },
  { id: "coffee-house", name: "Coffee House", tagline: "Warm Focus", region: "west", x: 18, y: 44 },
  { id: "music-room", name: "Music Room", tagline: "Rhythm & Expression", region: "west", x: 14, y: 54 },
  { id: "art-studio", name: "Art Studio", tagline: "Creative Confidence", region: "west", x: 24, y: 36 },
  { id: "library", name: "The Library", tagline: "Wisdom & Learning", region: "north", x: 48, y: 22 },
  { id: "spark-card-library", name: "Spark Card Library", tagline: "Collected Insight", region: "north", x: 58, y: 18 },
  { id: "guild-hall", name: "Guild Hall", tagline: "Mastery & Craft", region: "north", x: 38, y: 16 },
  { id: "observatory", name: "The Observatory", tagline: "Future Thinking", region: "northeast", x: 72, y: 18 },
  { id: "walking-trail", name: "Walking Trail", tagline: "Perspective & Pace", region: "northeast", x: 82, y: 28 },
  { id: "lookout", name: "Lookout Point", tagline: "Wide View", region: "northeast", x: 88, y: 14 },
  { id: "mountain-cabin", name: "Mountain Cabin", tagline: "Restoration", region: "quiet", x: 12, y: 22 },
  { id: "fire-circle", name: "Fire Circle", tagline: "Warm Recovery", region: "quiet", x: 8, y: 32 },
  { id: "peaceful-bench", name: "Peaceful Pond Bench", tagline: "Stillness", region: "quiet", x: 18, y: 28 },
];

export const REGION_LABELS: { id: string; label: string; x: number; y: number }[] = [
  { id: "east", label: "Glass Gardens", x: 74, y: 34 },
  { id: "south", label: "Nature", x: 54, y: 78 },
  { id: "southwest", label: "Stable Grounds", x: 22, y: 78 },
  { id: "west", label: "Creative Energy", x: 12, y: 48 },
  { id: "north", label: "Learning", x: 50, y: 10 },
  { id: "northeast", label: "Future Thinking", x: 80, y: 8 },
  { id: "quiet", label: "Restoration", x: 8, y: 18 },
];
