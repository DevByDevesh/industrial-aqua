// Single catalogue data layer for the Industrial Aqua storefront.
//
// These are product CATEGORIES (directory entries), not individual stock
// listings: no prices, availability, reviews or compatibility claims belong
// here. Real product data will replace/extend this layer when the client
// supplies the catalogue (see project notes); until then the shop page and
// the homepage both read from this one list so they cannot drift.

export interface Category {
  slug: string
  title: string
  /** Short description used by both the shop directory and homepage cards. */
  description: string
  /** Mono tag rendered on cards, e.g. "FILTRATION". */
  tag: string
  /** Sidebar group label, e.g. "Components". */
  group: string
  /** Decorative art variant used by the shop card symbol. */
  art: 'filter' | 'membrane' | 'pump' | 'fittings'
}

export const categories: Category[] = [
  { slug: 'domestic-ro', title: 'Domestic RO Systems', description: 'Water purification systems and components for home use.', tag: 'DOMESTIC RO', group: 'RO systems', art: 'filter' },
  { slug: 'commercial-ro', title: 'Commercial RO Systems', description: 'RO system options for offices, hospitality and commercial sites.', tag: 'COMMERCIAL RO', group: 'RO systems', art: 'membrane' },
  { slug: '500-1000-lph', title: '500–1000 LPH RO Plants', description: 'Mid-capacity plant options for business and institutional needs.', tag: 'RO PLANTS', group: 'RO plants', art: 'pump' },
  { slug: 'industrial-ro', title: 'Industrial RO Plants', description: 'Discuss capacity, feed water and application for industrial plant needs.', tag: 'INDUSTRIAL', group: 'RO plants', art: 'fittings' },
  { slug: 'filters', title: 'Filters & Cartridges', description: 'Filtration components for maintenance and treatment systems.', tag: 'FILTRATION', group: 'Components', art: 'filter' },
  { slug: 'membranes', title: 'RO Membranes', description: 'Membrane options; verify system model and compatibility before purchase.', tag: 'MEMBRANES', group: 'Components', art: 'membrane' },
  { slug: 'pumps-valves', title: 'Pumps & Valves', description: 'Components for flow, pressure and system control.', tag: 'FLOW CONTROL', group: 'Components', art: 'pump' },
  { slug: 'tanks', title: 'Storage Tanks', description: 'Storage options for RO systems and water treatment installations.', tag: 'STORAGE', group: 'Components', art: 'fittings' },
  { slug: 'solutions', title: 'Water Treatment Solutions', description: 'ETP, STP, water softeners, UV, UF and water chillers.', tag: 'TREATMENT', group: 'Solutions', art: 'membrane' },
]

/** Categories shown on the homepage product-range grid (excludes Solutions). */
export const homeCategories: Category[] = categories.filter((category) => category.slug !== 'solutions')

export function categoryPath(category: Category): string {
  return '/category/' + category.slug
}

export function isCategorySlug(value: string | null): value is string {
  return value !== null && categories.some((category) => category.slug === value)
}
