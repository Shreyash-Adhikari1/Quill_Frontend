"use client";

import { passwordRules } from "@/lib/schemas";

export function PasswordStrength({ value }: { value: string }) {
  return (
    <div className="grid gap-2 text-sm">
      {passwordRules.map((rule) => {
        const met = rule.test(value);
        return (
          <div key={rule.label} className={met ? "text-accent" : "text-muted"}>
            {met ? "✓" : "○"} {rule.label}
          </div>
        );
      })}
    </div>
  );
}
