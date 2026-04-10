import { NextRequest, NextResponse } from "next/server";
import { fetchPages } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const limit = searchParams.get("limit") ?? "50";
  const bot = searchParams.get("bot") ?? "";
  try {
    const data = await fetchPages(from, to, limit, bot);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
