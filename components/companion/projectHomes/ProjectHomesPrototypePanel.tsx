"use client";

import { useMemo, useState } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { ProjectHomesRoomShell } from "@/components/companion/projectHomes/ProjectHomesRoomShell";
import { ProjectHomeCard } from "@/components/companion/projectHomes/ProjectHomeCard";
import { ProjectHomeDetail } from "@/components/companion/projectHomes/ProjectHomeDetail";
import {
  SAMPLE_PROJECT_HOMES,
  getProjectHomeBackgroundUrl,
  getProjectHomeRoom,
  listProjectHomeRooms,
  recommendProjectHome,
  type ProjectHomeRecord,
  type ProjectHomeRoomId,
  type ProjectHomeView,
} from "@/lib/projectHomes";
import "@/app/companion/project-homes.css";

type Props = {
  onBack: () => void;
};

function newId(): string {
  return `ph-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ProjectHomesPrototypePanel({ onBack }: Props) {
  const [view, setView] = useState<ProjectHomeView>("gallery");
  const [homes, setHomes] = useState<ProjectHomeRecord[]>(SAMPLE_PROJECT_HOMES);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [purpose, setPurpose] = useState("");
  const [draftName, setDraftName] = useState("");
  const [selectedRoomId, setSelectedRoomId] =
    useState<ProjectHomeRoomId | null>(null);
  const [browsingHomes, setBrowsingHomes] = useState(false);

  const rooms = useMemo(() => listProjectHomeRooms(), []);
  const active = homes.find((h) => h.id === activeId) ?? null;
  const galleryBackground =
    active && view === "detail"
      ? getProjectHomeBackgroundUrl(active)
      : selectedRoomId && (view === "create-home" || view === "create-purpose")
        ? getProjectHomeRoom(selectedRoomId).artwork.backgroundUrl
        : getProjectHomeRoom("sunroom").artwork.backgroundUrl;

  function beginCreate() {
    setPurpose("");
    setDraftName("");
    setSelectedRoomId(null);
    setBrowsingHomes(false);
    setView("create-purpose");
  }

  function continueFromPurpose() {
    if (!purpose.trim()) return;
    const rec = recommendProjectHome(purpose);
    setSelectedRoomId(rec.roomId);
    setBrowsingHomes(false);
    if (!draftName.trim()) {
      const first = purpose.trim().split(/[.!?\n]/)[0]?.trim() ?? "New Project";
      setDraftName(first.slice(0, 64));
    }
    setView("create-home");
  }

  function restoreRecommendation() {
    const rec = recommendProjectHome(purpose);
    setSelectedRoomId(rec.roomId);
    setBrowsingHomes(false);
  }

  function createHome() {
    if (!purpose.trim() || !selectedRoomId) return;
    const room = getProjectHomeRoom(selectedRoomId);
    const now = new Date().toISOString();
    const record: ProjectHomeRecord = {
      id: newId(),
      name: draftName.trim() || `${room.name} Project`,
      purpose: purpose.trim(),
      projectHomeId: selectedRoomId,
      status: "dreaming",
      currentFocus: "Settle into this Project Home",
      lastWorkedAt: now,
      nextSuggestedStep: `Spend a few quiet minutes in the ${room.name}`,
      atmosphereNote: room.description,
      personalization: {},
    };
    setHomes((prev) => [record, ...prev]);
    setActiveId(record.id);
    setView("detail");
  }

  function openDetail(id: string) {
    setActiveId(id);
    setView("detail");
  }

  const recommendation = recommendProjectHome(purpose);
  const recommendedRoom = getProjectHomeRoom(
    selectedRoomId ?? recommendation.roomId,
  );

  return (
    <ProjectHomesRoomShell backgroundUrl={galleryBackground}>
      <EstateWorkspace className="project-homes-workspace grow-room-panel">
        <GrowPanelBackButton
          onBack={
            view === "gallery"
              ? onBack
              : view === "detail"
                ? () => {
                    setActiveId(null);
                    setView("gallery");
                  }
                : () =>
                    setView(
                      view === "create-home" ? "create-purpose" : "gallery",
                    )
          }
          label={view === "gallery" ? "Projects" : "Project Homes"}
        />

        {view === "gallery" ? (
          <div>
            <p className="project-homes-kicker">Prototype</p>
            <h1 className="project-homes-title">Project Homes</h1>
            <p className="project-homes-lead">
              Living places inside Spark Estate — not folders. Opening a
              project feels like walking into its workspace.
            </p>
            <div className="project-homes-actions">
              <button
                type="button"
                className="project-homes-btn project-homes-btn--primary"
                onClick={beginCreate}
              >
                Create a Project Home
              </button>
            </div>
            <div className="project-homes-grid">
              {homes.map((project) => (
                <ProjectHomeCard
                  key={project.id}
                  project={project}
                  onOpen={openDetail}
                />
              ))}
            </div>
            <p className="project-homes-prototype-note">
              Design prototype only. Existing Projects stay unchanged. Sample
              homes are not saved to your project storage.
            </p>
          </div>
        ) : null}

        {view === "create-purpose" ? (
          <div>
            <p className="project-homes-kicker">New Project Home</p>
            <h1 className="project-homes-title">What are you creating?</h1>
            <p className="project-homes-lead">
              Tell me what you are creating or working toward. I will suggest a
              Project Home that fits — no setup checklist required.
            </p>
            <div className="project-homes-field mt-4">
              <label htmlFor="project-home-purpose">
                What are you creating or working toward?
              </label>
              <textarea
                id="project-home-purpose"
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="A book chapter, a brand mood board, a workshop offer…"
              />
            </div>
            <div className="project-homes-field mt-3">
              <label htmlFor="project-home-name">Project name (optional)</label>
              <input
                id="project-home-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Give it a name when you are ready"
              />
            </div>
            <div className="project-homes-actions">
              <button
                type="button"
                className="project-homes-btn project-homes-btn--primary"
                disabled={!purpose.trim()}
                onClick={continueFromPurpose}
              >
                Continue
              </button>
              <button
                type="button"
                className="project-homes-btn project-homes-btn--ghost"
                onClick={() => setView("gallery")}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {view === "create-home" ? (
          <div>
            {!browsingHomes && selectedRoomId ? (
              <>
                <p className="project-homes-kicker">A quiet recommendation</p>
                <h1 className="project-homes-title">Your Project Home</h1>
                <p className="project-homes-shari-voice">
                  {selectedRoomId === recommendation.roomId
                    ? recommendation.reason
                    : `I think the ${recommendedRoom.name} would be a wonderful Project Home for this project because ${recommendedRoom.recommendVoice}.`}
                </p>
                <div className="project-homes-recommend">
                  <div
                    className="project-homes-recommend__photo"
                    style={{
                      backgroundImage: `url(${recommendedRoom.artwork.backgroundUrl})`,
                    }}
                    aria-hidden
                  />
                  <p className="mt-3 text-lg font-semibold text-[#1f1c19]">
                    {recommendedRoom.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#4b463f]">
                    {recommendedRoom.description}
                  </p>
                  {recommendedRoom.artwork.isPlaceholder ? (
                    <p className="project-homes-placeholder-note project-homes-placeholder-note--ink">
                      Temporary artwork — dedicated Strategy Conference plate
                      coming later.
                    </p>
                  ) : null}
                  <div className="project-homes-actions">
                    <button
                      type="button"
                      className="project-homes-btn project-homes-btn--primary"
                      onClick={createHome}
                    >
                      Use This Project Home
                    </button>
                    <button
                      type="button"
                      className="project-homes-btn project-homes-btn--secondary"
                      onClick={() => setBrowsingHomes(true)}
                    >
                      Browse Other Project Homes
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {browsingHomes ? (
              <>
                <p className="project-homes-kicker">Browse</p>
                <h1 className="project-homes-title">Other Project Homes</h1>
                <p className="project-homes-lead">
                  Choose another place if a different room feels more like home
                  for this work.
                </p>
                <div className="project-homes-room-grid">
                  {rooms.map((room) => {
                    const selected = selectedRoomId === room.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        className={`project-homes-room-option${
                          selected
                            ? " project-homes-room-option--selected"
                            : ""
                        }`}
                        onClick={() => setSelectedRoomId(room.id)}
                        aria-pressed={selected}
                      >
                        <span
                          className="project-homes-room-option__photo"
                          style={{
                            backgroundImage: `url(${room.artwork.backgroundUrl})`,
                          }}
                          aria-hidden
                        />
                        <span className="project-homes-room-option__body">
                          <span className="project-homes-room-option__name">
                            {room.name}
                            {room.artwork.isPlaceholder ? (
                              <span className="project-homes-room-option__placeholder">
                                {" "}
                                · temp art
                              </span>
                            ) : null}
                          </span>
                          <span className="project-homes-room-option__fit">
                            {room.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="project-homes-actions">
                  <button
                    type="button"
                    className="project-homes-btn project-homes-btn--primary"
                    disabled={!selectedRoomId}
                    onClick={createHome}
                  >
                    Use This Project Home
                  </button>
                  <button
                    type="button"
                    className="project-homes-btn project-homes-btn--ghost"
                    onClick={restoreRecommendation}
                  >
                    Back to recommendation
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {view === "detail" && active ? (
          <ProjectHomeDetail project={active} />
        ) : null}
      </EstateWorkspace>
    </ProjectHomesRoomShell>
  );
}
