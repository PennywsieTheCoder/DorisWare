# DorisWare Pre-Launch Checklist

Use this as the source of truth for launch readiness. Complete Priority 0 before accepting public orders.

## Priority 0 — Required before launch

- [ ] Connect the custom domain.
- [ ] In Supabase Auth, add the production domain to Site URL and Redirect URLs. Test sign-up confirmation and password-reset links on the production domain.
- [ ] Configure branded transactional email (sender name, sender address, and SMTP/email provider if required by the chosen Supabase plan).
- [ ] Complete live Paystack testing with small real payments for both Mobile Money and card.
  - [ ] Confirm a successful payment changes the order to paid/processing.
  - [ ] Confirm stock is reduced once only.
  - [ ] Confirm DorisWare Club points are awarded once only when enabled.
  - [ ] Confirm failed, cancelled, and abandoned payments do not create a fulfilled order.
  - [ ] Confirm the webhook endpoint and Paystack webhook secret are configured in production.
- [ ] Publish accurate Terms, Privacy, Delivery, Returns, and Refunds information. Link Returns/Refunds clearly from the footer and checkout.
- [ ] Make customer support immediately reachable: real support email plus phone or WhatsApp, business hours, and an expected response time.
- [ ] Send automatic customer emails for order received, payment confirmed, dispatched, delivered, and failed/cancelled payment. Ensure support and newsletter submissions notify the team as well as being stored in Supabase.
- [ ] Decide how to handle the final-item race condition: reserve stock during checkout, or document and operationally support a prompt refund/manual resolution if stock runs out after payment.
- [ ] Create an admin-only operating checklist for approving reviews, updating order status/tracking, resolving support messages, and handling refunds.

## Priority 1 — Strongly recommended for launch quality

- [ ] Require stronger MFA protection for administrators. Email/password sign-in supports the current TOTP flow; ensure Google/OAuth access cannot bypass the same protection for admin actions.
- [ ] Fix the current lint findings before launch:
  - [ ] `src/hooks/useProducts.js`: state update inside an effect.
  - [ ] `src/pages/Profilepage.jsx`: two state-update-in-effect findings and one missing dependency warning.
- [ ] Add error monitoring (for example Sentry) and a simple analytics tool. Track checkout started, payment completed, failed payment, and support submission.
- [ ] Optimise the production bundle: the current Vite build warns that the main JavaScript bundle is above 500 kB. Add route/component code-splitting where practical.
- [ ] Optimise and lazy-load product images; confirm images are compressed and have meaningful alt text.
- [ ] Test the complete experience on real Android/iPhone devices and slow mobile data: browse, filter, cart, checkout, login, password reset, MFA, review submission, and order tracking.
- [ ] Test accessibility basics: keyboard-only navigation, visible focus states, form errors, contrast, and screen-reader labels.
- [ ] Verify all production environment variables and secrets are set only in Supabase/hosting settings, never committed to the repository.

## Priority 2 — First improvements after launch

- [ ] Add a clearer delivery-status timeline with customer notifications at each stage.
- [ ] Add product SEO: individual titles/descriptions, product structured data, sitemap, robots.txt, and social-share images.
- [ ] Add admin export/download options for orders, newsletter subscribers, support messages, and reviews.
- [ ] Let customers edit a review while it is awaiting approval, if desired.
- [ ] Review customer behaviour and tune personalised recommendations from real purchase data.
- [ ] Add automated tests for checkout, Paystack webhook verification, admin permissions, MFA, and review permissions.

## Already implemented

- Product catalogue uses incremental loading: 12 products initially, then 12 more on request.
- Product reviews load 5 at a time; homepage shows at most 3 approved reviews.
- Reviews require a paid and delivered purchase and require admin approval before publication.
- Public reviews expose only the reviewer’s first name.
- Newsletter and support forms are protected with Turnstile and stored in Supabase.
- Checkout uses Paystack verification, stock deduction, delivery zones, and order tracking details.
- DorisWare Club rules and tiers are managed in Admin and can be disabled.
