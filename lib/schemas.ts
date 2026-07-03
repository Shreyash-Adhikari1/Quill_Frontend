import { z } from "zod";
import { hasStoredXssPayload, plainTextOnlyMessage } from "./xss";

export const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "Uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "Number", test: (value: string) => /\d/.test(value) },
  { label: "Special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/\d/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a special character");

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required").refine((value) => !hasStoredXssPayload(value), plainTextOnlyMessage("Full name")),
  username: z.string().min(3, "Username is required").regex(/^[A-Za-z0-9_]+$/, "Username can only use letters, numbers, and underscores"),
  email: z.email("Enter a valid email"),
  password: passwordSchema,
  captchaAnswer: z.string().min(1, "Solve the CAPTCHA"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  captchaAnswer: z.string().min(1, "Solve the CAPTCHA"),
});

export const emailSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const resetPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
  password: passwordSchema,
});

export const postSchema = z.object({
  postTitle: z.string().min(1, "Title is required").max(140, "Keep the title under 140 characters").refine((value) => !hasStoredXssPayload(value), plainTextOnlyMessage("Title")),
  postContent: z.string().min(1, "Content is required").max(10000, "Keep the note under 10,000 characters").refine((value) => !hasStoredXssPayload(value), plainTextOnlyMessage("Note")),
  visibility: z.enum(["public", "private"]),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required").refine((value) => !hasStoredXssPayload(value), plainTextOnlyMessage("Full name")),
  bio: z.string().max(280, "Bio must be under 280 characters").refine((value) => !hasStoredXssPayload(value), plainTextOnlyMessage("Bio")).optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});
