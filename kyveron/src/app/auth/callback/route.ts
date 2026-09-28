import { NextResponse } from "next/server";
import { drivers, env } from "@/lib/env";
import { supabaseServer } from "@/lib/auth/supabase";
import { afterSignIn } from "@/lib/auth/flows";

/** Supabase PKCE callback for OAuth, magic links, email confirmation, and password recovery. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const base = env().APP_URL;
  if (drivers().auth !== "supabase" || !code) return NextResponse.redirect(`${base}/login?error=provider_unavailable`);
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${base}/login?error=provider_unavailable`);
  await afterSignIn(data.user.id);
  return NextResponse.redirect(`${base}${safe}`);
}
