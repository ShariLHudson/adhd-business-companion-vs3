/**
 * Universal Blueprint Interface — member-facing models.
 * Built only from Universal Work Engine / Blueprint public exports.
 */

import type {
  BlueprintCategory,
  BlueprintComplexity,
  BlueprintDepthMode,
  CanonicalWorkId,
  SaveAsBlueprintReview,
  WorkBlueprintState,
} from "@/lib/universalWorkEngine";

export type BlueprintStartPath =
  | "start_from_scratch"
  | "start_from_blueprint"
  | "build_from_previous_work";

export type BlueprintBrowserSourceFilter =
  | "all"
  | "recommended"
  | "spark"
  | "personal"
  | "company"
  | "recent"
  | "previous_work";

export type BlueprintBrowserView = "list" | "cards";

export type BlueprintBrowserQuery = {
  workTypeId: string;
  search?: string;
  source?: BlueprintBrowserSourceFilter;
  complexity?: BlueprintComplexity | "all";
  depthMode?: BlueprintDepthMode | "all";
  recentBlueprintIds?: readonly string[];
  recommendedBlueprintIds?: readonly string[];
};

export type BlueprintBrowserItem = {
  blueprintId: string;
  version: string;
  title: string;
  description: string;
  category: BlueprintCategory;
  complexity: BlueprintComplexity;
  supportedDepthModes: readonly BlueprintDepthMode[];
  recommended: boolean;
  recentlyUsed: boolean;
};

export type MemberBlueprintPreview = {
  blueprintId: string;
  version: string;
  title: string;
  helpsCreate: string;
  whoItIsFor: string;
  detailLevel: string;
  availableDepthModes: readonly BlueprintDepthMode[];
  majorSections: readonly string[];
  likelyDeliverables: readonly string[];
  suggestedTasks: readonly string[];
  suggestedMilestones: readonly string[];
  commonlyForgotten: readonly string[];
  knownInfoMayReuse: readonly string[];
  createsOrConnectsProject: boolean;
  chamberSupport: readonly string[];
  boardSupport: readonly string[];
  researchSupport: readonly string[];
  cartographySupport: readonly string[];
};

export type KnownContextProposal = {
  key: string;
  label: string;
  value: string;
  inferred: boolean;
  confidential: boolean;
};

export type KnownContextReuseDecision = {
  approvedKeys: readonly string[];
  declinedKeys: readonly string[];
  editedValues: Readonly<Record<string, string>>;
};

export type DepthChangePreview = {
  workId: CanonicalWorkId;
  from: BlueprintDepthMode;
  to: BlueprintDepthMode;
  sectionsAdded: readonly string[];
  sectionsUnchanged: readonly string[];
  hiddenSystemRemainHidden: boolean;
  preservesWorkId: true;
  erasesUserContent: false;
};

export type PreviousWorkBrowserItem = {
  workId: CanonicalWorkId;
  title: string;
  blueprintId: string;
  blueprintTitle: string;
  depthMode: BlueprintDepthMode;
  updatedAt: string;
  reusableSectionIds: readonly string[];
  reusableSectionTitles: readonly string[];
};

export type BlueprintInterfaceSession = {
  workId: CanonicalWorkId;
  workTypeId: string;
  blueprintId: string | null;
  depthMode: BlueprintDepthMode | null;
  currentSectionId: string | null;
  currentQuestionId: string | null;
  startPath: BlueprintStartPath | null;
  approvedKnownContextKeys: readonly string[];
  sourceWorkId: CanonicalWorkId | null;
  updatedAt: string;
};

export type SaveAsBlueprintUiState = {
  review: SaveAsBlueprintReview;
  retainedKeys: string[];
  confirmed: boolean;
};

export type UniversalBlueprintInitResult = {
  state: WorkBlueprintState;
  definition: BlueprintDefinition;
};
