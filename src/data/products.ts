// Product catalogue data layer for Industrial Aqua.
//
// The 98-product test catalogue that previously lived here was removed on
// 2026-10-28 on the site owner's instruction — those products were test
// data only. The catalogue will be re-seeded from the client's own
// IndiaMART listing (Industrial Aqua Engineering, Howrah).
//
// Prices are always set by the client himself (via the Firebase-backed
// admin). Never invent a price, stock level, review or compatibility
// claim here. This file also serves as the seed data for that admin /
// Firestore import.

export interface ProductSection {
  id: string
  title: string
}

export interface Product {
  slug: string
  name: string
  /** Model / SKU code where the source listing prints one, e.g. "004A". */
  code?: string
  section: string
  subsection?: string
  /** Specification bullets exactly as printed, where the source gives any. */
  specs: string[]
  /** Long-form description — only when the business supplies one. */
  description?: string
  /** Always null until the client sets prices himself. */
  price: number | null
  /** Tracked inventory, only when the business supplies and maintains it
   * via the admin. null/absent = stock is not tracked for this product and
   * availability is confirmed on enquiry. Never invent a stock level. */
  stock?: number | null
  /** Archived products are withdrawn from sale: hidden from the shop and
   * blocked in carts, but kept in the catalogue data (unlike a delete) so
   * the business can restore them. Set only via the admin. */
  archived?: boolean
}

export const productSections: ProductSection[] = []

export const products: Product[] = []
