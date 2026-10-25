import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase/client';
import { cartHasUnpriced, cartPricedTotal, type CartItem } from './cart-model';

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id?: string;
  userId: string;
  email: string;
  customer: OrderCustomer;
  items: { slug: string; name: string; code?: string; qty: number; price: number | null }[];
  pricedTotal: number;
  hasUnpricedItems: boolean;
  status: string;
  createdAt: string;
}

export async function placeOrder(
  userId: string,
  email: string,
  customer: OrderCustomer,
  items: CartItem[],
): Promise<Order> {
  if (!db) throw new Error('Orders are unavailable right now.');
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
    status: 'Sent to store on WhatsApp',
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, 'orders'), order);
  return { ...order, id: ref.id };
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
