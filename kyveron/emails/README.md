# Email templates

No emails are sent yet: the storefront is a frontend preview. These templates are ready for
when an email provider (for example Resend) is connected on the server.

| Template | Type | Unsubscribe link |
|---|---|---|
| `marketing.html` | Marketing (newsletter, offers) | **Required**: visible link in the footer plus the headers below |
| `order-confirmation.html` | Transactional (order, dispatch, refund) | Not required: these go to every buyer and are not marketing |

## Rules for every marketing email

1. Send only to people who ticked the separate, unticked-by-default marketing box (sign-up,
   checkout or newsletter form). Store when and where consent was given.
2. Keep the visible **Unsubscribe** link in the footer. It must work in one click without
   logging in: `{{site_url}}/#/unsubscribe?email={{email}}&token={{unsubscribe_token}}`.
   `unsubscribe_token` is a server-generated HMAC of the email address, so links can't be forged.
3. Add one-click unsubscribe headers (RFC 8058; required by Gmail and Yahoo for bulk senders):

   ```
   List-Unsubscribe: <{{api_url}}/unsubscribe?email={{email}}&token={{unsubscribe_token}}>, <mailto:{{privacy_email}}?subject=unsubscribe>
   List-Unsubscribe-Post: List-Unsubscribe=One-Click
   ```

4. Stop sending within 48 hours of an unsubscribe, and never re-add the address without fresh consent.
5. Include the seller's legal name and postal address (the footer placeholders come from `src/lib/business.ts`).

Set `VITE_UNSUBSCRIBE_ENDPOINT` to the server endpoint so the `/unsubscribe` page removes the
address directly; until then it opens a pre-filled email to the privacy address.
