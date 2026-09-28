import type { ReactNode } from "react";

export function AuthShell({ title, intro, children, aside }: { title: string; intro?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="container-x grid gap-12 py-12 md:grid-cols-[1fr_minmax(0,440px)] md:py-20 lg:gap-24">
      <div className="max-w-md">
        <h1 className="display text-[clamp(2rem,4vw,3.2rem)]">{title}</h1>
        {intro && <div className="mt-4 text-ink-soft">{intro}</div>}
        {aside && <div className="mt-10 hidden md:block">{aside}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
