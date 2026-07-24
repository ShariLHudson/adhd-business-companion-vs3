"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { EstateWorkspace } from "@/components/companion/EstateWorkspace";
import { GrowPanelBackButton } from "@/components/companion/GrowPanelBackButton";
import { WorkspaceAreaWorksGuide } from "@/components/companion/WorkspaceAreaWorksGuide";
import { EstateRoomChatChrome } from "@/components/companion/estate/EstateRoomChatChrome";
import { BoardroomRoomShell } from "@/components/companion/boardroom/BoardroomRoomShell";
import { BoardDirectorsMeetExperience } from "@/components/companion/board/BoardDirectorsMeetExperience";
import { BoardDirectorDiscussionIntake } from "@/components/companion/board/BoardDirectorDiscussionIntake";
import type { AdvisoryMemberId } from "@/lib/advisory/types";
import type { BoardDirectorId } from "@/lib/board";
import { getBoardDirectorById } from "@/lib/board";
import {
  CARLOS_RIVERA_DIRECTOR_ID,
  DAVID_KIM_DIRECTOR_ID,
  MARCUS_WHITAKER_DIRECTOR_ID,
  MATEO_VARGAS_DIRECTOR_ID,
  MAYA_CHEN_DIRECTOR_ID,
  SHARI_MENON_DIRECTOR_ID,
  THOMAS_ELLISON_DIRECTOR_ID,
} from "@/lib/board/visibleDirectors";
import {
  clearBoardIntakeDraft,
  listBoardDirectorDiscussions,
  resumeBoardIntakeConversation,
  type BoardDiscussionContext,
  type BoardDirectorDiscussionRecord,
} from "@/lib/board/boardDiscussion/boardDirectorDiscussion";
import { consumeCallTheBoard } from "@/lib/board/callTheBoard";
import {
  BOARDROOM_WELCOME_MESSAGE,
  BOARDROOM_HOME_PRIMARY_CHOICES,
  BOARDROOM_HOW_TO_USE_POINTS,
  BOARDROOM_HOW_TO_SUMMARY_LABEL,
  BOARDROOM_CHAMBER_CONTRAST_BLURB,
  boardroomViewFromEntryIntent,
  hasResumableBoardDiscussion,
  isBoardroomDestinationHomeView,
  ordinaryDestinationBoardroomView,
  shouldOpenCarlosFromEntry,
  shouldOpenDavidFromEntry,
  shouldOpenMarcusFromEntry,
  shouldOpenMateoFromEntry,
  shouldOpenMayaFromEntry,
  shouldOpenShariFromEntry,
  shouldOpenThomasFromEntry,
  DISCUSSION_STYLE_META,
  appendMemberContext,
  askBoardMemberTurn,
  challengeViewTurn,
  emptyBrief,
  exploreOptionTurn,
  generateDecisionBrief,
  generateOpeningDiscussion,
  listAllBoardMembers,
  memberPerspectiveLabel,
  recentBoardroomDiscussions,
  recommendBestBoard,
  resolveBoardMembers,
  titleFromSituation,
  upsertBoardroomDiscussion,
  type BoardAssemblyMode,
  type BoardDiscussionStyle,
  type BoardDiscussionTurn,
  type BoardroomDiscussionRecord,
  type BoardroomEntryIntent,
  type BoardroomView,
} from "@/lib/boardroom";
import "@/app/companion/boardroom.css";

type Props = {
  onBack: () => void;
  /**
   * How this Boardroom visit should open.
   * Ordinary Estate navigation (`home`) → seating overview (boardroom_home).
   * Direct phrases (Meet Thomas, intake, past) may deep-link deliberately.
   * Remount via parent `key` so stale subviews cannot hijack a new entry.
   */
  entryIntent?: BoardroomEntryIntent;
  /** Current Focus / Call the Board context (Prompt 145) — intake only. */
  sourceContext?: BoardDiscussionContext | null;
  onReturnToSource?: () => void;
  /** Supporting Shari chat — not the primary Boardroom interface. */
  shariChatOpen?: boolean;
  onToggleShariChat?: (open: boolean) => void;
  thread?: ReactNode;
  footer?: ReactNode;
  conversationScrollKey?: string | number;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function newId(): string {
  return `brd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function BoardroomRoomPanel({
  onBack,
  entryIntent = "home",
  sourceContext = null,
  onReturnToSource,
  shariChatOpen = false,
  onToggleShariChat,
  thread,
  footer,
  conversationScrollKey,
}: Props) {
  const [view, setView] = useState<BoardroomView>(() => {
    // Ordinary destination entry never auto-opens discussion from sticky
    // Call-the-Board or leftover drafts — only explicit intake / sourceContext.
    if (entryIntent === "intake" || sourceContext) {
      return "board-director-intake";
    }
    return boardroomViewFromEntryIntent(entryIntent);
  });
  const [callContext, setCallContext] = useState<BoardDiscussionContext | null>(
    () => {
      if (entryIntent === "intake" || sourceContext) {
        return sourceContext ?? consumeCallTheBoard();
      }
      return null;
    },
  );
  const [directorPastDetail, setDirectorPastDetail] =
    useState<BoardDirectorDiscussionRecord | null>(null);
  const [resumeAvailable, setResumeAvailable] = useState(() =>
    hasResumableBoardDiscussion(),
  );

  useEffect(() => {
    if (sourceContext) setCallContext(sourceContext);
  }, [sourceContext]);
  const [meetRoundTableOpen, setMeetRoundTableOpen] = useState(
    () => entryIntent === "home" || entryIntent === "meet-directors",
  );
  const [meetInitialDirectorId] = useState<BoardDirectorId | null>(() => {
    if (shouldOpenThomasFromEntry(entryIntent)) return THOMAS_ELLISON_DIRECTOR_ID;
    if (shouldOpenShariFromEntry(entryIntent)) return SHARI_MENON_DIRECTOR_ID;
    if (shouldOpenMarcusFromEntry(entryIntent)) return MARCUS_WHITAKER_DIRECTOR_ID;
    if (shouldOpenDavidFromEntry(entryIntent)) return DAVID_KIM_DIRECTOR_ID;
    if (shouldOpenMayaFromEntry(entryIntent)) return MAYA_CHEN_DIRECTOR_ID;
    if (shouldOpenCarlosFromEntry(entryIntent)) return CARLOS_RIVERA_DIRECTOR_ID;
    if (shouldOpenMateoFromEntry(entryIntent)) return MATEO_VARGAS_DIRECTOR_ID;
    return null;
  });
  const [boardReviewDirectorIds, setBoardReviewDirectorIds] = useState<
    BoardDirectorId[]
  >([]);
  /** Fresh Bring-a-Decision intake — discard stale draft. */
  const [forceFreshBoardIntake, setForceFreshBoardIntake] = useState(false);
  const [tick, setTick] = useState(0);
  const recent = useMemo(() => {
    void tick;
    return recentBoardroomDiscussions(5);
  }, [tick]);
  const allPast = useMemo(() => {
    void tick;
    return recentBoardroomDiscussions(50);
  }, [tick]);
  const boardDirectorPast = useMemo(() => {
    void tick;
    return listBoardDirectorDiscussions(50);
  }, [tick]);

  const [situation, setSituation] = useState("");
  const [assemblyMode, setAssemblyMode] =
    useState<BoardAssemblyMode>("assemble-best");
  const [memberIds, setMemberIds] = useState<AdvisoryMemberId[]>([]);
  const [style, setStyle] =
    useState<BoardDiscussionStyle>("full-discussion");
  const [active, setActive] = useState<BoardroomDiscussionRecord | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [infoDraft, setInfoDraft] = useState("");
  const [askMemberId, setAskMemberId] = useState<AdvisoryMemberId | "">("");
  const [inviteMemberId, setInviteMemberId] = useState<AdvisoryMemberId | "">(
    "",
  );
  const [optionDraft, setOptionDraft] = useState("");
  const [decisionDraft, setDecisionDraft] = useState("");
  const [revisitDraft, setRevisitDraft] = useState("");
  const [outcomeDraft, setOutcomeDraft] = useState("");
  const [actionPanel, setActionPanel] = useState<
    null | "info" | "ask" | "invite" | "option" | "decision"
  >(null);

  const allMembers = useMemo(() => listAllBoardMembers(), []);

  function refresh() {
    setTick((n) => n + 1);
  }

  function persist(record: BoardroomDiscussionRecord) {
    const saved = upsertBoardroomDiscussion(record);
    setActive(saved);
    refresh();
    return saved;
  }

  function startHome() {
    // Destination home = Round Table seating / director overview.
    setView(ordinaryDestinationBoardroomView());
    setMeetRoundTableOpen(true);
    setActive(null);
    setDetailId(null);
    setActionPanel(null);
    setDirectorPastDetail(null);
    onToggleShariChat?.(false);
    setResumeAvailable(hasResumableBoardDiscussion());
  }

  function beginNewDiscussion() {
    clearBoardIntakeDraft();
    setBoardReviewDirectorIds([]);
    setForceFreshBoardIntake(true);
    setCallContext(null);
    setView("board-director-intake");
    setActionPanel(null);
    setResumeAvailable(false);
  }

  function resumeBoardDiscussion() {
    resumeBoardIntakeConversation();
    setForceFreshBoardIntake(false);
    setMeetRoundTableOpen(false);
    setView("board-director-intake");
    setActionPanel(null);
    setResumeAvailable(false);
  }

  function beginDiscussionWithDirectors(ids: readonly BoardDirectorId[]) {
    if (ids.length === 0) return;
    setBoardReviewDirectorIds([...ids]);
    setForceFreshBoardIntake(false);
    setMeetRoundTableOpen(false);
    setView("board-director-intake");
  }

  function goAssemblyChoice() {
    if (!situation.trim()) return;
    setView("new-assembly");
  }

  function chooseAssembleBest() {
    setAssemblyMode("assemble-best");
    setMemberIds(recommendBestBoard(situation));
    setView("new-members");
  }

  function choosePickMembers() {
    setAssemblyMode("choose-members");
    setMemberIds([]);
    setView("new-members");
  }

  function toggleMember(id: AdvisoryMemberId) {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function selectAllMembers() {
    setMemberIds(allMembers.map((m) => m.id));
  }

  function clearAllMembers() {
    setMemberIds([]);
  }

  function goStyleStep() {
    if (memberIds.length === 0) return;
    setView("new-style");
  }

  function beginMeeting() {
    const now = new Date().toISOString();
    const turns = generateOpeningDiscussion({
      situation: situation.trim(),
      memberIds,
      style,
    });
    const record: BoardroomDiscussionRecord = {
      id: newId(),
      title: titleFromSituation(situation),
      createdAt: now,
      updatedAt: now,
      situation: situation.trim(),
      assemblyMode,
      memberIds: [...memberIds],
      style,
      turns,
      brief: emptyBrief(situation.trim()),
      recordedDecision: null,
      revisitAt: null,
      outcomeNotes: null,
      status: "in-progress",
    };
    persist(record);
    setView("discussion");
  }

  function updateTurns(nextTurns: BoardDiscussionTurn[]) {
    if (!active) return;
    persist({ ...active, turns: nextTurns, status: "in-progress" });
  }

  function addMoreInformation() {
    if (!active || !infoDraft.trim()) return;
    updateTurns(appendMemberContext(active.turns, infoDraft));
    setInfoDraft("");
    setActionPanel(null);
  }

  function askSelectedMember() {
    if (!active || !askMemberId) return;
    const turn = askBoardMemberTurn(
      askMemberId,
      active.situation,
      active.style,
      infoDraft,
    );
    if (!turn) return;
    updateTurns([...active.turns, turn]);
    setAskMemberId("");
    setActionPanel(null);
  }

  function inviteMember() {
    if (!active || !inviteMemberId) return;
    if (active.memberIds.includes(inviteMemberId)) return;
    const nextIds = [...active.memberIds, inviteMemberId];
    const turn = askBoardMemberTurn(
      inviteMemberId,
      active.situation,
      active.style,
    );
    const nextTurns = turn
      ? [
          ...active.turns,
          {
            id: `mod-invite-${Date.now()}`,
            role: "moderator" as const,
            note: {
              kind: "invite" as const,
              text: `I've invited ${resolveBoardMembers([inviteMemberId])[0]?.name ?? "a new member"} to the table.`,
            },
          },
          turn,
        ]
      : active.turns;
    persist({
      ...active,
      memberIds: nextIds,
      turns: nextTurns,
    });
    setInviteMemberId("");
    setActionPanel(null);
  }

  function removeMember(id: AdvisoryMemberId) {
    if (!active) return;
    if (active.memberIds.length <= 1) return;
    persist({
      ...active,
      memberIds: active.memberIds.filter((m) => m !== id),
      turns: [
        ...active.turns,
        {
          id: `mod-remove-${Date.now()}`,
          role: "moderator",
          note: {
            kind: "invite",
            text: `${resolveBoardMembers([id])[0]?.name ?? "A member"} has left the table. The discussion continues with those who remain.`,
          },
        },
      ],
    });
  }

  function challengeActiveView() {
    if (!active) return;
    const target = active.memberIds[0];
    if (!target) return;
    const turn = challengeViewTurn(target, active.situation);
    if (!turn) return;
    updateTurns([...active.turns, turn]);
  }

  function exploreOption() {
    if (!active || !optionDraft.trim()) return;
    updateTurns([
      ...active.turns,
      ...exploreOptionTurn(active.memberIds, active.situation, optionDraft),
    ]);
    setOptionDraft("");
    setActionPanel(null);
  }

  function pauseDiscussion() {
    if (!active) return;
    persist({
      ...active,
      status: "paused",
      turns: [
        ...active.turns,
        {
          id: `mod-pause-${Date.now()}`,
          role: "moderator",
          note: {
            kind: "pause",
            text: "We'll pause here. Nothing is lost — return when you're ready.",
          },
        },
      ],
    });
    startHome();
  }

  function endMeeting() {
    if (!active) return;
    const brief = generateDecisionBrief({
      situation: active.situation,
      memberIds: active.memberIds,
      turns: active.turns,
    });
    persist({
      ...active,
      status: "ended",
      brief,
      turns: [
        ...active.turns,
        {
          id: `mod-end-${Date.now()}`,
          role: "moderator",
          note: {
            kind: "close",
            text: "I've gathered a Decision Brief from this meeting. The decision itself remains yours.",
          },
        },
      ],
    });
    setDecisionDraft("");
    setRevisitDraft("");
    setView("brief");
  }

  function recordDecision() {
    if (!active) return;
    persist({
      ...active,
      recordedDecision: decisionDraft.trim() || null,
      brief: {
        ...active.brief,
        yourDecision: decisionDraft.trim(),
      },
      status: "ended",
    });
    setActionPanel(null);
    startHome();
  }

  function notReadyYet() {
    if (!active) return;
    persist({ ...active, status: "ended", recordedDecision: null });
    startHome();
  }

  function revisitLater() {
    if (!active) return;
    persist({
      ...active,
      status: "ended",
      revisitAt: revisitDraft.trim() || new Date().toISOString().slice(0, 10),
      outcomeNotes: outcomeDraft.trim() || null,
    });
    setActionPanel(null);
    startHome();
  }

  function openPast(id: string) {
    const found = allPast.find((d) => d.id === id) ?? recent.find((d) => d.id === id);
    if (!found) return;
    setDetailId(id);
    setActive(found);
    setView("past-detail");
  }

  function resumePaused(record: BoardroomDiscussionRecord) {
    setActive(record);
    setSituation(record.situation);
    setMemberIds(record.memberIds);
    setStyle(record.style);
    setAssemblyMode(record.assemblyMode);
    setView("discussion");
  }

  const selectedMembers = resolveBoardMembers(memberIds);
  const activeMembers = active
    ? resolveBoardMembers(active.memberIds)
    : [];
  const detail = detailId
    ? allPast.find((d) => d.id === detailId) ?? active
    : null;

  return (
    <>
      <BoardroomRoomShell>
        <EstateWorkspace className="boardroom-workspace grow-room-panel">
          <GrowPanelBackButton
            onBack={
              isBoardroomDestinationHomeView(view)
                ? onBack
                : view === "discussion" || view === "brief"
                  ? () => {
                      if (view === "discussion" && active) pauseDiscussion();
                      else startHome();
                    }
                  : startHome
            }
            label={
              isBoardroomDestinationHomeView(view)
                ? "Estate"
                : "Back to Boardroom"
            }
          />

          {view === "home" ? (
            <HomeView
              onStart={beginNewDiscussion}
              onMeetDirectors={() => {
                setMeetRoundTableOpen(true);
                setView("meet-directors");
              }}
              onReviewPast={() => setView("past")}
              resumeAvailable={resumeAvailable}
              onResumeDiscussion={resumeBoardDiscussion}
              onViewBoardMembers={() => {
                setMeetRoundTableOpen(true);
                setView("meet-directors");
              }}
            />
          ) : null}

          {view === "how-to" ? (
            <div data-testid="boardroom-how-to-view">
              <p className="boardroom-kicker">Boardroom</p>
              <h2 className="boardroom-title">{BOARDROOM_HOW_TO_SUMMARY_LABEL}</h2>
              <div className="boardroom-gold-rule" aria-hidden />
              <div className="boardroom-how-to">
                <WorkspaceAreaWorksGuide areaId="boardroom" />
              </div>
              <p className="boardroom-purpose mt-4">
                {BOARDROOM_CHAMBER_CONTRAST_BLURB}
              </p>
              <div className="boardroom-actions">
                <button
                  type="button"
                  className="boardroom-btn boardroom-btn--secondary"
                  onClick={startHome}
                >
                  Back to Boardroom
                </button>
              </div>
            </div>
          ) : null}

          {view === "board-director-intake" ? (
            <BoardDirectorDiscussionIntake
              key={
                forceFreshBoardIntake
                  ? "board-intake-fresh"
                  : `board-intake-${boardReviewDirectorIds.join("-") || "empty"}`
              }
              initialDirectorIds={
                boardReviewDirectorIds.length > 0
                  ? boardReviewDirectorIds
                  : []
              }
              forceFreshDecision={forceFreshBoardIntake}
              sourceContext={callContext}
              onCancel={startHome}
              onChooseDirectors={() => {
                setForceFreshBoardIntake(false);
                setView("meet-directors");
              }}
              onReturnToSource={onReturnToSource}
              onComplete={() => {
                refresh();
                startHome();
              }}
            />
          ) : null}

          {view === "meet-directors" ? (
            <BoardDirectorsMeetExperience
              isDestinationHome
              onBackToBoardroom={onBack}
              initialDirectorId={meetInitialDirectorId}
              initialRoundTableOpen={meetRoundTableOpen}
              initialBoardReviewIds={boardReviewDirectorIds}
              onStartBoardDiscussion={(ids) => {
                beginDiscussionWithDirectors(ids);
              }}
              onBoardReviewIdsChange={setBoardReviewDirectorIds}
              resumeAvailable={resumeAvailable}
              onResumeDiscussion={resumeBoardDiscussion}
              onStartNewDiscussion={beginNewDiscussion}
              onReviewPastDiscussions={() => setView("past")}
            />
          ) : null}
          {view === "past" ? (
            directorPastDetail ? (
              <DirectorPastDetailView
                record={directorPastDetail}
                onBack={() => setDirectorPastDetail(null)}
              />
            ) : (
              <PastListView
                advisoryItems={allPast}
                boardDirectorItems={boardDirectorPast}
                onOpenAdvisory={openPast}
                onOpenDirectorPast={(item) => setDirectorPastDetail(item)}
                onBack={startHome}
              />
            )
          ) : null}

          {view === "past-detail" && detail ? (
            <PastDetailView
              record={detail}
              onBack={() => setView("past")}
              onResume={
                detail.status === "paused" || detail.status === "in-progress"
                  ? () => resumePaused(detail)
                  : undefined
              }
            />
          ) : null}

          {view === "new-situation" ? (
            <div>
              <p className="boardroom-title">Start a Board Discussion</p>
              <p className="boardroom-purpose">
                Describe the decision, problem, opportunity, or idea you want
                to explore.
              </p>
              <div className="boardroom-field mt-4">
                <label htmlFor="boardroom-situation">Situation</label>
                <textarea
                  id="boardroom-situation"
                  rows={5}
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="What's on the table?"
                />
              </div>
              <div className="boardroom-actions">
                <button
                  type="button"
                  className="boardroom-btn boardroom-btn--primary"
                  disabled={!situation.trim()}
                  onClick={goAssemblyChoice}
                >
                  Continue
                </button>
                <button
                  type="button"
                  className="boardroom-btn boardroom-btn--ghost"
                  onClick={startHome}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {view === "new-assembly" ? (
            <div>
              <p className="boardroom-title">Who sits at the table?</p>
              <p className="boardroom-purpose">
                Choose how you want to assemble the board.
              </p>
              <div className="boardroom-card-list">
                <button
                  type="button"
                  className="boardroom-card"
                  onClick={chooseAssembleBest}
                >
                  <div className="boardroom-card__title">
                    Assemble the Best Board
                  </div>
                  <div className="boardroom-card__meta">
                    Recommend relevant members for this situation. You can add
                    or remove anyone before we begin.
                  </div>
                </button>
                <button
                  type="button"
                  className="boardroom-card"
                  onClick={choosePickMembers}
                >
                  <div className="boardroom-card__title">
                    Choose My Board Members
                  </div>
                  <div className="boardroom-card__meta">
                    Pick the perspectives you want at the table.
                  </div>
                </button>
              </div>
            </div>
          ) : null}

          {view === "new-members" ? (
            <div>
              <p className="boardroom-title">
                {assemblyMode === "assemble-best"
                  ? "Recommended Board"
                  : "Choose Board Members"}
              </p>
              <p className="boardroom-purpose">
                {assemblyMode === "assemble-best"
                  ? "Review who I suggest. Add or remove members before we begin."
                  : "Select the members whose expertise and perspectives you need."}
              </p>
              {assemblyMode === "choose-members" ? (
                <div className="boardroom-actions">
                  <button
                    type="button"
                    className="boardroom-btn boardroom-btn--secondary"
                    onClick={selectAllMembers}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="boardroom-btn boardroom-btn--secondary"
                    onClick={clearAllMembers}
                  >
                    Clear All
                  </button>
                </div>
              ) : null}
              <div className="boardroom-member-grid">
                {(assemblyMode === "assemble-best"
                  ? selectedMembers
                  : allMembers
                ).map((member) => {
                  const selected = memberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={`boardroom-card board-director-card${selected ? " boardroom-card--selected" : ""}`}
                      onClick={() => toggleMember(member.id)}
                      aria-pressed={selected}
                      data-selected={selected ? "true" : "false"}
                    >
                      {selected ? (
                        <span
                          aria-hidden="true"
                          className="boardroom-card__selection-check selection-check"
                        >
                          ✓
                        </span>
                      ) : null}
                      <div className="boardroom-card__title">{member.name}</div>
                      <div className="boardroom-card__meta">
                        <strong>{member.role}</strong>
                        <br />
                        Expertise: {member.expertise.slice(0, 3).join(", ")}
                        <br />
                        Perspective: {memberPerspectiveLabel(member)}
                      </div>
                    </button>
                  );
                })}
              </div>
              {assemblyMode === "assemble-best" ? (
                <div className="mt-4">
                  <p className="boardroom-section-label">Add another member</p>
                  <div className="boardroom-member-grid">
                    {allMembers
                      .filter((m) => !memberIds.includes(m.id))
                      .map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          className="boardroom-card"
                          onClick={() => toggleMember(member.id)}
                        >
                          <div className="boardroom-card__title">
                            + {member.name}
                          </div>
                          <div className="boardroom-card__meta">
                            {member.role}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}
              <div className="boardroom-actions">
                <button
                  type="button"
                  className="boardroom-btn boardroom-btn--primary"
                  disabled={memberIds.length === 0}
                  onClick={goStyleStep}
                >
                  Continue
                </button>
                <button
                  type="button"
                  className="boardroom-btn boardroom-btn--ghost"
                  onClick={() => setView("new-assembly")}
                >
                  Back
                </button>
              </div>
            </div>
          ) : null}

          {view === "new-style" ? (
            <div>
              <p className="boardroom-title">How should we discuss this?</p>
              <p className="boardroom-purpose">
                Full Discussion is the default — change it if you need something
                lighter or sharper.
              </p>
              <div className="boardroom-card-list">
                {(
                  Object.keys(DISCUSSION_STYLE_META) as BoardDiscussionStyle[]
                ).map((key) => {
                  const meta = DISCUSSION_STYLE_META[key];
                  const selected = style === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`boardroom-card${selected ? " boardroom-card--selected" : ""}`}
                      onClick={() => setStyle(key)}
                      aria-pressed={selected}
                    >
                      <div className="boardroom-card__title">{meta.label}</div>
                      <div className="boardroom-card__meta">
                        {meta.description}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="boardroom-actions">
                <button
                  type="button"
                  className="boardroom-btn boardroom-btn--primary"
                  onClick={beginMeeting}
                >
                  Begin Meeting
                </button>
                <button
                  type="button"
                  className="boardroom-btn boardroom-btn--ghost"
                  onClick={() => setView("new-members")}
                >
                  Back
                </button>
              </div>
            </div>
          ) : null}

          {view === "discussion" && active ? (
            <DiscussionView
              record={active}
              members={activeMembers}
              actionPanel={actionPanel}
              setActionPanel={setActionPanel}
              infoDraft={infoDraft}
              setInfoDraft={setInfoDraft}
              askMemberId={askMemberId}
              setAskMemberId={setAskMemberId}
              inviteMemberId={inviteMemberId}
              setInviteMemberId={setInviteMemberId}
              optionDraft={optionDraft}
              setOptionDraft={setOptionDraft}
              allMembers={allMembers}
              onAddInfo={addMoreInformation}
              onAsk={askSelectedMember}
              onInvite={inviteMember}
              onRemove={removeMember}
              onChallenge={challengeActiveView}
              onExplore={exploreOption}
              onPause={pauseDiscussion}
              onEnd={endMeeting}
              shariChatOpen={shariChatOpen}
              onToggleShariChat={onToggleShariChat}
            />
          ) : null}

          {view === "brief" && active ? (
            <BriefView
              record={active}
              decisionDraft={decisionDraft}
              setDecisionDraft={setDecisionDraft}
              revisitDraft={revisitDraft}
              setRevisitDraft={setRevisitDraft}
              outcomeDraft={outcomeDraft}
              setOutcomeDraft={setOutcomeDraft}
              actionPanel={actionPanel}
              setActionPanel={setActionPanel}
              onRecord={recordDecision}
              onNotReady={notReadyYet}
              onRevisit={revisitLater}
            />
          ) : null}
        </EstateWorkspace>
      </BoardroomRoomShell>

      {shariChatOpen && thread && footer ? (
        <EstateRoomChatChrome
          roomId="round-table"
          thread={thread}
          footer={footer}
          conversationScrollKey={conversationScrollKey}
          panelClassName="boardroom-room__chat-panel"
        />
      ) : null}
    </>
  );
}

function HomeView({
  onStart,
  onMeetDirectors,
  onReviewPast,
  resumeAvailable = false,
  onResumeDiscussion,
  onViewBoardMembers,
}: {
  onStart: () => void;
  onMeetDirectors: () => void;
  onReviewPast: () => void;
  resumeAvailable?: boolean;
  onResumeDiscussion?: () => void;
  onViewBoardMembers?: () => void;
}) {
  const choiceHandlers: Record<
    (typeof BOARDROOM_HOME_PRIMARY_CHOICES)[number]["id"],
    () => void
  > = {
    "bring-decision": onStart,
    "meet-directors": onMeetDirectors,
    "review-past": onReviewPast,
  };

  const primary = BOARDROOM_HOME_PRIMARY_CHOICES.find(
    (c) => c.id === "bring-decision",
  )!;
  const secondary = BOARDROOM_HOME_PRIMARY_CHOICES.filter(
    (c) => c.id !== "bring-decision",
  );

  return (
    <div className="boardroom-home" data-testid="boardroom-home">
      <p className="boardroom-kicker">Spark Estate</p>
      <h1 className="boardroom-title">Round Table Boardroom</h1>
      <div className="boardroom-gold-rule" aria-hidden />
      <p
        className="boardroom-welcome"
        data-testid="boardroom-welcome-message"
      >
        {BOARDROOM_WELCOME_MESSAGE}
      </p>
      <p
        className="boardroom-home__chamber-blurb"
        data-testid="boardroom-chamber-contrast"
      >
        {BOARDROOM_CHAMBER_CONTRAST_BLURB}
      </p>

      {resumeAvailable ? (
        <div
          className="boardroom-home__resume-card"
          data-testid="boardroom-resume-discussion-card"
          role="region"
          aria-label="Unfinished Board discussion"
        >
          <p className="boardroom-home__resume-title">
            You have an unfinished Board discussion.
          </p>
          <div className="boardroom-home__resume-actions">
            <button
              type="button"
              className="boardroom-btn boardroom-btn--secondary"
              data-testid="boardroom-resume-discussion"
              onClick={onResumeDiscussion}
            >
              Resume Discussion
            </button>
            <button
              type="button"
              className="boardroom-btn boardroom-btn--ghost"
              data-testid="boardroom-resume-start-new"
              onClick={onStart}
            >
              Start New
            </button>
            <button
              type="button"
              className="boardroom-btn boardroom-btn--ghost"
              data-testid="boardroom-resume-view-members"
              onClick={onViewBoardMembers ?? onMeetDirectors}
            >
              View Board Members
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="boardroom-home__actions"
        role="list"
        aria-label="Boardroom primary choices"
        data-testid="boardroom-primary-choices"
      >
        <button
          type="button"
          role="listitem"
          className="boardroom-home__action-card boardroom-home__action-card--primary"
          data-testid={primary.testId}
          data-choice-id={primary.id}
          onClick={choiceHandlers[primary.id]}
        >
          <span className="boardroom-home__action-title">{primary.title}</span>
          <span className="boardroom-home__action-meta">
            {primary.description}
          </span>
        </button>
        <div
          className="boardroom-home__secondary-actions"
          role="group"
          aria-label="More Boardroom destinations"
        >
          {secondary.map((choice) => (
            <button
              key={choice.id}
              type="button"
              role="listitem"
              className="boardroom-home__action-card boardroom-home__action-card--secondary"
              data-testid={choice.testId}
              data-choice-id={choice.id}
              onClick={choiceHandlers[choice.id]}
            >
              <span className="boardroom-home__action-title">{choice.title}</span>
              <span className="boardroom-home__action-meta">
                {choice.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <details
        className="boardroom-home__how-to"
        data-testid="boardroom-how-to-use"
      >
        <summary className="boardroom-home__how-to-summary">
          {BOARDROOM_HOW_TO_SUMMARY_LABEL}
        </summary>
        <ul className="boardroom-home__how-to-list">
          {BOARDROOM_HOW_TO_USE_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function DirectorPastDetailView({
  record,
  onBack,
}: {
  record: BoardDirectorDiscussionRecord;
  onBack: () => void;
}) {
  const decision = record.decisionRecord;
  const relatedWork = decision?.relatedWork ?? [];
  return (
    <div data-testid="board-director-past-detail">
      <p className="boardroom-kicker">Decision Record</p>
      <h2 className="boardroom-title">{record.title}</h2>
      <div className="boardroom-gold-rule" aria-hidden />
      <p className="boardroom-purpose">{formatDate(record.createdAt)}</p>
      {decision ? (
        <div className="boardroom-card-list mt-4">
          <div className="boardroom-card">
            <div className="boardroom-card__title">Decision Record</div>
            <div className="boardroom-card__meta whitespace-pre-wrap">
              {decision.summary}
            </div>
          </div>
          <div className="boardroom-card">
            <div className="boardroom-card__title">Risks or unknowns</div>
            <div className="boardroom-card__meta whitespace-pre-wrap">
              {decision.keyRisks}
            </div>
          </div>
          <div className="boardroom-card">
            <div className="boardroom-card__title">Next useful step</div>
            <div className="boardroom-card__meta whitespace-pre-wrap">
              {decision.nextUsefulStep || decision.finalRecommendation}
            </div>
          </div>
          {relatedWork.length > 0 || decision.relatedProjectName ? (
            <div
              className="boardroom-card"
              data-testid="board-decision-related-work"
            >
              <div className="boardroom-card__title">Related Work</div>
              <ul className="boardroom-card__meta" style={{ margin: 0, paddingLeft: "1.1rem" }}>
                {relatedWork.map((ref) => (
                  <li key={`${ref.sourceType}-${ref.sourceId}`}>
                    {ref.label || ref.topic || ref.sourceType}
                  </li>
                ))}
                {decision.relatedProjectName &&
                !relatedWork.some((r) => r.sourceType === "project") ? (
                  <li>{decision.relatedProjectName}</li>
                ) : null}
              </ul>
            </div>
          ) : null}
          <div className="boardroom-card">
            <div className="boardroom-card__title">Participating Directors</div>
            <div className="boardroom-card__meta">
              {decision.participatingDirectors
                .map((id) => getBoardDirectorById(id)?.name)
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        </div>
      ) : (
        <div className="boardroom-director-intake__turns mt-4">
          {record.turns.map((turn) => (
            <article key={turn.id} className="boardroom-card">
              <p className="boardroom-card__title">
                {turn.speakerName || turn.role}
              </p>
              <p className="boardroom-card__meta whitespace-pre-wrap">
                {turn.text}
              </p>
            </article>
          ))}
        </div>
      )}
      <div className="boardroom-actions">
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          onClick={onBack}
          data-testid="board-director-past-detail-back"
        >
          Back to Past Discussions
        </button>
      </div>
    </div>
  );
}

function PastListView({
  advisoryItems,
  boardDirectorItems,
  onOpenAdvisory,
  onOpenDirectorPast,
  onBack,
}: {
  advisoryItems: BoardroomDiscussionRecord[];
  boardDirectorItems: ReturnType<typeof listBoardDirectorDiscussions>;
  onOpenAdvisory: (id: string) => void;
  onOpenDirectorPast: (item: BoardDirectorDiscussionRecord) => void;
  onBack: () => void;
}) {
  const hasAny =
    boardDirectorItems.length > 0 || advisoryItems.length > 0;

  return (
    <div data-testid="boardroom-past-discussions">
      <p className="boardroom-kicker">Boardroom</p>
      <h2 className="boardroom-title">Past Discussions</h2>
      <div className="boardroom-gold-rule" aria-hidden />
      <p className="boardroom-purpose">
        Previous Board discussions you can reopen. Related Chamber or research
        work may appear on each record when linked.
      </p>

      {!hasAny ? (
        <p
          className="boardroom-past-empty"
          data-testid="boardroom-past-empty"
        >
          No Board discussions have been saved yet. Your important decisions
          will appear here after you choose to preserve them.
        </p>
      ) : (
        <>
          {boardDirectorItems.length > 0 ? (
            <div className="boardroom-card-list" data-testid="board-director-past-list">
              <p className="boardroom-past-section-label">Board of Directors</p>
              {boardDirectorItems.map((item) => {
                const direction =
                  item.decisionRecord?.currentDirection ||
                  item.decisionRecord?.nextUsefulStep ||
                  (item.status === "recommendation-accepted"
                    ? "Recommendation accepted"
                    : "In progress");
                const directors = item.directorIds
                  .map((id) => getBoardDirectorById(id)?.name)
                  .filter(Boolean)
                  .join(", ");
                return (
                  <div
                    key={item.id}
                    className="boardroom-card boardroom-past-card"
                    data-testid={`board-director-past-${item.id}`}
                  >
                    <div className="boardroom-card__title">{item.title}</div>
                    <div className="boardroom-card__meta">
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="boardroom-card__meta">{directors}</div>
                    <div className="boardroom-card__meta">{direction}</div>
                    <div className="boardroom-actions" style={{ marginTop: "0.65rem" }}>
                      <button
                        type="button"
                        className="boardroom-btn boardroom-btn--secondary"
                        data-testid={`board-director-past-open-${item.id}`}
                        onClick={() => onOpenDirectorPast(item)}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          {advisoryItems.length > 0 ? (
            <div className="boardroom-card-list mt-4">
              <p className="boardroom-past-section-label">Earlier Boardroom records</p>
              {advisoryItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="boardroom-card"
                  onClick={() => onOpenAdvisory(item.id)}
                >
                  <div className="boardroom-card__title">{item.title}</div>
                  <div className="boardroom-card__meta">
                    {formatDate(item.createdAt)} ·{" "}
                    {item.memberIds.length} members ·{" "}
                    {DISCUSSION_STYLE_META[item.style].label}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}
      <div className="boardroom-actions">
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          onClick={onBack}
        >
          Back to Boardroom
        </button>
      </div>
    </div>
  );
}

function PastDetailView({
  record,
  onBack,
  onResume,
}: {
  record: BoardroomDiscussionRecord;
  onBack: () => void;
  onResume?: () => void;
}) {
  const members = resolveBoardMembers(record.memberIds);
  return (
    <div>
      <p className="boardroom-title">{record.title}</p>
      <p className="boardroom-purpose">
        {formatDate(record.createdAt)} ·{" "}
        {DISCUSSION_STYLE_META[record.style].label}
      </p>
      <div className="boardroom-brief-block">
        <h3>Original situation</h3>
        <p>{record.situation}</p>
      </div>
      <div className="boardroom-brief-block">
        <h3>Board members</h3>
        <ul>
          {members.map((m) => (
            <li key={m.id}>
              {m.name} — {m.role}
            </li>
          ))}
        </ul>
      </div>
      <BriefBlocks brief={record.brief} />
      <div className="boardroom-brief-block">
        <h3>Your Decision</h3>
        {record.recordedDecision ? (
          <p>{record.recordedDecision}</p>
        ) : (
          <div className="boardroom-empty-decision">
            Not recorded yet — that choice stays with you.
          </div>
        )}
      </div>
      {record.revisitAt ? (
        <div className="boardroom-brief-block">
          <h3>Revisit date</h3>
          <p>{record.revisitAt}</p>
        </div>
      ) : null}
      {record.outcomeNotes ? (
        <div className="boardroom-brief-block">
          <h3>Later outcome notes</h3>
          <p>{record.outcomeNotes}</p>
        </div>
      ) : null}
      <div className="boardroom-actions">
        {onResume ? (
          <button
            type="button"
            className="boardroom-btn boardroom-btn--primary"
            onClick={onResume}
          >
            Resume Discussion
          </button>
        ) : null}
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
}

function DiscussionView({
  record,
  members,
  actionPanel,
  setActionPanel,
  infoDraft,
  setInfoDraft,
  askMemberId,
  setAskMemberId,
  inviteMemberId,
  setInviteMemberId,
  optionDraft,
  setOptionDraft,
  allMembers,
  onAddInfo,
  onAsk,
  onInvite,
  onRemove,
  onChallenge,
  onExplore,
  onPause,
  onEnd,
  shariChatOpen,
  onToggleShariChat,
}: {
  record: BoardroomDiscussionRecord;
  members: ReturnType<typeof resolveBoardMembers>;
  actionPanel: null | "info" | "ask" | "invite" | "option" | "decision";
  setActionPanel: (
    p: null | "info" | "ask" | "invite" | "option" | "decision",
  ) => void;
  infoDraft: string;
  setInfoDraft: (v: string) => void;
  askMemberId: AdvisoryMemberId | "";
  setAskMemberId: (v: AdvisoryMemberId | "") => void;
  inviteMemberId: AdvisoryMemberId | "";
  setInviteMemberId: (v: AdvisoryMemberId | "") => void;
  optionDraft: string;
  setOptionDraft: (v: string) => void;
  allMembers: ReturnType<typeof listAllBoardMembers>;
  onAddInfo: () => void;
  onAsk: () => void;
  onInvite: () => void;
  onRemove: (id: AdvisoryMemberId) => void;
  onChallenge: () => void;
  onExplore: () => void;
  onPause: () => void;
  onEnd: () => void;
  shariChatOpen?: boolean;
  onToggleShariChat?: (open: boolean) => void;
}) {
  return (
    <div>
      <p className="boardroom-title">Board Discussion</p>
      <p className="boardroom-purpose">
        Shari is moderating. The board explores — you decide.
      </p>
      <p className="mt-2 text-sm text-[#6b635a]">
        At the table: {members.map((m) => m.name).join(", ")}
      </p>

      <div className="mt-4">
        {record.turns.map((turn) => (
          <TurnCard key={turn.id} turn={turn} />
        ))}
      </div>

      <div className="boardroom-action-bar">
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          onClick={() => setActionPanel(actionPanel === "info" ? null : "info")}
        >
          Add More Information
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          onClick={() => setActionPanel(actionPanel === "ask" ? null : "ask")}
        >
          Ask a Board Member
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          onClick={() =>
            setActionPanel(actionPanel === "invite" ? null : "invite")
          }
        >
          Invite Another Member
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          onClick={onChallenge}
        >
          Challenge This View
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          onClick={() =>
            setActionPanel(actionPanel === "option" ? null : "option")
          }
        >
          Explore Another Option
        </button>
        {onToggleShariChat ? (
          <button
            type="button"
            className="boardroom-btn boardroom-btn--secondary"
            onClick={() => onToggleShariChat(!shariChatOpen)}
          >
            {shariChatOpen ? "Hide Shari Chat" : "Talk with Shari"}
          </button>
        ) : null}
        <button
          type="button"
          className="boardroom-btn boardroom-btn--ghost"
          onClick={onPause}
        >
          Pause Discussion
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--primary"
          onClick={onEnd}
        >
          End Meeting
        </button>
      </div>

      {members.length > 1 ? (
        <div className="mt-3">
          <p className="boardroom-section-label">Remove a member</p>
          <div className="boardroom-action-bar">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                className="boardroom-btn boardroom-btn--ghost"
                onClick={() => onRemove(m.id)}
              >
                Remove {m.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {actionPanel === "info" ? (
        <div className="boardroom-field mt-4">
          <label htmlFor="board-info">Add context for the board</label>
          <textarea
            id="board-info"
            rows={3}
            value={infoDraft}
            onChange={(e) => setInfoDraft(e.target.value)}
          />
          <div className="boardroom-actions">
            <button
              type="button"
              className="boardroom-btn boardroom-btn--primary"
              disabled={!infoDraft.trim()}
              onClick={onAddInfo}
            >
              Share with Board
            </button>
          </div>
        </div>
      ) : null}

      {actionPanel === "ask" ? (
        <div className="boardroom-field mt-4">
          <label htmlFor="ask-member">Ask a board member</label>
          <select
            id="ask-member"
            value={askMemberId}
            onChange={(e) =>
              setAskMemberId(e.target.value as AdvisoryMemberId | "")
            }
          >
            <option value="">Choose…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="boardroom-actions">
            <button
              type="button"
              className="boardroom-btn boardroom-btn--primary"
              disabled={!askMemberId}
              onClick={onAsk}
            >
              Ask
            </button>
          </div>
        </div>
      ) : null}

      {actionPanel === "invite" ? (
        <div className="boardroom-field mt-4">
          <label htmlFor="invite-member">Invite another member</label>
          <select
            id="invite-member"
            value={inviteMemberId}
            onChange={(e) =>
              setInviteMemberId(e.target.value as AdvisoryMemberId | "")
            }
          >
            <option value="">Choose…</option>
            {allMembers
              .filter((m) => !record.memberIds.includes(m.id))
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role}
                </option>
              ))}
          </select>
          <div className="boardroom-actions">
            <button
              type="button"
              className="boardroom-btn boardroom-btn--primary"
              disabled={!inviteMemberId}
              onClick={onInvite}
            >
              Invite
            </button>
          </div>
        </div>
      ) : null}

      {actionPanel === "option" ? (
        <div className="boardroom-field mt-4">
          <label htmlFor="explore-option">Option to explore</label>
          <textarea
            id="explore-option"
            rows={2}
            value={optionDraft}
            onChange={(e) => setOptionDraft(e.target.value)}
            placeholder="Name an option you want the board to examine…"
          />
          <div className="boardroom-actions">
            <button
              type="button"
              className="boardroom-btn boardroom-btn--primary"
              disabled={!optionDraft.trim()}
              onClick={onExplore}
            >
              Explore with Board
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TurnCard({ turn }: { turn: BoardDiscussionTurn }) {
  if (turn.role === "moderator") {
    return (
      <div className="boardroom-turn boardroom-turn--moderator">
        <div className="boardroom-turn__who">Shari · Moderator</div>
        <div className="boardroom-turn__body">{turn.note.text}</div>
      </div>
    );
  }
  if (turn.role === "member-context") {
    return (
      <div className="boardroom-turn">
        <div className="boardroom-turn__who">You · Added context</div>
        <div className="boardroom-turn__body">{turn.text}</div>
      </div>
    );
  }
  const t = turn.turn;
  return (
    <div className="boardroom-turn">
      <div className="boardroom-turn__who">
        {t.memberName} · {t.memberRole}
      </div>
      <div className="boardroom-turn__body">{t.perspective}</div>
      <ListBlock label="Pros" items={t.pros} />
      <ListBlock label="Cons" items={t.cons} />
      <ListBlock label="Risks" items={t.risks} />
      <ListBlock label="Opportunities" items={t.opportunities} />
      <ListBlock label="Trade-offs" items={t.tradeOffs} />
      <ListBlock label="Unknowns" items={t.unknowns} />
      <ListBlock label="Questions" items={t.questions} />
      <ListBlock label="Possible options" items={t.possibleOptions} />
      <ListBlock label="Fit notes" items={t.fitNotes} />
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
        {label}
      </p>
      <ul className="boardroom-turn__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

function BriefView({
  record,
  decisionDraft,
  setDecisionDraft,
  revisitDraft,
  setRevisitDraft,
  outcomeDraft,
  setOutcomeDraft,
  actionPanel,
  setActionPanel,
  onRecord,
  onNotReady,
  onRevisit,
}: {
  record: BoardroomDiscussionRecord;
  decisionDraft: string;
  setDecisionDraft: (v: string) => void;
  revisitDraft: string;
  setRevisitDraft: (v: string) => void;
  outcomeDraft: string;
  setOutcomeDraft: (v: string) => void;
  actionPanel: null | "info" | "ask" | "invite" | "option" | "decision";
  setActionPanel: (
    p: null | "info" | "ask" | "invite" | "option" | "decision",
  ) => void;
  onRecord: () => void;
  onNotReady: () => void;
  onRevisit: () => void;
}) {
  return (
    <div>
      <p className="boardroom-title">Decision Brief</p>
      <p className="boardroom-purpose">
        A structured summary of the discussion. Your decision is left blank until
        you choose to record it.
      </p>
      <BriefBlocks brief={record.brief} />
      <div className="boardroom-brief-block">
        <h3>Your Decision</h3>
        <div className="boardroom-empty-decision">
          Left open on purpose — the board does not decide for you.
        </div>
      </div>
      <div className="boardroom-actions">
        <button
          type="button"
          className="boardroom-btn boardroom-btn--primary"
          onClick={() =>
            setActionPanel(actionPanel === "decision" ? null : "decision")
          }
        >
          Record My Decision
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          onClick={onNotReady}
        >
          I&apos;m Not Ready Yet
        </button>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          onClick={() =>
            setActionPanel(actionPanel === "option" ? null : "option")
          }
        >
          Revisit Later
        </button>
      </div>
      {actionPanel === "decision" ? (
        <div className="boardroom-field mt-4">
          <label htmlFor="your-decision">Your decision</label>
          <textarea
            id="your-decision"
            rows={3}
            value={decisionDraft}
            onChange={(e) => setDecisionDraft(e.target.value)}
            placeholder="In your own words…"
          />
          <div className="boardroom-actions">
            <button
              type="button"
              className="boardroom-btn boardroom-btn--primary"
              disabled={!decisionDraft.trim()}
              onClick={onRecord}
            >
              Save Decision
            </button>
          </div>
        </div>
      ) : null}
      {actionPanel === "option" ? (
        <div className="mt-4 space-y-3">
          <div className="boardroom-field">
            <label htmlFor="revisit-date">Revisit date</label>
            <input
              id="revisit-date"
              type="date"
              value={revisitDraft}
              onChange={(e) => setRevisitDraft(e.target.value)}
            />
          </div>
          <div className="boardroom-field">
            <label htmlFor="outcome-notes">Later outcome notes (optional)</label>
            <textarea
              id="outcome-notes"
              rows={2}
              value={outcomeDraft}
              onChange={(e) => setOutcomeDraft(e.target.value)}
            />
          </div>
          <div className="boardroom-actions">
            <button
              type="button"
              className="boardroom-btn boardroom-btn--primary"
              onClick={onRevisit}
            >
              Save for Later
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BriefBlocks({
  brief,
}: {
  brief: BoardroomDiscussionRecord["brief"];
}) {
  return (
    <>
      <div className="boardroom-brief-block">
        <h3>Situation</h3>
        <p>{brief.situation || "—"}</p>
      </div>
      <BriefList title="Options Considered" items={brief.optionsConsidered} />
      <BriefList title="Potential Benefits" items={brief.potentialBenefits} />
      <BriefList title="Potential Drawbacks" items={brief.potentialDrawbacks} />
      <BriefList title="Risks and Unknowns" items={brief.risksAndUnknowns} />
      <BriefList title="Areas of Agreement" items={brief.areasOfAgreement} />
      <BriefList
        title="Different Perspectives"
        items={brief.differentPerspectives}
      />
      <BriefList
        title="Questions Still to Answer"
        items={brief.questionsStillToAnswer}
      />
      <BriefList title="Possible Next Steps" items={brief.possibleNextSteps} />
    </>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="boardroom-brief-block">
      <h3>{title}</h3>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>—</p>
      )}
    </div>
  );
}
