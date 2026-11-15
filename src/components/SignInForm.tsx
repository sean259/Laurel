"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";

const input =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-400/15";
const button =
  "w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50";

/** Two steps: enter your email, then the 6-digit code we send to it. New emails get an account automatically. */
export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "sign-in" });
    setBusy(false);
    if (error) return setError(error.message ?? "Couldn't send the code. Try again in a minute.");
    setStep("code");
    setCode("");
    setNotice(`We sent a code to ${email.trim()}. It may take a minute — check your spam folder too.`);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.signIn.emailOtp({ email: email.trim(), otp: code.trim() });
    if (error) {
      setBusy(false);
      return setError(error.message ?? "That code didn't work.");
    }
    router.replace(next);
    router.refresh();
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={input}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className={button}>
          {busy ? "Sending…" : "Email me a code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      {notice && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{notice}</p>}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Code</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
          maxLength={6}
          pattern="[0-9]{6}"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className={`${input} text-center font-mono text-2xl tracking-[0.5em]`}
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy || code.length !== 6} className={button}>
        {busy ? "Checking…" : "Sign in"}
      </button>
      <div className="flex justify-between text-sm">
        <button type="button" onClick={() => setStep("email")} className="text-zinc-500 hover:text-zinc-900">
          ← Different email
        </button>
        <button type="button" disabled={busy} onClick={() => sendCode()} className="text-zinc-500 hover:text-zinc-900">
          Resend code
        </button>
      </div>
    </form>
  );
}
