/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HASH_ROUTER?: string;
  /** POST endpoint for privacy/data-deletion requests. Without it the form opens a pre-filled email. */
  readonly VITE_PRIVACY_REQUEST_ENDPOINT?: string;
  /** POST endpoint for one-click marketing unsubscribe. Without it the page opens a pre-filled email. */
  readonly VITE_UNSUBSCRIBE_ENDPOINT?: string;
  /** POST endpoint for newsletter sign-up. Without it sign-up is shown as not yet available. */
  readonly VITE_NEWSLETTER_ENDPOINT?: string;
}
