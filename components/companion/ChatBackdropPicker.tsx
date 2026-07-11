"use client";

import { useEffect, useState } from "react";
import {
  allBackdropOptions,
  getChatBackdropId,
  getClearMyMindBackdropId,
  getClearMyMindBackdropImageUrl,
  getRoomBackdropOverrideId,
  optionsForSurface,
  setChatBackdropId,
  setClearMyMindBackdropId,
  setRoomBackdropOverride,
  subscribeChatBackdropChange,
  type ChatBackdropOption,
} from "@/lib/chatBackdrop";
import { prepareEstateSceneTransitionFireAndForget } from "@/lib/estate/estateSceneTransition";
import { resolveCanonicalPlaceId } from "@/lib/estate/canonicalEstateRegistry";
import { preloadRoomBackground } from "@/lib/roomBackgroundPreload";

type Props = {
  /** Which surface preference this picker also updates. */
  surface: "chat" | "clear-my-mind";
  /** When set, selections apply to the active estate room and crossfade in place. */
  roomId?: string;
  onPicked?: () => void;
};

function readSelectedId(surface: "chat" | "clear-my-mind", roomId?: string): string {
  if (roomId) {
    return getRoomBackdropOverrideId(roomId) ?? (
      surface === "clear-my-mind"
        ? getClearMyMindBackdropId()
        : getChatBackdropId()
    );
  }
  return surface === "clear-my-mind"
    ? getClearMyMindBackdropId()
    : getChatBackdropId();
}

/**
 * Choose an estate environment — photograph crossfades in place for the active room.
 */
export function ChatBackdropPicker({ surface, roomId, onPicked }: Props) {
  const [selectedId, setSelectedId] = useState(() => readSelectedId(surface, roomId));
  const options = roomId ? allBackdropOptions() : optionsForSurface(surface);
  const immersive = Boolean(roomId);

  useEffect(() => {
    return subscribeChatBackdropChange(() => {
      setSelectedId(readSelectedId(surface, roomId));
    });
  }, [surface, roomId]);

  function pick(option: ChatBackdropOption) {
    const scopedRoomId = roomId ? resolveCanonicalPlaceId(roomId) : undefined;
    if (scopedRoomId) {
      setRoomBackdropOverride(scopedRoomId, option.id);
    }
    if (surface === "clear-my-mind") {
      setClearMyMindBackdropId(option.id);
      preloadRoomBackground(option.imageUrl || getClearMyMindBackdropImageUrl());
    } else {
      setChatBackdropId(option.id);
      if (option.imageUrl) preloadRoomBackground(option.imageUrl);
    }
    if (scopedRoomId && option.imageUrl) {
      prepareEstateSceneTransitionFireAndForget({
        toRoomId: scopedRoomId,
        imageUrl: option.imageUrl,
        silent: true,
        showFullPlate: true,
      });
    }
    setSelectedId(option.id);
    onPicked?.();
  }

  return (
    <div
      className="chat-backdrop-picker"
      data-testid="chat-backdrop-picker"
      data-surface={surface}
      data-immersive={immersive ? "true" : "false"}
    >
      <p className="chat-backdrop-picker__hint">
        {immersive
          ? "Choose a place in Spark Estate — your room will transition gently."
          : `Changes the image behind ${surface === "clear-my-mind" ? "Clear My Mind" : "chat"} — not the writing area.`}
      </p>
      <ul
        className="chat-backdrop-picker__list"
        role="listbox"
        aria-label="Estate environments"
      >
        {options.map((option) => {
          const active = option.id === selectedId;
          return (
            <li key={option.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={[
                  "chat-backdrop-picker__option",
                  active ? "chat-backdrop-picker__option--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => pick(option)}
                data-testid={`chat-backdrop-${option.id}`}
              >
                <span
                  className="chat-backdrop-picker__thumb"
                  style={{ backgroundImage: `url('${option.imageUrl}')` }}
                  aria-hidden
                />
                <span className="chat-backdrop-picker__meta">
                  <span className="chat-backdrop-picker__label">{option.label}</span>
                  <span className="chat-backdrop-picker__description">
                    {option.description}
                  </span>
                </span>
                <span className="chat-backdrop-picker__action" aria-hidden>
                  {active ? "Selected" : "Select"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
