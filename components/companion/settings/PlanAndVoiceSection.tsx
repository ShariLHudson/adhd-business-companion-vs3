"use client";

import { useCallback, useEffect, useState } from "react";
import { getPrefs, getVoiceStatus, type Plan } from "@/lib/companionStore";
import { getCompanionSupabase } from "@/lib/supabase/companionClient";
import {
  isCurrentVoicePlan,
  markVoicePlanPaymentPending,
  readVoicePlanPaymentPending,
  resolveVoicePlanEntitlement,
  syncVoicePlanPendingWithEntitlement,
  type VoicePlanEntitlementState,
} from "@/lib/voicePlans/voicePlanEntitlement";
import {
  VOICE_PLAN_COPY,
  paymentLinkWithUserCorrelation,
} from "@/lib/voicePlans/voicePlanOffers";
import { refreshVoicePlanEntitlementFromServer } from "@/lib/voicePlans/voicePlanServerSync";

type Props = {
  /** Optional override for tests. Defaults to prefs.plan. */
  plan?: Plan;
  /** Test seam — skip network refresh. */
  disableServerRefresh?: boolean;
};

function PlanCard(props: {
  title: string;
  status: string;
  current: boolean;
  children?: React.ReactNode;
  testId: string;
}) {
  return (
    <article
      className={
        props.current
          ? "w-full rounded-2xl border-2 border-[#1e4f4f] bg-[#1e4f4f]/[0.06] p-4 text-left"
          : "w-full rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 text-left"
      }
      data-testid={props.testId}
      data-current-voice-plan={props.current ? "true" : "false"}
      aria-current={props.current ? "true" : undefined}
    >
      <h3 className="text-lg font-semibold leading-snug text-[#1f1c19]">
        {props.title}
      </h3>
      {props.current ? (
        <p
          className="mt-1 text-sm font-semibold text-[#1e4f4f]"
          data-testid={`${props.testId}-current`}
        >
          {VOICE_PLAN_COPY.currentVoicePlan}
        </p>
      ) : null}
      {props.status ? (
        <p
          className="mt-1 text-base leading-relaxed text-[#3d3429]"
          data-testid={`${props.testId}-status`}
        >
          {props.status}
        </p>
      ) : null}
      {props.children}
    </article>
  );
}

export function PlanAndVoiceSection({
  plan: planProp,
  disableServerRefresh = false,
}: Props) {
  const [entitlement, setEntitlement] = useState<VoicePlanEntitlementState>(
    () => resolveVoicePlanEntitlement(planProp ?? getPrefs().plan),
  );
  const [pendingPlan, setPendingPlan] = useState<
    "voice-lite" | "voice-pro" | null
  >(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [softStatus, setSoftStatus] = useState<string | null>(null);

  const refreshLocal = useCallback(() => {
    const plan = planProp ?? getPrefs().plan;
    syncVoicePlanPendingWithEntitlement(plan);
    setEntitlement(resolveVoicePlanEntitlement(plan));
    const pending = readVoicePlanPaymentPending();
    setPendingPlan(pending?.plan ?? null);
  }, [planProp]);

  const refreshFromServer = useCallback(async () => {
    if (disableServerRefresh || planProp) {
      refreshLocal();
      return;
    }
    const result = await refreshVoicePlanEntitlementFromServer();
    refreshLocal();
    if (!result.ok) {
      setSoftStatus(result.statusMessage);
      return;
    }
    if (result.confirmationMessage) {
      setConfirmation(result.confirmationMessage);
      setSoftStatus(null);
    }
  }, [disableServerRefresh, planProp, refreshLocal]);

  useEffect(() => {
    void refreshFromServer();
  }, [refreshFromServer]);

  useEffect(() => {
    if (disableServerRefresh || planProp) return;
    const onFocus = () => {
      void refreshFromServer();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshFromServer();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [disableServerRefresh, planProp, refreshFromServer]);

  const vs = getVoiceStatus();
  const essentialCurrent = isCurrentVoicePlan(entitlement, "essential");
  const liteCurrent = isCurrentVoicePlan(entitlement, "voice-lite");
  const proCurrent = isCurrentVoicePlan(entitlement, "voice-pro");

  async function openPayment(plan: "voice-lite" | "voice-pro") {
    let sparkUserId: string | null = null;
    let email: string | null = null;
    try {
      const client = getCompanionSupabase();
      const session = client ? (await client.auth.getSession()).data.session : null;
      sparkUserId = session?.user?.id ?? null;
      email = session?.user?.email ?? null;
    } catch {
      /* correlation optional */
    }

    const href = paymentLinkWithUserCorrelation(plan, { sparkUserId, email });
    markVoicePlanPaymentPending(plan);
    setPendingPlan(plan);
    setConfirmation(null);
    setSoftStatus(null);
    // Do not change prefs.plan — entitlement stays until verified payment.
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div data-testid="plan-and-voice-section">
      <p className="mt-1 text-sm text-[#6b635a]">
        {VOICE_PLAN_COPY.sectionLead}
      </p>

      {entitlement === "unknown" ? (
        <p
          className="mt-3 rounded-xl bg-[#f3efe8] px-3 py-2 text-sm text-[#6b635a]"
          role="status"
          data-testid="plan-and-voice-unknown"
        >
          {VOICE_PLAN_COPY.unableToDetermine}
        </p>
      ) : null}

      {confirmation ? (
        <p
          className="mt-3 rounded-xl bg-[#e8f2f1] px-3 py-2 text-sm text-[#1e4f4f]"
          role="status"
          data-testid="plan-and-voice-confirmed"
        >
          {confirmation}
        </p>
      ) : null}

      {softStatus ? (
        <p
          className="mt-3 rounded-xl bg-[#f3efe8] px-3 py-2 text-sm text-[#6b635a]"
          role="status"
          data-testid="plan-and-voice-verify-soft-fail"
        >
          {softStatus}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        <PlanCard
          title={VOICE_PLAN_COPY.essentialLabel}
          status={VOICE_PLAN_COPY.includedWithPlan}
          current={essentialCurrent}
          testId="voice-plan-essential"
        />

        <PlanCard
          title={VOICE_PLAN_COPY.liteLabel}
          status={
            liteCurrent || proCurrent
              ? ""
              : VOICE_PLAN_COPY.additionalMonthlyRequired
          }
          current={liteCurrent}
          testId="voice-plan-lite"
        >
          {/* No purchase/downgrade CTA when Lite or Pro is already active. */}
          {!liteCurrent && !proCurrent ? (
            <>
              <a
                href={paymentLinkWithUserCorrelation("voice-lite", {})}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                data-testid="voice-plan-lite-choose"
                aria-label={VOICE_PLAN_COPY.subscribeLiteAria}
                onClick={(e) => {
                  e.preventDefault();
                  void openPayment("voice-lite");
                }}
              >
                {VOICE_PLAN_COPY.chooseLite}
              </a>
              {pendingPlan === "voice-lite" ? (
                <p
                  className="mt-2 text-sm leading-relaxed text-[#6b635a]"
                  role="status"
                  data-testid="voice-plan-lite-pending"
                >
                  {VOICE_PLAN_COPY.pendingPayment}
                </p>
              ) : null}
            </>
          ) : null}
        </PlanCard>

        <PlanCard
          title={VOICE_PLAN_COPY.proLabel}
          status={proCurrent ? "" : VOICE_PLAN_COPY.additionalMonthlyRequired}
          current={proCurrent}
          testId="voice-plan-pro"
        >
          {!proCurrent ? (
            <>
              <a
                href={paymentLinkWithUserCorrelation("voice-pro", {})}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1e4f4f] px-4 py-3 text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                data-testid="voice-plan-pro-choose"
                aria-label={VOICE_PLAN_COPY.subscribeProAria}
                onClick={(e) => {
                  e.preventDefault();
                  void openPayment("voice-pro");
                }}
              >
                {VOICE_PLAN_COPY.choosePro}
              </a>
              {pendingPlan === "voice-pro" ? (
                <p
                  className="mt-2 text-sm leading-relaxed text-[#6b635a]"
                  role="status"
                  data-testid="voice-plan-pro-pending"
                >
                  {VOICE_PLAN_COPY.pendingPayment}
                </p>
              ) : null}
            </>
          ) : null}
        </PlanCard>
      </div>

      {vs.hasVoice ? (
        <p
          className="mt-3 text-sm text-[#6b635a]"
          data-testid="voice-plan-minutes"
        >
          Voice this month:{" "}
          <span className="font-semibold text-[#1f1c19]">
            {Math.round(vs.usedMin)} / {vs.capMin} min used
          </span>{" "}
          · {Math.ceil(vs.leftMin)} min left
        </p>
      ) : null}
    </div>
  );
}
