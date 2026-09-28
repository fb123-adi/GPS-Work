import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="container-x max-w-xl py-24">
      <p className="spec-line">404</p>
      <h1 className="display mt-3 text-3xl">Page not found</h1>
      <Link href="/" className="btn btn-primary mt-8"><span className="btn-label">Go to Kyveron</span></Link>
    </main>
  );
}
