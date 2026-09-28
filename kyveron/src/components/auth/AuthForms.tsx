"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  register, requestPasswordReset, resetPassword, sendMagicLink, signIn, signInWithProvider, type FormState,
} from "@/lib/auth/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Honeypot } from "@/components/ui/Honeypot";

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p id={id} className="field-error">{msg}</p> : null;
}

function Banner({ state }: { state: FormState }) {
  if (!state?.message) return null;
  return <p className={`notice ${state.ok ? "notice-success" : "notice-error"}`} role={state.ok ? "status" : "alert"}>{state.message}</p>;
}

function PasswordInput({ id, name, autoComplete, invalid, describedBy }: { id: string; name: string; autoComplete: string; invalid?: boolean; describedBy?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} className="input pr-20" required
        aria-invalid={invalid} aria-describedby={describedBy} maxLength={128} />
      <button type="button" className="absolute inset-y-0 right-0 px-4 text-sm text-ink-soft hover:text-obsidian" onClick={() => setShow((s) => !s)}
        aria-pressed={show} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}

export function LoginForm({ next, socialEnabled, magicEnabled }: { next: string; socialEnabled: boolean; magicEnabled: boolean }) {
  const [state, action] = useActionState(signIn, undefined);
  const [magicState, magicAction] = useActionState(sendMagicLink, undefined);
  const [mode, setMode] = useState<"password" | "magic">("password");
  return (
    <div className="grid gap-6">
      {socialEnabled ? (
        <div className="grid gap-2">
          {(["google", "apple"] as const).map((p) => (
            <form key={p} action={signInWithProvider}>
              <input type="hidden" name="provider" value={p} />
              <input type="hidden" name="next" value={next} />
              <button className="btn btn-secondary w-full">Continue with {p === "google" ? "Google" : "Apple"}</button>
            </form>
          ))}
        </div>
      ) : (
        <p className="notice text-sm text-ink-soft">Google and Apple sign-in appear here once the provider credentials are configured in Supabase.</p>
      )}
      <div className="flex items-center gap-3 text-xs text-ink-soft"><span className="h-px flex-1 bg-line" />or with email<span className="h-px flex-1 bg-line" /></div>

      {mode === "password" ? (
        <form action={action} className="grid gap-4" noValidate>
          <input type="hidden" name="next" value={next} />
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" className="input" required />
          </div>
          <div className="field">
            <div className="flex items-baseline justify-between">
              <label htmlFor="password">Password</label>
              <Link href="/forgot-password" className="link text-sm">Forgot password?</Link>
            </div>
            <PasswordInput id="password" name="password" autoComplete="current-password" />
          </div>
          <Banner state={state} />
          <SubmitButton className="btn btn-primary w-full">Sign in</SubmitButton>
        </form>
      ) : (
        <form action={magicAction} className="grid gap-4" noValidate>
          <div className="field">
            <label htmlFor="magic-email">Email</label>
            <input id="magic-email" name="email" type="email" autoComplete="email" className="input" required />
            <Err id="magic-err" msg={magicState?.errors?.email} />
          </div>
          <Banner state={magicState} />
          <SubmitButton className="btn btn-primary w-full">Email me a sign-in link</SubmitButton>
        </form>
      )}
      {magicEnabled && (
        <button type="button" className="link justify-self-start text-sm" onClick={() => setMode((m) => (m === "password" ? "magic" : "password"))}>
          {mode === "password" ? "Sign in with an email link instead" : "Sign in with a password instead"}
        </button>
      )}
    </div>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);
  const e = state?.errors ?? {};
  if (state?.ok) return <Banner state={state} />;
  return (
    <form action={action} className="grid gap-4" noValidate>
      <Honeypot />
      <div className="field">
        <label htmlFor="fullName">Full name</label>
        <input id="fullName" name="fullName" autoComplete="name" className="input" required aria-invalid={!!e.fullName} aria-describedby="fn-err" />
        <Err id="fn-err" msg={e.fullName} />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" required aria-invalid={!!e.email} aria-describedby="em-err" />
        <Err id="em-err" msg={e.email} />
      </div>
      <div className="field">
        <label htmlFor="phone">Mobile number <span className="font-normal text-ink-soft">(optional, for delivery updates)</span></label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className="input" aria-invalid={!!e.phone} aria-describedby="ph-err" />
        <Err id="ph-err" msg={e.phone} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" invalid={!!e.password} describedBy="pw-hint" />
        {e.password ? <Err id="pw-hint" msg={e.password} /> : <p id="pw-hint" className="field-hint">At least 10 characters. A short phrase works well.</p>}
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="acceptTerms" className="checkbox" aria-invalid={!!e.acceptTerms} />
        <span>I agree to the <Link href="/legal/terms" className="link">terms</Link> and <Link href="/legal/privacy" className="link">privacy policy</Link>.</span>
      </label>
      <Err id="t-err" msg={e.acceptTerms} />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="marketingEmail" className="checkbox" />
        <span>Email me about new releases and restocks. Optional; change it any time in your account.</span>
      </label>
      <Banner state={state} />
      <SubmitButton className="btn btn-primary w-full">Create account</SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  if (state?.ok) return <Banner state={state} />;
  return (
    <form action={action} className="grid gap-4" noValidate>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" required aria-describedby="fe" />
        <Err id="fe" msg={state?.errors?.email} />
      </div>
      <Banner state={state} />
      <SubmitButton className="btn btn-primary w-full">Send reset link</SubmitButton>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);
  if (state?.ok) return <div className="grid gap-4"><Banner state={state} /><Link href="/login" className="btn btn-primary">Sign in</Link></div>;
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <div className="field">
        <label htmlFor="password">New password</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" invalid={!!state?.errors?.password} describedBy="rp" />
        <Err id="rp" msg={state?.errors?.password} />
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirm new password</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={!!state?.errors?.confirm} describedBy="rc" />
        <Err id="rc" msg={state?.errors?.confirm} />
      </div>
      <Banner state={state} />
      <SubmitButton className="btn btn-primary w-full">Update password</SubmitButton>
    </form>
  );
}
