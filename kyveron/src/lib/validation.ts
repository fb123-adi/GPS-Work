import { z } from "zod";
import { COUNTRIES, INDIAN_STATES } from "@/lib/config/store";

const trimmed = (max: number) => z.string().trim().max(max);

export const emailSchema = z.string().trim().toLowerCase().max(254).email("Enter a valid email address.");

/** Indian mobile: 10 digits starting 6-9, optional +91 / 0 prefix. Normalised to +91XXXXXXXXXX. */
export const indianMobile = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, ""))
  .refine((s) => /^(\+91|91|0)?[6-9]\d{9}$/.test(s), "Enter a 10-digit Indian mobile number.")
  .transform((s) => `+91${s.slice(-10)}`);

export const pinCode = z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a 6-digit PIN code.");

export const addressSchema = z
  .object({
    fullName: trimmed(80).min(2, "Enter the recipient's full name."),
    phone: indianMobile,
    line1: trimmed(120).min(3, "Enter house number and street."),
    line2: trimmed(120).optional().nullable(),
    landmark: trimmed(80).optional().nullable(),
    city: trimmed(60).min(2, "Enter the city."),
    state: z.string().refine((s) => (INDIAN_STATES as readonly string[]).includes(s), "Choose a state."),
    postalCode: pinCode,
    country: z.string().default("IN").refine((c) => COUNTRIES.some((x) => x.code === c && x.ships), "We do not ship to this country yet."),
  })
  .transform((a) => ({ ...a, line2: a.line2 || null, landmark: a.landmark || null }));

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  idempotencyKey: z.string().uuid(),
  email: emailSchema,
  phone: indianMobile,
  shipping: addressSchema,
  billingSameAsShipping: z.boolean(),
  billing: addressSchema.optional(),
  shippingMethod: z.enum(["standard", "express"]),
  couponCode: z.string().trim().toUpperCase().max(32).regex(/^[A-Z0-9-]*$/).optional().nullable(),
  paymentMethod: z.enum(["upi", "card", "netbanking", "wallet", "emi", "cod"]),
  acceptTerms: z.literal(true, { message: "Please accept the terms and privacy policy." }),
  saveAddress: z.boolean().optional(),
  marketingOptIn: z.boolean().optional(),
});

export const passwordSchema = z.string().min(10, "Use at least 10 characters.").max(128);

export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path.join(".");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
