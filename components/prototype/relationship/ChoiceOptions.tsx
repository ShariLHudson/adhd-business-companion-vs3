"use client";

type ChoiceOptionsProps = {
  visible: boolean;
  options: { id: string; label: string }[];
  onChoose: (id: string) => void;
};

export function ChoiceOptions({ visible, options, onChoose }: ChoiceOptionsProps) {
  if (!visible) return null;

  return (
    <div className="rel-choices" role="group">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="rel-choices__btn"
          onClick={() => onChoose(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
