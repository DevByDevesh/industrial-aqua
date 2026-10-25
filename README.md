# Industrial Aqua

React + Vite + TypeScript storefront foundation for RO water purifier spare parts and compatible replacement components.

## Setup

Requires Node.js 20.19+ or 22.12+. Run `npm install`, copy `.env.example` to `.env.local`, then run `npm run dev`.

Configure a Firebase Web App before setting `VITE_FIREBASE_ENABLED=true`. Never put service-account keys or server secrets in Vite variables; `VITE_*` values are public in the browser.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm test` — cart/order model tests (verified prices, tampering, stock)

## Status and launch blockers

The storefront, catalogue, cart, checkout and admin are live. The approved
purchase flow today is: customer places an order → the store confirms it
personally on WhatsApp → the customer pays the store directly. Orders are
saved (signed-in customers) with a pending payment state that only the
store admin can change; Firestore security rules live in `firestore.rules`
and must be published by the project owner (see `docs/firebase-setup.md`).

**Online payment is NOT integrated.** Before any online payment launch:

1. The owner chooses a payment provider and supplies its credentials
   (test/sandbox mode first). No provider has been chosen yet.
2. A trusted backend (Cloud Functions, needs the Blaze plan) must provide:
   server-side order validation and re-pricing (the browser's totals are
   never trusted), payment verification with the provider, signed webhook
   handling with idempotency and safe retries, and atomic stock decrement.
   None of this may live in browser code.
3. An order may be marked paid only from that verified backend path —
   never from a client-side redirect.

Until then, no real charges can or should be run through this codebase.
