"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";

declare global {
  interface Window {
    grecaptcha?: {
      reset?: () => void;
      render?: (container: HTMLElement, parameters: { sitekey: string; action: string }) => number;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [siteKey, setSiteKey] = useState(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "");
  const [configLoaded, setConfigLoaded] = useState(Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY));

  useEffect(() => {
    if (siteKey) return;

    // Docker deployments can supply public configuration at container runtime;
    // this avoids relying exclusively on values inlined during `next build`.
    void api.get("/public-config")
      .then((response) => setSiteKey(response.data?.recaptchaSiteKey || ""))
      .catch(() => setSiteKey(""))
      .finally(() => setConfigLoaded(true));
  }, [siteKey]);

  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || renderedRef.current) return;
    if (!window.grecaptcha?.render) return;

    window.grecaptcha.render(containerRef.current, { sitekey: siteKey, action });
    renderedRef.current = true;
  }, [action, scriptReady, siteKey]);

  if (configLoaded && !siteKey) {
    return <p className="text-sm text-red-700">reCAPTCHA site key is not configured.</p>;
  }

  return (
    <div className="min-h-[78px]">
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      {/* Google renders the checkbox/challenge here and returns a token that the backend verifies with the secret key. */}
      <div ref={containerRef} />
    </div>
  );
}
