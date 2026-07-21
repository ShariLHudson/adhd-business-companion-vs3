"use client";

import { useMemo, useState } from "react";
import {
  resolveCompanyBlueprintAuth,
} from "@/lib/universalBlueprintInterface";
import {
  confirmSaveAsBlueprint,
  prepareSaveAsBlueprint,
  type SaveAsBlueprintReview,
} from "@/lib/universalWorkEngine";

type Props = {
  workId: string;
  companyId?: string | null;
  companyRole?: string | null;
  onSaved: (blueprintId: string, category: "personal" | "company") => void;
  onCancel?: () => void;
};

/**
 * Save as Personal / Company Blueprint with review confirmation.
 */
export function SaveAsBlueprintReviewPanel({
  workId,
  companyId,
  companyRole,
  onSaved,
  onCancel,
}: Props) {
  const companyAuth = useMemo(
    () => resolveCompanyBlueprintAuth({ companyId, role: companyRole }),
    [companyId, companyRole],
  );
  const [category, setCategory] = useState<"personal" | "company">("personal");
  const [title, setTitle] = useState("");
  const [review, setReview] = useState<SaveAsBlueprintReview | null>(null);
  const [retainKeys, setRetainKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const prepare = () => {
    setError(null);
    if (category === "company" && !companyAuth.canSaveCompanyBlueprints) {
      setError(
        companyAuth.reasonIfDenied ??
          "Company Blueprints aren’t available right now.",
      );
      return;
    }
    try {
      const next = prepareSaveAsBlueprint({
        workId,
        category,
        title: title.trim() || undefined,
        retainKeys,
      });
      setReview(next);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "I couldn’t prepare that Blueprint yet.",
      );
    }
  };

  const confirm = () => {
    if (!review) return;
    setBusy(true);
    setError(null);
    try {
      const refreshed = prepareSaveAsBlueprint({
        workId,
        category: review.category,
        title: title.trim() || review.title,
        retainKeys,
      });
      const saved = confirmSaveAsBlueprint({
        workId,
        review: refreshed,
        confirm: true,
      });
      onSaved(saved.blueprintId, saved.category === "company" ? "company" : "personal");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "I couldn’t save that Blueprint yet.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="ubi-root"
      data-testid="ubi-save-as-blueprint"
      aria-labelledby="ubi-save-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="ubi-save-heading" className="text-xl">
            Save as Blueprint
          </h2>
          <p className="ubi-muted mt-1">
            Review what stays and what should be made generic. Your original
            work is unchanged.
          </p>
        </div>
        {onCancel ? (
          <button type="button" className="ubi-secondary" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <div className="ubi-chip-row mt-4">
        <button
          type="button"
          className="ubi-chip"
          aria-pressed={category === "personal"}
          data-testid="ubi-save-category-personal"
          onClick={() => {
            setCategory("personal");
            setReview(null);
          }}
        >
          Personal
        </button>
        <button
          type="button"
          className="ubi-chip"
          aria-pressed={category === "company"}
          data-testid="ubi-save-category-company"
          disabled={!companyAuth.canSaveCompanyBlueprints}
          onClick={() => {
            setCategory("company");
            setReview(null);
          }}
        >
          Company
        </button>
      </div>
      {category === "company" && !companyAuth.canSaveCompanyBlueprints ? (
        <p className="ubi-muted mt-2">{companyAuth.reasonIfDenied}</p>
      ) : null}

      <label className="mt-3 block">
        <span className="text-sm font-semibold">Name</span>
        <input
          className="ubi-field mt-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Blueprint"
          data-testid="ubi-save-title"
        />
      </label>

      {!review ? (
        <button
          type="button"
          className="ubi-primary mt-4"
          data-testid="ubi-save-prepare"
          onClick={prepare}
        >
          Review what will be saved
        </button>
      ) : (
        <div className="ubi-panel mt-4" data-testid="ubi-save-review">
          <p className="font-semibold">{review.title}</p>
          <p className="ubi-muted mt-1">{review.description}</p>
          {review.removedFields.length > 0 ? (
            <div className="mt-3">
              <p className="text-sm font-semibold">Will be generalized</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-[var(--ubi-muted)]">
                {review.removedFields.map((f) => (
                  <li key={f}>{f.replace(/_/g, " ")}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {review.requiresExplicitRetain.length > 0 ? (
            <div className="mt-3">
              <p className="text-sm font-semibold">
                Keep specific details only if needed
              </p>
              <ul className="mt-2 space-y-1">
                {review.requiresExplicitRetain.map((key) => (
                  <li key={key}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={retainKeys.includes(key)}
                        data-testid={`ubi-save-retain-${key}`}
                        onChange={(e) => {
                          setRetainKeys((prev) =>
                            e.target.checked
                              ? [...prev, key]
                              : prev.filter((k) => k !== key),
                          );
                          setReview(null);
                        }}
                      />
                      Keep {key.replace(/_/g, " ")}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <button
            type="button"
            className="ubi-primary mt-4"
            data-testid="ubi-save-confirm"
            disabled={busy}
            onClick={confirm}
          >
            {busy ? "Saving…" : "Confirm and save Blueprint"}
          </button>
        </div>
      )}

      {error ? (
        <p className="ubi-error" role="alert" data-testid="ubi-save-error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
