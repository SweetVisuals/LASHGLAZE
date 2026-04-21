/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
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

import Profile from './pages/Profile';

function AppContent() {
  const { isAdmin, isInitialLoading, policies } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const renderPolicyContent = (type: string, fallback: string) => {
    const policy = policies.find(p => p.type === type && p.published);
    if (!policy) return <p>{fallback}</p>;
    
    return (
      <div className="space-y-6 whitespace-pre-wrap">
        {policy.content.split('\n\n').map((block, i) => (
          <p key={i}>{block}</p>
        ))}
      </div>
    );
  };

  React.useEffect(() => {
    if (!isInitialLoading) {
      const loader = document.getElementById('loader-wrapper');
      if (loader) {
        loader.classList.add('loaded');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 800);
      }
    }
  }, [isInitialLoading]);

  // Handle Admin Access Redirect
  React.useEffect(() => {
    if (location.pathname === '/admin' && !isInitialLoading && !isAdmin) {
      navigate('/');
    }
  }, [location.pathname, isAdmin, isInitialLoading, navigate]);

  // Protected Admin Component Wrapper
  if (location.pathname === '/admin') {
    if (!isAdmin && !isInitialLoading) return <Navigate to="/" />;
    if (isAdmin) return <AdminDashboard onNavigateBack={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Header 
        onNavigate={() => navigate('/')} 
        onAdminClick={() => navigate('/admin')}
        onCartClick={() => navigate('/checkout')}
        onTrackClick={() => navigate('/tracking')}
        onProfileClick={() => navigate('/profile')}
      />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Store onProductClick={(id) => navigate(`/product/${id}`)} />} />
          
          <Route path="/product/:id" element={
            <ProductRouteWrapper navigate={navigate} />
          } />
          
          <Route path="/checkout" element={
            <Checkout 
              onBack={() => navigate('/')} 
              onSuccessRedirect={(orderId) => {
                if (orderId) navigate(`/tracking/${orderId}`);
                else navigate('/profile');
              }}
            />
          } />
          
          <Route path="/profile" element={
             <Profile onBack={() => navigate('/')} onOrderClick={(id) => navigate(`/tracking/${id}`)} />
          } />

          <Route path="/tracking" element={
            <OrderTracking 
              onMyOrdersClick={() => navigate('/profile')}
            />
          } />

          <Route path="/tracking/:orderId" element={
            <TrackingRouteWrapper navigate={navigate} />
          } />

          <Route path="/terms" element={
              <StaticPage 
                title="Terms & Conditions" 
                content={renderPolicyContent('terms', "Welcome to Lash Glaze. By accessing this website, you agree to be bound by these Terms and Conditions. This website is intended for personal, non-commercial use. All content, including designs, logos, and images, is the property of Lash Glaze and is protected by copyright laws.")} 
              />
          } />
          
          <Route path="/privacy" element={
              <StaticPage 
                title="Privacy Policy" 
                content={renderPolicyContent('privacy', "Your privacy is paramount to us at Lash Glaze. We collect information provided during checkout, including name, email, and shipping address. We do not store credit card info; all payments are processed securely via Stripe and PayPal.")} 
              />
          } />

          <Route path="/shipping" element={
              <StaticPage 
                title="Shipping Logistics" 
                content={renderPolicyContent('shipping', "Lash Glaze is committed to delivering your premium lashes as quickly and safely as possible. All orders are processed within 1-2 business days. Shipping charges are calculated dynamically at checkout based on your delivery address. We ship worldwide.")} 
              />
          } />

          <Route path="/returns" element={
              <StaticPage 
                title="Returns & Claims" 
                content={renderPolicyContent('refund', "At Lash Glaze, we take hygiene seriously. Due to the personal nature of our products, strip lashes can only be returned if they are in their original, unopened, and unused condition within 14 days of delivery. For hygiene reasons, any lashes removed from the tray cannot be returned.")} 
              />
          } />

          <Route path="/faq" element={
             <StaticPage 
               title="Common Queries" 
               content={
                 <div className="space-y-12">
                   <div>
                     <p className="font-sans text-[10px] uppercase font-black tracking-widest text-gold mb-2">Longevity & Care</p>
                     <p>How long can I wear Lash Glaze strip lashes? Our lashes are crafted from the finest artisanal silk and are designed for longevity. With proper removal and storage in their original tray, a single pair can be worn up to 20 times flawlessly.</p>
                   </div>
                   <div>
                     <p className="font-sans text-[10px] uppercase font-black tracking-widest text-gold mb-2">Global Access</p>
                     <p>Do you offer international shipping? Yes, we ship our premium collections worldwide. Shipping rates and delivery estimates are calculated dynamically at checkout based on your global location and preferred courier service.</p>
                   </div>
                   <div>
                     <p className="font-sans text-[10px] uppercase font-black tracking-widest text-gold mb-2">Ethical Standards</p>
                     <p>Are your lashes cruelty-free? Absolutely. At Lash Glaze, we are committed to ethical beauty. All our lashes are 100% vegan and cruelty-free, using high-grade synthetic silk that mimics the softness of natural fibers.</p>
                   </div>
                   <div>
                     <p className="font-sans text-[10px] uppercase font-black tracking-widest text-gold mb-2">Order Tracking</p>
                     <p>How do I track my order? Once your order is processed, you will receive a tracking code via email. You can also monitor your order's journey directly within your 'Atelier' profile or on our dedicated tracking page.</p>
                   </div>
                 </div>
               } 
             />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {location.pathname !== '/checkout' && (
        <Footer />
      )}
      <CookieBanner />
    </div>
  );
}

// Helper wrappers to extract params
function ProductRouteWrapper({ navigate }: { navigate: any }) {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/" />;
  return <ProductPage productId={id} onBack={() => navigate('/')} onCheckout={() => navigate('/checkout')} />;
}

function TrackingRouteWrapper({ navigate }: { navigate: any }) {
  const { orderId } = useParams<{ orderId: string }>();
  return <OrderTracking initialOrderId={orderId} onMyOrdersClick={() => navigate('/profile')} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

