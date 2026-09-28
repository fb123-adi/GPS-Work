import { getCurrentUser } from "@/lib/auth/session";
import { cartCount } from "@/lib/cart";
import { getPriceFormatter } from "@/lib/currency";
import { HeaderClient } from "./HeaderClient";

export const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?gender=men", label: "Men" },
  { href: "/shop?gender=women", label: "Women" },
  { href: "/collections/performance", label: "Performance" },
  { href: "/collections/daily-uniform", label: "Daily Uniform" },
  { href: "/journal", label: "Journal" },
];

export async function Header({ tone = "light" }: { tone?: "light" | "overlay" }) {
  const [user, count, fmt] = await Promise.all([getCurrentUser(), cartCount(), getPriceFormatter()]);
  return (
    <HeaderClient
      nav={NAV}
      signedIn={!!user}
      isStaff={!!user && user.roles.length > 0}
      initialCount={count}
      currency={fmt.currency}
      country={fmt.country}
      tone={tone}
    />
  );
}
