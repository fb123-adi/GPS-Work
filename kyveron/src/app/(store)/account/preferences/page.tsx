import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { DeleteAccountForm, MarketingForm } from "@/components/account/AccountForms";

export default async function PreferencesPage() {
  const user = await requireUser("/account/preferences");
  const [p] = await sql<{ marketing_email: boolean; marketing_whatsapp: boolean; deletion_requested_at: Date | null }[]>`
    select marketing_email, marketing_whatsapp, deletion_requested_at from profiles where user_id = ${user.id}`;
  return (
    <div className="grid gap-14">
      <section>
        <h1 className="display mb-6 text-[clamp(1.8rem,3vw,2.6rem)]">Preferences</h1>
        <h2 className="mb-3 text-lg font-semibold">Messages from us</h2>
        <MarketingForm email={!!p?.marketing_email} whatsapp={!!p?.marketing_whatsapp} />
      </section>
      <section aria-labelledby="del-h" className="border-t border-line pt-10">
        <h2 id="del-h" className="mb-3 text-lg font-semibold">Delete your account</h2>
        {p?.deletion_requested_at
          ? <p className="notice">You asked us to delete your account on {p.deletion_requested_at.toLocaleDateString("en-IN")}. We will email you when it is done.</p>
          : <DeleteAccountForm />}
      </section>
    </div>
  );
}
