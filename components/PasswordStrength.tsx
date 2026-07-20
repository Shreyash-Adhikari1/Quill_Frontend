"use client";

import { passwordRules } from "@/lib/schemas";

export function PasswordStrength({ value }: { value: string }) {
  return (
    <div className="grid gap-2 rounded-quill bg-[#f7f2e9] p-4 text-sm">
      {passwordRules.map((rule) => {
        const met = rule.test(value);
        return (
          <div key={rule.label} className={`flex items-center gap-2 ${met ? "font-medium text-[#66705d]" : "text-muted"}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full text-xs ${met ? "bg-[#dce4d3]" : "border border-line"}`} aria-hidden="true">
              {met ? "✓" : ""}
            </span>
            {rule.label}
          </div>
        );
      })}
    </div>
  );
}
