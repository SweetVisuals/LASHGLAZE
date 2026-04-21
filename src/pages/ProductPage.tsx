/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Share2, Info, ChevronLeft, Clock, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';

interface ProductPageProps {
  productId: string;
  onBack: () => void;
  onCheckout: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ productId, onBack, onCheckout }) => {
  const { products, addToCart, dropExpiry, isDropActive, formatPrice, storeSettings } = useApp();
  const product = products.find(p => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedLength, setSelectedLength] = useState('9-16mm');
  const [activeImage, setActiveImage] = useState(0);

  if (!product) return null;

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const now = new Date();
  const preOrderEndsAt = product.preOrderEndsAt ? new Date(product.preOrderEndsAt) : null;
  const limitedTimeEndsAt = product.limitedTimeEndsAt ? new Date(product.limitedTimeEndsAt) : null;

  const isPreOrderActive = !!(product.preOrderEnabled && preOrderEndsAt && now < preOrderEndsAt);
  const isLimitedTimeActive = !!(product.limitedTimeEnabled && limitedTimeEndsAt && now < limitedTimeEndsAt && (!preOrderEndsAt || now > preOrderEndsAt));
  const isReserveOrder = !!(product.limitedTimeEnabled && limitedTimeEndsAt && now >= limitedTimeEndsAt);

  const currentPrice = isPreOrderActive && product.preOrderPrice ? product.preOrderPrice : product.price;
  const isAvailable = isDropActive || isPreOrderActive || isLimitedTimeActive || isReserveOrder;

  // Which timer to show?
  const activeTimerTarget = isPreOrderActive ? preOrderEndsAt : (isLimitedTimeActive ? limitedTimeEndsAt : null);
  const timerLabel = isPreOrderActive ? 'Pre-order' : (isLimitedTimeActive ? 'Limited Time' : (isReserveOrder ? 'Reserve Order Mode' : 'Window active'));



  return (
    <div className="bg-paper min-h-screen text-ink">
      <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
        {/* Simple Minimal Back Navigation */}
        <div className="py-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-50 transition-all group"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" strokeWidth={3} /> 
            Back
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-32 pb-32">
          
          {/* VISUALS: Simple Stack or Gallery */}
          <div className="space-y-8">
            <motion.div 
              layoutId={`product-image-${product.id}`}
              className="aspect-square bg-accent/5 overflow-hidden rounded-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
            >
              <img 
                src={gallery[activeImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-4 pt-4">
                {gallery.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-none overflow-hidden transition-all duration-500 relative group ${
                      activeImage === idx 
                        ? 'opacity-100 ring-1 ring-white/20 scale-[0.98]' 
                        : 'opacity-40 hover:opacity-80'
                    }`}
                  >
                    <img 
                      src={img} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                    {activeImage === idx && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute inset-x-0 bottom-0 h-1 bg-white"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS: Rethought & Simplified */}
          <div className="mt-16 lg:mt-0 space-y-12">
            <div className="space-y-6">
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    <span>Aura Editorial</span>
                    <span className="w-1 h-1 bg-accent rounded-full" />
                    <span>Drop 001</span>
                  </div>
                  <h1 className="font-sans text-3xl lg:text-5xl font-bold tracking-tight text-ink flex flex-col lg:flex-row lg:items-center">
                    {product.name}
                    {isPreOrderActive && (
                       <span className="lg:ml-4 mt-2 lg:mt-0 bg-gold text-paper px-3 py-1 text-[10px] font-bold uppercase tracking-widest align-middle shadow-lg w-fit">
                         Pre-order
                       </span>
                    )}
                    {isLimitedTimeActive && (
                       <span className="lg:ml-4 mt-2 lg:mt-0 bg-red-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest align-middle shadow-lg animate-pulse w-fit">
                         Limited Time
                       </span>
                    )}
                    {isReserveOrder && (
                       <span className="lg:ml-4 mt-2 lg:mt-0 bg-blue-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest align-middle shadow-lg w-fit">
                         Reserve Order
                       </span>
                    )}
                  </h1>
               </div>

                <div className="flex items-baseline gap-4 mt-2">
                   <span className="text-2xl font-bold tracking-tighter text-ink">
                     {formatPrice(currentPrice)}
                   </span>
                   {(product.salePrice || (isPreOrderActive && product.preOrderPrice)) && (
                     <span className="text-base text-muted/50 line-through font-bold">
                       {isPreOrderActive && product.preOrderPrice 
                         ? formatPrice(product.price) 
                         : product.salePrice ? formatPrice(product.salePrice) : ''}
                     </span>
                   )}
                </div>
             </div>

             {/* Integrated Multi-Mode Timer Box */}
             <div 
               className="p-6 space-y-4 rounded-none shadow-inner transition-colors duration-500"
               style={{ 
                 backgroundColor: isPreOrderActive 
                   ? storeSettings.colors.preOrder 
                   : (isLimitedTimeActive ? storeSettings.colors.limitedTime : 'rgba(var(--accent-rgb), 0.05)')
               }}
             >
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em]">
                   <span className={activeTimerTarget ? (isPreOrderActive || isLimitedTimeActive ? 'text-white' : 'text-ink') : 'text-red-500'}>
                     {timerLabel}
                   </span>
                   {activeTimerTarget ? (
                     <CountdownTimer 
                       expiry={activeTimerTarget} 
                       variant="inline" 
                     />
                   ) : (
                     <span className="text-red-500 italic lowercase tracking-widest opacity-50">Expired</span>
                   )}
                </div>
             </div>

            <div className="space-y-10">
               {/* Action */}
               <div className="space-y-6 pt-6">
                  <div className="flex gap-4">
                  <div className="flex items-center px-4 font-bold text-sm bg-accent/5 rounded-none shadow-inner">
                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:opacity-40 transition-opacity">－</button>
                     <span className="w-8 text-center text-xs">{quantity}</span>
                     <button onClick={() => setQuantity(quantity + 1)} className="hover:opacity-40 transition-opacity">＋</button>
                  </div>
                    <button 
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          addToCart(product, quantity);
                          onCheckout();
                        }
                      }}
                      className={`flex-grow py-5 text-[10px] font-extrabold uppercase tracking-[0.4em] transition-all relative overflow-hidden group rounded-none shadow-xl ${
                        isAvailable
                          ? 'bg-ink text-paper hover:bg-gold hover:text-ink shadow-lg shadow-gold/10' 
                          : 'bg-black/5 text-muted cursor-not-allowed'
                      }`}
                    >
                      <span className="relative z-10">
                        {isPreOrderActive 
                          ? 'Pre-order now' 
                          : isReserveOrder 
                            ? 'Reserve order' 
                            : isAvailable ? 'Add to cart' : 'Sold Out'}
                      </span>
                    </button>
                  </div>
               </div>
            </div>

            {/* Product Desc - More refined */}
            <div className="pt-12 space-y-6">
               <div className="space-y-3">
                  <h4 className="text-[8px] uppercase font-bold tracking-[0.4em] text-muted">The Aesthetic</h4>
                  <p className="text-xs leading-relaxed font-serif italic text-muted max-w-lg">
                    "{product.description}"
                  </p>
               </div>
               
               <div className="flex gap-12 pt-4">
                  <div className="space-y-1">
                     <h5 className="text-[8px] uppercase font-bold tracking-widest text-muted">Wear Cycles</h5>
                     <p className="text-[9px] font-bold tracking-widest">15-20 Applications</p>
                  </div>
                  <div className="space-y-1">
                     <h5 className="text-[8px] uppercase font-bold tracking-widest text-muted">Grade</h5>
                     <p className="text-[9px] font-bold tracking-widest">Artisanal 5D Silk</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
