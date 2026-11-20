"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, type ButtonVariant } from "../atoms/Button";
import { ErrorText } from "../atoms/Alert";
import { Spinner } from "../atoms/Spinner";

/** Button that POSTs to an API route, then refreshes the page. Shows progress and any error. */
export function ActionButton({
  url,
  label,
  busyLabel,
  variant = "primary",
  inverse = false,
  align = "end",
}: {
  url: string;
  label: string;
  busyLabel: string;
  variant?: ButtonVariant;
  /** Set when placed on a dark surface, so the error text stays readable. */
  inverse?: boolean;
  align?: "start" | "end";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Something went wrong");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className={`flex flex-col gap-1.5 ${align === "end" ? "items-start sm:items-end" : "items-start"}`}>
      <Button variant={variant} onClick={run} disabled={busy} aria-busy={busy}>
        {busy && <Spinner />}
        {busy ? busyLabel : label}
      </Button>
      {error && <ErrorText inverse={inverse}>{error}</ErrorText>}
    </div>
  );
}
