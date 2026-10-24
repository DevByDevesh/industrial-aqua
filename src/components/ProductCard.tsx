import { ArrowUpRight, MessageCircle, Package } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../data/products';
import { whatsappEnquiryLink } from '../lib/enquiry';

// Shared product card used by the shop catalogue and the category pages,
// so a product looks and behaves identically wherever it appears.
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
    >
      <div className="product-card-top">
        <span className="product-card-icon"><Package size={17} /></span>
        {product.code && <span className="product-card-code">{product.code}</span>}
      </div>
      <h4>{product.name}</h4>
      {product.specs.length > 0 && (
        <ul className="product-specs">
          {product.specs.map((spec) => <li key={spec}>{spec}</li>)}
        </ul>
      )}
      <div className="product-card-footer">
        <span className="product-price">{product.price === null ? 'Price on request' : '₹' + product.price.toLocaleString('en-IN')}</span>
        <a href={whatsappEnquiryLink(product.name)} target="_blank" rel="noreferrer" className="shop-card-whatsapp"><MessageCircle size={14} /> Enquire <ArrowUpRight size={14} /></a>
      </div>
    </motion.article>
  );
}
