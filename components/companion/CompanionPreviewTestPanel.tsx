"use client";

import type { CSSProperties } from "react";
import type { ProfileEstateRoomId } from "@/lib/growth/profileEstateRooms";
import { PROFILE_ESTATE_ROOM_IDS } from "@/lib/growth/profileEstateRooms";
import type { CompanionPreviewTestLaunchTarget } from "@/lib/companionPreviewTestHarness";
import {
  isCompanionPreviewTestHarnessArmed,
  resetCompanionPreviewTestHarness,
} from "@/lib/companionPreviewTestHarness";

const PANEL_STYLE: CSSProperties = {
  position: "fixed",
  right: "12px",
  bottom: "12px",
  zIndex: 10050,
  width: "min(320px, calc(100vw - 24px))",
  maxHeight: "min(70vh, 520px)",
  overflow: "auto",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "2px solid #c45c26",
  background: "rgba(18, 12, 8, 0.94)",
  color: "#f6efe6",
  boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
  fontSize: "13px",
  lineHeight: 1.35,
};

const BADGE_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#ffb347",
};

const BUTTON_STYLE: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: "8px",
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "inherit",
  cursor: "pointer",
  textAlign: "left",
};

type Props = {
  onLaunch: (target: CompanionPreviewTestLaunchTarget, roomId?: string) => void;
  onReset: () => void;
};

const PROFILE_ROOM_LABELS: Record<ProfileEstateRoomId, string> = {
  "my-estate": "My Estate",
  "growth-profile": "Growth Profile",
  "evidence-vault": "Evidence Vault",
  journal: "Journal Gazebo",
  portfolio: "Portfolio",
};

export function CompanionPreviewTestPanel({ onLaunch, onReset }: Props) {
  if (!isCompanionPreviewTestHarnessArmed()) return null;

  return (
    <aside
      style={PANEL_STYLE}
      data-testid="companion-preview-test-panel"
      aria-label="Preview testing panel"
    >
      <p style={BADGE_STYLE}>Preview testing only</p>
      <h2 style={{ margin: "6px 0 4px", fontSize: "15px" }}>
        Experience test launcher
      </h2>
      <p style={{ margin: "0 0 8px", opacity: 0.85 }}>
        Session-only overrides. Does not change login count, welcome seen-state, or
        saved profile data.
      </p>

      <div>
        <button
          type="button"
          style={BUTTON_STYLE}
          onClick={() => onLaunch("welcome-home")}
        >
          Launch Welcome Home intro
        </button>

        <button
          type="button"
          style={BUTTON_STYLE}
          onClick={() => onLaunch("discovery-key", "greenhouse")}
        >
          Launch Discovery Key (Greenhouse)
        </button>

        <button
          type="button"
          style={BUTTON_STYLE}
          onClick={() => onLaunch("shari-arrival", "coffee-house")}
        >
          Launch Shari arrival (Coffee House)
        </button>

        <div style={{ marginTop: "10px" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Profile Estate rooms</p>
          {PROFILE_ESTATE_ROOM_IDS.map((roomId) => (
            <button
              key={roomId}
              type="button"
              style={{ ...BUTTON_STYLE, marginTop: "6px", fontSize: "12px" }}
              onClick={() => onLaunch("profile-estate", roomId)}
            >
              {PROFILE_ROOM_LABELS[roomId]}
            </button>
          ))}
        </div>

        <button
          type="button"
          style={{
            ...BUTTON_STYLE,
            marginTop: "12px",
            borderColor: "#c45c26",
            color: "#ffb347",
          }}
          onClick={() => {
            resetCompanionPreviewTestHarness();
            onReset();
          }}
        >
          Reset preview test state
        </button>
      </div>
    </aside>
  );
}
