"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CINEMATIC } from "@/lib/journalGazebo/cinematicTiming";
import { JOURNAL_GAZEBO_BACKGROUND_URL } from "@/lib/journalGazebo/journalGazeboMedia";
import { EstateRoomFullBleedBackground } from "@/components/companion/estate/EstateRoomFullBleedBackground";
import { EstateImmersiveHomeLink } from "@/components/companion/EstateImmersiveHomeLink";
import { SparkEstateGuideAnchor } from "@/components/companion/SparkEstateGuideAnchor";
import { EstateGuideFlipbook } from "@/components/estate-guide";
import { appendDictationToBody, plainTextFromHtml, restyleAllBlocksInEditor, sanitizePageHtml, type TypingStyle } from "@/lib/journalGazebo/writingSurface";
import { useSpeechToText } from "@/lib/growth/useSpeechToText";
import {
  createJournalConfig,
  ensureActiveJournalConfig,
  getEditingEntryId,
  hasCompletedJournalCeremony,
  isFirstJournalGazeboVisit,
  markJournalCeremonyComplete,
  markWelcomeNoteSeen,
  openJournalEntry,
  openTodaysPageJournal,
  saveJournalPage,
  setActiveJournalConfig,
  setEditingEntryId,
  updateJournalConfig,
  JOURNAL_GAZEBO_UPDATED_EVENT,
} from "@/lib/journalGazebo/store";
import {
  consumeJournalGazeboCommand,
  subscribeJournalGazeboCommands,
} from "@/lib/journalGazebo/journalGazeboCommands";
import {
  pickJournalGazeboReturnNote,
  type JournalGazeboReturnNote,
} from "@/lib/journalGazebo/returnGreetings";
import {
  JOURNAL_ON_DESK_SPARK,
  JOURNAL_OPEN_INVITE,
  JOURNAL_OPEN_TODAY_SPARK,
  JOURNAL_PAGE_SAVED,
  JOURNAL_READY_SPARK,
  JOURNAL_TOOLS,
  JOURNAL_WRITING_DESK_ARRIVAL,
} from "@/lib/journalGazebo/hospitality";
import { JournalGazeboSoundControl } from "./JournalGazeboSoundControl";
import {
  readJournalGazeboSoundMuted,
  writeJournalGazeboSoundMuted,
} from "@/lib/journalGazebo/soundPreference";
import type { JournalNoteCardBeat } from "@/lib/journalGazebo/cinematicTypes";
import { getMemberDisplayName, getMemberFirstName } from "@/lib/journalGazebo/memberDisplayName";
import { playJournalPageTurnSound, playPaperRustleSound } from "@/lib/journalGazebo/ritualSounds";
import type {
  JournalCeremonyStep,
  JournalGazeboConfig,
  JournalGazeboPhase,
} from "@/lib/journalGazebo/types";
import { JournalGazeboAmbience } from "./JournalGazeboAmbience";
import { JournalGazeboCeremonyPage } from "./JournalGazeboCeremonyPage";
import { JournalGazeboCreationWizard } from "./JournalGazeboCreationWizard";
import { gazeboSeasonBackgroundCandidates, journalGazeboAtmosphereOnly } from "@/lib/journalGazebo/seasons";
import { JournalGazeboDesignStudio } from "./JournalGazeboDesignStudio";
import {
  JournalGazeboWrappedGift,
  type GiftUnwrapMoment,
} from "./JournalGazeboWrappedGift";
import { JournalGazeboCinematicEnvironment } from "./JournalGazeboCinematicEnvironment";
import { JournalGazeboDesk, type DeskCamera } from "./JournalGazeboDesk";
import type { JournalHeroMoment } from "./JournalGazeboHeroJournal";
import {
  JournalGazeboEstateDesk,
  type EstateDeskMoment,
} from "./JournalGazeboEstateDesk";
import { JournalGazeboPrototypeRail } from "./JournalGazeboPrototypeRail";
import { JournalGazeboOpenBook } from "./JournalGazeboOpenBook";
import { JournalGazeboOptionsMenu } from "./JournalGazeboOptionsMenu";
import { JournalGazeboDoneButton } from "./JournalGazeboDoneButton";
import { JournalGazeboLibraryShelf } from "./JournalGazeboLibraryShelf";
import { JournalGazeboJournalPicker } from "./JournalGazeboJournalPicker";
import { JournalGazeboSanctuaryDesk } from "./JournalGazeboSanctuaryDesk";
import {
  getLibraryJournals,
} from "@/lib/journalGazebo/journalLibrary";
import { JournalGazeboWritingPreferences } from "./JournalGazeboWritingPreferences";
import { JournalGazeboWritingPage } from "./JournalGazeboWritingPage";
import {
  FIRST_WRITING_PAGE_INDEX,
  getJournalPlace,
  getPageBody,
  resolvePageTypingStyle,
  saveJournalPlace,
  savePageBody,
  savePageTypingStyle,
} from "@/lib/journalGazebo/journalPageStorage";
import { JOURNAL_RIBBON_CENTER_Y } from "@/lib/journalGazebo/journalRibbon";
import {
  recordJournalReturnSession,
  resolveJournalGazeboRestScenes,
  resolveJournalWelcomeScenes,
  resolveJournalWorkshopScenes,
  type JournalSessionScenes,
} from "@/lib/journalGazebo/journalSceneRotation";
import "./journal-gazebo.css";

type Props = {
  onBack: () => void;
  backLabel?: string | null;
  prototypeMode?: boolean;
  /** Prototype route — session reset before mount; avoids first/return race. */
  assumeFirstVisit?: boolean;
};

const AUTOSAVE_MS = 1500;
const DESK_REVEAL_MS = Math.round(500 * 1.18);

const GENTLE_PROMPTS = [
  "What feels most true right now?",
  "Is there one line you want to remember tomorrow?",
];

const GUIDED_PROMPTS = [
  "What felt heavy today?",
  "What am I grateful for?",
  "A lesson I want to remember",
];

export function JournalGazeboExperience({
  onBack,
  backLabel = "Companion",
  prototypeMode = false,
  assumeFirstVisit = false,
}: Props) {
  const [phase, setPhase] = useState<JournalGazeboPhase>(() =>
    assumeFirstVisit ? "estate" : "arrival",
  );
  const [config, setConfig] = useState<JournalGazeboConfig | null>(null);
  const [deskOpen, setDeskOpen] = useState(false);
  const [body, setBody] = useState("");
  const [dedicationHtml, setDedicationHtml] = useState("");
  const [entryId, setEntryId] = useState<string | null>(null);
  const [sparkLine, setSparkLine] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [showTime, setShowTime] = useState(true);
  const [returnNote, setReturnNote] = useState<JournalGazeboReturnNote | null>(null);
  const [deskCamera, setDeskCamera] = useState<DeskCamera>("wide");
  const [ceremonyStep, setCeremonyStep] = useState<JournalCeremonyStep>(0);
  const [bookPageIndex, setBookPageIndex] = useState(0);
  const [tasselY, setTasselY] = useState(18);
  const [estateMoment, setEstateMoment] = useState<EstateDeskMoment>(() =>
    assumeFirstVisit ? "ready" : "settling",
  );
  const [noteCardBeat, setNoteCardBeat] = useState<JournalNoteCardBeat>("waiting");
  const [giftMoment, setGiftMoment] = useState<GiftUnwrapMoment>("wrapped");
  const [journalRevealArrived, setJournalRevealArrived] = useState(false);
  const [centeredBookActive, setCenteredBookActive] = useState(false);
  const [memberDisplayName, setMemberDisplayName] = useState("");
  const cinematicTimersRef = useRef<number[]>([]);
  const [visitMode, setVisitMode] = useState<"pending" | "first" | "return">(() =>
    assumeFirstVisit ? "first" : "pending",
  );
  const [sessionScenes, setSessionScenes] = useState<JournalSessionScenes | null>(null);
  const [sceneSettled, setSceneSettled] = useState(false);
  const [estateGuideOpen, setEstateGuideOpen] = useState(false);
  const [journalPickerOpen, setJournalPickerOpen] = useState(false);
  const [writingPrefsOpen, setWritingPrefsOpen] = useState(false);
  const [pageTypingStyle, setPageTypingStyle] = useState<TypingStyle | null>(null);
  const [libraryJournals, setLibraryJournals] = useState<JournalGazeboConfig[]>([]);
  const [dateLabel, setDateLabel] = useState("");
  const [timeLabel, setTimeLabel] = useState("");

  const arrivalBreatheMs = CINEMATIC.arrivalMs;
  const estateReadyMs = CINEMATIC.estateStillnessMs;

  const scheduleCinematic = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    cinematicTimersRef.current.push(id);
    return id;
  }, []);

  const refreshLibrary = useCallback(() => {
    setLibraryJournals(getLibraryJournals());
  }, []);

  const clearCinematicTimers = useCallback(() => {
    for (const id of cinematicTimersRef.current) {
      window.clearTimeout(id);
    }
    cinematicTimersRef.current = [];
  }, []);

  useEffect(() => () => clearCinematicTimers(), [clearCinematicTimers]);

  const autosaveRef = useRef<number | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const openFallbackRef = useRef<number | null>(null);
  const openCompletedRef = useRef(false);

  const [useAtmosphere, setUseAtmosphere] = useState(false);
  const backgroundCandidates = useMemo(() => {
    if (prototypeMode) {
      const plates = gazeboSeasonBackgroundCandidates(undefined, {
        atmosphereOnly: false,
      });
      if (plates.length > 0) return plates;
      return [JOURNAL_GAZEBO_BACKGROUND_URL];
    }
    if (useAtmosphere) return [];
    return [JOURNAL_GAZEBO_BACKGROUND_URL];
  }, [prototypeMode, useAtmosphere]);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [sceneComposed, setSceneComposed] = useState(assumeFirstVisit || prototypeMode);
  const [soundMuted, setSoundMuted] = useState(false);
  const backgroundUrl = backgroundCandidates[backgroundIndex] ?? null;

  useLayoutEffect(() => {
    setSoundMuted(readJournalGazeboSoundMuted());
  }, []);

  useLayoutEffect(() => {
    setMemberDisplayName(getMemberDisplayName());
    refreshLibrary();
  }, [refreshLibrary]);

  useEffect(() => {
    if (prototypeMode) return;
    if (journalGazeboAtmosphereOnly() && visitMode === "return") {
      setUseAtmosphere(true);
    }
  }, [prototypeMode, visitMode]);

  useEffect(() => {
    if (backgroundUrl) return;
    if (useAtmosphere || prototypeMode) {
      const timer = window.setTimeout(() => setSceneComposed(true), 120);
      return () => window.clearTimeout(timer);
    }
  }, [backgroundUrl, useAtmosphere, prototypeMode]);

  useEffect(() => {
    if (!showWelcomeDesk && phase !== "gazebo-rest") return;
    const timer = window.setTimeout(() => setSceneComposed(true), 350);
    return () => window.clearTimeout(timer);
  }, [showWelcomeDesk, phase]);

  useLayoutEffect(() => {
    if (prototypeMode && assumeFirstVisit) {
      setVisitMode("first");
      return;
    }
    setVisitMode(isFirstJournalGazeboVisit() ? "first" : "return");
  }, [prototypeMode, assumeFirstVisit]);

  useEffect(() => {
    const now = new Date();
    setDateLabel(
      now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
    setTimeLabel(
      now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    );
  }, []);

  const isFirstVisit = visitMode !== "return";

  const showWelcomeLetter = isFirstVisit && phase === "estate";

  const showWelcomeDesk = showWelcomeLetter;

  const openBookActive =
    config != null &&
    (phase === "journal-reveal" ||
      phase === "journal-opening" ||
      phase === "ceremony" ||
      phase === "writing");

  const showSanctuaryDesk =
    phase === "gazebo-rest" && !openBookActive && !deskOpen && !journalPickerOpen;

  const featuredJournal = useMemo(() => {
    if (config) return config;
    if (libraryJournals.length > 0) return libraryJournals[0]!;
    return null;
  }, [config, libraryJournals]);

  const estateWelcomeVisible =
    showWelcomeDesk ||
    phase === "writing-desk-arrival";

  const estateVisible =
    estateWelcomeVisible ||
    phase === "gazebo-rest" ||
    phase === "creating" ||
    phase === "gift-unwrap" ||
    phase === "journal-reveal" ||
    phase === "journal-opening";

  const firstCreationCeremony =
    config != null && !hasCompletedJournalCeremony(config.id);

  const cinematicJournalVisible = openBookActive;

  const deskVisible =
    (phase === "journal-desk" ||
      phase === "ceremony" ||
      phase === "writing") &&
    config != null &&
    !cinematicJournalVisible;

  const journalMoment: JournalHeroMoment =
    phase === "writing" || phase === "ceremony"
      ? "open"
      : phase === "journal-opening" || phase === "journal-reveal"
        ? phase === "journal-opening"
          ? "opening"
          : "closed"
        : "closed";

  const ambienceActive = phase !== "desk" && !deskOpen;

  const cameraBlurred =
    phase === "letter" ||
    estateMoment === "letter-fading" ||
    estateMoment === "letter-closing";

  const handleBookPageIndexChange = useCallback(
    (next: number) => {
      if (!config) return;
      const currentStyle =
        pageTypingStyle ?? resolvePageTypingStyle(config.id, bookPageIndex, config);
      if (bookPageIndex >= FIRST_WRITING_PAGE_INDEX) {
        savePageBody(config.id, bookPageIndex, body);
        savePageTypingStyle(config.id, bookPageIndex, currentStyle);
      } else if (bookPageIndex === 0 && dedicationHtml.trim()) {
        savePageBody(config.id, 0, dedicationHtml);
      }
      saveJournalPlace(config.id, { pageIndex: next, tasselY });
      setBookPageIndex(next);
      if (next >= FIRST_WRITING_PAGE_INDEX) {
        if (!hasCompletedJournalCeremony(config.id)) {
          markJournalCeremonyComplete(config.id);
          refreshLibrary();
        }
        setCeremonyStep(3);
        setPhase("writing");
        setBody(getPageBody(config.id, next));
        setPageTypingStyle(resolvePageTypingStyle(config.id, next, config));
        window.setTimeout(() => paperRef.current?.focus(), 350);
        return;
      }
      setCeremonyStep(next as JournalCeremonyStep);
      setPhase("ceremony");
      if (next < FIRST_WRITING_PAGE_INDEX) {
        setBody("");
        setPageTypingStyle(null);
      }
    },
    [body, bookPageIndex, config, dedicationHtml, pageTypingStyle, tasselY, refreshLibrary],
  );

  const handleTasselYChange = useCallback(
    (y: number) => {
      setTasselY(y);
      if (config) saveJournalPlace(config.id, { pageIndex: bookPageIndex, tasselY: y });
    },
    [bookPageIndex, config],
  );

  const enterWriting = useCallback(() => {
    if (!config) return;
    setPhase("writing");
    setDeskCamera("writing");
    setSparkLine(null);
    setBookPageIndex(FIRST_WRITING_PAGE_INDEX);
    setBody(getPageBody(config.id, FIRST_WRITING_PAGE_INDEX));
    setPageTypingStyle(resolvePageTypingStyle(config.id, FIRST_WRITING_PAGE_INDEX, config));
    window.setTimeout(() => paperRef.current?.focus(), 500);
  }, [config]);

  const openJournalAtSavedPlace = useCallback((journal: JournalGazeboConfig) => {
    const ceremonyDone = hasCompletedJournalCeremony(journal.id);
    const place = getJournalPlace(journal.id);
    setConfig(journal);
    setCenteredBookActive(true);
    setTasselY(place.tasselY);
    openCompletedRef.current = ceremonyDone;
    if (ceremonyDone) {
      const page = Math.max(place.pageIndex, FIRST_WRITING_PAGE_INDEX);
      setBookPageIndex(page);
      setBody(getPageBody(journal.id, page));
      setPageTypingStyle(resolvePageTypingStyle(journal.id, page, journal));
      setPhase(page >= FIRST_WRITING_PAGE_INDEX ? "writing" : "ceremony");
      setDeskCamera("writing");
      setDeskOpen(false);
      return;
    }
    setBookPageIndex(0);
    setBody("");
    setDedicationHtml(getPageBody(journal.id, 0));
    setTasselY(JOURNAL_RIBBON_CENTER_Y);
    setPhase("journal-reveal");
  }, []);

  const finishJournalOpen = useCallback(() => {
    if (openCompletedRef.current) return;
    openCompletedRef.current = true;
    setCenteredBookActive(true);
    if (openFallbackRef.current) {
      window.clearTimeout(openFallbackRef.current);
      openFallbackRef.current = null;
    }
    setDeskCamera("writing");
    setBookPageIndex(0);
    if (config && !hasCompletedJournalCeremony(config.id)) {
      setCeremonyStep(0);
      setBody("");
      setDedicationHtml(getPageBody(config.id, 0));
      setTasselY(JOURNAL_RIBBON_CENTER_Y);
      setPhase("ceremony");
      return;
    }
    if (config) {
      const place = getJournalPlace(config.id);
      setBookPageIndex(place.pageIndex);
      setTasselY(place.tasselY);
      setBody(getPageBody(config.id, place.pageIndex));
      if (place.pageIndex < FIRST_WRITING_PAGE_INDEX) {
        setDedicationHtml(getPageBody(config.id, 0));
      }
      if (place.pageIndex >= FIRST_WRITING_PAGE_INDEX) {
        setPageTypingStyle(resolvePageTypingStyle(config.id, place.pageIndex, config));
      }
      setPhase(place.pageIndex >= FIRST_WRITING_PAGE_INDEX ? "writing" : "ceremony");
      return;
    }
    enterWriting();
  }, [config, enterWriting]);

  const beginJournalOpen = useCallback(() => {
    if (phase !== "journal-reveal") return;
    openCompletedRef.current = false;
    setSparkLine(null);
    setPhase("journal-opening");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      window.setTimeout(finishJournalOpen, 80);
      return;
    }
    openFallbackRef.current = window.setTimeout(
      finishJournalOpen,
      CINEMATIC.journalCoverOpenMs,
    );
  }, [finishJournalOpen, phase]);

  const handleBackToCover = useCallback(() => {
    if (!config) return;
    const currentStyle =
      pageTypingStyle ?? resolvePageTypingStyle(config.id, bookPageIndex, config);
    if (bookPageIndex >= FIRST_WRITING_PAGE_INDEX) {
      savePageBody(config.id, bookPageIndex, body);
      savePageTypingStyle(config.id, bookPageIndex, currentStyle);
    } else if (bookPageIndex === 0 && dedicationHtml.trim()) {
      savePageBody(config.id, 0, dedicationHtml);
    }
    saveJournalPlace(config.id, { pageIndex: bookPageIndex, tasselY });
    if (openFallbackRef.current) {
      window.clearTimeout(openFallbackRef.current);
      openFallbackRef.current = null;
    }
    openCompletedRef.current = false;
    setSparkLine(null);
    setPhase("journal-reveal");
  }, [body, bookPageIndex, config, dedicationHtml, pageTypingStyle, tasselY]);

  const handleJournalOpen = useCallback(() => {
    if (
      (phase !== "journal-desk" && phase !== "gazebo-rest") ||
      deskCamera === "writing"
    ) {
      return;
    }
    if (
      (phase === "gazebo-rest" || phase === "journal-desk") &&
      deskCamera === "wide"
    ) {
      setDeskCamera("approach");
      window.setTimeout(() => setSparkLine(JOURNAL_OPEN_INVITE), 700);
      return;
    }
    if (phase === "gazebo-rest" && deskCamera === "approach") {
      openCompletedRef.current = false;
      setPhase("journal-opening");
      setSparkLine(null);
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reducedMotion) {
        window.setTimeout(finishJournalOpen, 80);
        return;
      }
      openFallbackRef.current = window.setTimeout(
        finishJournalOpen,
        CINEMATIC.journalCoverOpenMs,
      );
      return;
    }
    if (phase !== "journal-desk" || deskCamera !== "approach") return;

    openCompletedRef.current = false;
    setPhase("journal-opening");
    setSparkLine(null);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      window.setTimeout(finishJournalOpen, 80);
      return;
    }
    openFallbackRef.current = window.setTimeout(finishJournalOpen, CINEMATIC.journalCoverOpenMs);
  }, [deskCamera, finishJournalOpen, phase]);

  const presentJournalOnDesk = useCallback(
    (journal: JournalGazeboConfig, line?: string | null) => {
      openCompletedRef.current = false;
      setConfig(journal);
      setDeskCamera("wide");
      setPhase("journal-desk");
      setDeskOpen(false);
      if (line) setSparkLine(line);

      const revealMs = line ? CINEMATIC.sparkLineMs : DESK_REVEAL_MS;

      window.setTimeout(() => {
        setDeskCamera("approach");
        window.setTimeout(() => {
          setSparkLine(JOURNAL_OPEN_INVITE);
          window.setTimeout(
            () => setSparkLine(null),
            CINEMATIC.sparkInviteMs,
          );
        }, 900);
      }, revealMs);
    },
    [],
  );

  const replayArrival = useCallback(() => {
    clearCinematicTimers();
    setPhase("arrival");
    setEstateMoment("settling");
    setNoteCardBeat("waiting");
    setGiftMoment("wrapped");
    setJournalRevealArrived(false);
    setCenteredBookActive(false);
    setSparkLine(null);
    setConfig(null);
    setBody("");
    setEntryId(null);
    setDeskOpen(false);
    setDeskCamera("wide");
    setCeremonyStep(0);
    setBookPageIndex(0);
    setReturnNote(null);
    setEditingEntryId(null);
    setVisitMode("first");
    openCompletedRef.current = false;
    if (openFallbackRef.current) {
      window.clearTimeout(openFallbackRef.current);
      openFallbackRef.current = null;
    }
  }, [clearCinematicTimers]);

  const beginWriting = useCallback(
    (journal: JournalGazeboConfig) => {
      const place = getJournalPlace(journal.id);
      const page = Math.max(place.pageIndex, FIRST_WRITING_PAGE_INDEX);
      setConfig(journal);
      setCenteredBookActive(true);
      setBookPageIndex(page);
      setBody(getPageBody(journal.id, page));
      setTasselY(place.tasselY);
      setPhase("writing");
      setDeskOpen(false);
      window.setTimeout(() => paperRef.current?.focus(), 400);
    },
    [],
  );

  useEffect(() => {
    return subscribeJournalGazeboCommands(() => {
      const command = consumeJournalGazeboCommand();
      if (!command) return;
      const journal = config ?? ensureActiveJournalConfig();
      switch (command.kind) {
        case "open_journal":
          if (visitMode === "return") {
            openJournalAtSavedPlace(journal);
          } else {
            presentJournalOnDesk(journal);
          }
          break;
        case "create_journal":
          setConfig(journal);
          setPhase("creating");
          break;
        case "resume_journal":
          beginWriting(journal);
          break;
        case "open_writing_tools":
          setConfig(journal);
          setPhase("creating");
          break;
        default: {
          const _exhaustive: never = command.kind;
          return _exhaustive;
        }
      }
    });
  }, [
    beginWriting,
    config,
    openJournalAtSavedPlace,
    presentJournalOnDesk,
    visitMode,
  ]);

  const jumpToPhase = useCallback(
    (target: JournalGazeboPhase) => {
      setDeskOpen(false);
      setSparkLine(null);
      if (target === "arrival") {
        replayArrival();
        return;
      }
      if (target === "welcome-note" || target === "letter") {
        setVisitMode("first");
        setPhase("letter");
        setEstateMoment("letter");
        return;
      }
      if (target === "estate") {
        setVisitMode("first");
        setPhase("estate");
        setEstateMoment("ready");
        return;
      }
      if (target === "creating") {
        setVisitMode("first");
        markWelcomeNoteSeen();
        setPhase("creating");
        return;
      }
      if (target === "journal-desk") {
        const journal = config ?? openTodaysPageJournal();
        setConfig(journal);
        setBody("");
        setEntryId(null);
        setDeskCamera("approach");
        setPhase("journal-desk");
        return;
      }
      if (target === "writing") {
        const journal = config ?? openTodaysPageJournal();
        beginWriting(journal);
      }
    },
    [beginWriting, config, replayArrival],
  );

  useEffect(() => {
    if (visitMode === "pending") return;
    setSceneSettled(false);
    if (visitMode === "return") {
      setSessionScenes(recordJournalReturnSession());
      return;
    }
    setSessionScenes(null);
  }, [visitMode]);

  useEffect(() => {
    if (!sessionScenes?.settledUrl || !sessionScenes.transitionAfterMs) return;
    const timer = window.setTimeout(
      () => setSceneSettled(true),
      sessionScenes.transitionAfterMs,
    );
    return () => window.clearTimeout(timer);
  }, [sessionScenes]);

  useEffect(() => {
    if (visitMode === "pending") return;
    if (visitMode === "first") {
      setPhase("estate");
      setEstateMoment("ready");
      return;
    }
    refreshLibrary();
    const journals = getLibraryJournals();
    if (journals.length > 0) {
      setConfig(ensureActiveJournalConfig());
    } else {
      setConfig(null);
    }
    setReturnNote(pickJournalGazeboReturnNote());
    setDeskCamera("wide");
    setPhase("gazebo-rest");
  }, [visitMode]);

  useEffect(() => {
    if (visitMode !== "first" || phase !== "estate") return;
    if (prototypeMode) return;
    const timer = window.setTimeout(() => setEstateMoment("ready"), estateReadyMs);
    return () => window.clearTimeout(timer);
  }, [visitMode, phase, estateReadyMs, prototypeMode]);

  useEffect(() => {
    if (phase !== "journal-desk" || deskCamera !== "approach") return;
    if (firstCreationCeremony) return;
    const timer = window.setTimeout(() => {
      openCompletedRef.current = false;
      setCenteredBookActive(true);
      setPhase("journal-opening");
      setSparkLine(null);
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reducedMotion) {
        window.setTimeout(finishJournalOpen, 80);
        return;
      }
      openFallbackRef.current = window.setTimeout(
        finishJournalOpen,
        CINEMATIC.journalCoverOpenMs,
      );
    }, 900);
    return () => window.clearTimeout(timer);
  }, [phase, deskCamera, finishJournalOpen, firstCreationCeremony]);

  useEffect(() => {
    if (phase !== "journal-reveal") {
      setJournalRevealArrived(false);
      return;
    }
    const timer = window.setTimeout(() => setJournalRevealArrived(true), 120);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const existingId = getEditingEntryId();
    if (!existingId || visitMode !== "return") return;
    const entry = openJournalEntry(existingId);
    if (entry) {
      setBody(entry.body);
      setEntryId(entry.id);
      const active = ensureActiveJournalConfig();
      setConfig(active);
      openJournalAtSavedPlace(active);
    }
  }, [visitMode, openJournalAtSavedPlace]);

  useEffect(() => {
    if (!savedNote) return;
    const timer = window.setTimeout(() => setSavedNote(null), 2400);
    return () => window.clearTimeout(timer);
  }, [savedNote]);

  useEffect(() => {
    if (phase !== "writing" || !config || config.writingMode === "silent") return;
    const prompts =
      config.writingMode === "guided" ? GUIDED_PROMPTS : GENTLE_PROMPTS;
    const timer = window.setInterval(() => {
      setSparkLine(prompts[Math.floor(Math.random() * prompts.length)]!);
    }, config.writingMode === "guided" ? 45_000 : 90_000);
    return () => window.clearInterval(timer);
  }, [phase, config]);

  useEffect(() => {
    const onUpdate = () => {
      refreshLibrary();
      if (config?.id) {
        const next = ensureActiveJournalConfig();
        if (next.id === config.id) setConfig(next);
      }
    };
    window.addEventListener(JOURNAL_GAZEBO_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(JOURNAL_GAZEBO_UPDATED_EVENT, onUpdate);
  }, [config?.id, refreshLibrary]);

  const openSelectedJournal = useCallback(
    (journal: JournalGazeboConfig) => {
      setActiveJournalConfig(journal.id);
      setConfig(journal);
      setEntryId(null);
      setEditingEntryId(null);
      setJournalPickerOpen(false);
      openJournalAtSavedPlace(journal);
      setSparkLine(JOURNAL_OPEN_TODAY_SPARK);
      window.setTimeout(() => setSparkLine(null), CINEMATIC.sparkLineMs);
    },
    [openJournalAtSavedPlace],
  );

  function runNoteCardCinematic() {
    clearCinematicTimers();
    setPhase("envelope-opening");
    setEstateMoment("envelope-opening");
    setNoteCardBeat("pause");

    let t = CINEMATIC.notePauseMs;
    scheduleCinematic(t, () => {
      setNoteCardBeat("lift");
      playPaperRustleSound();
    });
    t += CINEMATIC.noteLiftMs;
    scheduleCinematic(t, () => setNoteCardBeat("flap-lift"));
    t += CINEMATIC.noteFlapLiftMs;
    scheduleCinematic(t, () => setNoteCardBeat("flap-open"));
    t += CINEMATIC.noteFlapOpenMs;
    scheduleCinematic(t, () => {
      setNoteCardBeat("revealed");
      playJournalPageTurnSound();
      setEstateMoment("letter");
    });
    t += CINEMATIC.noteRevealMs;
    scheduleCinematic(t, () => {
      setNoteCardBeat("complete");
    });
  }

  function toggleSound() {
    setSoundMuted((current) => {
      const next = !current;
      writeJournalGazeboSoundMuted(next);
      return next;
    });
  }

  function handleNoteOpen() {
    if (!showWelcomeDesk) return;
    if (estateMoment === "envelope-opening" || estateMoment === "letter") return;

    if (
      phase === "estate" && estateMoment === "settling"
    ) {
      setEstateMoment("ready");
    } else if (phase !== "estate" || estateMoment !== "ready") {
      return;
    }

    if (noteCardBeat !== "waiting") return;
    runNoteCardCinematic();
  }

  function handleWelcomeCreateJournal() {
    markWelcomeNoteSeen();
    clearCinematicTimers();
    setJournalPickerOpen(false);
    setDeskOpen(false);
    setConfig(null);
    setBody("");
    setEntryId(null);
    setEditingEntryId(null);
    setSparkLine(null);
    setPhase("creating");
  }

  function handleOpenMyJournal(journal?: JournalGazeboConfig) {
    markWelcomeNoteSeen();
    refreshLibrary();
    const journals = getLibraryJournals();
    if (journals.length === 0) {
      handleWelcomeCreateJournal();
      return;
    }
    if (journal) {
      openSelectedJournal(journal);
      return;
    }
    if (journals.length === 1) {
      openSelectedJournal(journals[0]!);
      return;
    }
    setJournalPickerOpen(true);
  }

  function handleDesignComplete(draft: JournalGazeboConfig) {
    clearCinematicTimers();
    openCompletedRef.current = false;
    markWelcomeNoteSeen();
    const created = createJournalConfig(draft);
    refreshLibrary();
    setConfig(created);
    setEntryId(null);
    setBody("");
    setEditingEntryId(null);
    setCeremonyStep(0);
    setBookPageIndex(0);
    setTasselY(JOURNAL_RIBBON_CENTER_Y);
    setGiftMoment("wrapping");
    setPhase("gift-unwrap");
    setEstateMoment("rest");
    setSparkLine(null);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scale = reduced ? 0.35 : 1;
    let t = CINEMATIC.giftWrappingMs * scale;

    scheduleCinematic(t, () => setGiftMoment("wrapped"));
    t += CINEMATIC.giftWrappedPauseMs * scale;

    scheduleCinematic(t, () => setGiftMoment("bow"));
    t += CINEMATIC.giftBowMs * scale;
    scheduleCinematic(t, () => setGiftMoment("ribbon-pull"));
    t += CINEMATIC.giftRibbonPullMs * scale;
    scheduleCinematic(t, () => setGiftMoment("ribbon"));
    t += CINEMATIC.giftRibbonMs * scale;
    scheduleCinematic(t, () => setGiftMoment("unwrap"));
    t += CINEMATIC.giftUnwrapMs * scale;
    scheduleCinematic(t, () => {
      setGiftMoment("reveal");
      setSparkLine(null);
      openCompletedRef.current = false;
    });
    t += CINEMATIC.giftAdmireMs * scale;
    scheduleCinematic(t, () => {
      setPhase("gazebo-rest");
      setDeskCamera("wide");
      setSparkLine(JOURNAL_ON_DESK_SPARK);
      window.setTimeout(() => setSparkLine(null), CINEMATIC.sparkLineMs);
    });
  }

  function handleStepBackIntoGazebo() {
    if (isListening) stopListening();
    setWritingPrefsOpen(false);
    openCompletedRef.current = false;
    setCenteredBookActive(false);
    setDeskCamera("wide");
    setEstateMoment("rest");
    if (config) {
      if (bookPageIndex === 0 && dedicationHtml.trim()) {
        savePageBody(config.id, 0, dedicationHtml);
      }
      saveJournalPlace(config.id, { pageIndex: bookPageIndex, tasselY });
      if (bookPageIndex >= FIRST_WRITING_PAGE_INDEX) {
        savePageBody(config.id, bookPageIndex, body);
        const style =
          pageTypingStyle ?? resolvePageTypingStyle(config.id, bookPageIndex, config);
        savePageTypingStyle(config.id, bookPageIndex, style);
      }
      if (!hasCompletedJournalCeremony(config.id)) {
        markJournalCeremonyComplete(config.id);
      }
      const touched = updateJournalConfig(config.id, {});
      if (touched) setConfig(touched);
    }
    refreshLibrary();
    setPhase("gazebo-rest");
    setSparkLine(null);
    setDeskOpen(false);
  }

  function scheduleAutosave(nextBody: string) {
    if (!config) return;
    if (autosaveRef.current) window.clearTimeout(autosaveRef.current);
    autosaveRef.current = window.setTimeout(() => {
      if (bookPageIndex >= FIRST_WRITING_PAGE_INDEX) {
        savePageBody(config.id, bookPageIndex, nextBody);
        saveJournalPlace(config.id, { pageIndex: bookPageIndex, tasselY });
        if (pageTypingStyle) {
          savePageTypingStyle(config.id, bookPageIndex, pageTypingStyle);
        }
      }
      if (!plainTextFromHtml(nextBody).trim()) return;
      const result = saveJournalPage({
        configId: config.id,
        body: nextBody,
        entryId,
        title: config.name,
      });
      if (result.ok) {
        setEntryId(result.entryId);
        setSavedNote(JOURNAL_PAGE_SAVED);
      }
    }, AUTOSAVE_MS);
  }

  function handleBodyChange(next: string) {
    setBody(next);
    scheduleAutosave(next);
  }

  const { isSupported, isListening, startListening, stopListening } =
    useSpeechToText();

  function toggleVoice() {
    if (isListening) {
      stopListening();
      return;
    }
    startListening((spoken) => {
      setBody((current) => {
        const style =
          pageTypingStyle ??
          (config
            ? resolvePageTypingStyle(config.id, bookPageIndex, config)
            : undefined);
        const merged = appendDictationToBody(current, spoken, config ?? undefined, style);
        scheduleAutosave(merged);
        return merged;
      });
    });
  }

  function handleWritingPrefsUpdate(patch: Partial<JournalGazeboConfig>) {
    if (!config) return;
    const updated = updateJournalConfig(config.id, patch);
    if (updated) setConfig(updated);
  }

  const handlePageTypingStyleUpdate = useCallback(
    (patch: Partial<TypingStyle>) => {
      if (!config || bookPageIndex < FIRST_WRITING_PAGE_INDEX) return;
      setPageTypingStyle((prev) => {
        const base = prev ?? resolvePageTypingStyle(config.id, bookPageIndex, config);
        const next = { ...base, ...patch };
        savePageTypingStyle(config.id, bookPageIndex, next);
        window.setTimeout(() => {
          const el = paperRef.current;
          if (!el) return;
          restyleAllBlocksInEditor(el, config, next);
          setBody(sanitizePageHtml(el.innerHTML));
          el.focus();
        }, 0);
        return next;
      });
    },
    [bookPageIndex, config],
  );

  const showImmersiveHome =
    phase !== "arrival" &&
    phase !== "envelope-opening" &&
    (openBookActive ||
      phase === "gazebo-rest" ||
      phase === "estate" ||
      phase === "creating" ||
      phase === "writing" ||
      phase === "ceremony" ||
      phase === "gift-unwrap" ||
      phase === "journal-reveal" ||
      phase === "journal-opening" ||
      phase === "return-greeting");

  const showJournalOptions =
    config != null &&
    !deskOpen &&
    openBookActive &&
    (phase === "writing" || phase === "ceremony");

  const showJournalDone = showJournalOptions;

  const shelfJournals = useMemo(() => {
    if (libraryJournals.length > 0) return libraryJournals;
    if (config) return [config];
    return [];
  }, [libraryJournals, config]);

  const showEstateGuide = !estateGuideOpen;

  function handleChooseAnotherJournal() {
    setCenteredBookActive(false);
    setDeskOpen(false);
    setBody("");
    setEntryId(null);
    setBookPageIndex(0);
    setSparkLine(null);
    setDeskCamera("wide");
    refreshLibrary();
    const journals = getLibraryJournals();
    if (journals.length === 0) {
      handleWelcomeCreateJournal();
      return;
    }
    setPhase("gazebo-rest");
    if (journals.length === 1) {
      openSelectedJournal(journals[0]!);
      return;
    }
    setConfig(null);
    setJournalPickerOpen(true);
  }

  const deskClickable =
    phase === "journal-desk" &&
    (deskCamera === "approach" || deskCamera === "wide");

  const bookFocusActive =
    phase === "journal-opening" ||
    (phase === "gift-unwrap" &&
      (giftMoment === "unwrap" ||
        giftMoment === "reveal" ||
        giftMoment === "admire"));

  const phaseBackgroundScenes = useMemo((): JournalSessionScenes | null => {
    if (showWelcomeDesk) return resolveJournalWelcomeScenes();
    if (phase === "gazebo-rest") return resolveJournalGazeboRestScenes();
    if (phase === "creating") return resolveJournalWorkshopScenes();
    if (
      phase === "gift-unwrap" ||
      phase === "journal-reveal" ||
      phase === "journal-opening" ||
      phase === "ceremony" ||
      phase === "writing"
    ) {
      if (visitMode === "return" && sessionScenes) return sessionScenes;
      return resolveJournalWorkshopScenes();
    }
    if (visitMode === "return" && sessionScenes) return sessionScenes;
    if (prototypeMode) return resolveJournalWorkshopScenes();
    return null;
  }, [showWelcomeDesk, phase, visitMode, sessionScenes, prototypeMode]);

  const usingPlateBackground = phaseBackgroundScenes != null;
  const photoScene = Boolean(backgroundUrl) || usingPlateBackground;
  const sceneReady = sceneComposed;
  const memberFirstName = getMemberFirstName() || memberDisplayName.split(/\s+/)[0] || "";

  return (
    <div
      className={[
        "journal-gazebo",
        prototypeMode ? "journal-gazebo--prototype" : "journal-gazebo--companion",
        photoScene ? "journal-gazebo--photo-scene" : "",
        showWelcomeDesk ? "journal-gazebo--welcome-letter" : "",
        usingPlateBackground && !showWelcomeDesk && phase !== "gazebo-rest"
          ? "journal-gazebo--workshop-plate"
          : "",
        openBookActive ? "journal-gazebo--cinematic-book" : "",
        cinematicJournalVisible ? "journal-gazebo--cinematic-ceremony" : "",
        sceneSettled && phaseBackgroundScenes?.settledUrl
          ? "journal-gazebo--scene-settled"
          : "",
        sceneReady ? "journal-gazebo--scene-ready" : "journal-gazebo--scene-loading",
        phase === "envelope-opening" ? "journal-gazebo--note-cinematic" : "",
        estateVisible ? "journal-gazebo--estate" : "",
        phase === "writing-desk-arrival"
          ? "journal-gazebo--writing-desk"
          : "",
        phase === "letter" ||
        estateMoment === "letter-fading" ||
        estateMoment === "letter-closing"
          ? "journal-gazebo--letter"
          : "",
        cameraBlurred ? "journal-gazebo--world-blur" : "",
        phase === "creating" ? "journal-gazebo--design-studio journal-gazebo--workshop" : "",
        deskVisible ? "journal-gazebo--desk-active" : "",
        phase === "gazebo-rest" ? "journal-gazebo--gazebo-rest" : "",
        phase === "gift-unwrap" ? "journal-gazebo--gift-unwrap" : "",
        phase === "journal-reveal" ? "journal-gazebo--journal-reveal" : "",
        phase === "journal-opening" ? "journal-gazebo--journal-opening" : "",
        openBookActive && (phase === "writing" || phase === "ceremony")
          ? "journal-gazebo--writing-open"
          : "",
        bookFocusActive ? "journal-gazebo--book-focus" : "",
        deskOpen ? "journal-gazebo--desk-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-journal-phase={phase}
      data-journal-visit={visitMode}
      suppressHydrationWarning
    >
      <JournalGazeboAmbience active={ambienceActive} muted={soundMuted} />

      <JournalGazeboSoundControl muted={soundMuted} onToggle={toggleSound} />

      {showImmersiveHome ? (
        <EstateImmersiveHomeLink
          onClick={onBack}
          className="journal-gazebo__home-link"
        />
      ) : null}

      {showEstateGuide && !estateGuideOpen ? (
        <SparkEstateGuideAnchor
          onClick={() => setEstateGuideOpen(true)}
          className="journal-gazebo__estate-guide"
        />
      ) : null}

      <EstateGuideFlipbook
        open={estateGuideOpen}
        onClose={() => setEstateGuideOpen(false)}
      />

      {journalPickerOpen ? (
        <JournalGazeboJournalPicker
          journals={libraryJournals}
          activeJournalId={config?.id}
          onSelect={openSelectedJournal}
          onClose={() => setJournalPickerOpen(false)}
        />
      ) : null}

      {showJournalDone ? (
        <JournalGazeboDoneButton onDone={handleStepBackIntoGazebo} />
      ) : null}

      {showJournalOptions && config ? (
        <JournalGazeboOptionsMenu
          onReadAloud={toggleVoice}
          readAloudSupported={isSupported}
          isListening={isListening}
          onReturnToGazebo={handleStepBackIntoGazebo}
          onChooseAnotherJournal={handleChooseAnotherJournal}
          onWritingPreferences={() => {
            if (config && bookPageIndex >= FIRST_WRITING_PAGE_INDEX) {
              setPageTypingStyle(
                (prev) =>
                  prev ?? resolvePageTypingStyle(config.id, bookPageIndex, config),
              );
            }
            setWritingPrefsOpen(true);
          }}
          onToggleTime={() => setShowTime((v) => !v)}
          showTime={showTime}
          onPrint={() =>
            import("@/lib/journalGazebo/print").then(({ printCurrentJournalPage }) =>
              printCurrentJournalPage({
                config,
                body,
                showTime,
                typingStyle:
                  pageTypingStyle ??
                  resolvePageTypingStyle(config.id, bookPageIndex, config),
              }),
            )
          }
          printDisabled={!plainTextFromHtml(body).trim()}
          onCloseJournal={handleStepBackIntoGazebo}
        />
      ) : null}

      {writingPrefsOpen && config && bookPageIndex >= FIRST_WRITING_PAGE_INDEX ? (
        <JournalGazeboWritingPreferences
          style={
            pageTypingStyle ??
            resolvePageTypingStyle(config.id, bookPageIndex, config)
          }
          onClose={() => setWritingPrefsOpen(false)}
          onUpdate={handlePageTypingStyleUpdate}
        />
      ) : null}

      {photoScene && !showWelcomeDesk && !bookFocusActive ? (
        <JournalGazeboCinematicEnvironment active={ambienceActive} />
      ) : null}

      {useAtmosphere && !photoScene && !openBookActive ? (
        <div className="journal-gazebo__atmosphere" aria-hidden="true" />
      ) : null}

      {phaseBackgroundScenes ? (
        <>
          <EstateRoomFullBleedBackground
            roomId="journal"
            imageUrl={phaseBackgroundScenes.gazeboUrl}
            className="journal-gazebo__background journal-gazebo__background--gazebo"
            onLoad={() => setSceneComposed(true)}
          />
          {phaseBackgroundScenes.settledUrl ? (
            <EstateRoomFullBleedBackground
              roomId="journal"
              imageUrl={phaseBackgroundScenes.settledUrl}
              className={[
                "journal-gazebo__background",
                "journal-gazebo__background--settled",
                sceneSettled ? "journal-gazebo__background--settled-visible" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onLoad={() => setSceneComposed(true)}
            />
          ) : null}
        </>
      ) : backgroundUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundUrl}
          alt=""
          aria-hidden
          className="journal-gazebo__background"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setSceneComposed(true)}
          onError={() => {
            if (backgroundIndex + 1 < backgroundCandidates.length) {
              setBackgroundIndex((i) => i + 1);
              return;
            }
            setUseAtmosphere(true);
          }}
        />
      ) : !useAtmosphere ? (
        <EstateRoomFullBleedBackground
          roomId="journal"
          imageUrl={JOURNAL_GAZEBO_BACKGROUND_URL}
          className="journal-gazebo__background"
          onLoad={() => setSceneComposed(true)}
        />
      ) : null}

      {cinematicJournalVisible && config ? (
        <JournalGazeboOpenBook
          phase={phase}
          config={config}
          pageIndex={bookPageIndex}
          onPageIndexChange={handleBookPageIndexChange}
          memberFirstName={memberFirstName}
          body={body}
          onBodyChange={handleBodyChange}
          paperRef={paperRef}
          showTime={showTime}
          tasselY={tasselY}
          onTasselYChange={handleTasselYChange}
          onOpenComplete={finishJournalOpen}
          onRequestOpen={beginJournalOpen}
          onRequestClose={handleBackToCover}
          arrived={phase !== "journal-reveal" || journalRevealArrived}
          onDraftPatch={handleWritingPrefsUpdate}
          dedicationHtml={dedicationHtml}
          onDedicationChange={setDedicationHtml}
          pageTypingStyle={pageTypingStyle ?? undefined}
          onPageTypingStyleChange={handlePageTypingStyleUpdate}
        />
      ) : null}

      {(phase === "gift-unwrap" && config) ? (
        <>
          {bookFocusActive ? (
            <span className="jg-open-book__focus-veil jg-open-book__focus-veil--gift" aria-hidden="true" />
          ) : null}
          <div className="journal-estate journal-estate--photo-scene journal-estate--composed journal-estate--gift">
            <div className="journal-estate__glow" aria-hidden="true" />
            <JournalGazeboWrappedGift config={config} moment={giftMoment} />
          </div>
        </>
      ) : null}

      {showWelcomeDesk ? (
        <JournalGazeboEstateDesk
          moment={estateMoment}
          showWelcome
          sceneComposed={sceneReady}
          journals={libraryJournals}
          onCreateJournal={handleWelcomeCreateJournal}
          onOpenJournal={handleOpenMyJournal}
        />
      ) : null}

      {showSanctuaryDesk ? (
        <JournalGazeboSanctuaryDesk
          journals={libraryJournals}
          featuredJournal={featuredJournal}
          sceneComposed={sceneReady}
          initialNote={returnNote}
          onCreateJournal={handleWelcomeCreateJournal}
          onOpenJournal={handleOpenMyJournal}
          onJournalClick={
            featuredJournal
              ? () => openSelectedJournal(featuredJournal)
              : undefined
          }
        />
      ) : null}

      {phase === "gazebo-rest" && shelfJournals.length > 0 ? (
        <div className="journal-gazebo__gazebo-shelf">
          <JournalGazeboLibraryShelf
            journals={shelfJournals}
            activeJournalId={config?.id}
            onSelectJournal={openSelectedJournal}
          />
        </div>
      ) : null}

      {deskVisible && config ? (
        <JournalGazeboDesk
          config={config}
          camera={deskCamera}
          journalMoment={journalMoment}
          onJournalOpen={handleJournalOpen}
          onJournalOpenComplete={finishJournalOpen}
          journalClickable={deskClickable}
        >
          {phase === "ceremony" && config && !cinematicJournalVisible ? (
            <JournalGazeboCeremonyPage
              step={ceremonyStep}
              config={config}
              memberFirstName={memberFirstName}
              dateLabel={dateLabel}
              timeLabel={timeLabel}
              onTurnPage={() => handleBookPageIndexChange(ceremonyStep + 1)}
            />
          ) : null}
          {phase === "writing" ? (
            <JournalGazeboWritingPage
              config={config}
              body={body}
              onBodyChange={handleBodyChange}
              paperRef={paperRef}
              dateLabel={dateLabel}
              timeLabel={timeLabel}
              showTime={showTime}
              pageIndex={bookPageIndex}
              typingStyle={pageTypingStyle ?? undefined}
              onTypingStyleChange={handlePageTypingStyleUpdate}
            />
          ) : null}
        </JournalGazeboDesk>
      ) : null}

      {sparkLine &&
      (phase === "writing-desk-arrival" ||
        phase === "journal-desk" ||
        phase === "gazebo-rest" ||
        phase === "gift-unwrap" ||
        phase === "journal-reveal" ||
        phase === "return-greeting" ||
        phase === "creating") ? (
        <p className="journal-gazebo__spark" role="status">
          {sparkLine.split("\n").map((line, i, arr) => (
            <span key={line}>
              {line}
              {i < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ) : null}

      {phase === "creating" ? (
        <div className="journal-estate journal-estate--workshop journal-estate--composed">
          <JournalGazeboDesignStudio
            onComplete={handleDesignComplete}
            onExit={() => {
              setSparkLine(null);
              if (visitMode === "return") {
                setPhase("gazebo-rest");
                setEstateMoment("rest");
              } else {
                setPhase("estate");
                setEstateMoment("ready");
              }
            }}
          />
        </div>
      ) : null}

      {(phase === "writing" || phase === "ceremony") && config && !deskOpen ? (
        <>
          {sparkLine && phase === "writing" ? (
            <p className="journal-gazebo__spark journal-gazebo__spark--writing" role="status">
              {sparkLine}
            </p>
          ) : null}

          {savedNote && phase === "writing" ? (
            <span className="journal-gazebo__saved-note journal-gazebo__saved-note--options" role="status">
              {savedNote}
            </span>
          ) : null}
        </>
      ) : null}

      {deskOpen && config ? (
        <div className="journal-gazebo__wizard">
          <JournalGazeboCreationWizard
            variant="desk"
            initialConfig={config}
            finalLabel={JOURNAL_TOOLS.returnToPage}
            onComplete={(draft) => {
              const updated = updateJournalConfig(config.id, draft);
              if (updated) setConfig(updated);
              setDeskOpen(false);
            }}
            onCancel={() => setDeskOpen(false)}
          />
        </div>
      ) : null}

      {prototypeMode ? (
        <JournalGazeboPrototypeRail
          phase={phase}
          onReplayArrival={replayArrival}
          onJumpToPhase={jumpToPhase}
        />
      ) : null}
    </div>
  );
}
