"use client";

import { useState } from "react";

export function ReclassifyUnknownBotsButton() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function reclassify() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/analytics/bots/reclassify-unknown", {
        method: "POST",
      });
      const result = (await response.json()) as { updated?: number; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update bot names");
      setMessage(`Updated ${result.updated ?? 0} request records.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update bot names");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={reclassify}
        disabled={pending}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Correcting bot names…" : "Correct old bot names"}
      </button>
      {message && <p role="status" className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
