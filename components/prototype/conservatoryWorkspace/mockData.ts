import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";

export const CONSERVATORY_BACKGROUND = CLEAR_MY_MIND_CONSERVATORY_BG;

export const ARRIVAL_LINES = [
  "Good morning, Shari.",
  "I've prepared your Conservatory because you've been doing your clearest strategic thinking here.",
  "Your workshop marketing plan is waiting.",
] as const;

export const COMPANION_WHISPER =
  "I have one thought before we continue — lead with the transformation your member walks away with, not the features you'll cover.";

export const DOCUMENT_TITLE = "Workshop Marketing Plan";

export const DOCUMENT_PREPARED = [
  {
    id: "audience",
    heading: "Who this is for",
    body: "ADHD entrepreneurs who feel overwhelmed trying to organize and grow their business.",
  },
  {
    id: "promise",
    heading: "The promise",
    body: "A calmer, clearer way to decide what to work on next — and leave with one action plan they can actually follow.",
  },
] as const;

export const SPARK_QUESTION =
  "What would someone be able to do after your workshop that they cannot do confidently today?";

export const CLOSING_LINES = [
  "Beautiful work.",
  "I've updated your Workshop Launch Business Asset.",
] as const;

export const FOLIO_SECTIONS = {
  businessBrain: {
    title: "Business Brain™",
    items: ["Visual Spark Studios™", "ADHD Business Ecosystem™", "Warm, clear, encouraging voice"],
  },
  clientAvatar: {
    title: "Client Avatar™",
    items: ["ADHD entrepreneur", "Easily overwhelmed", "Wants clarity and momentum"],
  },
  brandVoice: {
    title: "Brand Voice™",
    items: ["Warm", "Clear", "Encouraging", "Never clinical"],
  },
  assets: {
    title: "Related Business Assets™",
    items: ["Workshop Launch", "7-Day Email Sequence", "Founder Invitation"],
  },
  sparkCard: {
    title: "Spark Card™",
    body: "Positioning: Make the promise clear before creating the content.",
  },
  decision: {
    title: "Previous Decision™",
    body: "Lead with transformation, not features.",
  },
} as const;
