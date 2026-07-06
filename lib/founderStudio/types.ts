/** UI routing types — domain types live in @/lib/founder/types */
export type {
  FounderLabelTone,
  FounderGlanceItem,
  FounderGlanceSection,
  FounderPriority,
  FounderCustomerSignal,
  FounderTrend,
  FounderRoomCard,
  TeamHubSection,
} from "@/lib/founder/types";

/** @deprecated Use FounderCustomerSignal */
export type FounderSignal = import("@/lib/founder/types").FounderCustomerSignal;

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
