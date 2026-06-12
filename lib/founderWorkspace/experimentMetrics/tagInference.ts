import type { FounderTrackedExperiment } from "@/lib/founderWorkspace/tracking/types";
import type { FounderWorkspaceItem } from "@/lib/founderWorkspace/types";

const KEYWORD_TAGS: { re: RegExp; tag: string }[] = [
  { re: /\bonboard/i, tag: "onboarding" },
  { re: /\b(ux|ui|design|layout)\b/i, tag: "ux" },
  { re: /\b(api|token|endpoint)\b/i, tag: "api" },
  { re: /\b(perf|speed|latency)\b/i, tag: "performance" },
  { re: /\b(convert|funnel|sales)\b/i, tag: "conversion" },
  { re: /\b(email|newsletter)\b/i, tag: "email" },
  { re: /\b(google|export|doc)\b/i, tag: "google_docs" },
  { re: /\b(focus|adhd|attention)\b/i, tag: "focus" },
  { re: /\b(template|snippet)\b/i, tag: "content" },
];

export function inferExperimentTags(input: {
  title: string;
  hypothesis?: string;
  testPlan?: string;
  relatedProjectTitle?: string;
  explicitTags?: string[];
}): string[] {
  const text = [
    input.title,
    input.hypothesis ?? "",
    input.testPlan ?? "",
    input.relatedProjectTitle ?? "",
  ].join(" ");

  const tags = new Set<string>(input.explicitTags ?? []);
  for (const { re, tag } of KEYWORD_TAGS) {
    if (re.test(text)) tags.add(tag);
  }
  if (input.relatedProjectTitle) {
    tags.add(
      input.relatedProjectTitle
        .toLowerCase()
        .replace(/\s+/g, "_")
        .slice(0, 24),
    );
  }
  return [...tags].slice(0, 8);
}

export function inferTagsFromTracked(exp: FounderTrackedExperiment): string[] {
  return inferExperimentTags({
    title: exp.title,
    hypothesis: exp.hypothesis,
    testPlan: exp.testPlan,
    relatedProjectTitle: exp.relatedProjectTitle,
    explicitTags: (exp as FounderTrackedExperiment & { tags?: string[] }).tags,
  });
}

export function inferTagsFromWorkspaceItem(item: FounderWorkspaceItem): string[] {
  return inferExperimentTags({
    title: item.title,
    hypothesis: item.description,
  });
}
