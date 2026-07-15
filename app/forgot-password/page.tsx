"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import { emailSchema } from "@/lib/schemas";

type Input = z.infer<typeof emailSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<Input>({ resolver: zodResolver(emailSchema) });
  async function onSubmit(values: Input) {
    // Client-side validation here is for UX ONLY; backend rate limits and validation protect the reset flow.
    try {
      setError("");
      setMessage("");
      const response = await api.post("/user/request-password-reset", values);
      setMessage(response.data?.message || "If the email is registered, a reset OTP has been sent.");
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message || err.response?.data?.error) : undefined;
      setError(message || "Could not send reset OTP.");
    }
  }
  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-12">
      <h1 className="font-heading text-4xl">Reset your password</h1>
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input className="field" placeholder="Email" type="email" {...register("email")} />
        {formState.errors.email ? <p className="text-sm text-red-700">{formState.errors.email.message}</p> : null}
        {message ? <p className="text-sm text-accent">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn btn-primary" disabled={formState.isSubmitting}>Send reset OTP</button>
      </form>
    </main>
  );
}
