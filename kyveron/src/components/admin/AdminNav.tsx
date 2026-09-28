"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 overflow-x-auto px-3 pb-2 lg:block lg:space-y-0.5 lg:px-3 lg:pb-4">
        {items.map((i) => {
          const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
          return (
            <li key={i.href} className="flex-none">
              <Link href={i.href} aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap px-3 py-2 text-sm transition-colors ${active ? "bg-obsidian text-ivory" : "text-[#2b2a27] hover:bg-[#ebe6dc]"}`}>
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
