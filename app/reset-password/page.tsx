import type { Metadata } from "next";
import { PasswordRecovery } from "@/components/auth/password-recovery";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function ResetPasswordPage() {
  return <PasswordRecovery mode="reset" />;
}
