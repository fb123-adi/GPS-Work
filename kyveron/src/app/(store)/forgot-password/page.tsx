import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" intro={<p>Enter your account email. If it matches an account, we will send a link that works for one hour.</p>}>
      <ForgotForm />
    </AuthShell>
  );
}
