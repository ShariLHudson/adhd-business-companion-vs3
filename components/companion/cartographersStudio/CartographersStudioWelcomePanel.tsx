"use client";

import { useState } from "react";
import {
  CARTOGRAPHERS_WELCOME_ABOUT_HEADING,
  CARTOGRAPHERS_WELCOME_BEGIN_HEADING,
  CARTOGRAPHERS_WELCOME_BODY,
  CARTOGRAPHERS_WELCOME_CLICK_FRAME,
  CARTOGRAPHERS_WELCOME_FOOTER,
  CARTOGRAPHERS_WELCOME_MAP_BLURBS,
  CARTOGRAPHERS_WELCOME_SUBTITLE,
  CARTOGRAPHERS_WELCOME_TELL_SPARK,
  CARTOGRAPHERS_WELCOME_TITLE,
} from "@/lib/cartographersStudio/welcome";

type Props = {
  onDismiss: () => void;
};

/**
 * Elegant orientation guide for Cartographer's Studio.
 * Frosted glass — not estate navigation, not Chat with Shari.
 */
export function CartographersStudioWelcomePanel({ onDismiss }: Props) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div
      className="cartographers-welcome"
      data-testid="cartographers-studio-welcome"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cartographers-welcome-title"
    >
      <div className="cartographers-welcome__glass">
        <header className="cartographers-welcome__header">
          <h1
            id="cartographers-welcome-title"
            className="cartographers-welcome__title"
          >
            {CARTOGRAPHERS_WELCOME_TITLE}
          </h1>
          <p className="cartographers-welcome__subtitle">
            {CARTOGRAPHERS_WELCOME_SUBTITLE}
          </p>
        </header>

        <div className="cartographers-welcome__body">
          {CARTOGRAPHERS_WELCOME_BODY.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <section
          className="cartographers-welcome__begin"
          aria-labelledby="cartographers-welcome-begin"
        >
          <h2
            id="cartographers-welcome-begin"
            className="cartographers-welcome__section-title"
          >
            {CARTOGRAPHERS_WELCOME_BEGIN_HEADING}
          </h2>

          <div className="cartographers-welcome__guidance">
            <article className="cartographers-welcome__guide">
              <h3 className="cartographers-welcome__guide-title">
                1. {CARTOGRAPHERS_WELCOME_TELL_SPARK.heading}
              </h3>
              <ul className="cartographers-welcome__examples">
                {CARTOGRAPHERS_WELCOME_TELL_SPARK.examples.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </article>

            <article className="cartographers-welcome__guide">
              <h3 className="cartographers-welcome__guide-title">
                2. {CARTOGRAPHERS_WELCOME_CLICK_FRAME.heading}
              </h3>
              <p className="cartographers-welcome__guide-body">
                {CARTOGRAPHERS_WELCOME_CLICK_FRAME.body}
              </p>
            </article>

            <article className="cartographers-welcome__guide">
              <button
                type="button"
                className="cartographers-welcome__about-toggle"
                aria-expanded={aboutOpen}
                data-testid="cartographers-welcome-about-toggle"
                onClick={() => setAboutOpen((v) => !v)}
              >
                <span>
                  3. {CARTOGRAPHERS_WELCOME_ABOUT_HEADING}{" "}
                  <span aria-hidden>{aboutOpen ? "▲" : "▼"}</span>
                </span>
              </button>
              {aboutOpen ? (
                <ul
                  className="cartographers-welcome__about-list"
                  data-testid="cartographers-welcome-about-list"
                >
                  {CARTOGRAPHERS_WELCOME_MAP_BLURBS.map((map) => (
                    <li key={map.id}>
                      <strong>{map.name}.</strong> {map.sentence}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          </div>
        </section>

        <p className="cartographers-welcome__footer">{CARTOGRAPHERS_WELCOME_FOOTER}</p>

        <div className="cartographers-welcome__actions">
          <button
            type="button"
            className="cartographers-welcome__dismiss"
            data-testid="cartographers-welcome-dismiss"
            onClick={onDismiss}
          >
            Begin
          </button>
        </div>
      </div>
    </div>
  );
}
