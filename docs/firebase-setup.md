# Firebase setup — Industrial Aqua

Safe development/operations notes for the site's Firebase backend.
**Never put a service-account key or any privileged secret in this repo or
in a `VITE_` variable** — everything under `VITE_` is shipped to browsers.

## What is actually used

| Service | Used? | For what |
| --- | --- | --- |
| Firebase Authentication (Email/Password) | Yes | Customer accounts + the single store-admin account |
| Cloud Firestore | Yes | `products` and `orders` collections |
| Firebase Storage | No | Initialized in code but unused — product photos are static files in the repo. Safe to leave unconfigured. |
| Cloud Functions | No (not yet) | Would need the Blaze plan; see "Trusted server-side work" below |

The Firebase project must be owned by the **client's** Google account.
Project ID is read from configuration, not hard-coded into logic.

## Web configuration (environment variables)

The web app config is a *public project identifier*, not a secret — access
is controlled by the Firestore security rules, and the API key is
additionally restricted in Google Cloud (HTTP referrers + API allowlist).
Defaults for the live project are built into `src/lib/firebase/client.ts`;
environment variables override them when set. Names only:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_ENABLED` — set to `false` to force the offline preview

See `.env.example` for the template.

## Preview without Firebase

Firebase initialization is optional by design. If it is disabled
(`VITE_FIREBASE_ENABLED=false`) or unconfigured, the shop renders from the
local catalogue seed in `src/data/products.ts`, the cart works fully
(client-side), and only account/order persistence is unavailable. Use this
for design previews — never point a preview at the production project with
write-enabled rules unless you mean to edit live data.

## Data model

- `products/{id}` — `slug`, `name`, optional `code`, `section` (one of the
  catalogue sections; categories are a presentation layer over sections,
  not a separate collection), optional `subsection`, `specs` (string list),
  optional `description`, `price` (number or `null` = price on request),
  `stock` (integer or `null` = not tracked), `order` (sort key),
  `updatedAt`. Only the admin can write; every write is schema-validated
  by the security rules.
- `orders/{id}` — `userId`, `email`, `customer {name, phone, address}`,
  `items` (each `{slug, name, code?, qty, price}` snapshots taken from the
  verified cart), `pricedTotal`, `hasUnpricedItems`, `status`,
  `paymentStatus`, `createdAt`, `updatedAt`. Status lifecycle:
  `Sent to store on WhatsApp` → `Confirmed by store` → `Out for delivery`
  → `Delivered`, or `Cancelled`. `paymentStatus` is `Pending`, `Paid` or
  `Failed`; every order is created as `Pending` (the rules pin this) and
  only the admin can change it — today that means "the customer paid the
  store directly", confirmed on WhatsApp. If a payment provider is added
  later, only the verified server-side/webhook path may set `Paid`.
  Items and totals never change after creation.

## Security rules

`firestore.rules` in this repo is the source of truth. It enforces:

- Products: public read; admin-only writes with schema validation
  (no negative prices/stock, bounded strings, no extra fields).
- Orders: a signed-in customer can create an order only for themselves
  (`userId`/`email` bound to their auth token), only in the initial
  status, with a validated shape (item quantities 1–99, prices ≥ 0 or
  null, at most 50 items). Customers read only their own orders. Only the
  admin can update an order, and only `status`/`updatedAt`.
- Everything else: denied.

### Publishing the rules (owner action)

GitHub/Hostinger deploys only the website — **pushing this repo does not
publish Firestore rules**. Publish with either:

1. Firebase Console → project → Firestore Database → **Rules** → paste the
   contents of `firestore.rules` → **Publish**. (The console validates the
   syntax first; a failed publish leaves the previous rules untouched.)
2. Or the Firebase CLI from this repo root:
   `firebase deploy --only firestore:rules`
   (`firebase.json` already points at `firestore.rules`.)

Until the tightened rules are published, the older interim rules apply
(product writes allowed for any signed-in user). Treat publishing as a
required go-live step.

## Known limits of the client-only setup

Security rules validate the *shape* of an order, but cannot recompute the
total from catalogue prices (a product's slug is not its document ID) and
cannot atomically decrement stock when an order is placed. Stock is
therefore **display-only**: the admin maintains it, the shop blocks
ordering of out-of-stock items, but placing an order does not reserve or
decrement stock.

If true server-verified totals or atomic inventory are needed later, add
Cloud Functions (requires the Blaze plan on the client's project):

- a callable/HTTPS function that re-prices the cart from Firestore,
  validates stock, and creates the order in a transaction;
- the browser then sends only slugs + quantities, never prices.

Do not move this logic into browser code — anything shipped to the browser
can be modified by the customer.

## Local development

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the web config of a
   **development** Firebase project (or leave `VITE_FIREBASE_ENABLED=false`
   for the offline preview).
3. `npm run dev`
4. For rules work, use the Firebase Emulator Suite
   (`firebase emulators:start`) against a demo project rather than editing
   production rules by trial and error.
