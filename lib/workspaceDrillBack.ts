import { useEffect } from "react";

export type WorkspaceBackRegistrar = ((fn: (() => boolean) | null) => void) | undefined;

/** Register a one-level drill-back handler for global Back (P0.46). */
export function useWorkspaceDrillBack(
  registerBack: WorkspaceBackRegistrar,
  isDrilled: boolean,
  onPop: () => void,
) {
  useEffect(() => {
    if (!registerBack) return;
    if (!isDrilled) {
      registerBack(null);
      return;
    }
    registerBack(() => {
      onPop();
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, isDrilled, onPop]);
}
