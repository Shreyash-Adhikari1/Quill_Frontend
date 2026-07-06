"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifyLoginOtpPage() {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const { refreshUser } = useAuth();

  async function submit() {
    // The backend validates the TOTP against the server-stored secret before issuing the real session cookie.
    await api.post("/user/verify-login-otp", { otp });
    await refreshUser();
    router.push("/feed");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-12">
      <h1 className="font-heading text-4xl">Two-factor check</h1>
      <p className="mt-3 text-muted">Enter your 6-digit login code.</p>
      <input className="field mt-6 text-center text-2xl tracking-[0.4em]" maxLength={6} inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} />
      <button className="btn btn-primary mt-4" disabled={otp.length !== 6} onClick={submit}>Continue</button>
    </main>
  );
}
