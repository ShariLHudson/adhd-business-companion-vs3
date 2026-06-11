import { NextResponse } from "next/server";
import { G_COOKIE } from "@/lib/google";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(G_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
