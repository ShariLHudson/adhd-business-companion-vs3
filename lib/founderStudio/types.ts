export type FounderLabelTone =
  | "critical"
  | "opportunity"
  | "quick-win"
  | "on-deck"
  | "insight"
  | "revenue"
  | "ignore";

export type FounderGlanceItem = {
  id: string;
  label: string;
  tone: FounderLabelTone;
  summary: string;
};

export type FounderGlanceSection = {
  id: string;
  title: string;
  items: FounderGlanceItem[];
};

export type FounderPriority = {
  id: string;
  title: string;
  note?: string;
};

export type FounderSignal = {
  id: string;
  label: string;
  detail: string;
};

export type FounderTrend = {
  id: string;
  label: string;
  direction: "up" | "down" | "watch";
  note: string;
};

export type FounderRoomId =
  | "morning"
  | "strategy"
  | "innovation"
  | "spark-command"
  | "opportunity-vault"
  | "knowledge-library"
  | "reflection"
  | "creation-studio"
  | "automation-studio"
  | "team-hub";

export type FounderRoomMeta = {
  id: FounderRoomId;
  href: string;
  title: string;
  question: string;
  purpose: string;
  accent: "teal" | "aqua" | "gold" | "bronze" | "purple";
};

export type FounderRoomCard = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
};

export type TeamHubSection = {
  id: string;
  title: string;
  items: { id: string; title: string; meta?: string }[];
};
