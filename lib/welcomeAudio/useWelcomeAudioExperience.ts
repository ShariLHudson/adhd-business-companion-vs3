"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";
import {
  clearWelcomeRoomGestureUnlock,
  hasPendingWelcomeRoomGestureUnlock,
} from "@/lib/welcomeRoom/welcomeRoomGesture";
import {
  getWelcomeRoomAmbienceEnabled,
  setWelcomeRoomAmbienceEnabled,
} from "@/lib/welcomeRoom/persistence";
import { isWelcomeAudioSessionUnlocked } from "./audioUnlock";
import { WelcomeAudioManager } from "./WelcomeAudioManager";
import { resolveWelcomeAudioProfile } from "./profiles";
import { attachWelcomeRoomAudioManager } from "./welcomeRoomAudioSession";
import type {
  WelcomePlaybackProgress,
  WelcomeVoiceTransportState,
} from "./types";

type Options = {
  profileId: string;
  active: boolean;
  immersive?: boolean;
  paused?: boolean;
};

const EMPTY_PROGRESS: WelcomePlaybackProgress = {
  currentSeconds: 0,
  totalSeconds: 0,
  ratio: 0,
};

export function useWelcomeAudioExperience({
  profileId,
  active,
  immersive = true,
  paused = false,
}: Options) {
  const profile = resolveWelcomeAudioProfile(profileId);
  const managerRef = useRef<WelcomeAudioManager | null>(null);
  const [musicMuted, setMusicMutedState] = useState(() => !getWelcomeRoomAmbienceEnabled());
  const [voiceMuted, setVoiceMutedState] = useState(false);
  const [ambienceAvailable, setAmbienceAvailable] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [voiceState, setVoiceState] =
    useState<WelcomeVoiceTransportState>("idle");
  const [voiceReady, setVoiceReady] = useState(false);
  const [voiceClipCount, setVoiceClipCount] = useState(0);
  const [progress, setProgress] = useState<WelcomePlaybackProgress>(EMPTY_PROGRESS);

  useLayoutEffect(() => {
    if (!profile) return;
    const manager =
      profile.id === "welcome-room"
        ? attachWelcomeRoomAudioManager()
        : new WelcomeAudioManager(profile);
    if (!manager) return;
    if (profile.id === "welcome-room") {
      manager.setMusicMuted(!getWelcomeRoomAmbienceEnabled());
    }
    managerRef.current = manager;

    const unsubVoice = manager.onVoiceStateChange((state) => {
      setVoiceState(state);
      setVoiceReady(manager.isVoiceReady());
      setVoiceClipCount(manager.getVoiceClipCount());
    });
    const unsubUnlock = manager.onAudioUnlockChange(setAudioUnlocked);
    const unsubProgress = manager.onProgressChange(setProgress);

    setAudioUnlocked(manager.isAudioUnlocked());
    setVoiceState(manager.getVoiceState());
    setVoiceReady(manager.isVoiceReady());
    setVoiceClipCount(manager.getVoiceClipCount());
    setProgress(manager.getPlaybackProgress());

    void manager.probeAmbience().then(setAmbienceAvailable);
    void manager.preloadVoice();

    if (!prefersReducedMotion()) {
      manager.beginImmersiveWelcome();
    }

    const startExperience = () => {
      void manager.playExperience().then((unlocked) => {
        if (unlocked) {
          clearWelcomeRoomGestureUnlock();
          setAudioUnlocked(true);
        }
      });
    };

    manager.adoptSessionUnlock();
    if (manager.isAudioUnlocked()) {
      setAudioUnlocked(true);
    }

    if (
      hasPendingWelcomeRoomGestureUnlock() ||
      isWelcomeAudioSessionUnlocked()
    ) {
      startExperience();
    }

    return () => {
      unsubVoice();
      unsubUnlock();
      unsubProgress();
      if (profile.id !== "welcome-room") {
        manager.destroy();
      }
      managerRef.current = null;
    };
  }, [profile]);

  useEffect(() => {
    if (!active || !immersive || paused) {
      managerRef.current?.pauseExperience();
      return;
    }
    const manager = managerRef.current;
    if (!manager) return;
    if (
      !manager.isAudioUnlocked() &&
      (hasPendingWelcomeRoomGestureUnlock() || isWelcomeAudioSessionUnlocked())
    ) {
      void manager.playExperience().then((unlocked) => {
        if (unlocked) {
          clearWelcomeRoomGestureUnlock();
          setAudioUnlocked(true);
        }
      });
      return;
    }
    if (!manager.isAudioUnlocked()) return;
    if (manager.getVoiceState() === "idle" || manager.getVoiceState() === "ended") {
      void manager.playExperience();
      return;
    }
    manager.resumeExperience();
  }, [active, immersive, paused]);

  useEffect(() => {
    managerRef.current?.setMusicMuted(musicMuted);
  }, [musicMuted]);

  useEffect(() => {
    managerRef.current?.setVoiceMuted(voiceMuted);
  }, [voiceMuted]);

  const playExperience = useCallback(async () => {
    const unlocked = (await managerRef.current?.playExperience()) ?? false;
    setAudioUnlocked(unlocked || (managerRef.current?.isAudioUnlocked() ?? false));
    return unlocked;
  }, []);

  const pauseExperience = useCallback(() => {
    managerRef.current?.pauseExperience();
  }, []);

  const stopExperience = useCallback(async () => {
    await managerRef.current?.stopExperience();
    setProgress(EMPTY_PROGRESS);
  }, []);

  const restartExperience = useCallback(async () => {
    await managerRef.current?.restartExperience();
  }, []);

  const resumeExperience = useCallback(() => {
    managerRef.current?.resumeExperience();
  }, []);

  const toggleMusic = useCallback(() => {
    const next = !musicMuted;
    setMusicMutedState(next);
    setWelcomeRoomAmbienceEnabled(!next);
    managerRef.current?.setMusicMuted(next);
    if (!next && audioUnlocked && voiceState !== "idle") {
      void managerRef.current?.playExperience();
    }
  }, [musicMuted, audioUnlocked, voiceState]);

  const toggleVoice = useCallback(() => {
    const next = !voiceMuted;
    setVoiceMutedState(next);
    managerRef.current?.setVoiceMuted(next);
  }, [voiceMuted]);

  return {
    musicMuted,
    voiceMuted,
    ambienceAvailable,
    audioUnlocked,
    toggleMusic,
    toggleVoice,
    voiceState,
    voiceReady,
    voiceClipCount,
    voiceAvailable: Boolean(profile?.voice),
    progress,
    playExperience,
    pauseExperience,
    stopExperience,
    restartExperience,
    resumeExperience,
  };
}
