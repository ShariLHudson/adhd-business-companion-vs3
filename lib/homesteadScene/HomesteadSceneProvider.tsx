"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  HOMESTEAD_SCENE_REFRESH_MS,
  homesteadSceneDataAttributes,
  resolveHomesteadSceneState,
  type HomesteadSceneState,
  type HomesteadSceneSurface,
} from "./resolveHomesteadSceneState";

const HomesteadSceneContext = createContext<HomesteadSceneState | null>(null);

function applySceneToElement(
  el: HTMLElement,
  state: HomesteadSceneState,
) {
  const attrs = homesteadSceneDataAttributes(state);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }
  for (const [key, value] of Object.entries(state.cssVars)) {
    el.style.setProperty(key, value);
  }
}

export function HomesteadSceneProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, HOMESTEAD_SCENE_REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const state = useMemo(
    () => resolveHomesteadSceneState({ now, surface: "home" }),
    [now],
  );

  useEffect(() => {
    applySceneToElement(document.documentElement, state);
  }, [state]);

  return (
    <HomesteadSceneContext.Provider value={state}>
      {children}
    </HomesteadSceneContext.Provider>
  );
}

export function useHomesteadScene(): HomesteadSceneState {
  const state = useContext(HomesteadSceneContext);
  if (!state) {
    return resolveHomesteadSceneState({ surface: "app" });
  }
  return state;
}

export function useHomesteadSceneSurfaceProps(input?: {
  openingDoor?: boolean;
  welcomePhotographId?: string;
  surface?: HomesteadSceneSurface;
  className?: string;
}): {
  state: HomesteadSceneState;
  surfaceProps: HTMLAttributes<HTMLElement> & { style?: CSSProperties };
} {
  const base = useHomesteadScene();
  const state = useMemo(
    () =>
      resolveHomesteadSceneState({
        now: base.now,
        surface: input?.surface ?? "login",
        openingDoor: input?.openingDoor,
      }),
    [base.now, input?.openingDoor, input?.surface],
  );

  const surfaceProps = useMemo(() => {
    const attrs = homesteadSceneDataAttributes(state);
    return {
      ...attrs,
      className: ["homestead-scene--ambient", input?.className]
        .filter(Boolean)
        .join(" "),
      style: state.cssVars as CSSProperties,
      ...(input?.welcomePhotographId
        ? { "data-welcome-photograph": input.welcomePhotographId }
        : {}),
    };
  }, [state, input?.className, input?.welcomePhotographId]);

  return { state, surfaceProps };
}
