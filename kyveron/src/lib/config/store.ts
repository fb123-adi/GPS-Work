/**
 * Store configuration. Everything a business owner must confirm before
 * launch is marked TODO(owner). Values here are safe for client import:
 * no secrets.
 */

export const BRAND = {
  name: "Kyveron",
  // TODO(owner): replace every placeholder below with verified business details.
  legalName: "[Registered legal entity name]",
  address: "[Registered business address, City, State, PIN]",
  gstin: "[GSTIN]",
  supportEmail: "support@kyveron.example",
  supportPhone: "+91 00000 00000",
  whatsapp: "+91 00000 00000",
  whatsappLink: "https://wa.me/910000000000",
  serviceHours: "Monday to Saturday, 10:00 to 18:00 IST",
  grievanceOfficer: "[Grievance officer name, email, phone]",
} as const;

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED";

export const BASE_CURRENCY: CurrencyCode = "INR";

/** Currencies a visitor may browse in. Checkout stays INR until international selling is configured. */
export const CURRENCIES: { code: CurrencyCode; label: string; locale: string }[] = [
  { code: "INR", label: "Indian rupee", locale: "en-IN" },
  { code: "USD", label: "US dollar", locale: "en-US" },
  { code: "EUR", label: "Euro", locale: "de-DE" },
  { code: "GBP", label: "Pound sterling", locale: "en-GB" },
  { code: "AED", label: "UAE dirham", locale: "en-AE" },
];

export const COUNTRIES: { code: string; name: string; currency: CurrencyCode; ships: boolean }[] = [
  { code: "IN", name: "India", currency: "INR", ships: true },
  { code: "AE", name: "United Arab Emirates", currency: "AED", ships: false },
  { code: "GB", name: "United Kingdom", currency: "GBP", ships: false },
  { code: "US", name: "United States", currency: "USD", ships: false },
  { code: "DE", name: "Germany", currency: "EUR", ships: false },
];

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

export type ShippingMethod = {
  id: "standard" | "express";
  label: string;
  feeMinor: number;
  freeAboveMinor: number | null;
  daysMin: number;
  daysMax: number;
};

// TODO(owner): confirm fees and courier SLAs with your logistics partner.
export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", label: "Standard delivery", feeMinor: 9900, freeAboveMinor: 299900, daysMin: 3, daysMax: 7 },
  { id: "express", label: "Express delivery", feeMinor: 24900, freeAboveMinor: null, daysMin: 1, daysMax: 3 },
];

/**
 * GST on apparel depends on the per-unit sale value. Prices are displayed
 * inclusive of GST (Indian retail convention); the tax component is computed
 * for invoices. TODO(owner): confirm the current slabs and HSN codes with
 * your chartered accountant before launch; rates change.
 */
export const TAX = {
  inclusive: true,
  slabs: [
    { maxUnitPriceMinor: 250000, ratePercent: 5 },
    { maxUnitPriceMinor: null, ratePercent: 18 },
  ] as { maxUnitPriceMinor: number | null; ratePercent: number }[],
};

export const RETURNS = {
  windowDays: 14,
  // TODO(owner): confirm exclusions.
  exclusions: ["Innerwear and socks", "Items marked final sale", "Items worn, washed, or without tags"],
  reasons: [
    "Size too small",
    "Size too large",
    "Not as pictured",
    "Quality concern",
    "Received wrong item",
    "Changed my mind",
  ],
};

export const RESERVATION_MINUTES = 30;
export const MAX_QTY_PER_LINE = 10;
export const POLICY_VERSION = "0.1-draft";

/** Warehouse PIN for delivery estimates. TODO(owner): set the real dispatch PIN. */
export const WAREHOUSE_PIN = "560001";
