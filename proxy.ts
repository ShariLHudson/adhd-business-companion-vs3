import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  FOUNDER_ADMIN_COOKIE,
  FOUNDER_ADMIN_LOGIN_PATH,
  verifyFounderAdminToken,
} from "@/lib/founderAdmin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isFounderPage = pathname.startsWith("/founder");
  const isFounderApi = pathname.startsWith("/api/founder");
  if (!isFounderPage && !isFounderApi) {
    return NextResponse.next();
  }

  if (isFounderPage && pathname === FOUNDER_ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(FOUNDER_ADMIN_COOKIE)?.value;
  const authorized = await verifyFounderAdminToken(token);

  if (!authorized) {
    if (isFounderApi) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = FOUNDER_ADMIN_LOGIN_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/founder/:path*", "/api/founder/:path*"],
};
