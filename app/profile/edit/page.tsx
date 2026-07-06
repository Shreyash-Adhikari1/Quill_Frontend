"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import { changePasswordSchema, profileSchema } from "@/lib/schemas";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Shell } from "@/components/Shell";
import { PasswordStrength } from "@/components/PasswordStrength";

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof changePasswordSchema>;

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const [mfaQr, setMfaQr] = useState("");
  const [mfaKey, setMfaKey] = useState("");
  const [mfaOtp, setMfaOtp] = useState("");
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.fullName || "",
      bio: user?.bio || "",
    },
  });
  const passwordForm = useForm<PasswordInput>({ resolver: zodResolver(changePasswordSchema) });
  const newPassword = useWatch({ control: passwordForm.control, name: "newPassword" });

  async function saveProfile(values: ProfileInput) {
    // Client-side validation here is for UX ONLY; backend authorization and Zod validation remain authoritative.
    const formData = new FormData();
    formData.append("fullName", values.fullName);
    formData.append("bio", values.bio || "");
    if (avatarFile) {
      // Avatar uploads go through multer's profile-image field so files are filtered and stored server-side.
      formData.append("profile-image", avatarFile);
    }
    await api.patch("/user/me", formData);
    await refreshUser();
    setAvatarFile(null);
    setMessage("Profile updated successfully.");
  }

  async function changePassword(values: PasswordInput) {
    // Client-side validation here is for UX ONLY; never trust password changes unless the backend accepts them.
    await api.patch("/user/me/password", values);
    passwordForm.reset();
    setMessage("Password changed successfully.");
  }

  async function setupMfa() {
    // MFA setup returns a QR image for an authenticator app; the secret is confirmed before it becomes active.
    const response = await api.post("/user/me/mfa/setup");
    setMfaQr(response.data.qrCodeDataUrl);
    setMfaKey(response.data.manualEntryKey);
  }

  async function confirmMfa() {
    await api.post("/user/me/mfa/confirm", { otp: mfaOtp });
    await refreshUser();
    setMfaOtp("");
    setMfaQr("");
    setMfaKey("");
    setMessage("Two-factor authentication enabled.");
  }

  async function disableMfa() {
    await api.post("/user/me/mfa/disable", { otp: mfaOtp });
    await refreshUser();
    setMfaOtp("");
    setMessage("Two-factor authentication disabled.");
  }

  async function exportData() {
    // Export endpoint returns only sanitized personal data and excludes auth secrets.
    const response = await api.get("/user/me/export");
    const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quill-data-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importData() {
    await api.post("/user/me/import", {
      fullName: profileForm.getValues("fullName"),
      bio: profileForm.getValues("bio"),
    });
    await refreshUser();
    setMessage("Profile data imported successfully.");
  }

  return (
    <ProtectedRoute>
      <Shell>
        <main className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="font-heading text-4xl">Edit profile</h1>
          <form className="mt-8 grid gap-4 border-b border-line pb-8" onSubmit={profileForm.handleSubmit(saveProfile)}>
            <input className="field" placeholder="Full name" {...profileForm.register("fullName")} />
            <textarea className="field min-h-32" placeholder="Bio" {...profileForm.register("bio")} />
            <label className="grid gap-2 text-sm text-muted">
              Avatar image
              <input className="field" type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} />
            </label>
            {Object.values(profileForm.formState.errors).map((error) => <p key={error.message} className="text-sm text-red-700">{error.message}</p>)}
            <button className="btn btn-primary w-fit" disabled={profileForm.formState.isSubmitting}>Save profile</button>
          </form>
          <form className="mt-8 grid gap-4" onSubmit={passwordForm.handleSubmit(changePassword)}>
            <h2 className="font-heading text-2xl">Change password</h2>
            <input className="field" placeholder="Current password" type="password" {...passwordForm.register("currentPassword")} />
            <input className="field" placeholder="New password" type="password" {...passwordForm.register("newPassword")} />
            <PasswordStrength value={newPassword || ""} />
            {Object.values(passwordForm.formState.errors).map((error) => <p key={error.message} className="text-sm text-red-700">{error.message}</p>)}
            <button className="btn btn-secondary w-fit" disabled={passwordForm.formState.isSubmitting}>Change password</button>
          </form>
          <section className="mt-8 grid gap-4 border-t border-line pt-8">
            <h2 className="font-heading text-2xl">Two-factor authentication</h2>
            <p className="text-sm text-muted">Status: {user?.otpEnabled ? "Enabled" : "Disabled"}</p>
            {!user?.otpEnabled ? <button className="btn btn-secondary w-fit" onClick={setupMfa}>Set up 2FA</button> : null}
            {mfaQr ? <img src={mfaQr} alt="Authenticator QR code" className="h-44 w-44 rounded-quill border border-line" /> : null}
            {mfaKey ? <p className="break-all text-sm text-muted">Manual key: {mfaKey}</p> : null}
            <input className="field max-w-xs" placeholder="6-digit authenticator code" maxLength={6} inputMode="numeric" value={mfaOtp} onChange={(event) => setMfaOtp(event.target.value.replace(/\D/g, ""))} />
            {!user?.otpEnabled ? <button className="btn btn-primary w-fit" disabled={mfaOtp.length !== 6 || !mfaQr} onClick={confirmMfa}>Enable 2FA</button> : <button className="btn btn-secondary w-fit" disabled={mfaOtp.length !== 6} onClick={disableMfa}>Disable 2FA</button>}
          </section>
          <section className="mt-8 grid gap-4 border-t border-line pt-8">
            <h2 className="font-heading text-2xl">Privacy data</h2>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-secondary" onClick={exportData}>Export my data</button>
              <button className="btn btn-secondary" onClick={importData}>Import profile fields</button>
            </div>
          </section>
          {message ? <p className="mt-5 text-sm text-accent">{message}</p> : null}
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
