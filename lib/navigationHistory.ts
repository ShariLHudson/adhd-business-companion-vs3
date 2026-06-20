/**
 * True navigation history — each forward navigation pushes a restore callback.
 * Back pops and runs the previous screen state (not a hard-coded default).
 */

export type NavigationRestoreFn = () => void;

export function createNavigationHistoryStack() {
  const frames: NavigationRestoreFn[] = [];
  return {
    push(restore: NavigationRestoreFn) {
      frames.push(restore);
    },
    pop(): NavigationRestoreFn | undefined {
      return frames.pop();
    },
    clear() {
      frames.length = 0;
    },
    get size() {
      return frames.length;
    },
  };
}
