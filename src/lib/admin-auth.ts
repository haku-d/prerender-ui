import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const ADMIN_USERNAME = "anvy";

function credentialsMatch(authorization: string | null, password: string) {
  if (!authorization) return false;

  const match = /^Basic\s+([A-Za-z0-9+/]+={0,2})$/i.exec(authorization);
  if (!match) return false;

  let decoded: string;
  try {
    const encoded = match[1];
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.toString("base64") !== encoded) return false;
    decoded = bytes.toString("utf8");
  } catch {
    return false;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0 || decoded.slice(0, separator) !== ADMIN_USERNAME) {
    return false;
  }

  const suppliedPassword = Buffer.from(decoded.slice(separator + 1));
  const configuredPassword = Buffer.from(password);
  return (
    suppliedPassword.length === configuredPassword.length &&
    timingSafeEqual(suppliedPassword, configuredPassword)
  );
}

export function requireAdminAuth(request: Request): NextResponse | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse("Admin authentication is not configured", {
      status: 503,
    });
  }

  if (credentialsMatch(request.headers.get("authorization"), password)) {
    return null;
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Prerender Admin", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}
