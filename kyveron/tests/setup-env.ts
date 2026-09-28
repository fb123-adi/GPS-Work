// Test environment: a dedicated database; mock drivers only (never real keys).
process.env.APP_ENV = "test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://postgres@127.0.0.1:54329/kyveron_test";
process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-1234";
process.env.APP_URL = "http://localhost:3000";
delete process.env.RAZORPAY_KEY_ID;
delete process.env.RAZORPAY_KEY_SECRET;
delete process.env.RESEND_API_KEY;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
