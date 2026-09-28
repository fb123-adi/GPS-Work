import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { jwtVerify } from "jose";

/**
 * Runs before every page request:
 *  1. Content Security Policy with a per-request nonce.
 *  2. Supabase session refresh (when Supabase auth is configured).
 *  3. Admin idle timeout: /admin requires recent signed activity.
 * Authorization itself happens in the pages and actions (guards.ts); this
 * layer is an extra gate, never the only one.
 */
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://checkout.razorpay.com https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
    // Inline style attributes are used for CSS custom properties; scripts stay nonce-locked.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: https://*.razorpay.com ${supabaseUrl}`.trim(),
    "font-src 'self'",
    `connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com ${supabaseUrl}`.trim(),
    "frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://api.razorpay.com",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const useSupabase = (process.env.AUTH_DRIVER ?? (supabaseUrl ? "supabase" : "local")) === "supabase";
  if (useSupabase && supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request: { headers: requestHeaders } });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    });
    await supabase.auth.getUser();
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const idleMinutes = Number(process.env.ADMIN_IDLE_TIMEOUT_MINUTES ?? 30);
    const token = request.cookies.get("kv_admin_seen")?.value;
    let fresh = false;
    if (token && process.env.SESSION_SECRET) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET), { audience: "admin-activity" });
        fresh = Date.now() - Number(payload.t) < idleMinutes * 60_000;
      } catch {
        fresh = false;
      }
    }
    if (!fresh) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=/admin&reason=${token ? "timeout" : "admin"}`;
      const r = NextResponse.redirect(url);
      r.cookies.delete("kv_admin_seen");
      return r;
    }
    // Sliding window: re-sign activity on each admin navigation.
    const { SignJWT } = await import("jose");
    const next = await new SignJWT({ t: Date.now() })
      .setProtectedHeader({ alg: "HS256" })
      .setAudience("admin-activity")
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET!));
    response.cookies.set("kv_admin_seen", next, {
      httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 12 * 3600,
    });
    response.headers.set("Cache-Control", "no-store");
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|media|favicon.ico|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
