"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Alert } from "../atoms/Alert";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Spinner } from "../atoms/Spinner";
import { Field } from "../molecules/Field";

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
    setNotice(`We sent a code to ${email.trim()}. It may take a minute, so check your spam folder too.`);
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
        <Field label="Email">
          <Input
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" size="lg" block disabled={busy}>
          {busy && <Spinner />}
          {busy ? "Sending…" : "Email me a code"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      {notice && <Alert tone="info">{notice}</Alert>}
      <Field label="6-digit code">
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
          maxLength={6}
          pattern="[0-9]{6}"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="text-center font-mono text-2xl tracking-[0.5em]"
        />
      </Field>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" size="lg" block disabled={busy || code.length !== 6}>
        {busy && <Spinner />}
        {busy ? "Checking…" : "Sign in"}
      </Button>
      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => setStep("email")}>
          <span aria-hidden>←</span> Different email
        </Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => sendCode()}>
          Resend code
        </Button>
      </div>
    </form>
  );
}
