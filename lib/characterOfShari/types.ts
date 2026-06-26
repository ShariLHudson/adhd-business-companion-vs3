export type CharacterInteractionKind =
  | "spoken_line"
  | "question"
  | "observation"
  | "room_recommendation"
  | "room_preparation"
  | "silence";

export type CharacterCheckId =
  | "would_say"
  | "would_notice"
  | "would_remain_quiet"
  | "would_prepare_this_way"
  | "would_recommend"
  | "would_smile_instead";

export type CharacterCheck = {
  id: CharacterCheckId;
  passed: boolean;
  reason?: string;
};

export type CharacterVerdict = {
  authentic: boolean;
  content: string | null;
  checks: CharacterCheck[];
  reason: string | null;
  violatedRole?: string | null;
};

export type CharacterFilterContext = {
  kind: CharacterInteractionKind;
  presencePreferSilence?: boolean;
  recoveryGentle?: boolean;
};

export type CharacterEvaluation = {
  greeting: CharacterVerdict;
  invite: CharacterVerdict;
};
