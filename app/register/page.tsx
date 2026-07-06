"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import { registerSchema } from "@/lib/schemas";
import { PasswordStrength } from "@/components/PasswordStrength";

type Input = z.infer<typeof registerSchema>;
type Captcha = { captchaId: string; question: string };

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const { register, handleSubmit, control, formState } = useForm<Input>({ resolver: zodResolver(registerSchema) });
  const password = useWatch({ control, name: "password" });

  async function refreshCaptcha() {
    const response = await api.get("/user/captcha");
    setCaptcha(response.data);
  }

  useEffect(() => {
    void refreshCaptcha();
  }, []);

  async function onSubmit(values: Input) {
    // Client-side validation here is for UX ONLY; backend Zod validation remains authoritative.
    try {
      setError("");
      await api.post("/user/register", { ...values, captchaId: captcha?.captchaId });
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (err: unknown) {
      void refreshCaptcha();
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Registration failed. Use a unique username/email, a strong password, and the current CAPTCHA answer.");
    }
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-12">
      <h1 className="font-heading text-4xl">Create your Quill account</h1>
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input className="field" placeholder="Full name" {...register("fullName")} />
        <input className="field" placeholder="Username" {...register("username")} />
        <input className="field" placeholder="Email" type="email" {...register("email")} />
        <input className="field" placeholder="Password" type="password" {...register("password")} />
        <PasswordStrength value={password || ""} />
        <label className="grid gap-2 text-sm text-muted">
          {/* CAPTCHA reduces automated fake-account creation before backend registration work runs. */}
          CAPTCHA: {captcha?.question || "Loading..."}
          <input className="field" placeholder="Answer" inputMode="numeric" {...register("captchaAnswer")} />
        </label>
        {Object.values(formState.errors).map((error) => <p key={error.message} className="text-sm text-red-700">{error.message}</p>)}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn btn-primary" disabled={formState.isSubmitting}>Register</button>
      </form>
      <p className="mt-5 text-sm text-muted">Already writing here? <Link className="text-accent" href="/login">Log in</Link></p>
    </main>
  );
}
