/**
 * Never render DOM Events or unknown throwables as "[object Event]".
 */

export function safeErrorMessage(error: unknown): string {
  if (error == null) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    return error.message || error.name || "Error";
  }
  // DOM Event / React synthetic event — never stringify as [object Event]
  if (
    typeof error === "object" &&
    error !== null &&
    ("nativeEvent" in error ||
      ("type" in error && "target" in error && !("message" in error)))
  ) {
    return "UI event was thrown instead of an Error (handler miswired).";
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Unserializable error";
  }
}

export function safeErrorStack(error: unknown): string {
  if (error instanceof Error && error.stack) return error.stack;
  return safeErrorMessage(error);
}

export function asError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(safeErrorMessage(error));
}
