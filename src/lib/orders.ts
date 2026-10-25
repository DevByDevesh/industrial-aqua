import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/client';
import { cartHasUnpriced, cartPricedTotal, type CartItem } from './cart-model';

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
}

/** The order lifecycle. A customer creates an order in the initial status;
 * only the store admin moves it forward (enforced in firestore.rules).
 * There is deliberately no payment status: the site takes no online
 * payment, so no client-writable field may claim one. */
export const ORDER_STATUSES = [
  'Sent to store on WhatsApp',
  'Confirmed by store',
  'Out for delivery',
  'Delivered',
  'Cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const INITIAL_ORDER_STATUS: OrderStatus = ORDER_STATUSES[0];

/** Payment state, tracked separately from fulfilment status. Every order
 * starts as 'Pending'; only the store admin can move it (firestore.rules
 * pins the create value and restricts updates), and only after payment is
 * confirmed with the store directly — the site takes no online payment
 * and a browser redirect can never set this. When a payment provider is
 * integrated later, 'Paid' may be set only by the verified webhook /
 * server-side confirmation path, never by client code. */
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const INITIAL_PAYMENT_STATUS: PaymentStatus = PAYMENT_STATUSES[0];

export interface Order {
  id?: string;
  userId: string;
  email: string;
  customer: OrderCustomer;
  items: { slug: string; name: string; code?: string; qty: number; price: number | null }[];
  pricedTotal: number;
  hasUnpricedItems: boolean;
  status: string;
  /** Orders saved before Phase 8 may not carry this; treat as 'Pending'. */
  paymentStatus?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function placeOrder(
  userId: string,
  email: string,
  customer: OrderCustomer,
  items: CartItem[],
): Promise<Order> {
  if (!db) throw new Error('Orders are unavailable right now.');
  const now = new Date().toISOString();
  const order: Order = {
    userId,
    email,
    customer,
    items: items.map((item) => ({
      slug: item.slug,
      name: item.name,
      ...(item.code ? { code: item.code } : {}),
      qty: item.qty,
      price: item.price,
    })),
    pricedTotal: cartPricedTotal(items),
    hasUnpricedItems: cartHasUnpriced(items),
    status: INITIAL_ORDER_STATUS,
    paymentStatus: INITIAL_PAYMENT_STATUS,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(collection(db, 'orders'), order);
  return { ...order, id: ref.id };
}

/** Admin only (firestore.rules enforces it): move an order to a new status.
 * Only `status` and `updatedAt` change — totals and items are immutable. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!db) throw new Error('Orders are unavailable right now.');
  await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
}

/** Admin only (firestore.rules enforces it): record the payment state after
 * the store has confirmed payment directly with the customer. */
export async function updateOrderPaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<void> {
  if (!db) throw new Error('Orders are unavailable right now.');
  await updateDoc(doc(db, 'orders', orderId), { paymentStatus, updatedAt: new Date().toISOString() });
}

// Builds the WhatsApp order message link to the store's business number.
export function whatsappOrderLink(order: Order): string {
  const lines: string[] = ['Hello Industrial Aqua, I would like to place this order:', ''];
  for (const item of order.items) {
    lines.push(
      '• ' + item.name + (item.code ? ' (' + item.code + ')' : '') + ' × ' + item.qty +
        ' — ' + (item.price === null ? 'price on request' : '₹' + (item.price * item.qty).toLocaleString('en-IN')),
    );
  }
  lines.push('');
  if (order.pricedTotal > 0) lines.push('Priced items total: ₹' + order.pricedTotal.toLocaleString('en-IN'));
  if (order.hasUnpricedItems) lines.push('Some items are price-on-request — please confirm their prices.');
  if (order.id) lines.push('Order ref: ' + order.id);
  lines.push('');
  lines.push('Name: ' + order.customer.name);
  lines.push('Phone: ' + order.customer.phone);
  lines.push('Delivery address: ' + order.customer.address);
  return (
    'https://wa.me/919689757239?text=' + encodeURIComponent(lines.join('\n'))
  );
}
