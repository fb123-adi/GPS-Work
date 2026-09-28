import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x max-w-xl py-24">
      <p className="spec-line">404</p>
      <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">We could not find that page.</h1>
      <p className="mt-4 text-ink-soft">It may have moved, or the link may be incomplete. If you were looking for an order, use order tracking.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-primary"><span className="btn-label">Shop all</span></Link>
        <Link href="/track-order" className="btn btn-secondary"><span className="btn-label">Track an order</span></Link>
      </div>
    </div>
  );
}
