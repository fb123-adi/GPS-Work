"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";

const LINKS = [
  ["/account", "Overview"], ["/account/orders", "Orders"], ["/account/addresses", "Addresses"], ["/wishlist", "Wishlist"],
  ["/returns", "Returns and exchanges"], ["/account/preferences", "Preferences"], ["/account/security", "Password and security"],
] as const;

export function AccountNav({ isStaff }: { isStaff: boolean }) {
  const path = usePathname();
  return (
    <nav aria-label="Account" className="mt-6">
      <ul className="flex gap-1 overflow-x-auto border-b border-line pb-2 lg:block lg:space-y-0.5 lg:border-0 lg:pb-0">
        {LINKS.map(([href, label]) => {
          const active = href === "/account" ? path === href : path.startsWith(href);
          return (
            <li key={href} className="flex-none">
              <Link href={href} aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap px-3 py-2 text-[0.9375rem] transition-colors lg:px-0 ${active ? "font-medium text-obsidian lg:underline lg:underline-offset-8" : "text-ink-soft hover:text-obsidian"}`}>
                {label}
              </Link>
            </li>
          );
        })}
        {isStaff && <li className="flex-none"><Link href="/admin" className="block px-3 py-2 text-[0.9375rem] text-cobalt lg:px-0">Admin</Link></li>}
      </ul>
      <form action={signOut} className="mt-4 hidden lg:block"><button className="text-sm text-ink-soft underline-offset-4 hover:underline">Sign out</button></form>
    </nav>
  );
}
