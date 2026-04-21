/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Clock } from 'lucide-react';
import { Product } from '../types';
import { CountdownTimer } from '../components/CountdownTimer';

interface StoreProps {
  onProductClick: (id: string) => void;
}

export const Store: React.FC<StoreProps> = ({ onProductClick }) => {
  const { products, formatPrice, storeSettings } = useApp();
  const [filterType, setFilterType] = useState('All');

  return (
    <div className="pb-20 bg-paper">
      {/* Announcement Bar */}
      <div className="bg-accent py-2 overflow-hidden whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="inline-block text-ink text-[9px] font-bold uppercase tracking-[0.4em]"
        >
          Limited weekly drops - don't miss out • Hand-crafted luxury strip lashes • New styles every Monday • Worldwide shipping available • 
          Limited weekly drops - don't miss out • Hand-crafted luxury strip lashes • New styles every Monday • Worldwide shipping available • 
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-accent/10">
        <div className="absolute inset-0 z-0 opacity-100">
          <img 
            src={storeSettings.heroBannerUrl} 
            alt="Editorial Lash Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/[0.65]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-paper" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="font-serif text-6xl md:text-8xl text-white mb-10 tracking-tight italic"
          >
            The Muse Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xs md:text-sm text-white/80 mb-12 tracking-[0.4em] uppercase font-bold"
          >
            Crafted for the modern gaze.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
              <button 
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-64 h-16 flex items-center justify-center bg-white/10 backdrop-blur-2xl text-white text-[11px] tracking-[0.4em] uppercase font-bold shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 rounded-none border-none z-[60] relative overflow-hidden group"
              >
                <div className="absolute top-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -left-full group-hover:animate-shine" />
                Shop Collection
              </button>
              {(() => {
                const productWithTimer = [...products]
                  .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()) // Assuming numeric IDs are timestamps or using created_at if available
                  .find(p => p.limitedTimeEnabled && p.limitedTimeEndsAt);
                
                const expiry = productWithTimer?.limitedTimeEndsAt 
                  ? new Date(productWithTimer.limitedTimeEndsAt) 
                  : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

                return (
                  <CountdownTimer 
                    expiry={expiry} 
                    variant="button"
                  />
                );
              })()}
          </motion.div>
        </div>
      </section>

      {/* Trust Badges - Minimal Editorial Style */}
      <section className="max-w-5xl mx-auto px-8 md:px-16 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center p-4">
            <RefreshCcw className="text-muted mb-6" size={24} strokeWidth={1} />
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Artisanal Craft</h3>
            <p className="text-[9px] text-muted uppercase tracking-[0.2em] leading-loose max-w-[170px]">Hand-knotted silk perfection</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <Truck className="text-muted mb-6" size={24} strokeWidth={1} />
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Global Shipping</h3>
            <p className="text-[9px] text-muted uppercase tracking-[0.2em] leading-loose max-w-[170px]">Tracked delivery worldwide</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <ShieldCheck className="text-muted mb-6" size={24} strokeWidth={1} />
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Premium Silk</h3>
            <p className="text-[9px] text-muted uppercase tracking-[0.2em] leading-loose max-w-[170px]">Reusable up to 15 wears</p>
          </div>
        </div>
      </section>

      {/* Product Feed */}
      <section id="collection" className="max-w-5xl mx-auto px-8 md:px-16 py-24">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="font-serif text-5xl md:text-7xl text-ink italic mb-6 tracking-tight">The Complete Edition</h2>
          <p className="text-[10px] text-muted uppercase tracking-[0.5em] font-bold opacity-60">Limited run lash package</p>
        </div>

        <div className="flex justify-center">
          {products
            .filter(p => p.status === 'active')
            .map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer w-full max-w-xl"
              onClick={() => onProductClick(product.id)}
            >
              <div className="relative aspect-video overflow-hidden bg-accent/20 mb-6 p-2 rounded-none">
                <div className="w-full h-full overflow-hidden bg-white rounded-none relative">
                   {(() => {
                     const now = new Date();
                     const preOrderEndsAt = product.preOrderEndsAt ? new Date(product.preOrderEndsAt) : null;
                     const limitedTimeEndsAt = product.limitedTimeEndsAt ? new Date(product.limitedTimeEndsAt) : null;

                     const isPreOrder = !!(product.preOrderEnabled && preOrderEndsAt && now < preOrderEndsAt);
                     const isLimited = !!(product.limitedTimeEnabled && limitedTimeEndsAt && now < limitedTimeEndsAt && (!preOrderEndsAt || now > preOrderEndsAt));
                     const isReserve = !!(product.limitedTimeEnabled && limitedTimeEndsAt && now >= limitedTimeEndsAt);

                     if (isPreOrder) return (
                        <div className="absolute top-4 left-4 z-10 bg-gold text-paper px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg">
                          Pre-order
                        </div>
                     );
                     if (isLimited) return (
                        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg animate-pulse">
                          Limited Time
                        </div>
                     );
                     if (isReserve) return (
                        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg">
                          Reserve Order
                        </div>
                     );
                     return null;
                   })()}
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button className="hidden md:block absolute bottom-6 left-6 right-6 bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 rounded-none shadow-2xl hover:bg-gold hover:text-black">
                  Select Package
                </button>
              </div>
              <div className="space-y-2 text-center mt-8">
                <h3 className="font-serif text-2xl md:text-3xl italic group-hover:text-muted transition-colors leading-tight">{product.name}</h3>
                <div className="flex items-center justify-center gap-4">
                   <span className="text-[10px] uppercase tracking-widest text-muted">Glaze Series Base</span>
                   <span className="text-xs text-muted">|</span>
                   <p className="text-sm text-ink font-bold leading-none">
                     {product.preOrderEnabled && product.preOrderPrice ? (
                        <>
                          <span className="text-gold">{formatPrice(product.preOrderPrice)}</span>
                          <span className="ml-2 text-[10px] text-muted line-through opacity-50">{formatPrice(product.price)}</span>
                        </>
                     ) : formatPrice(product.price)}
                   </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


    </div>
  );
};
