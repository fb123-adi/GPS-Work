import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmailToken } from "@/lib/auth/flows";

export const metadata: Metadata = { title: "Confirm email", robots: { index: false }, referrer: "no-referrer" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const ok = token ? await verifyEmailToken(token.slice(0, 100)) : false;
  return (
    <div className="container-x max-w-lg py-20">
      <h1 className="display text-3xl">{ok ? "Email confirmed" : "This link has expired"}</h1>
      <p className="mt-4 text-ink-soft">{ok ? "Thank you. Your account is ready." : "Confirmation links work once and expire after 24 hours. Sign in and we will send a new one from your account page."}</p>
      <Link href="/login" className="btn btn-primary mt-8"><span className="btn-label">Sign in</span></Link>
    </div>
  );
}
