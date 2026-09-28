/** Request-time clock for server components (kept out of render bodies for lint purity). */
export function nowMs(): number {
  return Date.now();
}
