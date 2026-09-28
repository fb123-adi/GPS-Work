import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { TrackForm } from "@/components/order/TrackForm";

export const metadata: Metadata = { title: "Track your order", description: "Check the status of your Kyveron order." };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const [{ order }, user] = await Promise.all([searchParams, getCurrentUser()]);
  return (
    <div className="container-x grid gap-12 py-14 md:grid-cols-2 lg:py-20">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,3.2rem)]">Track your order</h1>
        <p className="mt-4 max-w-md text-ink-soft">Enter the order number from your confirmation email and the email address or mobile number you used at checkout.</p>
        {user && <p className="mt-6 text-sm">Signed in? All your orders are in <Link href="/account/orders" className="link">your account</Link>.</p>}
      </div>
      <TrackForm defaultOrder={order?.toUpperCase().slice(0, 14) ?? ""} />
    </div>
  );
}
