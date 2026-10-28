import { ArrowUpRight, MessageCircle, Package, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../data/products';
import { productImages } from '../data/product-images';
import { whatsappEnquiryLink } from '../lib/enquiry';
import { useCart } from '../lib/cart';
import { useToast } from './feedback/ToastProvider';

// Shared product card used by the shop catalogue and the category pages,
// so a product looks and behaves identically wherever it appears.
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const image = productImages[product.slug];
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const productPath = '/product/' + product.slug;

  const addToBag = () => {
    cart.add(product);
    toast.showToast({
      title: 'Added to bag',
      description: product.name,
      actionLabel: 'View bag',
      onAction: () => navigate('/cart'),
    });
  };

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.03 }}
    >
      {image ? (
        <div className="product-card-media">
          <Link to={productPath} aria-label={'View ' + product.name}>
            <img src={image} alt={product.name} loading="lazy" />
          </Link>
          {product.code && <span className="product-card-code product-card-code-overlay">{product.code}</span>}
        </div>
      ) : (
        <div className="product-card-top">
          <span className="product-card-icon"><Package size={17} /></span>
          {product.code && <span className="product-card-code">{product.code}</span>}
        </div>
      )}
      <h4><Link to={productPath} className="product-card-name">{product.name}</Link></h4>
      {product.specs.length > 0 && (
        <ul className="product-specs">
          {product.specs.map((spec) => <li key={spec}>{spec}</li>)}
        </ul>
      )}
      <div className="product-card-footer">
        <span className="product-price">{product.price === null ? 'Price on request' : '₹' + product.price.toLocaleString('en-IN') + (product.priceUnit ? ' / ' + product.priceUnit : '')}</span>
        <span className="product-card-actions">
          <button type="button" className="shop-card-bag" onClick={addToBag} disabled={product.stock === 0}><ShoppingBag size={14} /> {product.stock === 0 ? 'Out of stock' : 'Add'}</button>
          <a href={whatsappEnquiryLink(product.name)} target="_blank" rel="noreferrer" className="shop-card-whatsapp"><MessageCircle size={14} /> Enquire <ArrowUpRight size={14} /></a>
        </span>
      </div>
    </motion.article>
  );
}
