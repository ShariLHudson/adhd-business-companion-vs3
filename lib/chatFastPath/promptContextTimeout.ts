const DEFAULT_CONTEXT_TIMEOUT_MS = 120;

/**
 * Race an async context builder against a short timeout.
 * Fast chat turns skip heavy memory rather than block the UI.
 */
export async function withPromptContextTimeout<T>(
  build: () => Promise<T> | T,
  fallback: T,
  timeoutMs = DEFAULT_CONTEXT_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      Promise.resolve().then(() => build()),
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), timeoutMs);
      }),
    ]);
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
