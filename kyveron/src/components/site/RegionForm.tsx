"use client";

import { useTransition } from "react";
import { setRegion } from "@/app/actions/prefs";
import { COUNTRIES, CURRENCIES } from "@/lib/config/store";

export function RegionForm({ currency, country, dark = false }: { currency: string; country: string; dark?: boolean }) {
  const [pending, start] = useTransition();
  const selectCls = dark ? "select border-graphite bg-graphite text-ivory" : "select";
  return (
    <form
      action={(fd) => start(() => setRegion(fd))}
      onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
      className="grid gap-3 sm:grid-cols-2"
      aria-busy={pending}
    >
      <div className="field">
        <label htmlFor={`country-${dark}`} className={dark ? "!text-stone" : ""}>Country or region</label>
        <select id={`country-${dark}`} name="country" defaultValue={country} className={selectCls}>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}{c.ships ? "" : " (browse only)"}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`currency-${dark}`} className={dark ? "!text-stone" : ""}>Currency</label>
        <select id={`currency-${dark}`} name="currency" defaultValue={currency} className={selectCls}>
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.label}</option>)}
        </select>
      </div>
      <p className={`text-xs sm:col-span-2 ${dark ? "text-stone" : "text-ink-soft"}`}>
        Other currencies are approximate and for reference. Orders are charged in INR and currently ship within India only.
      </p>
      <noscript><button className="btn btn-sm btn-secondary">Update</button></noscript>
    </form>
  );
}
