import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center justify-center overflow-hidden bg-ink text-ivory">
      <div className="grain absolute inset-0 duo-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_40%,transparent,rgba(12,10,9,0.7))]" />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <span className="eyebrow-on-dark">Error 404</span>
        <h1 className="mt-6 font-display text-6xl italic text-gold sm:text-8xl">Lost luxury</h1>
        <p className="mt-6 max-w-md text-base font-light text-ivory/75">
          The page you seek has moved on — but the collection awaits.
        </p>
        <div className="mt-10">
          <ButtonLink href="/" variant="gold">
            Return Home
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
