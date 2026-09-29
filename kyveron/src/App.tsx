import { BrowserRouter, HashRouter, Routes, Route, Link } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { DynamicProvider } from './lib/dynamicStore';
import { PageLayout } from './components/Layout';
import HomePage from './pages/Home';
import ShopPage from './pages/Shop';
import ProductDetailPage from './pages/ProductDetail';
import CartPage, { CheckoutPage, OrderConfirmationPage } from './pages/CartCheckout';
import { LoginPage, RegisterPage, AccountPage, WishlistPage, TrackOrderPage } from './pages/Account';
import { CollectionPage, SearchPage } from './pages/CollectionSearch';
import { AboutPage, ContactPage, JournalPage, ReturnsPage, FAQPage, LegalPage } from './pages/Static';
import { AdminPanel } from './pages/Admin';

// Static hosts without SPA rewrites (GitHub Pages) build with VITE_HASH_ROUTER=true.
const Router = import.meta.env.VITE_HASH_ROUTER === 'true' ? HashRouter : BrowserRouter;

function App() {
  return (
    <DynamicProvider>
      <StoreProvider>
        <Router>
          <PageLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/collections/:slug" element={<CollectionPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/terms" element={<LegalPage type="terms" />} />
              <Route path="/privacy" element={<LegalPage type="privacy" />} />
              <Route path="/cookie-policy" element={<LegalPage type="cookie-policy" />} />
              <Route path="/shipping-policy" element={<LegalPage type="shipping-policy" />} />
              <Route path="/refund-policy" element={<LegalPage type="refund-policy" />} />
              <Route path="/size-guide" element={<LegalPage type="size-guide" />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PageLayout>
        </Router>
      </StoreProvider>
    </DynamicProvider>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-6xl font-semibold text-[#AAA394] mb-4">404</h1>
        <p className="text-lg font-medium text-[#303238] mb-2">Page not found</p>
        <p className="text-sm text-[#AAA394] mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Go Home</Link>
      </div>
    </div>
  );
}

export default App;
