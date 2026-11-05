import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";

export function proxy(req: NextRequest) {
  if (isAdminAuthorized(req.headers.get("authorization"))) return NextResponse.next();
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/send-payment-request"],
};
