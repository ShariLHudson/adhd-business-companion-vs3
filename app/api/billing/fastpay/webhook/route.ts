import { NextResponse } from "next/server";

import { processFastPayWebhook } from "@/lib/billing/fastpay";

export const runtime = "nodejs";

/**
 * FastPay / FastPayDirect webhook — verified signature required.
 * Never trusts browser redirects or payment-page opens alone.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader =
    request.headers.get("x-fastpay-signature") ??
    request.headers.get("X-FastPay-Signature");

  const result = await processFastPayWebhook({
    rawBody,
    signatureHeader,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.code,
        preserveEntitlement: true,
      },
      { status: result.httpStatus },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      applied: result.applied,
      duplicate: result.duplicate,
      plan: result.record?.plan ?? null,
      entitlementStatus: result.record?.entitlementStatus ?? null,
    },
    { status: result.httpStatus },
  );
}
