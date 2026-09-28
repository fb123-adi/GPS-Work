import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { AddressList } from "@/components/account/AccountForms";

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const items = await sql<{ id: string; label: string | null; fullName: string; phone: string; line1: string; line2: string | null; landmark: string | null; city: string; state: string; postalCode: string; isDefault: boolean }[]>`
    select id, label, full_name as "fullName", phone, line1, line2, landmark, city, state, postal_code as "postalCode", is_default as "isDefault"
    from addresses where user_id = ${user.id} and deleted_at is null order by is_default desc, created_at desc`;
  return (
    <div>
      <h1 className="display mb-8 text-[clamp(1.8rem,3vw,2.6rem)]">Addresses</h1>
      <AddressList items={items} />
    </div>
  );
}
