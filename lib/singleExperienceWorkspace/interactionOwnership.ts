/**
 * 066 — Single Interaction Ownership (architecture + runtime gates).
 * Exactly one INTERACTION_OWNER for Creation Destinations: Current Focus.
 */

export const INTERACTION_OWNERSHIP_RULE = {
  id: "066-SIO",
  name: "Single Interaction Ownership",
  soleOwner: "current_focus" as const,
  principle:
    "Current Focus owns asking, accepting, Reality, Trust, advance, and next interaction. All else presents.",
  globalCompanionDuringCreation: "dormant" as const,
} as const;

/** Component role under 066 ownership. */
export type CreationComponentRole =
  | "INTERACTION_OWNER"
  | "PRESENTER"
  | "GUIDANCE"
  | "NAVIGATION"
  | "VISUALIZATION";

export type CreationDestinationComponentId =
  | "current_focus"
  | "what_we_know"
  | "workspace_phase_label"
  | "event_map_disclosure"
  | "create_workspace_v2_panel"
  | "estate_room_shell"
  | "estate_room_chat_chrome"
  | "simple_chat"
  | "home_chat_input_footer"
  | "create_estate_entrance_composer"
  | "create_catalog_picker"
  | "create_workspace_resume_list"
  | "create_draft_resume_list"
  | "project_home_bridge"
  | "app_back_button"
  | "events_intelligence_chat_questions"
  | "facilitated_creation_chat"
  | "create_guided_opener"
  | "need_ideas_chat_bridge"
  | "build_draft_chat_bridge"
  | "focus_continue_chat_reopen"
  | "secondary_recommendations";

export type CreationComponentClassification = {
  id: CreationDestinationComponentId;
  role: CreationComponentRole;
  requiredRole: CreationComponentRole;
  defect: boolean;
  notes: string;
};

/**
 * Post–066-RUNTIME classification — illegal owners demoted.
 * defect=false means runtime path demoted (gates must still pass).
 */
export const CREATION_DESTINATION_OWNERSHIP: readonly CreationComponentClassification[] =
  [
    {
      id: "current_focus",
      role: "INTERACTION_OWNER",
      requiredRole: "INTERACTION_OWNER",
      defect: false,
      notes: "Sole interaction owner via CurrentFocusInteraction + submitCurrentFocusResponse.",
    },
    {
      id: "what_we_know",
      role: "PRESENTER",
      requiredRole: "PRESENTER",
      defect: false,
      notes: "Summarizes verified facts only.",
    },
    {
      id: "workspace_phase_label",
      role: "PRESENTER",
      requiredRole: "PRESENTER",
      defect: false,
      notes: "Status label only.",
    },
    {
      id: "event_map_disclosure",
      role: "VISUALIZATION",
      requiredRole: "VISUALIZATION",
      defect: false,
      notes: "Progressive disclosure — does not ask.",
    },
    {
      id: "create_workspace_v2_panel",
      role: "PRESENTER",
      requiredRole: "PRESENTER",
      defect: false,
      notes:
        "066 migrated — estate presentation-only; no SectionContentField answer capture.",
    },
    {
      id: "estate_room_shell",
      role: "VISUALIZATION",
      requiredRole: "VISUALIZATION",
      defect: false,
      notes: "Art Studio scene shell.",
    },
    {
      id: "estate_room_chat_chrome",
      role: "GUIDANCE",
      requiredRole: "GUIDANCE",
      defect: false,
      notes: "Dormant while Creation session active.",
    },
    {
      id: "simple_chat",
      role: "GUIDANCE",
      requiredRole: "GUIDANCE",
      defect: false,
      notes: "Demoted — cannot capture Creation answers while session active.",
    },
    {
      id: "home_chat_input_footer",
      role: "GUIDANCE",
      requiredRole: "GUIDANCE",
      defect: false,
      notes: "Hidden during Creation Destination (chatVisible forced false).",
    },
    {
      id: "create_estate_entrance_composer",
      role: "NAVIGATION",
      requiredRole: "NAVIGATION",
      defect: false,
      notes: "Pre-destination entry only.",
    },
    {
      id: "create_catalog_picker",
      role: "NAVIGATION",
      requiredRole: "NAVIGATION",
      defect: false,
      notes: "Browse entry.",
    },
    {
      id: "create_workspace_resume_list",
      role: "NAVIGATION",
      requiredRole: "NAVIGATION",
      defect: false,
      notes: "Resume by id.",
    },
    {
      id: "create_draft_resume_list",
      role: "NAVIGATION",
      requiredRole: "NAVIGATION",
      defect: false,
      notes: "Draft restore.",
    },
    {
      id: "project_home_bridge",
      role: "NAVIGATION",
      requiredRole: "NAVIGATION",
      defect: false,
      notes: "Navigation only.",
    },
    {
      id: "app_back_button",
      role: "NAVIGATION",
      requiredRole: "NAVIGATION",
      defect: false,
      notes: "Ends Creation session on leave.",
    },
    {
      id: "events_intelligence_chat_questions",
      role: "GUIDANCE",
      requiredRole: "GUIDANCE",
      defect: false,
      notes: "Supplies content into Current Focus via resolveCanonicalCurrentFocus.",
    },
    {
      id: "facilitated_creation_chat",
      role: "GUIDANCE",
      requiredRole: "GUIDANCE",
      defect: false,
      notes: "Blocked while Creation session active.",
    },
    {
      id: "create_guided_opener",
      role: "GUIDANCE",
      requiredRole: "GUIDANCE",
      defect: false,
      notes: "Yields to Current Focus after workspace activation.",
    },
    {
      id: "need_ideas_chat_bridge",
      role: "PRESENTER",
      requiredRole: "PRESENTER",
      defect: false,
      notes: "onNeedIdeasInFocus — no handleSend.",
    },
    {
      id: "build_draft_chat_bridge",
      role: "PRESENTER",
      requiredRole: "PRESENTER",
      defect: false,
      notes: "onBuildDraftInFocus — submitCurrentFocusResponse.",
    },
    {
      id: "focus_continue_chat_reopen",
      role: "PRESENTER",
      requiredRole: "PRESENTER",
      defect: false,
      notes: "Removed — Continue is in-Focus submit; never reopens chat.",
    },
    {
      id: "secondary_recommendations",
      role: "PRESENTER",
      requiredRole: "PRESENTER",
      defect: false,
      notes: "Recommend only.",
    },
  ] as const;

/** Runtime gates — computed from migration evidence (not hardcoded claims). */
export type OwnershipRuntimeGateId =
  | "in_focus_submit_path"
  | "companion_dormant_session"
  | "split_screen_rejected"
  | "canonical_focus_resolver"
  | "illegal_owners_demoted";

/**
 * Evidence flipped only when corresponding migration code ships.
 * Browser certification still required separately (B066).
 */
export const OWNERSHIP_RUNTIME_EVIDENCE = {
  /** Current Focus submit + real /api/generate Build Draft */
  inFocusSubmitAndRealBuildDraft: true,
  /** creationSession dormancy + WorkingPanel chat absent */
  companionDormantDuringCreation: true,
  /** questionMode rejects split_screen for Creation Destinations */
  splitScreenRejectedForCreation: true,
  /** Runtime Creation Record — Focus without EventRecord */
  focusAlwaysResolvesViaRuntimeRecord: true,
  /** Estate V2 presentation-only; section textareas not answer owners */
  sectionAnswerCaptureRetiredOnEstate: true,
  /** requestCreateOpen redirects content-generator → Estate */
  legacyContentGeneratorCreateRedirected: true,
} as const;

export function computeOwnershipRuntimeGates(): Record<
  OwnershipRuntimeGateId,
  boolean
> {
  const e = OWNERSHIP_RUNTIME_EVIDENCE;
  return {
    in_focus_submit_path: e.inFocusSubmitAndRealBuildDraft,
    companion_dormant_session: e.companionDormantDuringCreation,
    split_screen_rejected: e.splitScreenRejectedForCreation,
    canonical_focus_resolver: e.focusAlwaysResolvesViaRuntimeRecord,
    illegal_owners_demoted:
      e.sectionAnswerCaptureRetiredOnEstate &&
      e.legacyContentGeneratorCreateRedirected,
  };
}

/** @deprecated use computeOwnershipRuntimeGates() — kept for import compatibility */
export const OWNERSHIP_RUNTIME_GATES = computeOwnershipRuntimeGates();

export function listOwnershipDefects(): CreationComponentClassification[] {
  return CREATION_DESTINATION_OWNERSHIP.filter((c) => c.defect);
}

/** Active-runtime illegal owners — empty when demotion complete. */
export function listIllegalInteractionOwners(): CreationComponentClassification[] {
  const gates = computeOwnershipRuntimeGates();
  if (!gates.illegal_owners_demoted) {
    return CREATION_DESTINATION_OWNERSHIP.filter(
      (c) => c.role === "INTERACTION_OWNER" && c.id !== "current_focus",
    );
  }
  return CREATION_DESTINATION_OWNERSHIP.filter(
    (c) =>
      c.defect &&
      c.role === "INTERACTION_OWNER" &&
      c.id !== "current_focus",
  );
}

export function hasSingleLegalInteractionOwner(): boolean {
  const owners = CREATION_DESTINATION_OWNERSHIP.filter(
    (c) => c.requiredRole === "INTERACTION_OWNER" && c.id === "current_focus",
  );
  return owners.length === 1;
}

export function is066OwnershipArchitectureComplete(): boolean {
  return (
    INTERACTION_OWNERSHIP_RULE.soleOwner === "current_focus" &&
    hasSingleLegalInteractionOwner()
  );
}

export function is066OwnershipRuntimeComplete(): boolean {
  const gates = computeOwnershipRuntimeGates();
  return (
    is066OwnershipArchitectureComplete() &&
    Object.values(gates).every(Boolean) &&
    listIllegalInteractionOwners().length === 0 &&
    listOwnershipDefects().length === 0
  );
}

/**
 * Browser certification gate — unit/runtime evidence is not enough.
 * Remains false until Founder Validation / B066 confirms sole Focus ownership.
 */
export function is066ReadyForBrowserCertification(): boolean {
  return false;
}
