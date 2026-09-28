import { drivers } from "@/lib/env";
import { requireUser } from "@/lib/auth/guards";
import { MfaSetup, PasswordForm } from "@/components/account/AccountForms";

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ mfa?: string }> }) {
  const [user, sp] = await Promise.all([requireUser("/account/security"), searchParams]);
  const local = drivers().auth === "local";
  return (
    <div className="grid gap-14">
      <section>
        <h1 className="display mb-6 text-[clamp(1.8rem,3vw,2.6rem)]">Password and security</h1>
        {sp.mfa === "required" && <p className="notice notice-cobalt mb-6">Staff accounts must use two-step verification before opening admin.</p>}
        <h2 className="mb-3 text-lg font-semibold">Change password</h2>
        <PasswordForm local={local} />
      </section>
      <section className="border-t border-line pt-10">
        <h2 className="mb-2 text-lg font-semibold">Two-step verification</h2>
        {local ? (
          <p className="text-sm text-ink-soft">Available once Supabase auth is configured. The development sign-in driver does not support it.</p>
        ) : user.aal === "aal2" ? (
          <p className="text-sm text-success">On for this session.</p>
        ) : (
          <MfaSetup />
        )}
      </section>
    </div>
  );
}
