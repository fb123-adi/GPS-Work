"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";

type Point = { day: string; revenueMinor: number; orders: number };

function niceMax(v: number) {
  if (v <= 0) return 100000;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = [1, 2, 2.5, 5, 10].find((m) => m * p >= v)!;
  return n * p;
}

/**
 * Single-series daily revenue columns. Cobalt marks (validated against the
 * white surface), <=24px columns, 4px rounded data-end, 1px recessive grid,
 * per-column hover/focus tooltip, and a table view for screen readers.
 */
export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 1100, H = 260, L = 72, R = 8, T = 12, B = 28;
  const max = niceMax(Math.max(0, ...data.map((d) => d.revenueMinor)));
  const slot = (W - L - R) / Math.max(1, data.length);
  const bw = Math.min(24, Math.max(2, slot - 2));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, max / 2, max];
  const fmtDay = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const labelEvery = Math.ceil(data.length / 8);
  const h = hover !== null ? data[hover] : null;

  return (
    <figure>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Daily revenue, ${data.length} days`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e7e3db" strokeWidth={1} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#55524b">{formatMoney(Math.round(t), "INR")}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = L + i * slot + (slot - bw) / 2;
            const top = y(d.revenueMinor);
            const hgt = Math.max(0, y(0) - top);
            const r = Math.min(4, hgt, bw / 2);
            const path = hgt === 0 ? "" : `M${x},${y(0)} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${y(0)} Z`;
            return (
              <g key={d.day}>
                {/* Hit target larger than the mark */}
                <rect x={L + i * slot} y={T} width={slot} height={H - T - B} fill="transparent" tabIndex={0}
                  aria-label={`${fmtDay(d.day)}: ${formatMoney(d.revenueMinor)}, ${d.orders} orders`}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} />
                {path && <path d={path} fill="#214C9A" opacity={hover === null || hover === i ? 1 : 0.55} pointerEvents="none" />}
                {i % labelEvery === 0 && <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#55524b">{fmtDay(d.day)}</text>}
              </g>
            );
          })}
          <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke="#8a8477" strokeWidth={1} />
        </svg>
        {h && hover !== null && (
          <div className="pointer-events-none absolute top-0 border border-line bg-white px-3 py-2 text-xs shadow-sm"
            style={{ left: `${((L + hover * slot + slot / 2) / W) * 100}%`, transform: "translateX(-50%)" }} role="status">
            <p className="font-medium">{fmtDay(h.day)}</p>
            <p className="tabular-nums">{formatMoney(h.revenueMinor)}</p>
            <p className="text-ink-soft">{h.orders} {h.orders === 1 ? "order" : "orders"}</p>
          </div>
        )}
      </div>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-ink-soft">Show as table</summary>
        <table className="mt-2 w-full text-left">
          <thead><tr><th className="py-1">Day</th><th>Revenue</th><th>Orders</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.day} className="border-t border-line"><td className="py-1">{fmtDay(d.day)}</td><td className="tabular-nums">{formatMoney(d.revenueMinor)}</td><td>{d.orders}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
