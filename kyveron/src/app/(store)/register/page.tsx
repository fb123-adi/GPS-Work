import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthShell title="Create an account" intro={<p>We will email you a link to confirm your address. Your password is stored only as a secure hash.</p>}
      aside={<p className="text-sm">Already have an account? <Link href="/login" className="link">Sign in</Link></p>}>
      <RegisterForm />
    </AuthShell>
  );
}
