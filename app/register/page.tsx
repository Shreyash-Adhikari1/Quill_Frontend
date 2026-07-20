"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import { registerSchema } from "@/lib/schemas";
import { PasswordStrength } from "@/components/PasswordStrength";
import { getRecaptchaToken, RecaptchaWidget, resetRecaptcha } from "@/components/RecaptchaWidget";

type Input = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, control, formState } = useForm<Input>({ resolver: zodResolver(registerSchema) });
  const password = useWatch({ control, name: "password" });

  async function onSubmit(values: Input) {
    // Client-side validation here is for UX ONLY; backend Zod validation remains authoritative.
    try {
      setError("");
      const recaptchaToken = getRecaptchaToken();
      if (!recaptchaToken) {
        setError("Complete the reCAPTCHA challenge before registering.");
        return;
      }
      await api.post("/user/register", { ...values, recaptchaToken });
      router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (err: unknown) {
      resetRecaptcha();
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Registration failed. Use a unique username/email, a strong password, and complete reCAPTCHA.");
    }
  }

  return (
    <main className="auth-shell">
      <h1 className="font-heading text-4xl font-semibold">Make room for your thoughts.</h1>
      <p className="mt-2 leading-7 text-muted">A calm writing space, ready when you are.</p>
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input className="field" placeholder="Full name" {...register("fullName")} />
        <input className="field" placeholder="Username" {...register("username")} />
        <input className="field" placeholder="Email" type="email" {...register("email")} />
        <input className="field" placeholder="Password" type="password" {...register("password")} />
        <PasswordStrength value={password || ""} />
        <RecaptchaWidget action="REGISTER" />
        {Object.values(formState.errors).map((error) => <p key={error.message} className="text-sm text-red-700">{error.message}</p>)}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn btn-primary" disabled={formState.isSubmitting}>Register</button>
      </form>
      <p className="mt-5 text-sm text-muted">Already writing here? <Link className="text-accent" href="/login">Log in</Link></p>
    </main>
  );
}
