/**
 * Role-based access control. Permissions are checked on the server for every
 * admin page and every admin action; hiding UI is never the control.
 */
export const STAFF_ROLES = [
  "super_admin", "catalog_manager", "order_manager", "support_agent", "marketing_editor", "analyst",
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const PERMISSIONS = {
  "dashboard.view": ["super_admin", "catalog_manager", "order_manager", "support_agent", "marketing_editor", "analyst"],
  "products.view": ["super_admin", "catalog_manager", "marketing_editor", "analyst", "order_manager", "support_agent"],
  "products.edit": ["super_admin", "catalog_manager"],
  "products.cost.view": ["super_admin", "catalog_manager", "analyst"],
  "inventory.adjust": ["super_admin", "catalog_manager"],
  "orders.view": ["super_admin", "order_manager", "support_agent", "analyst"],
  "orders.fulfil": ["super_admin", "order_manager"],
  "orders.cancel": ["super_admin", "order_manager"],
  "orders.refund": ["super_admin", "order_manager"],
  "orders.note": ["super_admin", "order_manager", "support_agent"],
  "customers.view": ["super_admin", "order_manager", "support_agent"],
  "returns.manage": ["super_admin", "order_manager", "support_agent"],
  "tickets.manage": ["super_admin", "support_agent"],
  "discounts.manage": ["super_admin", "marketing_editor"],
  "content.manage": ["super_admin", "marketing_editor"],
  "reviews.moderate": ["super_admin", "marketing_editor", "support_agent"],
  "exports.orders": ["super_admin", "order_manager", "analyst"],
  "exports.catalog": ["super_admin", "catalog_manager", "analyst"],
  "exports.customers": ["super_admin"],
  "staff.manage": ["super_admin"],
  "audit.view": ["super_admin"],
} as const satisfies Record<string, readonly StaffRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(roles: readonly StaffRole[], perm: Permission): boolean {
  const allowed = PERMISSIONS[perm] as readonly StaffRole[];
  return roles.some((r) => allowed.includes(r));
}
