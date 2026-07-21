/**
 * 066 Runtime — Canonical Current Focus (sole interaction owner).
 */

export type CurrentFocusResponseType =
  | "free_text"
  | "multiline"
  | "single_choice"
  | "multiple_choice"
  | "confirmation"
  | "date_time"
  | "number"
  | "structured_list"
  | "unsure"
  | "ideas"
  | "skip";

export type CanonicalCurrentFocus = {
  focusId: string;
  creationId: string;
  title: string;
  purpose: string;
  prompt: string;
  responseType: CurrentFocusResponseType;
  knownContext: string[];
  availableGuidance: string[];
  completionCriteria: string;
  nextTransition: string | null;
  contextVersion: number;
  /** Optional choices for single/multiple choice */
  choices?: string[];
  sectionId?: string | null;
  assetTypeId?: string | null;
  introductoryGuidance?: string | null;
  /** Latest saved section body — editor seeds from this when opening the section. */
  savedContent?: string | null;
};

export type SubmitCurrentFocusResponseInput = {
  creationId: string;
  focusId: string;
  response: string;
  responseType: CurrentFocusResponseType;
  requestId: string;
  contextVersion: number;
};

export type SubmitCurrentFocusResponseResult = {
  ok: boolean;
  preservedResponse: string;
  confirmationGuidance: string | null;
  failureMessage: string | null;
  retryAvailable: boolean;
  nextFocus: CanonicalCurrentFocus | null;
  realityUpdated: boolean;
  trustAuthorized: boolean;
  advanced: boolean;
  /** 074+ — true only when authoritative durable store confirmed the mutation */
  durable?: boolean;
  version?: number;
};
