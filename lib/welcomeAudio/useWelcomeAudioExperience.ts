"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (!profile) return;
    const manager = new WelcomeAudioManager(profile);
    manager.setMusicMuted(!getWelcomeRoomAmbienceEnabled());
    managerRef.current = manager;

    const unsubVoice = manager.onVoiceStateChange((state) => {
      setVoiceState(state);
      setVoiceReady(manager.isVoiceReady());
      setVoiceClipCount(manager.getVoiceClipCount());
    });
    const unsubUnlock = manager.onAudioUnlockChange(setAudioUnlocked);
    const unsubProgress = manager.onProgressChange(setProgress);

    void manager.probeAmbience().then(setAmbienceAvailable);
    void manager.preloadVoice();

    if (!prefersReducedMotion()) {
      manager.beginImmersiveWelcome();
    }

    const tryAutoEnter = () => {
      void manager.playExperience().then((unlocked) => {
        if (unlocked) {
          clearWelcomeRoomGestureUnlock();
          setAudioUnlocked(true);
        }
      });
    };

    if (
      hasPendingWelcomeRoomGestureUnlock() ||
      isWelcomeAudioSessionUnlocked()
    ) {
      tryAutoEnter();
    }

    return () => {
      unsubVoice();
      unsubUnlock();
      unsubProgress();
      manager.destroy();
      managerRef.current = null;
    };
  }, [profile]);

  useEffect(() => {
    managerRef.current?.setMusicMuted(musicMuted);
  }, [musicMuted]);

  useEffect(() => {
    managerRef.current?.setVoiceMuted(voiceMuted);
  }, [voiceMuted]);

  useEffect(() => {
    if (!active || !immersive) {
      managerRef.current?.pauseExperience();
      return;
    }
    if (paused) {
      managerRef.current?.pauseExperience();
      return;
    }
    managerRef.current?.resumeExperience();
  }, [active, immersive, paused]);

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
  };
}
