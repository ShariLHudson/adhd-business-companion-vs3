"use client";

import { useCallback, useEffect, useState } from "react";

import type { EcosystemGoogleAsset } from "@/lib/ecosystem/googleWorkspaceAutomation";
import { ECOSYSTEM_DASHBOARD_ACCESS_HEADER } from "@/lib/ghl/auth";

import { ActionChip, DASHBOARD, DashboardSection } from "./ecosystemDashboardUi";

type GoogleWorkspaceAutomationSectionProps = {
  accessToken: string;
  refreshToken?: number;
};

export function GoogleWorkspaceAutomationSection({
  accessToken,
  refreshToken = 0,
}: GoogleWorkspaceAutomationSectionProps) {
  const [assets, setAssets] = useState<EcosystemGoogleAsset[]>([]);
  const [connected, setConnected] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ecosystem/google-workspace", {
        headers: { [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken },
        credentials: "include",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          assets: EcosystemGoogleAsset[];
          connected: boolean;
          configured: boolean;
        };
        setAssets(data.assets);
        setConnected(data.connected);
        setConfigured(data.configured);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  async function createFolder() {
    setMessage(null);
    const res = await fetch("/api/ecosystem/google-workspace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
      },
      credentials: "include",
      body: JSON.stringify({
        founderAction: "create_folder",
        folderName: "Ecosystem Assets",
      }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      setMessage("Folder created in Google Drive.");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } else {
      setMessage(data.error ?? "Could not create folder.");
    }
  }

  async function openAsset(asset: EcosystemGoogleAsset) {
    await fetch("/api/ecosystem/google-workspace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
      },
      credentials: "include",
      body: JSON.stringify({ founderAction: "open_in_google", assetId: asset.id }),
    });
    window.open(asset.googleUrl, "_blank", "noopener,noreferrer");
  }

  async function archiveAsset(assetId: string) {
    await fetch("/api/ecosystem/google-workspace", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [ECOSYSTEM_DASHBOARD_ACCESS_HEADER]: accessToken,
      },
      credentials: "include",
      body: JSON.stringify({ founderAction: "archive_asset", assetId }),
    });
    void load();
  }

  return (
    <DashboardSection
      id="google-workspace"
      title="Google Workspace"
      subtitle="Docs · Sheets · Forms · Drive — ecosystem asset automation"
    >
      {loading ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>Loading Google assets…</p>
      ) : !configured ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>
          Add Google OAuth env vars (see GOOGLE_SETUP.md) to enable automation.
        </p>
      ) : !connected ? (
        <p className={`text-sm ${DASHBOARD.muted}`}>
          Connect Google in the companion app (Settings → Connections), then return here.
        </p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <ActionChip label="Create folder" variant="gold" onClick={() => void createFolder()} />
          </div>

          {message ? (
            <p className={`mb-3 text-xs ${DASHBOARD.muted}`}>{message}</p>
          ) : null}

          {assets.length === 0 ? (
            <p className={`text-sm ${DASHBOARD.muted}`}>
              No ecosystem assets in Google yet. Create from content opportunities or approved drafts.
            </p>
          ) : (
            <ul className="space-y-2">
              {assets.slice(0, 8).map((asset) => (
                <li
                  key={asset.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#ebe4d9] bg-[#faf8f5] p-3 text-sm"
                >
                  <div>
                    <p className={`font-medium ${DASHBOARD.body}`}>{asset.title}</p>
                    <p className={`text-xs ${DASHBOARD.muted}`}>
                      {asset.kind} · {asset.sourceType.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <ActionChip
                      label="Open in Google"
                      variant="teal"
                      onClick={() => void openAsset(asset)}
                    />
                    <ActionChip
                      label="Archive"
                      onClick={() => void archiveAsset(asset.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </DashboardSection>
  );
}
