"use client";

type QuietChoicesProps = {
  visible: boolean;
  options: { id: string; label: string }[];
  onChoose: (id: string) => void;
};

export function QuietChoices({ visible, options, onChoose }: QuietChoicesProps) {
  if (!visible) return null;

  return (
    <div className="cw4-choices" role="group">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="cw4-choices__btn"
          onClick={() => onChoose(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
