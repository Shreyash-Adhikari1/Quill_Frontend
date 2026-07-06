export function FormSecurityNote() {
  return null;
}

// Client-side validation in forms is for UX ONLY: instant feedback and fewer
// round trips. It is NOT a security control. The backend independently validates
// all requests with its own Zod schemas because client-side checks can be bypassed.
