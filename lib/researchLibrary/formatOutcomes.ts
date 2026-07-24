import {
  buildDynamicCreationBlueprint,
  buildProjectProposalFromPackage,
  generateCreationPackage,
  runUniversalRequestToOutcome,
  understandUniversalRequest,
} from "@/lib/universalRequestOutcome";
import type {
  ResearchCollectionRecord,
  ResearchOutcomeArtifact,
  ResearchUseOption,
} from "./types";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function findingsAsSections(collection: ResearchCollectionRecord) {
  return collection.findings
    .filter((f) => !collection.excludedFindingIds.includes(f.id))
    .slice(0, 12)
    .map((f) => ({ title: f.title, body: f.content }));
}

/**
 * Build a substantive result from a Research Collection + chosen use option.
 * Reuses Universal Request-to-Outcome — does not invent a second creation engine.
 */
export function buildResearchOutcome(input: {
  collection: ResearchCollectionRecord;
  option: ResearchUseOption;
  freeformRequest?: string | null;
}): ResearchOutcomeArtifact {
  const request =
    input.freeformRequest?.trim() ||
    `${input.option.label} from research about ${input.collection.topic}`;

  if (input.option.outcomeType === "continue") {
    return {
      id: newId("out"),
      kind: "summary",
      title: "Continue researching",
      content: input.collection.summary,
      sections: findingsAsSections(input.collection),
      researchCollectionId: input.collection.id,
      destinationHint: "stay",
      createdAt: new Date().toISOString(),
    };
  }

  if (input.option.outcomeType === "list") {
    const items = input.collection.findings
      .filter((f) =>
        ["recommendation", "fact", "theme", "option"].includes(f.kind),
      )
      .slice(0, 8);
    const ranked = items.length
      ? items
      : input.collection.findings.slice(0, 6);
    return {
      id: newId("out"),
      kind: "list",
      title: `Prioritized list: ${input.collection.topic}`,
      content: ranked
        .map((f, i) => `${i + 1}. ${f.title} — ${f.content}`)
        .join("\n"),
      sections: ranked.map((f, i) => ({
        title: `${i + 1}. ${f.title}`,
        body: `${f.content}\n\nWhy it matters now: this supports a clearer next move on ${input.collection.topic}.`,
      })),
      researchCollectionId: input.collection.id,
      destinationHint: "create",
      createdAt: new Date().toISOString(),
    };
  }

  if (input.option.outcomeType === "form") {
    return {
      id: newId("out"),
      kind: "form",
      title: `Evaluation form: ${input.collection.topic}`,
      content: "Structured form generated from research findings.",
      sections: [
        {
          title: "Purpose",
          body: `Use this form to evaluate options related to ${input.collection.topic}.`,
        },
        {
          title: "Instructions",
          body: "Complete each section. Required fields help you compare candidates fairly.",
        },
        {
          title: "Candidate information",
          body: "Fields: Full name (text, required) · Background / expertise (textarea, required) · Relevant experience (textarea, required)",
        },
        {
          title: "Fit criteria",
          body: (
            input.collection.recommendations.slice(0, 4).join(" · ") ||
            input.collection.themes.slice(0, 4).join(" · ") ||
            "Clarity of fit, available time, complementary strengths"
          )
            .split(" · ")
            .map((c, i) => `Criterion ${i + 1}: ${c} (rating 1–5, required)`)
            .join("\n"),
        },
        {
          title: "Risks and cautions",
          body:
            [...input.collection.risks, ...input.collection.cautions]
              .slice(0, 4)
              .map((r) => `Watch for: ${r}`)
              .join("\n") || "Note any concerns before recommending.",
        },
        {
          title: "Recommendation",
          body: "Overall recommendation (select: Strong yes / Maybe / Not now) · Notes (textarea) · Reviewer name (text, required)",
        },
      ],
      researchCollectionId: input.collection.id,
      destinationHint: "create",
      createdAt: new Date().toISOString(),
    };
  }

  if (input.option.destination === "projects" || input.option.outcomeType === "project") {
    const understanding = understandUniversalRequest(
      `Turn research about ${input.collection.topic} into a project`,
    );
    const blueprint = buildDynamicCreationBlueprint(understanding);
    const pkg = generateCreationPackage({
      understanding,
      blueprint,
      researchCollection: null,
      sourceExperience: "research_library",
    });
    const proposal = buildProjectProposalFromPackage(understanding, pkg);
    const phaseSections =
      proposal.phases.length > 0
        ? proposal.phases.map((p, i) => ({
            title: `Phase ${i + 1}: ${p.name}`,
            body: [
              p.milestones.length
                ? `Milestones: ${p.milestones.join("; ")}`
                : null,
              p.tasks.length ? `Tasks: ${p.tasks.join("; ")}` : null,
            ]
              .filter(Boolean)
              .join("\n"),
          }))
        : findingsAsSections(input.collection).map((s, i) => ({
            title: `Phase ${i + 1}: ${s.title}`,
            body: s.body,
          }));
    return {
      id: newId("out"),
      kind: "project_proposal",
      title: proposal.title || `Project proposal: ${input.collection.topic}`,
      content: [
        "Project Proposal Review — nothing is created until you approve.",
        "",
        ...phaseSections.map((s) => `${s.title}\n${s.body}`),
        "",
        proposal.dependencies.length
          ? `Dependencies: ${proposal.dependencies.join("; ")}`
          : null,
        proposal.risks.length ? `Risks: ${proposal.risks.join("; ")}` : null,
        "Dependencies and risks should be reviewed before dates are set.",
      ]
        .filter(Boolean)
        .join("\n"),
      sections: phaseSections,
      researchCollectionId: input.collection.id,
      destinationHint: "projects",
      createdAt: new Date().toISOString(),
    };
  }

  if (
    input.option.destination === "strategic_planning" ||
    input.option.outcomeType === "strategy"
  ) {
    return {
      id: newId("out"),
      kind: "strategy_proposal",
      title: `Strategy proposal: ${input.collection.topic}`,
      content: "Proposed strategy from research — not approved until you confirm.",
      sections: [
        {
          title: "Strategic objective",
          body: `Use what we learned about ${input.collection.topic} to make a clearer directional choice.`,
        },
        {
          title: "Evidence",
          body:
            input.collection.facts.slice(0, 5).join("\n") ||
            input.collection.summary ||
            "See Research Collection findings.",
        },
        {
          title: "Options",
          body:
            input.collection.options.slice(0, 5).join("\n") ||
            "Options can be refined in Strategic Planning.",
        },
        {
          title: "Tradeoffs and risks",
          body: [...input.collection.risks, ...input.collection.cautions]
            .slice(0, 6)
            .join("\n") || "Risks remain open for review.",
        },
        {
          title: "Possible initiatives",
          body:
            input.collection.recommendations.slice(0, 5).join("\n") ||
            "Initiatives stay proposed until confirmed.",
        },
        {
          title: "Unresolved questions",
          body:
            input.collection.questions.slice(0, 5).join("\n") ||
            "None recorded yet.",
        },
      ],
      researchCollectionId: input.collection.id,
      destinationHint: "strategic_planning",
      createdAt: new Date().toISOString(),
    };
  }

  if (input.option.destination === "visual_thinking") {
    return {
      id: newId("out"),
      kind: "creation_package",
      title: `Visual handoff: ${input.collection.topic}`,
      content: JSON.stringify({
        researchCollectionId: input.collection.id,
        topic: input.collection.topic,
        summary: input.collection.summary,
        findings: input.collection.findings.map((f) => ({
          id: f.id,
          title: f.title,
          content: f.content,
          kind: f.kind,
        })),
        relationships: input.collection.themes,
      }),
      sections: findingsAsSections(input.collection),
      researchCollectionId: input.collection.id,
      destinationHint: "visual_thinking",
      createdAt: new Date().toISOString(),
    };
  }

  if (input.option.destination === "business_estate") {
    return {
      id: newId("out"),
      kind: "summary",
      title: `Business Estate proposal: ${input.collection.topic}`,
      content:
        "Proposed Business Estate updates — nothing authoritative changes without approval.",
      sections: [
        {
          title: "Proposed note",
          body: input.collection.summary || input.collection.topic,
        },
        {
          title: "Possible updates",
          body: "Propose an Audience Update · Propose an Offer Update · Add a Market Finding · Add a Business Note · Add a Draft Framework",
        },
        {
          title: "Approval boundary",
          body: "Review in My Business Estate before any record changes.",
        },
      ],
      researchCollectionId: input.collection.id,
      destinationHint: "business_estate",
      createdAt: new Date().toISOString(),
    };
  }

  // Default: Create handoff via universal pipeline
  const result = runUniversalRequestToOutcome(request, {
    sourceExperience: "research_library",
  });
  const pkg = result.creationPackage;
  return {
    id: newId("out"),
    kind:
      input.option.outcomeType === "guide"
        ? "guide"
        : input.option.outcomeType === "comparison"
          ? "comparison"
          : "document",
    title: pkg?.title || input.option.label,
    content:
      pkg?.sections?.map((s) => `${s.title}\n${s.content}`).join("\n\n") ||
      input.collection.summary,
    sections:
      pkg?.sections?.map((s) => ({ title: s.title, body: s.content })) ||
      findingsAsSections(input.collection),
    researchCollectionId: input.collection.id,
    destinationHint: "create",
    createdAt: new Date().toISOString(),
  };
}

export function validateResearchOutcome(
  artifact: ResearchOutcomeArtifact,
): { passed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!artifact.title.trim()) reasons.push("Missing title");
  if (!artifact.sections.length && !artifact.content.trim()) {
    reasons.push("No substantive content");
  }
  if (artifact.kind === "form") {
    const joined = artifact.sections.map((s) => s.body).join(" ");
    if (!/field|rating|select|textarea/i.test(joined)) {
      reasons.push("Form lacks fields/structure");
    }
  }
  if (artifact.kind === "list" && artifact.sections.length < 2) {
    reasons.push("List needs organized items");
  }
  if (
    artifact.kind === "project_proposal" &&
    !/phase|task|proposal/i.test(artifact.content + artifact.title)
  ) {
    reasons.push("Project proposal lacks structure");
  }
  return { passed: reasons.length === 0, reasons };
}
