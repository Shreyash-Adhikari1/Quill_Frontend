"use client";

import { useEffect } from "react";
import api from "@/lib/api";

export function CsrfInitializer() {
  useEffect(() => {
    // This runs once on app load before login/register/comment/post mutations.
    // The backend sets a readable csrf-token cookie; lib/api.ts copies that value
    // into X-CSRF-Token for future state-changing requests.
    void api.get("/csrf-token").catch(() => undefined);
  }, []);

  return null;
}
