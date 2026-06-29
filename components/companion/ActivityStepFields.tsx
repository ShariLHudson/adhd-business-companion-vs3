"use client";

import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import {
  filledOptions,
  getStringArray,
  getTextAnswer,
  type ActivityAnswers,
  type ActivityFieldDef,
} from "@/lib/activityFields";

const inputClass =
  "w-full rounded-xl border-2 border-[#d4cdc3] bg-white px-4 py-3 text-base text-[#1f1c19] placeholder:text-[#9a8f82] focus:border-[#1e4f4f] focus:outline-none focus:ring-2 focus:ring-[#1e4f4f]/15";

const deskInputClass =
  "w-full rounded-lg border border-[#c4a876]/45 bg-[rgba(255,252,245,0.55)] px-3 py-2 text-[0.88rem] text-[#2e2820] placeholder:text-[#9a8f82] focus:border-[#b89558]/65 focus:outline-none focus:ring-1 focus:ring-[#c4a876]/25";

const floatingCardInputClass =
  "w-full rounded-xl border-[1.5px] border-[rgba(90,78,58,0.38)] bg-white px-4 py-3 text-base text-[#1f1c19] placeholder:text-[#6b635a] focus:border-[#1e4f4f]/55 focus:outline-none focus:ring-2 focus:ring-[#1e4f4f]/18";

type Props = {
  field: ActivityFieldDef;
  answers: ActivityAnswers;
  onChange: (answers: ActivityAnswers) => void;
  presentation?: "default" | "desk" | "floating-card";
};

export function ActivityStepFields({
  field,
  answers,
  onChange,
  presentation = "default",
}: Props) {
  const desk = presentation === "desk";
  const floatingCard = presentation === "floating-card";
  const compact = desk || floatingCard;
  const fieldInputClass = floatingCard
    ? floatingCardInputClass
    : desk
      ? deskInputClass
      : inputClass;
  const fieldWrapClass = compact ? "mt-1.5" : "mt-4";

  function patch(key: string, value: unknown) {
    onChange({ ...answers, [key]: value });
  }

  switch (field.type) {
    case "text":
      return (
        <div className={fieldWrapClass}>
          {!compact && field.label ? (
            <label className="mb-2 block text-sm font-semibold text-[#4b463f]">
              {field.label}
            </label>
          ) : null}
          {field.multiline ? (
            <VoiceAnswerField
              value={getTextAnswer(answers, field.key)}
              onChange={(v) => patch(field.key, v)}
              placeholder={field.placeholder ?? "Your answer…"}
              className="mt-0"
              inputClassName={`${fieldInputClass} ${desk ? "min-h-[3.25rem] resize-y" : "min-h-[100px] resize-y"}`}
            />
          ) : (
            <input
              type="text"
              value={getTextAnswer(answers, field.key)}
              onChange={(e) => patch(field.key, e.target.value)}
              placeholder={field.placeholder ?? "Type here…"}
              className={fieldInputClass}
            />
          )}
        </div>
      );

    case "options": {
      const stored = getStringArray(answers[field.key]);
      const rows =
        stored.length > 0
          ? stored
          : Array.from({ length: field.startCount ?? 1 }, () => "");
      const labelAt = field.itemLabel ?? ((i: number) => `Option ${i + 1}`);
      return (
        <div className={`${fieldWrapClass} space-y-2`}>
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <div className="min-w-0 flex-1">
                {!compact ? (
                  <label className="mb-1 block text-sm font-semibold text-[#4b463f]">
                    {labelAt(i)}
                  </label>
                ) : null}
                <input
                  type="text"
                  value={row}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = e.target.value;
                    patch(field.key, next);
                  }}
                  placeholder="Type here…"
                  className={fieldInputClass}
                />
              </div>
              {rows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = rows.filter((_, j) => j !== i);
                    patch(field.key, next.length > 0 ? next : [""]);
                  }}
                  className={
                    desk
                      ? "mt-0 shrink-0 self-end rounded-lg border border-[#c9bfb0] bg-white px-2 py-2 text-xs font-semibold text-[#6b635a]"
                      : "mt-0 shrink-0 self-end rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-xs font-semibold text-[#6b635a] hover:border-[#a85c4a]/40 hover:text-[#a85c4a]"
                  }
                  aria-label={`Remove ${labelAt(i)}`}
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            onClick={() => patch(field.key, [...rows, ""])}
            className={
              desk
                ? "rounded-lg border border-dashed border-[#c4a876]/45 bg-transparent px-3 py-1.5 text-xs font-semibold text-[#8a7a62] hover:bg-[#c4a876]/8"
                : "rounded-xl border border-dashed border-[#1e4f4f]/40 bg-white px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/5"
            }
          >
            {field.addLabel ?? "Add another"}
          </button>
        </div>
      );
    }

    case "labeled-fields": {
      const rows = getStringArray(answers[field.key]);
      const values =
        rows.length >= field.fields.length
          ? rows
          : [...rows, ...Array(field.fields.length - rows.length).fill("")];
      return (
        <div className="mt-4 space-y-3">
          {field.fields.map((f, i) => (
            <div key={f.label}>
              <label className="mb-1 block text-sm font-semibold text-[#4b463f]">
                {f.label}
              </label>
              <input
                type="text"
                value={values[i] ?? ""}
                onChange={(e) => {
                  const next = [...values];
                  next[i] = e.target.value;
                  patch(field.key, next);
                }}
                placeholder={f.placeholder ?? "Type here…"}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      );
    }

    case "review-list": {
      const items = filledOptions(answers[field.fromKey]);
      return (
        <div className="mt-4 rounded-xl border border-[#e7dfd4] bg-[#faf7f2] px-4 py-3">
          {field.title ? (
            <p className="mb-2 text-sm font-semibold text-[#1e4f4f]">
              {field.title}
            </p>
          ) : null}
          {items.length === 0 ? (
            <p className="text-sm text-[#6b635a]">Nothing entered yet.</p>
          ) : (
            <ul className="space-y-2 text-base text-[#1f1c19]">
              {items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-semibold text-[#9a8f82]">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    case "eliminate-from": {
      const items = filledOptions(answers[field.key]);
      return (
        <div className="mt-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-[#6b635a]">No options to narrow yet.</p>
          ) : (
            items.map((item, i) => (
              <div
                key={`${item}-${i}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
              >
                <span className="text-base text-[#1f1c19]">{item}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_, j) => j !== i);
                    patch(field.key, next);
                  }}
                  className="shrink-0 rounded-lg border border-[#c9bfb0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b635a] hover:border-[#a85c4a]/40 hover:text-[#a85c4a]"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      );
    }

    case "pick-from": {
      const items = filledOptions(answers[field.fromKey]);
      const selected = getTextAnswer(answers, field.key);
      return (
        <div className="mt-4 space-y-2">
          {field.label ? (
            <p className="text-sm font-semibold text-[#4b463f]">{field.label}</p>
          ) : null}
          {items.length === 0 ? (
            <p className="text-sm text-[#6b635a]">
              Nothing listed yet — you can continue, or tap Back to add items.
            </p>
          ) : (
            items.map((item) => {
              const active = selected === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => patch(field.key, item)}
                  className={`flex w-full rounded-xl border px-4 py-3 text-left text-base transition-colors ${
                    active
                      ? "border-[#1e4f4f] bg-[#1e4f4f]/10 font-semibold text-[#1e4f4f]"
                      : "border-[#e7dfd4] bg-white text-[#1f1c19] hover:border-[#1e4f4f]/30"
                  }`}
                >
                  {item}
                </button>
              );
            })
          )}
        </div>
      );
    }

    case "choice":
      return (
        <div className="mt-4 flex flex-wrap gap-2">
          {field.label ? (
            <p className="mb-1 w-full text-sm font-semibold text-[#4b463f]">
              {field.label}
            </p>
          ) : null}
          {field.choices.map((choice) => {
            const active = getTextAnswer(answers, field.key) === choice;
            return (
              <button
                key={choice}
                type="button"
                onClick={() => patch(field.key, choice)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                    : "border-[#1e4f4f]/30 bg-white text-[#1e4f4f] hover:bg-[#1e4f4f]/5"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>
      );

    case "bucket-assign": {
      const items = filledOptions(answers[field.fromKey]);
      const map =
        answers[field.key] && typeof answers[field.key] === "object"
          ? (answers[field.key] as Record<string, string>)
          : {};
      return (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
            >
              <p className="text-base font-medium text-[#1f1c19]">{item}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {field.buckets.map((bucket) => {
                  const active = map[item] === bucket.id;
                  return (
                    <button
                      key={bucket.id}
                      type="button"
                      onClick={() =>
                        patch(field.key, { ...map, [item]: bucket.id })
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        active
                          ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                          : "border-[#c9bfb0] bg-white text-[#4b463f]"
                      }`}
                    >
                      {bucket.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
