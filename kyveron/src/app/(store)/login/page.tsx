import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { drivers } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const REASONS: Record<string, string> = {
  timeout: "You were signed out of admin after a period of inactivity. Sign in again to continue.",
  admin: "Please sign in to continue to admin.",
  wishlist: "Sign in to save items to your wishlist.",
  provider_unavailable: "That sign-in method is not available right now. Use your email and password.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/account";
  const user = await getCurrentUser();
  if (user && sp.reason !== "timeout" && sp.reason !== "admin") redirect(next);
  const supa = drivers().auth === "supabase";
  const note = REASONS[sp.reason ?? sp.error ?? ""];
  return (
    <AuthShell title="Sign in" intro={<p>Track orders, save addresses, and keep your bag across devices.</p>}
      aside={<p className="text-sm">New to Kyveron? <Link href="/register" className="link">Create an account</Link></p>}>
      {note && <p className="notice notice-cobalt mb-6" role="status">{note}</p>}
      <LoginForm next={next} socialEnabled={supa} magicEnabled={supa} />
      <p className="mt-8 text-sm md:hidden">New to Kyveron? <Link href="/register" className="link">Create an account</Link></p>
    </AuthShell>
  );
}
