/** Structured inputs for Help Me Right Now — every question gets a field. */

export type ActivityAnswers = Record<string, unknown>;

export type ActivityFieldDef =
  | {
      type: "text";
      key: string;
      label?: string;
      placeholder?: string;
      multiline?: boolean;
      optional?: boolean;
    }
  | {
      type: "options";
      key: string;
      startCount?: number;
      minFilled?: number;
      itemLabel?: (index: number) => string;
      addLabel?: string;
    }
  | {
      type: "labeled-fields";
      key: string;
      fields: { label: string; placeholder?: string }[];
      requiredCount?: number;
    }
  | {
      type: "review-list";
      fromKey: string;
      title?: string;
    }
  | {
      type: "eliminate-from";
      key: string;
      fromKey: string;
      minRemaining?: number;
    }
  | {
      type: "pick-from";
      key: string;
      fromKey: string;
      label?: string;
      optional?: boolean;
    }
  | {
      type: "choice";
      key: string;
      label?: string;
      choices: string[];
    }
  | {
      type: "bucket-assign";
      key: string;
      fromKey: string;
      buckets: { id: string; label: string }[];
    };

export type ActivityStep = {
  instruction: string;
  field?: ActivityFieldDef;
};

export function activityStep(
  instruction: string,
  field?: ActivityFieldDef,
): ActivityStep {
  return field ? { instruction, field } : { instruction };
}

export function stepInstruction(step: ActivityStep | string): string {
  return typeof step === "string" ? step : step.instruction;
}

export function stepField(step: ActivityStep | string): ActivityFieldDef | undefined {
  return typeof step === "string" ? undefined : step.field;
}

export function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "string" ? v : ""));
}

export function filledOptions(value: unknown): string[] {
  return getStringArray(value).map((s) => s.trim()).filter(Boolean);
}

export function getTextAnswer(answers: ActivityAnswers, key: string): string {
  const v = answers[key];
  return typeof v === "string" ? v : "";
}

export function canAdvanceActivityStep(
  field: ActivityFieldDef | undefined,
  answers: ActivityAnswers,
): boolean {
  if (!field) return true;

  switch (field.type) {
    case "text":
      if (field.optional) return true;
      return getTextAnswer(answers, field.key).trim().length > 0;
    case "options": {
      const min = field.minFilled ?? 1;
      return filledOptions(answers[field.key]).length >= min;
    }
    case "labeled-fields": {
      const rows = getStringArray(answers[field.key]);
      const required = field.requiredCount ?? field.fields.length;
      for (let i = 0; i < required; i++) {
        if (!rows[i]?.trim()) return false;
      }
      return true;
    }
    case "review-list":
      return filledOptions(answers[field.fromKey]).length > 0;
    case "eliminate-from": {
      const min = field.minRemaining ?? 1;
      const source = field.key;
      return filledOptions(answers[source]).length >= min;
    }
    case "pick-from":
      if (field.optional) return true;
      return getTextAnswer(answers, field.key).trim().length > 0;
    case "choice":
      return getTextAnswer(answers, field.key).trim().length > 0;
    case "bucket-assign": {
      const items = filledOptions(answers[field.fromKey]);
      if (items.length === 0) return false;
      const map = answers[field.key];
      if (!map || typeof map !== "object") return false;
      const assignments = map as Record<string, string>;
      return items.every((item) => Boolean(assignments[item]?.trim()));
    }
    default:
      return true;
  }
}

/** Copy list into working key when entering eliminate step. */
export function prepareStepAnswers(
  field: ActivityFieldDef | undefined,
  answers: ActivityAnswers,
): ActivityAnswers {
  if (!field || field.type !== "eliminate-from") return answers;
  if (filledOptions(answers[field.key]).length > 0) return answers;
  const from = filledOptions(answers[field.fromKey]);
  if (from.length === 0) return answers;
  return { ...answers, [field.key]: [...from] };
}

export function defaultAnswersForField(field: ActivityFieldDef): unknown {
  switch (field.type) {
    case "options": {
      const count = field.startCount ?? 3;
      return Array.from({ length: count }, () => "");
    }
    case "labeled-fields":
      return field.fields.map(() => "");
    case "bucket-assign":
      return {};
    case "eliminate-from":
    case "review-list":
      return undefined;
    default:
      return "";
  }
}
