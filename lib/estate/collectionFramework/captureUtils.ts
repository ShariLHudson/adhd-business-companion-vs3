import type {
  EstateCollectionCaptureConfig,
  EstateCollectionCaptureField,
  EstateCollectionCaptureValues,
  EstateCollectionItem,
} from "./types";

export function emptyCaptureValues(
  fields: readonly EstateCollectionCaptureField[],
): EstateCollectionCaptureValues {
  return Object.fromEntries(fields.map((field) => [field.id, ""]));
}

export function primaryCaptureText(
  config: EstateCollectionCaptureConfig,
  values: EstateCollectionCaptureValues,
): string {
  return values[config.primaryFieldId]?.trim() ?? "";
}

export function captureValuesFromItem(
  item: EstateCollectionItem,
  fields: readonly import("./types").EstateCollectionCaptureField[],
): EstateCollectionCaptureValues {
  if (item.captureValues) return { ...item.captureValues };
  const values = emptyCaptureValues(fields);
  for (const field of fields) {
    if (field.id === "body") values.body = item.body;
    else if (field.id === "title" || field.id === "chapterTitle") {
      values[field.id] = item.title ?? "";
    } else if (field.id === "category") values.category = item.category ?? "";
    else {
      const match = item.fields?.find(
        (f) => f.label.toLowerCase() === field.label.toLowerCase(),
      );
      if (match) values[field.id] = match.value;
    }
  }
  return values;
}

export function isCaptureValid(
  fields: readonly EstateCollectionCaptureField[],
  values: EstateCollectionCaptureValues,
): boolean {
  return fields.every((field) => {
    if (!field.required) return true;
    return Boolean(values[field.id]?.trim());
  });
}
