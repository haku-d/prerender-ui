import type { NextRequest } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  return requireAdminAuth(request) ?? undefined;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
