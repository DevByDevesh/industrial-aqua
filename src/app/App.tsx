import { AnimatePresence, motion } from 'motion/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SiteShell } from '../components/layout/SiteShell';
import { AdminShell } from '../components/layout/AdminShell';
import { RoutePlaceholder } from '../pages/RoutePlaceholder';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminOrdersPage, AdminOverviewPage } from '../pages/admin/AdminInsights';
import { CategoryPage } from '../pages/CategoryPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AccountPage, LoginPage, OrdersPage, RegisterPage, ResetPasswordPage } from '../pages/AccountPages';
import { ContactPage, PrivacyPage, ReturnsPage, ShippingPage, SupportPage, TermsPage } from '../pages/InfoPages';
import { FindPartsPage } from '../pages/FindPartsPage';
import { AuthProvider } from '../lib/auth';
import { CartProvider } from '../lib/cart';
import { transitions } from '../motion/tokens';

const placeholderRoutes = [
  { path: '/account/orders/:id', title: 'Order details', description: 'Open your orders list to see the full order.' },
];

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={transitions.fast}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/find-parts" element={<FindPartsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/login" element={<LoginPage />} />
          <Route path="/account/register" element={<RegisterPage />} />
          <Route path="/account/reset-password" element={<ResetPasswordPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          {placeholderRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<RoutePlaceholder {...route} />} />
          ))}
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="inventory" element={<RoutePlaceholder title="Inventory" description="Stock levels are confirmed on enquiry; there is no separate stock system yet." />} />
            <Route path="categories" element={<RoutePlaceholder title="Categories" description="Categories are managed in the site code alongside the catalogue." />} />
            <Route path="compatibility" element={<RoutePlaceholder title="Compatibility" description="Compatibility is confirmed by the store team per enquiry; nothing is published without verification." />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="settings" element={<RoutePlaceholder title="Settings" description="Store policies are published on the Shipping, Returns, Privacy and Terms pages." />} />
          </Route>
          <Route path="*" element={<RoutePlaceholder title="Page not found" description="The page you are looking for does not exist." hideSetupNote />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SiteShell>
          <AnimatedRoutes />
        </SiteShell>
      </CartProvider>
    </AuthProvider>
  );
}
