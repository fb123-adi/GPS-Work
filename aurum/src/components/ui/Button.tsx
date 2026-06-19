import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "gold";

const base =
  "inline-flex items-center justify-center gap-2 font-body text-[0.72rem] uppercase tracking-wide2 transition-all duration-300 ease-luxe cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const sizes = "px-8 py-4 min-h-[44px]";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-ivory hover:bg-graphite border border-ink hover:border-graphite",
  outline:
    "border border-ink/70 text-ink hover:bg-ink hover:text-ivory hover:border-ink",
  ghost: "text-ink hover:text-gold-ink",
  gold: "bg-gold text-ink hover:bg-gold-ink hover:text-ivory border border-gold",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, sizes, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  href,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link href={href} className={cn(base, sizes, variants[variant], className)}>
      {children}
    </Link>
  );
}
