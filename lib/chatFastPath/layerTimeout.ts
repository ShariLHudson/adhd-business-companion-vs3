/**
 * Bounded execution for sync/async layers — skip on timeout instead of hanging Thinking.
 */

export class LayerTimeoutError extends Error {
  readonly layer: string;

  constructor(layer: string, timeoutMs: number) {
    super(`${layer}-timeout:${timeoutMs}`);
    this.name = "LayerTimeoutError";
    this.layer = layer;
  }
}

export function isLayerTimeoutError(err: unknown): boolean {
  return err instanceof LayerTimeoutError;
}

export function withLayerTimeout<T>(
  layer: string,
  fn: () => T,
  timeoutMs: number,
): T {
  if (timeoutMs <= 0) return fn();
  const start = Date.now();
  const result = fn();
  if (Date.now() - start > timeoutMs) {
    throw new LayerTimeoutError(layer, timeoutMs);
  }
  return result;
}

export async function withAsyncLayerTimeout<T>(
  layer: string,
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  if (timeoutMs <= 0) return fn();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fn(),
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new LayerTimeoutError(layer, timeoutMs)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
