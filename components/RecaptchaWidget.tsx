"use client";

import Script from "next/script";

declare global {
  interface Window {
    grecaptcha?: {
      reset?: () => void;
    };
  }
}

export function getRecaptchaToken() {
  // Google writes the solved widget token into this hidden textarea for the current page.
  return document.querySelector<HTMLTextAreaElement>('textarea[name="g-recaptcha-response"]')?.value || "";
}

export function resetRecaptcha() {
  // Resetting after failed auth forces a fresh single-use token instead of replaying an expired one.
  window.grecaptcha?.reset?.();
}

export function RecaptchaWidget({ action }: { action: "LOGIN" | "REGISTER" }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  if (!siteKey) {
    return <p className="text-sm text-red-700">reCAPTCHA site key is not configured.</p>;
  }

  return (
    <div className="min-h-[78px]">
      <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" />
      {/* Google renders the checkbox/challenge here and returns a token that the backend verifies with the secret key. */}
      <div className="g-recaptcha" data-sitekey={siteKey} data-action={action} />
    </div>
  );
}
