# Industrial Aqua

React + Vite + TypeScript storefront foundation for RO water purifier spare parts and compatible replacement components.

## Setup

Requires Node.js 20.19+ or 22.12+. Run `npm install`, copy `.env.example` to `.env.local`, then run `npm run dev`.

Configure a Firebase Web App before setting `VITE_FIREBASE_ENABLED=true`. Never put service-account keys or server secrets in Vite variables; `VITE_*` values are public in the browser.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Phase 1 scope

Scaffold, design tokens, route placeholders, shared Motion variants, one reduced-motion-aware Lenis provider, and optional Firebase client initialization. No sample products, fabricated prices, stock, reviews or compatibility assertions. Payment is not configured. Backend order validation, stock decrement, payment webhook verification and Firebase security rules are required before launch.
