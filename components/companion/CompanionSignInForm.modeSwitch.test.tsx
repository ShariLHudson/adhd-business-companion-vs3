/**
 * @vitest-environment jsdom
 *
 * Regression: Create Account / Sign In must switch mode without submitting
 * empty credentials (no false "Opening your space…" busy state).
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const signIn = vi.fn(async () => ({ error: null }));
const signUp = vi.fn(async () => ({ error: null, needsConfirmation: false }));
const resetPassword = vi.fn(async () => ({ error: null }));

vi.mock("@/components/companion/CompanionAuthProvider", () => ({
  useCompanionAuth: () => ({
    configured: true,
    configChecked: true,
    loading: false,
    user: null,
    signIn,
    signUp,
    resendSignUpConfirmation: vi.fn(),
    resetPassword,
    signInWithGoogle: vi.fn(),
  }),
}));

vi.mock("@/components/companion/CompanionLanguageProvider", () => ({
  useCompanionLanguage: () => ({
    t: (key: string) => {
      if (key === "auth.signIn") return "Sign in";
      if (key === "auth.email") return "Email";
      if (key === "auth.password") return "Password";
      if (key === "auth.yourName") return "Your name";
      return key;
    },
  }),
}));

vi.mock("@/lib/supabase/companionClient", () => ({
  companionAuthConfigStatus: () => ({
    hasUrl: true,
    hasAnonKey: true,
    urlLooksValid: true,
    anonKeyLooksValid: true,
    anonKeyLength: 100,
  }),
  companionAuthMisconfigHint: () => null,
  ensureCompanionSupabaseConfigured: async () => true,
  companionAuthConfigured: () => true,
  hydrateCompanionAuthFromInlineConfig: () => {},
}));

vi.mock("@/lib/welcomeAudio/welcomeHomeAudioSession", () => ({
  primeWelcomeHomeAudioFromGesture: () => {},
}));

vi.mock("@/lib/companionAuthIntelligence", () => ({
  recordAuthLoginFailure: () => {},
  recordAuthLoginSuccess: () => {},
  recordAuthPasswordResetRequested: () => {},
}));

import { CompanionSignInForm } from "./CompanionSignInForm";

describe("CompanionSignInForm mode switching", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    signIn.mockClear();
    signUp.mockClear();
    resetPassword.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function renderForm(returning = true) {
    act(() => {
      root.render(
        <CompanionSignInForm variant="page" returning={returning} />,
      );
    });
  }

  function buttonByText(label: string) {
    return Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.trim() === label,
    ) as HTMLButtonElement | undefined;
  }

  function nameField() {
    return container.querySelector(
      'input[placeholder="What should Shari call you?"]',
    );
  }

  function form() {
    return container.querySelector("form") as HTMLFormElement;
  }

  it("switches to Create Account without submitting or opening busy state", () => {
    renderForm(true);
    expect(buttonByText("Create Account")).toBeTruthy();
    expect(buttonByText("Create Account")?.type).toBe("button");
    expect(buttonByText("Sign in")?.type).toBe("submit");
    expect(nameField()).toBeFalsy();

    act(() => {
      buttonByText("Create Account")?.click();
    });

    expect(signUp).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
    expect(buttonByText("Opening your space…")).toBeFalsy();
    expect(buttonByText("Create Account")?.disabled).toBe(false);
    expect(buttonByText("Sign in")?.disabled).toBe(false);
    expect(buttonByText("Create Account")?.type).toBe("submit");
    expect(buttonByText("Sign in")?.type).toBe("button");
    expect(nameField()).toBeTruthy();
    expect(container.querySelector('[role="alert"]')).toBeFalsy();
  });

  it("switches back to Sign in without submitting empty credentials", () => {
    renderForm(true);

    act(() => {
      buttonByText("Create Account")?.click();
    });
    expect(nameField()).toBeTruthy();

    act(() => {
      buttonByText("Sign in")?.click();
    });

    expect(signIn).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
    expect(buttonByText("Opening your space…")).toBeFalsy();
    expect(nameField()).toBeFalsy();
    expect(container.querySelector('[role="alert"]')).toBeFalsy();
  });

  it("validates empty credentials without entering Opening your space", () => {
    renderForm(true);

    act(() => {
      form().dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    expect(signIn).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
    expect(buttonByText("Opening your space…")).toBeFalsy();
    expect(buttonByText("Sign in")?.disabled).toBe(false);
    expect(container.querySelector('[role="alert"]')?.textContent).toMatch(
      /email and password are required/i,
    );
  });

  it("form submit uses the active mode only (Enter / requestSubmit)", () => {
    renderForm(true);
    expect(buttonByText("Sign in")?.type).toBe("submit");
    expect(buttonByText("Create Account")?.type).toBe("button");

    act(() => {
      form().dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    expect(signIn).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
    expect(buttonByText("Opening your space…")).toBeFalsy();
    expect(container.querySelector('[role="alert"]')?.textContent).toMatch(
      /email and password are required/i,
    );

    act(() => {
      buttonByText("Create Account")?.click();
    });
    expect(buttonByText("Create Account")?.type).toBe("submit");
    expect(buttonByText("Sign in")?.type).toBe("button");
    expect(nameField()).toBeTruthy();

    act(() => {
      form().dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    expect(signIn).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
    expect(buttonByText("Opening your space…")).toBeFalsy();
    expect(buttonByText("Create Account")?.disabled).toBe(false);
  });

  it("Forgot Password stays on Sign In and does not call signIn or signUp", () => {
    renderForm(true);
    expect(buttonByText("Forgot password?")).toBeTruthy();

    act(() => {
      buttonByText("Forgot password?")?.click();
    });

    expect(signIn).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
    expect(resetPassword).not.toHaveBeenCalled();
    expect(container.textContent).toMatch(/reset link/i);
    expect(nameField()).toBeFalsy();
  });
});
