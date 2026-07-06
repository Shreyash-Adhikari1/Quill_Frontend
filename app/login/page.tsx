"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/lib/schemas";

type Input = z.infer<typeof loginSchema>;
type Captcha = { captchaId: string; question: string };

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const { register, handleSubmit, formState } = useForm<Input>({ resolver: zodResolver(loginSchema) });

  async function refreshCaptcha() {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/captcha`, { withCredentials: true });
    setCaptcha(response.data);
  }

  useEffect(() => {
    void refreshCaptcha();
  }, []);

  async function onSubmit(values: Input) {
    // Client-side validation here is for UX ONLY; backend validation and cookie issuance are authoritative.
    try {
      setError("");
      const result = await login({ ...values, captchaId: captcha?.captchaId });
      router.push(result.requiresOtp ? "/verify-login-otp" : "/feed");
    } catch (err: unknown) {
      void refreshCaptcha();
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Login failed. Confirm the backend is running over HTTPS.");
    }
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-12">
      <h1 className="font-heading text-4xl">Welcome back</h1>
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input className="field" placeholder="Email" type="email" {...register("email")} />
        <input className="field" placeholder="Password" type="password" {...register("password")} />
        <label className="grid gap-2 text-sm text-muted">
          {/* CAPTCHA slows automated credential stuffing in addition to backend rate limits and account lockout. */}
          CAPTCHA: {captcha?.question || "Loading..."}
          <input className="field" placeholder="Answer" inputMode="numeric" {...register("captchaAnswer")} />
        </label>
        {Object.values(formState.errors).map((error) => <p key={error.message} className="text-sm text-red-700">{error.message}</p>)}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn btn-primary" disabled={formState.isSubmitting}>Log in</button>
      </form>
      <a
        className="btn btn-secondary mt-3"
        href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
      >
        {/* OAuth must use full page navigation, not fetch/XHR, because Google consent redirects happen in the browser. */}
        Sign in with Google
      </a>
      <div className="mt-5 flex justify-between text-sm text-muted">
        <Link className="text-accent" href="/register">Create account</Link>
        <Link className="text-accent" href="/forgot-password">Forgot password?</Link>
      </div>
    </main>
  );
}
