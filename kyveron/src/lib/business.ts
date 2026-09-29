// ===== Business & Legal Details =====
// Single source for the seller information Indian e-commerce rules require on the site
// (Consumer Protection (E-Commerce) Rules 2020, IT Rules 2021, DPDP Act 2023).
// Every value in [brackets] is a placeholder: replace it with the real detail before launch.
// These are compiled into the site, so edit this file (not Admin → Settings, which only
// changes the copy stored in one browser).

export const BUSINESS = {
  brandName: 'KYVERON',
  legalName: '[Registered legal name of the business]',
  entityType: '[Private Limited Company / LLP / Proprietorship]',
  registeredAddress: '[Registered office address, City, State, PIN]',
  gstin: '[GSTIN]',
  cin: '[CIN or LLPIN, if applicable]',
  supportEmail: '[support email address]',
  supportPhone: '[support phone number]',
  serviceHours: 'Mon–Sat, 10am–7pm IST',
  privacyEmail: '[privacy / data requests email address]',
  grievanceOfficer: {
    name: '[Grievance Officer name]',
    designation: 'Grievance Officer',
    email: '[grievance officer email address]',
    phone: '[grievance officer phone number]',
    address: '[Grievance Officer postal address]',
  },
  countryOfOrigin: '[Country of origin, e.g. India]',
};

// Date shown on the policy pages. Update whenever a policy changes.
export const POLICY_UPDATED = '29 September 2026';

// Customers must be at least this old to create an account or place an order.
export const MINIMUM_AGE = 18;

/** True while a value is still an unfilled [placeholder]. */
export function isPlaceholder(value: string) {
  return value.startsWith('[') && value.endsWith(']');
}

/** mailto: link for a real address, or undefined while it is still a placeholder. */
export function mailtoHref(address: string, subject?: string, body?: string) {
  if (isPlaceholder(address)) return undefined;
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${address}${query ? `?${query}` : ''}`;
}
