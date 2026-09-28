import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { AccountNav } from "@/components/account/AccountNav";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  return (
    <div className="container-x grid gap-10 py-10 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-14">
      <div>
        <p className="text-sm text-ink-soft">Signed in as</p>
        <p className="truncate font-medium">{user.fullName ?? user.email}</p>
        <AccountNav isStaff={user.roles.length > 0} />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
