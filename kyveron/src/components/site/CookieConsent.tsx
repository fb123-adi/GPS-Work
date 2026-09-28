"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { saveCookieConsent } from "@/app/actions/prefs";

/**
 * Cookie consent. Necessary cookies (session, bag, security) are always on.
 * Analytics and marketing stay off until the visitor opts in; every choice is
 * logged server-side with the policy version.
 */
export function CookieConsent({ hasChoice }: { hasChoice: boolean }) {
  const [visible, setVisible] = useState(!hasChoice);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    const reopen = () => {
      setCustom(true);
      setVisible(true);
    };
    window.addEventListener("kv:cookie-settings", reopen);
    return () => window.removeEventListener("kv:cookie-settings", reopen);
  }, []);

  if (!visible) return null;
  const save = (a: boolean, m: boolean) =>
    start(async () => {
      await saveCookieConsent({ analytics: a, marketing: m });
      setVisible(false);
    });

  return (
    <section
      aria-label="Cookie preferences"
      className="load-4 fixed inset-x-3 bottom-3 z-[var(--z-toast)] mx-auto max-w-[560px] border border-obsidian bg-ivory p-5 shadow-[0_16px_48px_rgba(21,21,21,0.18)] sm:inset-x-auto sm:right-5 sm:bottom-5"
    >
      <h2 className="font-semibold">Cookies</h2>
      <p className="mt-2 text-sm text-ink-soft">
        We use necessary cookies to keep you signed in and remember your bag. With your permission we would also use analytics cookies to
        see which pages help people shop. <Link href="/legal/cookies" className="link">Cookie policy</Link>
      </p>
      {custom && (
        <fieldset className="mt-4 space-y-3 text-sm">
          <legend className="sr-only">Choose cookie categories</legend>
          <label className="flex items-start gap-3"><input type="checkbox" checked disabled className="checkbox" /> <span><strong>Necessary</strong>. Always on. Sign-in, bag, security, and fraud prevention.</span></label>
          <label className="flex items-start gap-3"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="checkbox" /> <span><strong>Analytics</strong>. Anonymous usage statistics.</span></label>
          <label className="flex items-start gap-3"><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="checkbox" /> <span><strong>Marketing</strong>. Measuring ads we run on other sites.</span></label>
        </fieldset>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {custom ? (
          <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => save(analytics, marketing)}>Save choices</button>
        ) : (
          <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => setCustom(true)}>Customise</button>
        )}
        <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => save(false, false)}>Necessary only</button>
        <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => save(true, true)}>Accept all</button>
      </div>
    </section>
  );
}
