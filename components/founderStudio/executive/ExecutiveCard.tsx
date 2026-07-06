import type { FounderLabelTone } from "@/lib/founder/types";

import { FounderCard } from "../FounderCard";
import { toneDisplayLabel } from "./toneDisplayLabel";

type ExecutiveCardProps = {
  title: string;
  summary: string;
  tone?: FounderLabelTone;
  meta?: string;
};

export function ExecutiveCard(props: ExecutiveCardProps) {
  return (
    <FounderCard
      {...props}
      toneLabel={toneDisplayLabel(props.tone)}
    />
  );
}

export function InsightCard(props: ExecutiveCardProps) {
  return <ExecutiveCard {...props} tone={props.tone ?? "insight"} />;
}

export function RecommendationCard(props: ExecutiveCardProps) {
  return <ExecutiveCard {...props} />;
}
