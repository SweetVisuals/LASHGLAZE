/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Store } from './pages/Store';
import { ProductPage } from './pages/ProductPage';
import { Checkout } from './pages/Checkout';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrderTracking } from './pages/OrderTracking';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { StaticPage } from './pages/StaticPage';

import { Profile } from './pages/Profile';

type PageType = 'store' | 'product' | 'checkout' | 'admin' | 'tracking' | 'profile' | 'terms' | 'privacy' | 'shipping' | 'returns' | 'faq';

function AppContent() {
  const { isAdmin, isInitialLoading } = useApp();
  const [currentPage, setCurrentPage] = useState<PageType>('store');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);

  const navigateToProduct = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const navigateToTracking = (id: string) => {
    setTrackedOrderId(id);
    setCurrentPage('tracking');
    window.scrollTo(0, 0);
  };

  const navigateTo = (page: PageType) => {
    if (page !== 'tracking') setTrackedOrderId(null);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  React.useEffect(() => {
    if (currentPage === 'admin' && !isAdmin) {
      setCurrentPage('store');
    }
  }, [currentPage, isAdmin]);

  React.useEffect(() => {
    if (!isInitialLoading) {
      const loader = document.getElementById('loader-wrapper');
      if (loader) {
        loader.classList.add('loaded');
        // Optional: Remove from DOM after transition
        setTimeout(() => {
          loader.style.display = 'none';
        }, 800);
      }
    }
  }, [isInitialLoading]);

  if (currentPage === 'admin') {
    if (!isAdmin) return null;
    return <AdminDashboard onNavigateBack={() => navigateTo('store')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Header 
        onNavigate={() => navigateTo('store')} 
        onAdminClick={() => navigateTo('admin')}
        onCartClick={() => navigateTo('checkout')}
        onTrackClick={() => navigateTo('tracking')}
        onProfileClick={() => navigateTo('profile')}
      />
      
      <main className="flex-grow">
        {currentPage === 'store' && (
          <Store onProductClick={navigateToProduct} />
        )}
        
        {currentPage === 'product' && selectedProductId && (
          <ProductPage 
            productId={selectedProductId} 
            onBack={() => navigateTo('store')}
            onCheckout={() => navigateTo('checkout')}
          />
        )}
        
        {currentPage === 'checkout' && (
          <Checkout 
            onBack={() => navigateTo('store')} 
            onSuccessRedirect={() => navigateTo('profile')}
          />
        )}
        
        {currentPage === 'profile' && (
           <Profile onOrderClick={navigateToTracking} />
        )}

        {currentPage === 'tracking' && (
          <OrderTracking initialOrderId={trackedOrderId || undefined} />
        )}

        {currentPage === 'terms' && (
           <StaticPage 
             title="Terms & Conditions" 
             content={<p>These Terms and Conditions constitute a legally binding agreement between you and Lash Glaze Strip Lashes concerning your access to and use of the website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto. By accessing the site, you agree that you have read, understood, and agreed to be bound by all of these Terms and Conditions.</p>} 
           />
        )}
        {currentPage === 'privacy' && (
           <StaticPage 
             title="Privacy Policy" 
             content={<p>We respect your privacy and are committed to protecting it. This Privacy Policy outlines our practices concerning the collection, use, and disclosure of your information when you use our website. We collect personal data you provide, such as name and email, and use it to enhance your experience. We do not sell your personal data to third parties.</p>} 
           />
        )}
        {currentPage === 'shipping' && (
           <StaticPage 
             title="Shipping Logistics" 
             content={<p>All orders are processed within 1-2 business days. Standard shipping typically takes 3-5 business days within the EU, and 7-14 days internationally. Expedited shipping options are available at checkout. You will receive a tracking number once your order has been dispatched from our Berlin atelier.</p>} 
           />
        )}
        {currentPage === 'returns' && (
           <StaticPage 
             title="Returns & Claims" 
             content={<p>We accept returns for unused, unopened products in their original packaging within 14 days of delivery. Due to hygiene regulations, we cannot accept returns on lashes that have been removed from their tray. Please contact our support team to initiate a return or claim for damaged items.</p>} 
           />
        )}
        {currentPage === 'faq' && (
           <StaticPage 
             title="Common Queries" 
             content={<><p><strong>Q: How long do the lashes last?</strong><br/>A: With proper care, our premium silk lashes can be worn up to 20 times.</p><p><strong>Q: Do you ship internationally?</strong><br/>A: Yes, we ship worldwide. Shipping costs will apply and be added at checkout.</p></>} 
           />
        )}
      </main>

      <Footer onNavigate={(page: PageType) => navigateTo(page)} />
      <CookieBanner />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
