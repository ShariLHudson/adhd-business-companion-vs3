"use client";

import { useEffect, useState } from "react";
import {
  toggleDirectorAccordion,
  type BoardDirectorId,
} from "@/lib/board";
import { listVisibleBoardDirectors } from "@/lib/board/visibleDirectors";
import {
  initialMeetDirectorExperienceState,
  isMeetConversationActive,
  openMeetDirectorConversation,
  resolveMeetRouteDirector,
  returnToDirectorProfile,
  returnToDirectorsGallery,
  routeToDirectorProfilePreservingConversation,
  type MeetDirectorExperienceState,
} from "@/lib/board/meetDirector";
import {
  addDirectorToBoardReview,
  createEmptyBoardReviewState,
  isDirectorIncludedInBoardReview,
  removeDirectorFromBoardReview,
  startBoardReview,
  type BoardReviewState,
} from "@/lib/board/boardReview";
import {
  closeRoundTable,
  createClosedRoundTableNav,
  openRoundTable,
  returnToMemberPlace,
  selectRoundTableDirector,
  type RoundTableNavState,
} from "@/lib/board/roundTable";
import {
  createEmptyDirectorSessionStore,
  getDirectorSessionView,
  getRememberedConversation,
  rememberDirectorConversation,
  setDirectorAccordionOpen,
  setDirectorPortraitEnlarged,
  type DirectorSessionStore,
} from "@/lib/board/directorSessionStore";
import { BoardDirectorProfileCard } from "@/components/companion/board/BoardDirectorProfileCard";
import { BoardDirectorGalleryCard } from "@/components/companion/board/BoardDirectorGalleryCard";
import { MeetDirectorConversationOverlay } from "@/components/companion/board/MeetDirectorConversationOverlay";
import { BoardReviewTray } from "@/components/companion/board/BoardReviewTray";
import { CompactBoardDirectorSelector } from "@/components/companion/board/CompactBoardDirectorSelector";
import { RoundTableOverlay } from "@/components/companion/board/RoundTableOverlay";
import "@/app/companion/board-director-meet.css";

type Props = {
  onBackToBoardroom: () => void;
  /** Optional: open directly on a Director profile (e.g. deep link). */
  initialDirectorId?: BoardDirectorId | null;
  /** Open Round Table immediately (official Board navigation entry). */
  initialRoundTableOpen?: boolean;
  /** Restore Board Review selection when remounting Meet. */
  initialBoardReviewIds?: readonly BoardDirectorId[];
  /** Start Board discussion intake with selected Directors. */
  onStartBoardDiscussion?: (directorIds: readonly BoardDirectorId[]) => void;
  /** Sync Board Review selection to Boardroom host. */
  onBoardReviewIdsChange?: (directorIds: BoardDirectorId[]) => void;
};

/**
 * Meet the Directors + official Round Table navigation.
 * Visible Directors only (Thomas for this pass).
 */
export function BoardDirectorsMeetExperience({
  onBackToBoardroom,
  initialDirectorId = null,
  initialRoundTableOpen = false,
  initialBoardReviewIds = [],
  onStartBoardDiscussion,
  onBoardReviewIdsChange,
}: Props) {
  const [state, setState] = useState<MeetDirectorExperienceState>(() =>
    initialDirectorId
      ? routeToDirectorProfilePreservingConversation(initialDirectorId)
      : initialMeetDirectorExperienceState(),
  );
  const [boardReview, setBoardReview] = useState<BoardReviewState>(() => {
    let review = createEmptyBoardReviewState();
    for (const id of initialBoardReviewIds) {
      review = addDirectorToBoardReview(review, id);
    }
    return review;
  });

  const [roundTable, setRoundTable] = useState<RoundTableNavState>(() =>
    initialRoundTableOpen
      ? openRoundTable(createClosedRoundTableNav(), initialDirectorId)
      : createClosedRoundTableNav(),
  );
  const [session, setSession] = useState<DirectorSessionStore>(
    createEmptyDirectorSessionStore,
  );
  const [profileTransitionKey, setProfileTransitionKey] = useState(0);
  const [showFullBiographies, setShowFullBiographies] = useState(false);

  const directors = listVisibleBoardDirectors();
  const director = resolveMeetRouteDirector(state.route);
  const meetActive = isMeetConversationActive(state);
  const activeDirectorId =
    state.route.screen === "gallery" ? null : state.route.directorId;
  const viewState = activeDirectorId
    ? getDirectorSessionView(session, activeDirectorId)
    : { openAccordionId: null, portraitEnlarged: false };

  useEffect(() => {
    if (!initialRoundTableOpen) return;
    setRoundTable((prev) => openRoundTable(prev, initialDirectorId ?? null));
  }, [initialRoundTableOpen, initialDirectorId]);

  useEffect(() => {
    if (!state.conversation) return;
    setSession((prev) => rememberDirectorConversation(prev, state.conversation!));
  }, [state.conversation]);

  useEffect(() => {
    onBoardReviewIdsChange?.(boardReview.selectedDirectorIds);
  }, [boardReview.selectedDirectorIds, onBoardReviewIdsChange]);

  function openProfile(id: BoardDirectorId, opts?: { fromTable?: boolean }) {
    setProfileTransitionKey((k) => k + 1);
    setState((prev) => {
      const remembered =
        prev.route.screen !== "gallery" && prev.route.directorId === id
          ? prev.conversation
          : getRememberedConversation(session, id);
      return routeToDirectorProfilePreservingConversation(id, remembered);
    });
    if (opts?.fromTable) {
      setRoundTable((prev) => selectRoundTableDirector(prev, id));
    }
  }

  function startMeet(id: BoardDirectorId) {
    const remembered = getRememberedConversation(session, id);
    setState(openMeetDirectorConversation(id, remembered));
  }

  function closeMeetToProfile() {
    setState((prev) => {
      const next = returnToDirectorProfile(prev);
      if (next.conversation) {
        setSession((s) => rememberDirectorConversation(s, next.conversation!));
      }
      return next;
    });
  }

  function backToGallery() {
    setState(returnToDirectorsGallery());
    setRoundTable((prev) => returnToMemberPlace(prev));
  }

  function includeDirector(id: BoardDirectorId) {
    setBoardReview((prev) => addDirectorToBoardReview(prev, id));
  }

  function removeDirector(id: BoardDirectorId) {
    setBoardReview((prev) => removeDirectorFromBoardReview(prev, id));
  }

  function openMyPlaceAtTheTable() {
    const active =
      state.route.screen === "gallery" ? null : state.route.directorId;
    setRoundTable((prev) => openRoundTable(prev, active));
  }

  function onSelectDirectorFromTable(id: BoardDirectorId) {
    openProfile(id, { fromTable: true });
    setRoundTable((prev) => selectRoundTableDirector(prev, id));
    window.setTimeout(() => {
      setRoundTable((prev) => closeRoundTable(prev));
    }, 220);
  }

  function onSelectMemberPlace() {
    setState(returnToDirectorsGallery());
    setRoundTable((prev) => closeRoundTable(returnToMemberPlace(prev)));
  }

  const reviewTray = (
    <BoardReviewTray
      review={boardReview}
      onRemove={removeDirector}
      onStartBoardReview={() => {
        const next = startBoardReview(boardReview);
        setBoardReview(next);
        onStartBoardDiscussion?.(next.selectedDirectorIds);
      }}
      onContinueChoosing={backToGallery}
      onOpenDirector={(id) => openProfile(id)}
    />
  );


  const roundTableOverlay = (
    <RoundTableOverlay
      open={roundTable.open}
      activeDirectorId={roundTable.activeDirectorId}
      includedDirectorIds={boardReview.selectedDirectorIds}
      onClose={() => setRoundTable((prev) => closeRoundTable(prev))}
      onSelectDirector={onSelectDirectorFromTable}
      onSelectMemberPlace={onSelectMemberPlace}
    />
  );

  const placeAtTableBtn = (
    <button
      type="button"
      className="boardroom-btn boardroom-btn--secondary board-directors-meet__table-btn"
      data-testid="board-view-round-table"
      onClick={openMyPlaceAtTheTable}
    >
      View the Round Table
    </button>
  );

  if (state.route.screen === "gallery") {
    return (
      <div
        className="board-directors-meet"
        data-testid="board-directors-meet-gallery"
      >
        <button
          type="button"
          className="board-director-profile__back"
          onClick={onBackToBoardroom}
          data-testid="board-directors-meet-back-boardroom"
        >
          ← Return to Boardroom Home
        </button>
        <p className="boardroom-kicker">Board of Directors</p>
        <h1 className="boardroom-title">Meet the Directors</h1>
        <div className="boardroom-gold-rule" aria-hidden />
        <p className="boardroom-purpose">
          Choose Directors for a Board Review with a compact list first. Full
          biographies stay available when you want them — your Board Review
          stays with you.
        </p>
        <div className="board-directors-meet__nav-actions">{placeAtTableBtn}</div>
        {reviewTray}
        <CompactBoardDirectorSelector
          selectedIds={boardReview.selectedDirectorIds}
          onChange={(ids) => {
            setBoardReview((prev) => {
              let next = {
                ...createEmptyBoardReviewState(),
                reviewStarted: prev.reviewStarted,
              };
              for (const id of ids) {
                next = addDirectorToBoardReview(next, id);
              }
              return next;
            });
          }}
          onLearnAbout={(id) => openProfile(id)}
        />
        <div className="boardroom-actions" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="boardroom-btn boardroom-btn--ghost"
            data-testid="board-meet-toggle-biographies"
            onClick={() => setShowFullBiographies((v) => !v)}
          >
            {showFullBiographies
              ? "Hide full biographies"
              : "Browse full biographies"}
          </button>
        </div>
        {showFullBiographies ? (
          <div className="board-directors-meet__grid" role="list">
            {directors.map((d) => (
              <BoardDirectorGalleryCard
                key={d.id}
                director={d}
                included={isDirectorIncludedInBoardReview(boardReview, d.id)}
                onOpenProfile={() => openProfile(d.id)}
                onMeet={() => startMeet(d.id)}
                onInclude={() => includeDirector(d.id)}
                onRemove={() => removeDirector(d.id)}
              />
            ))}
          </div>
        ) : null}
        {roundTableOverlay}
      </div>
    );
  }

  if (!director) {
    return (
      <div className="board-directors-meet">
        <p className="boardroom-purpose">That Director isn’t available.</p>
        <button
          type="button"
          className="boardroom-btn boardroom-btn--secondary"
          onClick={backToGallery}
        >
          Back to Directors
        </button>
        {roundTableOverlay}
      </div>
    );
  }

  return (
    <div
      className="board-directors-meet board-directors-meet--profile"
      data-testid="board-directors-meet-profile-host"
      data-meet-active={meetActive ? "true" : "false"}
      data-previous-director={roundTable.previousDirectorId ?? undefined}
    >
      <div className="board-directors-meet__nav-actions">
        {placeAtTableBtn}
      </div>
      {reviewTray}
      <div
        key={`${director.id}-${profileTransitionKey}`}
        className="board-director-profile-transition"
      >
        <BoardDirectorProfileCard
          director={director}
          faded={meetActive}
          onMeet={() => startMeet(director.id)}
          onBackToGallery={backToGallery}
          onOpenPlaceAtTable={openMyPlaceAtTheTable}
          portraitEnlarged={viewState.portraitEnlarged}
          onTogglePortraitEnlarge={() => {
            if (meetActive) return;
            setSession((prev) =>
              setDirectorPortraitEnlarged(
                prev,
                director.id,
                !getDirectorSessionView(prev, director.id).portraitEnlarged,
              ),
            );
          }}
          includedInBoardReview={isDirectorIncludedInBoardReview(
            boardReview,
            director.id,
          )}
          onIncludeInBoardReview={() => includeDirector(director.id)}
          onRemoveFromBoardReview={() => removeDirector(director.id)}
          openAccordionId={viewState.openAccordionId}
          onToggleAccordion={(id) => {
            if (meetActive) return;
            setSession((prev) => {
              const current = getDirectorSessionView(prev, director.id)
                .openAccordionId;
              return setDirectorAccordionOpen(
                prev,
                director.id,
                toggleDirectorAccordion(current, id),
              );
            });
          }}
        />
      </div>

      {meetActive && state.conversation ? (
        <MeetDirectorConversationOverlay
          director={director}
          conversation={state.conversation}
          onConversationChange={(next) =>
            setState((prev) => ({ ...prev, conversation: next }))
          }
          onReturnToProfile={closeMeetToProfile}
          includedInBoardReview={isDirectorIncludedInBoardReview(
            boardReview,
            director.id,
          )}
          onAddToBoardReview={() => includeDirector(director.id)}
          onTakeToBoard={() => {
            includeDirector(director.id);
            closeMeetToProfile();
            onStartBoardDiscussion?.([
              ...new Set([...boardReview.selectedDirectorIds, director.id]),
            ]);
          }}
        />
      ) : null}
      {roundTableOverlay}
    </div>
  );
}
