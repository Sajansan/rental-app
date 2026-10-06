import type { Metadata } from "next";
import { PasswordRecovery } from "@/components/auth/password-recovery";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <PasswordRecovery mode="request" />;
}
