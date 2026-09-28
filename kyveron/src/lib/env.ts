import "server-only";
import { z } from "zod";

/**
 * Server environment, validated once. Secrets are only ever read here and
 * never imported into client components (the "server-only" import makes the
 * build fail if that happens).
 *
 * Each integration resolves to a driver. When credentials are missing we fall
 * back to a clearly-labelled mock driver, and mock drivers refuse to run when
 * APP_ENV=production.
 */
const schema = z.object({
  APP_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

  AUTH_DRIVER: z.enum(["supabase", "local"]).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("media"),
  ADMIN_REQUIRE_MFA: z.enum(["true", "false"]).default("true"),
  ADMIN_IDLE_TIMEOUT_MINUTES: z.coerce.number().int().min(5).max(240).default(30),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  MOCK_PAYMENT_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Kyveron <orders@example.com>"),
  SUPPORT_EMAIL: z.string().default("support@example.com"),

  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

  CRON_SECRET: z.string().optional(),
  UPLOAD_DIR: z.string().default(".data/uploads"),
  INTERNATIONAL_CHECKOUT_ENABLED: z.enum(["true", "false"]).default("false"),
  COD_ENABLED: z.enum(["true", "false"]).default("false"),
});

type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment configuration:\n${issues.join("\n")}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => env().APP_ENV === "production";

export type Drivers = {
  auth: "supabase" | "local";
  payments: "razorpay" | "mock";
  email: "resend" | "log";
  storage: "supabase" | "local";
  captcha: "turnstile" | "none";
};

export function drivers(): Drivers {
  const e = env();
  const supabaseReady = Boolean(e.NEXT_PUBLIC_SUPABASE_URL && e.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const d: Drivers = {
    auth: e.AUTH_DRIVER ?? (supabaseReady ? "supabase" : "local"),
    payments: e.RAZORPAY_KEY_ID && e.RAZORPAY_KEY_SECRET ? "razorpay" : "mock",
    email: e.RESEND_API_KEY ? "resend" : "log",
    storage: supabaseReady && e.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "local",
    captcha: e.TURNSTILE_SECRET_KEY && e.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? "turnstile" : "none",
  };
  if (e.APP_ENV === "production") {
    const mock: string[] = [];
    if (d.auth === "local") mock.push("auth (configure Supabase)");
    if (d.payments === "mock") mock.push("payments (configure Razorpay)");
    if (d.storage === "local") mock.push("storage (configure Supabase Storage)");
    if (d.payments === "razorpay" && !e.RAZORPAY_WEBHOOK_SECRET) mock.push("RAZORPAY_WEBHOOK_SECRET");
    if (mock.length) {
      throw new Error(`Refusing to run in production with mock drivers: ${mock.join(", ")}`);
    }
  }
  return d;
}
