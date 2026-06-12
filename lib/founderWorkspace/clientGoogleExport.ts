import { formatFounderGoogleDocContent } from "@/lib/founderWorkspace/exportContent";
import type { FounderWorkspaceItem } from "@/lib/founderWorkspace";

export async function clientExportToGoogleDoc(
  item: FounderWorkspaceItem,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const statusRes = await fetch("/api/google/status", { cache: "no-store" });
  const status = (await statusRes.json()) as { connected?: boolean };
  if (!status.connected) {
    return { ok: false, error: "Google not connected." };
  }

  const res = await fetch("/api/google/create-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: item.title.trim(),
      content: formatFounderGoogleDocContent(item),
      kind: "doc",
    }),
  });

  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    return { ok: false, error: data.error ?? "Export failed." };
  }
  window.open(data.url, "_blank", "noopener,noreferrer");
  return { ok: true, url: data.url };
}
