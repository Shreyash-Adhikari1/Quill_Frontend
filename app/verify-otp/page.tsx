"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import axios from "axios";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function submit() {
    // Email verification proves mailbox ownership before the backend allows login.
    try {
      setError("");
      setIsSubmitting(true);
      await api.post("/user/verify-otp", { email, otp });
      router.push("/login");
    } catch (err: unknown) {
      const responseMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(responseMessage || "Verification failed. Check the code and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resend() {
    try {
      setError("");
      const response = await api.post("/user/resend-otp", { email });
      setCooldown(30);
      setMessage(response.data?.message || "A new code was sent.");
    } catch (err: unknown) {
      const responseMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(responseMessage || "Could not resend the verification code.");
    }
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-12">
      <h1 className="font-heading text-4xl">Verify your email</h1>
      <p className="mt-3 text-muted">Enter the 6-digit code sent after registration.</p>
      <input className="field mt-6" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <input className="field mt-4 text-center text-2xl tracking-[0.4em]" maxLength={6} inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} />
      <button className="btn btn-primary mt-4" disabled={!email || otp.length !== 6 || isSubmitting} onClick={submit}>Verify</button>
      <button className="mt-4 text-sm text-accent disabled:text-muted" disabled={cooldown > 0} onClick={resend}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}</button>
      {message ? <p className="mt-3 text-sm text-accent">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-12 text-muted">Loading verification...</main>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
