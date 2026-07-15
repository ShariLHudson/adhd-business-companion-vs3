"use client";

type Props = {
  open: boolean;
  room: string;
  section: string;
  question: string;
  helpText: string;
  onClose: () => void;
};

/**
 * Local guided help — does not open general chat or restore prior conversations.
 */
export function BusinessEstateLocalHelp({
  open,
  room,
  section,
  question,
  helpText,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="be-local-help"
      role="dialog"
      aria-label="Help with this question"
      data-testid="be-local-help"
    >
      <p className="be-local-help__context">
        {room} · {section}
      </p>
      <p className="be-local-help__question">{question}</p>
      <p className="be-local-help__body">{helpText}</p>
      <button
        type="button"
        className="be-btn be-btn--secondary"
        onClick={onClose}
        data-testid="be-local-help-close"
      >
        Back to the question
      </button>
    </div>
  );
}
