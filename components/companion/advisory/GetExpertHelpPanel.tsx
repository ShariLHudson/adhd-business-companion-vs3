"use client";

import { useMemo, useState } from "react";
import "@/components/companion/guided-stages/guidedStageEntry.css";
import {
  CHAMBER_MEMBERS,
  getChamberMemberById,
  type ChamberMemberId,
} from "@/lib/chamber/chamberMemberRegistry";
import {
  listAllBoardMembers,
  type BoardroomDiscussionRecord,
} from "@/lib/boardroom";
import {
  buildAdvisoryContext,
  buildSuggestedChangesFromAdvice,
  dispatchAdvisoryChamberInvite,
  saveAdvisoryAdvice,
} from "@/lib/profile/advisoryHelpContext";
import {
  startAdvisoryBoardDiscussion,
  summarizeBoardForOverlay,
} from "@/lib/profile/advisoryHelpBoard";
import {
  getRecommendedChamberMembers,
  recommendAssistancePath,
  recommendChamberSpecialists,
} from "@/lib/profile/advisoryHelpRecommendations";
import type {
  AdvisoryContext,
  AdvisoryHelpMode,
  AdvisorySourceType,
  AdvisorySuggestedChange,
  ShariPathRecommendation,
} from "@/lib/profile/advisoryHelpTypes";
import {
  ADVISORY_HELP_MAY_AUTO_LAUNCH_PATH,
  ADVISORY_HELP_MAY_AUTO_UPDATE_PROFILE,
  ADVISORY_HELP_MAY_AUTO_OPEN_CHAMBER_HOME,
  ASSISTANCE_ACTION_LABEL,
  BOARD_PATH_LABEL,
  CHAMBER_PATH_LABEL,
  MAX_CHAMBER_SPECIALISTS_PER_SESSION,
  SHARI_PATH_LABEL,
} from "@/lib/profile/advisoryHelpTypes";

type Props = {
  sourceType: AdvisorySourceType;
  areaId: string;
  stageId?: string;
  avatarId?: string;
  draftContext?: Record<string, unknown>;
  onClose: () => void;
  onReturn: () => void;
};

type Phase =
  | "kind"
  | "question"
  | "pick_chamber"
  | "browse_chamber"
  | "shari_rec"
  | "board_confirm"
  | "board_result"
  | "active_chamber"
  | "suggest"
  | "research_redirect";

/**
 * Need Another Perspective? — Chamber and Board are separate destinations.
 * Never shows Chamber specialists as Board members or vice versa.
 */
export function GetExpertHelpPanel({
  sourceType,
  areaId,
  stageId,
  avatarId,
  draftContext,
  onClose,
  onReturn,
}: Props) {
  const [phase, setPhase] = useState<Phase>("kind");
  const [mode, setMode] = useState<AdvisoryHelpMode | null>(null);
  const [question, setQuestion] = useState("");
  const [selectedChamber, setSelectedChamber] = useState<ChamberMemberId[]>([]);
  const [context, setContext] = useState<AdvisoryContext | null>(null);
  const [board, setBoard] = useState<BoardroomDiscussionRecord | null>(null);
  const [suggestions, setSuggestions] = useState<AdvisorySuggestedChange[]>(
    [],
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState("");
  const [shariRec, setShariRec] = useState<ShariPathRecommendation | null>(
    null,
  );

  const recommendedChamber = useMemo(
    () => getRecommendedChamberMembers(areaId),
    [areaId],
  );

  const boardMembersPreview = useMemo(
    () => listAllBoardMembers().slice(0, 6),
    [],
  );

  function ensureContext(q?: string): AdvisoryContext {
    const ctx = buildAdvisoryContext({
      sourceType,
      areaId,
      stageId,
      avatarId,
      userQuestion: q ?? question,
      draftContext,
    });
    setContext(ctx);
    return ctx;
  }

  function chooseKind(next: AdvisoryHelpMode) {
    setMode(next);
    setPhase("question");
  }

  function afterQuestion() {
    const ctx = ensureContext();
    if (mode === "chamber_specialist") {
      setPhase("pick_chamber");
    } else if (mode === "board_discussion") {
      setPhase("board_confirm");
    } else if (mode === "shari_recommend") {
      setShariRec(recommendAssistancePath(ctx));
      setPhase("shari_rec");
    }
  }

  function toggleChamber(id: ChamberMemberId) {
    setSelectedChamber((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_CHAMBER_SPECIALISTS_PER_SESSION) {
        return [prev[0]!, id].slice(0, MAX_CHAMBER_SPECIALISTS_PER_SESSION);
      }
      return [...prev, id];
    });
  }

  function inviteChamber(ids: ChamberMemberId[]) {
    const ctx = context ?? ensureContext();
    dispatchAdvisoryChamberInvite({ memberIds: ids, context: ctx });
    setSelectedChamber(ids);
    setPhase("active_chamber");
    setNotice(
      ids.length === 1
        ? `${getChamberMemberById(ids[0]!)?.displayName ?? "Specialist"} (Chamber) has joined. This is not a Board meeting.`
        : `${ids.length} Chamber specialists are available. This remains Chamber help — not the Board.`,
    );
  }

  function startBoard() {
    const ctx = context ?? ensureContext();
    const { discussion } = startAdvisoryBoardDiscussion(ctx);
    setBoard(discussion);
    saveAdvisoryAdvice({
      context: ctx,
      mode: "board_discussion",
      boardMemberIds: discussion.memberIds,
      summary: question || ctx.userQuestion || "Board discussion",
    });
    setPhase("board_result");
    setNotice(
      "Board discussion opened with Board members only — Chamber specialists were not used.",
    );
  }

  function handleSaveChamberAdvice() {
    const ctx = context ?? ensureContext();
    const ids = selectedChamber.length
      ? selectedChamber
      : recommendedChamber.slice(0, 1);
    const sourceLabel =
      ids
        .map((id) => getChamberMemberById(id)?.displayName)
        .filter(Boolean)
        .join(", ") || "Chamber specialist";
    const changes = buildSuggestedChangesFromAdvice(ctx, sourceLabel);
    setSuggestions(changes);
    saveAdvisoryAdvice({
      context: ctx,
      mode: "chamber_specialist",
      chamberMemberIds: ids,
      summary: question || ctx.userQuestion || "Chamber advice",
      suggestedChanges: changes,
    });
    setNotice("Advice saved separately — profile fields unchanged.");
    setPhase("suggest");
  }

  function confirmShariPath(rec: ShariPathRecommendation) {
    if (ADVISORY_HELP_MAY_AUTO_LAUNCH_PATH) return;
    if (rec.path === "continue_with_shari") {
      setNotice("Continuing with Shari in this area. Nothing else opened.");
      onReturn();
      return;
    }
    if (rec.path === "research_with_shari") {
      setPhase("research_redirect");
      setNotice(
        "Deep research stays with Shari in conversation — not Chamber or Board. Close this and ask in chat when you want to dig in.",
      );
      return;
    }
    if (rec.path === "ask_chamber_specialist") {
      setMode("chamber_specialist");
      if (rec.chamberHint) {
        setSelectedChamber(
          rec.chamberHint.optionalSecond
            ? [rec.chamberHint.primary, rec.chamberHint.optionalSecond]
            : [rec.chamberHint.primary],
        );
      }
      setPhase("pick_chamber");
      return;
    }
    if (rec.path === "take_to_board") {
      setMode("board_discussion");
      setPhase("board_confirm");
    }
  }

  const chamberList = (() => {
    if (phase === "browse_chamber") {
      const q = memberFilter.trim().toLowerCase();
      if (!q) return [...CHAMBER_MEMBERS];
      return CHAMBER_MEMBERS.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.specialty.toLowerCase().includes(q),
      );
    }
    return CHAMBER_MEMBERS.filter((m) => recommendedChamber.includes(m.id));
  })();

  const boardSummary = board ? summarizeBoardForOverlay(board) : null;

  return (
    <div
      className="get-expert-help-panel"
      data-testid="get-expert-help-panel"
      data-auto-update-profile={String(ADVISORY_HELP_MAY_AUTO_UPDATE_PROFILE)}
      data-auto-chamber-home={String(ADVISORY_HELP_MAY_AUTO_OPEN_CHAMBER_HOME)}
      data-auto-launch={String(ADVISORY_HELP_MAY_AUTO_LAUNCH_PATH)}
      role="dialog"
      aria-label={ASSISTANCE_ACTION_LABEL}
    >
      <header className="get-expert-help-panel__header">
        <div>
          <p className="estate-workspace__kicker">Assistance</p>
          <h2 className="get-expert-help-panel__title">
            {ASSISTANCE_ACTION_LABEL}
          </h2>
        </div>
        <button
          type="button"
          className="my-business-estate-panel__close"
          onClick={onClose}
          data-testid="expert-help-close"
        >
          Close
        </button>
      </header>

      <p className="get-expert-help-panel__return-hint">
        You&apos;ll return to{" "}
        <strong>{areaId.replace(/-/g, " ")}</strong>
        {stageId ? ` · ${stageId}` : ""}
        {avatarId ? ` · avatar ${avatarId.slice(0, 8)}…` : ""}. Drafts stay
        where they are.
      </p>

      {phase === "kind" ? (
        <div
          className="get-expert-help-panel__choices"
          data-testid="expert-help-kind"
        >
          <p className="get-expert-help-panel__lead">
            What kind of help would be useful?
          </p>
          <button
            type="button"
            className="guided-stage-entry__option"
            onClick={() => chooseKind("chamber_specialist")}
            data-testid="expert-kind-chamber_specialist"
          >
            <span className="guided-stage-entry__option-title">
              {CHAMBER_PATH_LABEL}
            </span>
            <span className="guided-stage-entry__option-desc">
              Focused expertise from the Chamber — not a Board meeting.
            </span>
          </button>
          <button
            type="button"
            className="guided-stage-entry__option"
            onClick={() => chooseKind("board_discussion")}
            data-testid="expert-kind-board_discussion"
          >
            <span className="guided-stage-entry__option-title">
              {BOARD_PATH_LABEL}
            </span>
            <span className="guided-stage-entry__option-desc">
              Cross-functional Board review for major decisions — not Chamber
              specialists.
            </span>
          </button>
          <button
            type="button"
            className="guided-stage-entry__option"
            onClick={() => chooseKind("shari_recommend")}
            data-testid="expert-kind-shari_recommend"
          >
            <span className="guided-stage-entry__option-title">
              {SHARI_PATH_LABEL}
            </span>
            <span className="guided-stage-entry__option-desc">
              Shari suggests Chamber, Board, research, or staying here — you
              choose.
            </span>
          </button>
        </div>
      ) : null}

      {phase === "question" ? (
        <div className="get-expert-help-panel__ask">
          <label
            className="business-estate-research-panel__label"
            htmlFor="expert-help-question"
          >
            What would you like help with?
          </label>
          <textarea
            id="expert-help-question"
            className="business-estate-research-panel__textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Describe the decision or question in your own words…"
            data-testid="expert-help-question"
          />
          <button
            type="button"
            className="business-estate-section-editor__save"
            onClick={afterQuestion}
            data-testid="expert-help-question-continue"
          >
            Continue
          </button>
        </div>
      ) : null}

      {(phase === "pick_chamber" || phase === "browse_chamber") && (
        <div
          className="get-expert-help-panel__pick"
          data-testid="chamber-specialist-pick"
        >
          <p className="get-expert-help-panel__lead">
            Chamber specialists only — choose one, or add a second if helpful
            (max {MAX_CHAMBER_SPECIALISTS_PER_SESSION}).
          </p>
          <label className="get-expert-help-panel__search">
            <span className="sr-only">Search Chamber specialists</span>
            <input
              type="search"
              value={memberFilter}
              onChange={(e) => {
                setMemberFilter(e.target.value);
                if (e.target.value.trim()) setPhase("browse_chamber");
              }}
              placeholder="Search Chamber specialists…"
              data-testid="expert-help-member-search"
            />
          </label>
          <ul className="get-expert-help-panel__member-list" role="listbox">
            {chamberList.map((m) => {
              const checked = selectedChamber.includes(m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    className={`get-expert-help-panel__member${
                      checked ? " get-expert-help-panel__member--selected" : ""
                    }`}
                    onClick={() => toggleChamber(m.id)}
                    data-testid={`chamber-specialist-${m.id}`}
                  >
                    <span className="get-expert-help-panel__member-name">
                      {m.displayName}
                    </span>
                    <span className="get-expert-help-panel__member-specialty">
                      {m.specialty}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="guided-stage-complete__actions">
            <button
              type="button"
              className="business-estate-section-editor__save"
              disabled={selectedChamber.length === 0}
              onClick={() => inviteChamber(selectedChamber)}
              data-testid="expert-invite-selected"
            >
              Invite Chamber specialist
            </button>
            {phase === "browse_chamber" ? (
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  setMemberFilter("");
                  setPhase("pick_chamber");
                }}
                data-testid="expert-show-recommended-chamber"
              >
                Show recommended
              </button>
            ) : (
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  setMemberFilter("");
                  setPhase("browse_chamber");
                }}
                data-testid="expert-browse-all-chamber"
              >
                Browse all Chamber specialists
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "board_confirm" ? (
        <div
          className="get-expert-help-panel__board-confirm"
          data-testid="board-path-confirm"
        >
          <p className="get-expert-help-panel__lead">
            {BOARD_PATH_LABEL} uses the Board registry — not Chamber
            specialists.
          </p>
          <p className="get-expert-help-panel__lead">
            Board members who may join this review:
          </p>
          <ul className="get-expert-help-panel__member-list">
            {boardMembersPreview.map((m) => (
              <li key={m.id}>
                <div
                  className="get-expert-help-panel__member"
                  data-testid={`board-member-${m.id}`}
                >
                  <span className="get-expert-help-panel__member-name">
                    {m.name}
                  </span>
                  <span className="get-expert-help-panel__member-specialty">
                    {m.role} · Board
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="guided-stage-complete__actions">
            <button
              type="button"
              className="business-estate-section-editor__save"
              onClick={startBoard}
              data-testid="start-board-discussion"
            >
              Start Board discussion
            </button>
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => setPhase("kind")}
            >
              Back
            </button>
          </div>
        </div>
      ) : null}

      {phase === "shari_rec" && shariRec ? (
        <div
          className="get-expert-help-panel__shari"
          data-testid="expert-shari-rec"
        >
          <p>{shariRec.rationale}</p>
          <p className="get-expert-help-panel__lead">
            Recommended path:{" "}
            <strong>
              {shariRec.path === "continue_with_shari"
                ? "Continue with Shari"
                : shariRec.path === "ask_chamber_specialist"
                  ? CHAMBER_PATH_LABEL
                  : shariRec.path === "take_to_board"
                    ? BOARD_PATH_LABEL
                    : "Ask Shari in conversation"}
            </strong>
          </p>
          <div className="guided-stage-complete__actions">
            <button
              type="button"
              className="business-estate-section-editor__save"
              onClick={() => confirmShariPath(shariRec)}
              data-testid="expert-accept-shari-rec"
            >
              Continue with this recommendation
            </button>
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => setPhase("kind")}
            >
              Choose a different path
            </button>
          </div>
        </div>
      ) : null}

      {phase === "research_redirect" ? (
        <div data-testid="research-path-redirect">
          <p className="get-expert-help-panel__lead">
            Deep research stays with Shari in conversation — separate from
            Chamber and Board. Close this and ask in chat when you want to dig
            in.
          </p>
          <button
            type="button"
            className="business-estate-section-editor__save"
            onClick={onReturn}
          >
            Return to area
          </button>
        </div>
      ) : null}

      {phase === "board_result" && board && boardSummary ? (
        <div
          className="get-expert-help-panel__board"
          data-testid="expert-board-result"
        >
          <h3>{board.title}</h3>
          <p className="business-estate-research-layer-label">
            Board discussion (Board registry)
          </p>
          <p className="get-expert-help-panel__lead">Areas of agreement</p>
          <ul>
            {boardSummary.agreement.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="get-expert-help-panel__lead">Differences</p>
          <ul>
            {boardSummary.differences.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="get-expert-help-panel__lead">Key decision points</p>
          <ul>
            {boardSummary.decisionPoints.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p>
            <strong>Recommended next step:</strong> {boardSummary.nextStep}
          </p>
        </div>
      ) : null}

      {phase === "active_chamber" ||
      phase === "board_result" ||
      phase === "suggest" ? (
        <div
          className="get-expert-help-panel__actions"
          data-testid="expert-help-actions"
        >
          {phase === "active_chamber" ? (
            <>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() =>
                  setNotice(
                    "Ask in chat — Chamber context is attached. Profile unchanged.",
                  )
                }
              >
                Ask another question
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  setSelectedChamber([]);
                  setPhase("pick_chamber");
                }}
              >
                Invite a second Chamber specialist
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={handleSaveChamberAdvice}
                data-testid="expert-save-advice"
              >
                Save advice
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={handleSaveChamberAdvice}
                data-testid="expert-suggest-changes"
              >
                Suggest changes
              </button>
            </>
          ) : null}
          {phase === "board_result" ? (
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => {
                const ctx = context ?? ensureContext();
                const changes = buildSuggestedChangesFromAdvice(
                  ctx,
                  board?.title ?? "Board discussion",
                );
                setSuggestions(changes);
                setPhase("suggest");
              }}
              data-testid="expert-suggest-changes"
            >
              Suggest changes
            </button>
          ) : null}
          <button
            type="button"
            className="business-estate-section-editor__save"
            onClick={onReturn}
            data-testid="expert-return-to-area"
          >
            Return to area
          </button>
        </div>
      ) : null}

      {phase === "suggest" && suggestions.length ? (
        <div
          className="get-expert-help-panel__suggestions"
          data-testid="expert-suggested-changes"
        >
          <p className="get-expert-help-panel__lead">
            Advice only — nothing is applied until you approve.
          </p>
          {suggestions.map((s) => (
            <article key={s.path} className="get-expert-help-panel__suggestion">
              <p>
                <strong>{s.path}</strong>
              </p>
              <p>Current: {s.currentValue || "(empty)"}</p>
              <p>Suggested: {s.suggestedValue}</p>
              <p>Reason: {s.reason}</p>
              <p>Source: {s.sourceLabel}</p>
            </article>
          ))}
          <div className="guided-stage-complete__actions">
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() =>
                setNotice(
                  "Edit the field in your area, then Save Changes — advice never auto-applies.",
                )
              }
              data-testid="expert-apply-requires-edit"
            >
              Apply
            </button>
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() =>
                setNotice("Edit in your area when ready. Profile unchanged.")
              }
            >
              Edit
            </button>
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() =>
                setNotice("Kept as advice only. Profile unchanged.")
              }
            >
              Keep as advice only
            </button>
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() =>
                setPhase(
                  mode === "board_discussion"
                    ? "board_result"
                    : "active_chamber",
                )
              }
            >
              Continue discussion
            </button>
          </div>
        </div>
      ) : null}

      {notice ? (
        <p className="guided-estate-field__notice" role="status">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
