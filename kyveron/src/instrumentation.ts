/**
 * Runs once per server process. Defaults the process time zone to IST so
 * server-rendered dates match what Indian customers and staff expect.
 * Override with TZ in the environment for other markets.
 */
export function register() {
  process.env.TZ ??= "Asia/Kolkata";
}
