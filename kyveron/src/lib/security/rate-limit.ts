import "server-only";
import { sql } from "@/lib/db";

export type Limit = { key: string; limit: number; windowSeconds: number };

export const LIMITS = {
  login: (id: string) => ({ key: `login:${id}`, limit: 8, windowSeconds: 900 }),
  signup: (ip: string) => ({ key: `signup:${ip}`, limit: 5, windowSeconds: 3600 }),
  passwordReset: (id: string) => ({ key: `reset:${id}`, limit: 4, windowSeconds: 3600 }),
  checkout: (id: string) => ({ key: `checkout:${id}`, limit: 12, windowSeconds: 600 }),
  coupon: (id: string) => ({ key: `coupon:${id}`, limit: 10, windowSeconds: 600 }),
  contact: (ip: string) => ({ key: `contact:${ip}`, limit: 5, windowSeconds: 3600 }),
  track: (ip: string) => ({ key: `track:${ip}`, limit: 15, windowSeconds: 900 }),
  newsletter: (ip: string) => ({ key: `newsletter:${ip}`, limit: 6, windowSeconds: 3600 }),
  upload: (id: string) => ({ key: `upload:${id}`, limit: 30, windowSeconds: 600 }),
  review: (id: string) => ({ key: `review:${id}`, limit: 5, windowSeconds: 3600 }),
} satisfies Record<string, (id: string) => Limit>;

/**
 * Fixed-window counter in Postgres, so limits hold across server instances.
 * Returns true when the request is allowed.
 */
export async function hit({ key, limit, windowSeconds }: Limit): Promise<boolean> {
  const [row] = await sql<{ hits: number }[]>`
    insert into rate_limits (key, window_start, hits) values (${key}, now(), 1)
    on conflict (key) do update set
      hits = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
                  then 1 else rate_limits.hits + 1 end,
      window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
                  then now() else rate_limits.window_start end
    returning hits`;
  return row.hits <= limit;
}

export class RateLimitError extends Error {
  constructor() {
    super("Too many attempts. Please wait a few minutes and try again.");
  }
}

export async function enforce(l: Limit) {
  if (!(await hit(l))) throw new RateLimitError();
}
