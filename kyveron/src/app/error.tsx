"use client";

import Link from "next/link";

/** Generic error boundary: never shows stack traces or internal messages. */
export default function ErrorPage({ reset, error }: { reset: () => void; error: Error & { digest?: string } }) {
  return (
    <main className="container-x max-w-xl py-24">
      <h1 className="display text-3xl">Something went wrong on our side.</h1>
      <p className="mt-4 text-ink-soft">Your bag is safe. Please try again. If this keeps happening, contact us{error.digest ? ` and mention reference ${error.digest}` : ""}.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" className="btn btn-primary" onClick={reset}>Try again</button>
        <Link href="/" className="btn btn-secondary">Home</Link>
      </div>
    </main>
  );
}
