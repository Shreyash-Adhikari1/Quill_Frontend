"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import { resetPasswordSchema } from "@/lib/schemas";
import { PasswordStrength } from "@/components/PasswordStrength";

type Input = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, control, formState, setValue } = useForm<Input>({ resolver: zodResolver(resetPasswordSchema) });
  const password = useWatch({ control, name: "password" });
  useEffect(() => {
    const email = new URLSearchParams(window.location.search).get("email");
    if (email) setValue("email", email);
  }, [setValue]);
  async function onSubmit(values: Input) {
    // Client-side validation here is for UX ONLY; backend validates the OTP and new password policy.
    try {
      setError("");
      setMessage("");
      const response = await api.post("/user/reset-password", { email: values.email, otp: values.otp, newPassword: values.password });
      setMessage(response.data?.message || "Password reset successfully.");
      router.replace("/login");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message || err.response?.data?.error) : undefined;
      setError(message || "Password reset failed.");
    }
  }
  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-6 py-12">
      <h1 className="font-heading text-4xl">Choose a new password</h1>
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input className="field" placeholder="Email" type="email" {...register("email")} />
        <input className="field" placeholder="Reset OTP" maxLength={6} {...register("otp")} />
        <input className="field" placeholder="New password" type="password" {...register("password")} />
        <PasswordStrength value={password || ""} />
        {Object.values(formState.errors).map((error) => <p key={error.message} className="text-sm text-red-700">{error.message}</p>)}
        {message ? <p className="text-sm text-accent">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn btn-primary" disabled={formState.isSubmitting}>Reset password</button>
      </form>
    </main>
  );
}
