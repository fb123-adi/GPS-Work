import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { drivers, env } from "@/lib/env";
import { signOut } from "@/lib/auth/actions";
import { Wordmark } from "@/components/site/Wordmark";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Kyveron admin" }, robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Dashboard", perm: "dashboard.view" },
  { href: "/admin/orders", label: "Orders", perm: "orders.view" },
  { href: "/admin/returns", label: "Returns", perm: "returns.manage" },
  { href: "/admin/products", label: "Products", perm: "products.view" },
  { href: "/admin/inventory", label: "Inventory", perm: "inventory.adjust" },
  { href: "/admin/customers", label: "Customers", perm: "customers.view" },
  { href: "/admin/discounts", label: "Discounts", perm: "discounts.manage" },
  { href: "/admin/content", label: "Content", perm: "content.manage" },
  { href: "/admin/reviews", label: "Reviews", perm: "reviews.moderate" },
  { href: "/admin/tickets", label: "Support tickets", perm: "tickets.manage" },
  { href: "/admin/exports", label: "Reports and exports", perm: "exports.orders" },
  { href: "/admin/staff", label: "Staff and roles", perm: "staff.manage" },
  { href: "/admin/audit", label: "Audit log", perm: "audit.view" },
] as const;

/**
 * Every admin page re-checks permission on the server (requireStaffPage);
 * this layout additionally hides the area from non-staff (404) and enforces
 * MFA for staff when configured.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin&reason=admin");
  if (user.roles.length === 0) notFound();
  if (env().ADMIN_REQUIRE_MFA === "true" && drivers().auth === "supabase" && user.aal !== "aal2") redirect("/account/security?mfa=required");
  const items = NAV.filter((n) => can(user.roles, n.perm));
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[0.9375rem]">
      <a href="#admin-main" className="skip-link">Skip to content</a>
      <div className="grid lg:grid-cols-[232px_1fr]">
        <aside className="border-b border-line bg-ivory lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-14 items-center justify-between px-5 lg:h-16">
            <Link href="/admin" aria-label="Admin home"><Wordmark /></Link>
            <Link href="/" className="text-xs text-ink-soft hover:underline lg:hidden">View store</Link>
          </div>
          <AdminNav items={items.map(({ href, label }) => ({ href, label }))} />
          <div className="hidden border-t border-line px-5 py-4 text-xs text-ink-soft lg:block">
            <p className="truncate text-obsidian">{user.email}</p>
            <p className="mt-0.5">{user.roles.map((r) => r.replace("_", " ")).join(", ")}</p>
            <div className="mt-3 flex gap-4">
              <Link href="/" className="hover:underline">View store</Link>
              <form action={signOut}><button className="hover:underline">Sign out</button></form>
            </div>
          </div>
        </aside>
        <main id="admin-main" tabIndex={-1} className="min-w-0 px-4 py-6 outline-none sm:px-8 lg:py-8">
          {drivers().payments === "mock" && <p className="mb-4 border border-cobalt bg-[#eef2fa] px-3 py-2 text-xs text-cobalt">Test mode: payments and refunds are simulated.</p>}
          {children}
        </main>
      </div>
    </div>
  );
}
