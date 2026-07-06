import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CsrfInitializer } from "@/components/CsrfInitializer";

export const metadata: Metadata = {
  title: "Quill",
  description: "A quiet place to write and share notes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CsrfInitializer />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
