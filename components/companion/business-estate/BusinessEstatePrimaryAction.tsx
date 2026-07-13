"use client";

type Props = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
};

/** Single primary CTA for a Business Estate room. */
export function BusinessEstatePrimaryAction({
  label,
  onClick,
  disabled = false,
  testId = "business-estate-primary-action",
}: Props) {
  return (
    <div className="business-estate-primary-action">
      <button
        type="button"
        className="business-estate-primary-action__btn"
        onClick={onClick}
        disabled={disabled}
        data-testid={testId}
      >
        {label}
      </button>
    </div>
  );
}
