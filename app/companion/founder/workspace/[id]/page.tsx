import { notFound } from "next/navigation";

import { FounderWorkspaceView } from "@/components/founderStudio/FounderWorkspaceView";
import { getWorkspace } from "@/lib/founder/workspace";
import {
  FOUNDER_WORKSPACE_IDS,
  isFounderWorkspaceId,
} from "@/lib/founder/workspace/config";

type FounderWorkspaceRouteProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return FOUNDER_WORKSPACE_IDS.map((id) => ({ id }));
}

export default async function FounderWorkspaceRoute({
  params,
}: FounderWorkspaceRouteProps) {
  const { id } = await params;

  if (!isFounderWorkspaceId(id)) {
    notFound();
  }

  const workspace = getWorkspace(id);

  return <FounderWorkspaceView workspace={workspace} />;
}
