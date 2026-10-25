// Product catalogue data layer for Industrial Aqua.
//
// Source: the printed catalogue pamphlet the client supplied (8 pages:
// Our Import, Nuflow, Accessories, Housings & Filters, Fittings, Pro
// Series, Membranes, Pumps). Product names, model codes and specification
// bullets are transcribed from that pamphlet. The pamphlet publisher's
// company name is NOT used anywhere in the site content.
//
// Prices are intentionally null: the client fills them in himself later
// (via the Firebase-backed admin). Never invent a price, stock level,
// review or compatibility claim here. This file also serves as the seed
// data for that future admin/Firestore import.

export interface ProductSection {
  id: string
  title: string
}

export interface Product {
  slug: string
  name: string
  /** Model / SKU code where the pamphlet prints one, e.g. "004A". */
  code?: string
  section: string
  subsection?: string
  /** Specification bullets exactly as printed, where the pamphlet gives any. */
  specs: string[]
  /** Long-form description — only when the business supplies one. The
   * pamphlet provides none, so this is empty across the current catalogue
   * and the detail page simply omits the section. */
  description?: string
  /** Always null for now — the client sets prices himself later. */
  price: number | null
  /** Tracked inventory, only when the business supplies and maintains it
   * via the admin. null/absent = stock is not tracked for this product and
   * availability is confirmed on enquiry. Never invent a stock level. */
  stock?: number | null
}

export const productSections: ProductSection[] = [
  { id: 'our-import', title: 'Our Import' },
  { id: 'nuflow', title: 'Nuflow Range' },
  { id: 'accessories', title: 'Accessories' },
  { id: 'housings-filters', title: 'Housings & Filters' },
  { id: 'fittings', title: 'Fittings' },
  { id: 'pro-series', title: 'Pro Series' },
  { id: 'membranes', title: 'Membranes' },
  { id: 'pumps', title: 'Pumps' },
]

const p = (
  name: string,
  section: string,
  extra: Partial<Omit<Product, 'name' | 'section' | 'price'>> = {},
): Product => ({
  slug:
    (extra.code ? (extra.subsection ? extra.subsection + ' ' : '') + extra.code : name)
      .toLowerCase()
      .replace(/["″]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    section,
  name,
  section,
  specs: [],
  price: null,
  ...extra,
})

export const products: Product[] = [
  // ── Our Import ──────────────────────────────────────────────────────────
  p('Boda Faucet', 'our-import'),
  p('Faucet G-2', 'our-import', { code: 'G-2' }),
  p('Tap Kent', 'our-import'),
  p('Tap Chrome', 'our-import'),
  p('Faucet G-4', 'our-import', { code: 'G-4' }),
  p('FR KFLOW 450/550/800', 'our-import', { specs: ['Flow restrictor', '450 / 550 / 800'] }),
  p('FR Shitong 350/450/550/650', 'our-import', { specs: ['Flow restrictor', '350 / 450 / 550 / 650'] }),

  // ── Nuflow Range ────────────────────────────────────────────────────────
  p('PP Nuflow 140', 'nuflow'),
  p('PP Nuflow 110', 'nuflow'),
  p('PP Nuflow 90', 'nuflow'),
  p('10" Wound Filter', 'nuflow'),
  p('PP 20"/20*4', 'nuflow'),
  p('20"/20*4 Wound', 'nuflow'),
  p('Inline Nuflow', 'nuflow'),
  p('Membrane 90/100 GPD', 'nuflow', { specs: ['Hydronix membrane', '90 / 100 GPD'] }),
  p('SMPS 24/36/3AMP', 'nuflow', { specs: ['24 / 36 / 3 AMP'] }),
  p('UV Choke AC/DC', 'nuflow'),
  p('SV Nuflow Jacko', 'nuflow', { specs: ['Solenoid valve'] }),
  p('SV Nuflow 36/24', 'nuflow', { specs: ['Solenoid valve', '36 / 24'] }),

  // ── Accessories ─────────────────────────────────────────────────────────
  // The pamphlet groups these photos under subsection headings without
  // individual model names; names below describe the item shown and the
  // client can rename them in the admin later.
  p('SMPS Power Supply', 'accessories', { subsection: 'SMPS' }),
  p('UV Choke', 'accessories', { subsection: 'Choke and Sensor' }),
  p('Digital Sensor Controller', 'accessories', { subsection: 'Choke and Sensor' }),
  p('Level Sensor', 'accessories', { subsection: 'Choke and Sensor' }),
  p('Float Sensor Assembly', 'accessories', { subsection: 'Choke and Sensor' }),
  p('TDS Controller', 'accessories', { subsection: 'TDS Controller' }),
  p('Solenoid Valve', 'accessories', { subsection: 'Solenoid Valve' }),
  p('4" Ultra Filtration (UF)', 'accessories', { subsection: '4" Ultra Filteration' }),
  p('Inlet Coupling', 'accessories', { subsection: 'Cuppling & Valve' }),
  p('Ball Valve', 'accessories', { subsection: 'Cuppling & Valve' }),
  p('Coupling & Valve Set', 'accessories', { subsection: 'Cuppling & Valve' }),

  // ── Housings & Filters ──────────────────────────────────────────────────
  p('10" Black FV Housing', 'housings-filters'),
  p('10" FX Regular Housing', 'housings-filters'),
  p('10" FV White Housing', 'housings-filters'),
  p('10" Natural Housing', 'housings-filters'),
  p('MH Silicon', 'housings-filters', { specs: ['Membrane housing'] }),
  p('MH Nextech', 'housings-filters', { specs: ['Membrane housing'] }),
  p('UV Housing', 'housings-filters'),
  p('10"/20" Blue Housing', 'housings-filters'),
  p('Inline Nuflow Filter', 'housings-filters'),
  p('Inline Nextech Filter', 'housings-filters'),
  p('Inline Nextech Pro Filter', 'housings-filters'),
  p('Copper Filter Transparent/Gold', 'housings-filters'),

  // ── Fittings (model codes as printed) ───────────────────────────────────
  ...['004A', '005A', '002A', '013A', '003A', '002B', '004C', '002D', '002C', '013B', '003C', '002E'].map((code) =>
    p('Elbow ' + code, 'fittings', { code, subsection: 'Elbow' }),
  ),
  ...['006A', '021A', '022A', '014A', '012A', '019A', '006C', '023A', '024A', '014C', '012D'].map((code) =>
    p('Connector ' + code, 'fittings', { code, subsection: 'Connector' }),
  ),
  ...['009C', '009A', '009E', '017A', '010A'].map((code) =>
    p('Tee ' + code, 'fittings', { code, subsection: 'Tee' }),
  ),
  ...['034A', '025A', '025B', '015E', '022A'].map((code) =>
    p('Valve ' + code, 'fittings', { code, subsection: 'Valve' }),
  ),
  ...['032A', '041A', '031A'].map((code) =>
    p('Switch / Cutter ' + code, 'fittings', { code, subsection: 'Switches & Cutter' }),
  ),

  // ── Pro Series ──────────────────────────────────────────────────────────
  p('PP Nextech Pro', 'pro-series'),
  p('Inline Filter (Pro)', 'pro-series'),
  p('Alkaline Filter', 'pro-series'),
  p('4" Nano Mineral', 'pro-series'),
  p('8" Mineral Cartridge', 'pro-series'),
  p('10"/20" GAC', 'pro-series'),

  // ── Membranes ───────────────────────────────────────────────────────────
  p('Nextech 80 GPD', 'membranes', {
    specs: ['11 Layer', '100% import', 'Long lasting', 'NO Joints', 'Attractive packaging', 'OEM available', 'Working TDS up to 2000'],
  }),
  p('Nextech 90 GPD', 'membranes', {
    specs: ['13 Layer', '100% import', 'Long lasting', 'NO Joints', 'Attractive packaging', 'OEM available', 'Working TDS up to 2000'],
  }),
  p('Nextech 100 GPD', 'membranes', {
    specs: ['15 Layer', '100% import', 'Long lasting', 'NO Joints', 'Attractive packaging', 'OEM available', 'Working TDS up to 2000'],
  }),
  p('Hydronix 300 GPD', 'membranes'),
  p('CRV 90/110 GPD', 'membranes'),
  p('Mark TFC 110 GPD', 'membranes'),
  p('8" EAU Concealed', 'membranes'),
  p('Nextech ECO', 'membranes'),

  // ── Pumps ───────────────────────────────────────────────────────────────
  p('Pump Navy Force Self Suction', 'pumps', {
    specs: ['100% import pump', 'Weight – 2.2 kg', '42mm armature', 'Suction height 2 mtr.'],
  }),
  p('Pump Navy Force Booster', 'pumps', {
    specs: ['100% import pump', 'Weight – 1.9 kg', '38mm armature', 'Pure copper coil'],
  }),
  p('Pump Nextech Pro (2 yr warranty)', 'pumps', {
    specs: ['2yr Warranty', 'Booster pump', 'Suction height 2 mtr.', 'Max pressure 125 PSI'],
  }),
  p('Pump Nextech Pro NI-18', 'pumps', {
    specs: ['1yr Warranty', '24 V', 'Max pressure 125 PSI'],
  }),
  p('Pump Nextech-150 GPD', 'pumps', {
    specs: ['1yr warranty', 'Flow rate 2.5L/min', 'Max pressure 140 PSI'],
  }),
  p('Pump CRV-100 GPD Prime', 'pumps', {
    specs: ['1yr Warranty', 'Eco range pump', 'Most reliable pump', 'Max pressure 110 PSI'],
  }),
]
