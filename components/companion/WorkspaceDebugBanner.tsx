"use client";

import { useEffect, useState } from "react";
import {
  isWorkspaceDebugEnabled,
  subscribeCreateOpenLiveTrace,
  type CreateOpenLiveTraceSnapshot,
} from "@/lib/createOpenLiveTrace";

type WorkspaceDebugBannerProps = {
  workspacePanel: string | null;
  chatLayoutMode: string;
  workspaceActive: boolean;
  createMounted: boolean;
};

export function WorkspaceDebugBanner(props: WorkspaceDebugBannerProps) {
  const [trace, setTrace] = useState<CreateOpenLiveTraceSnapshot | null>(null);

  useEffect(() => {
    if (!isWorkspaceDebugEnabled()) return;
    return subscribeCreateOpenLiveTrace(setTrace);
  }, []);

  if (!isWorkspaceDebugEnabled()) return null;

  const rightPanelVisible =
    props.workspaceActive && props.createMounted;

  return (
    <div className="pointer-events-none absolute right-2 top-2 z-[80] max-w-xs rounded-lg border border-amber-400/60 bg-black/80 p-2 font-mono text-[10px] leading-relaxed text-amber-100 shadow-lg">
      <p className="font-bold text-amber-300">Workspace Debug</p>
      <p>workspacePanel: {props.workspacePanel ?? "null"}</p>
      <p>chatLayoutMode: {props.chatLayoutMode}</p>
      <p>workspaceActive: {String(props.workspaceActive)}</p>
      <p>rightPanelVisible: {String(rightPanelVisible)}</p>
      <p>createMounted: {String(props.createMounted)}</p>
      {trace ? (
        <>
          <p className="mt-1 text-amber-400">last trace: {trace.stage}</p>
          <p>traceId: {trace.traceId}</p>
        </>
      ) : null}
    </div>
  );
}
