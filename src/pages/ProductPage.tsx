/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Share2, Info, ChevronLeft, Clock, ShieldCheck, Truck, Sparkles, Lock } from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';
import { ProductReviews } from '../components/ProductReviews';

interface ProductPageProps {
  productId: string;
  onBack: () => void;
  onCheckout: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ productId, onBack, onCheckout }) => {
  const { products, addToCart, dropExpiry, isDropActive, formatPrice, storeSettings, showcaseReviews } = useApp();
  const product = products.find(p => p.id === productId || p.slug === productId);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const variants = (product?.variants as any) || {};
  const colors: string[] = variants.colors || [];
  const sizes: string[] = variants.sizes || [];
  const styles: string[] = variants.styles || [];

  const [selectedColor, setSelectedColor] = useState<string | undefined>(variants.defaultColor || (colors.length > 0 ? colors[0] : undefined));
  const [selectedSize, setSelectedSize] = useState<string | undefined>(variants.defaultSize || (sizes.length > 0 ? sizes[0] : undefined));
  const [selectedStyle, setSelectedStyle] = useState<string | undefined>(variants.defaultStyle || (styles.length > 0 ? styles[0] : undefined));

  React.useEffect(() => {
    setSelectedColor(variants.defaultColor || (colors.length > 0 ? colors[0] : undefined));
    setSelectedSize(variants.defaultSize || (sizes.length > 0 ? sizes[0] : undefined));
    setSelectedStyle(variants.defaultStyle || (styles.length > 0 ? styles[0] : undefined));
  }, [productId, product, variants.defaultColor, variants.defaultSize, variants.defaultStyle, colors, sizes, styles]);

  if (!product) return null;

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const now = new Date();
  const preOrderEndsAt = product.preOrderEndsAt ? new Date(product.preOrderEndsAt) : null;
  const limitedTimeEndsAt = product.limitedTimeEndsAt ? new Date(product.limitedTimeEndsAt) : null;

  const isPreOrderActive = !!(product.preOrderEnabled && preOrderEndsAt && now < preOrderEndsAt);
  const isLimitedTimeActive = !!(product.limitedTimeEnabled && limitedTimeEndsAt && now < limitedTimeEndsAt && (!preOrderEndsAt || now > preOrderEndsAt));
  const isReserveOrder = !!(product.limitedTimeEnabled && limitedTimeEndsAt && now >= limitedTimeEndsAt);

  const currentPrice = (isPreOrderActive && product.preOrderPrice) 
    ? product.preOrderPrice 
    : (product.salePrice && product.salePrice < product.price ? product.salePrice : product.price);
  const isAvailable = isDropActive || isPreOrderActive || isLimitedTimeActive || isReserveOrder;

  const allVariantsSelected = 
    (!colors.length || selectedColor) &&
    (!sizes.length || selectedSize) &&
    (!styles.length || selectedStyle);

  const canAddToCart = isAvailable && allVariantsSelected;

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

        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-32 pb-32">
          
          {/* VISUALS: Simple Stack or Gallery */}
          <div className="space-y-8 order-4 lg:order-none">
            <motion.div 
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
                        ? 'opacity-100 ring-1 ring-gold/30 scale-[0.98]' 
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
                        className="absolute inset-x-0 bottom-0 h-1 bg-gold"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS: Rethought & Simplified */}
          <div className="mt-8 lg:mt-0 space-y-12 max-lg:contents">
            <div className="space-y-6 order-1 lg:order-none max-lg:mb-8">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                      <span>Aura Editorial</span>
                      <span className="w-1 h-1 bg-accent rounded-full" />
                      <span>Drop 001</span>
                    </div>
                    {isPreOrderActive ? (
                       <span className="bg-gold text-paper px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm w-fit">
                         Pre-order
                       </span>
                    ) : isReserveOrder ? (
                       <span className="bg-blue-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm w-fit">
                         Reserve Order
                       </span>
                    ) : isLimitedTimeActive ? (
                       <span 
                         className="text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm animate-pulse w-fit"
                         style={{ backgroundColor: storeSettings.colors.limitedTime }}
                       >
                         Limited Time
                       </span>
                    ) : null}
                  </div>
                  <h1 className="font-sans text-3xl lg:text-5xl font-bold tracking-tight text-ink">
                    {product.name}
                  </h1>
               </div>

                <div className="flex items-baseline gap-4 mt-2">
                   <span className="text-2xl font-bold tracking-tighter text-ink">
                     {formatPrice(currentPrice)}
                   </span>
                   {currentPrice < product.price && (
                     <span className="text-base text-muted/50 line-through font-bold">
                       {formatPrice(product.price)}
                     </span>
                   )}
                </div>
             </div>

             {/* Integrated Multi-Mode Timer Box */}
             <div 
               className="p-6 space-y-4 rounded-none shadow-none transition-colors duration-500 border-none order-2 lg:order-none max-lg:mb-8"
               style={{ 
                 backgroundColor: isPreOrderActive 
                   ? 'color-mix(in srgb, var(--preOrder) 10%, transparent)' 
                   : (isLimitedTimeActive ? 'color-mix(in srgb, var(--limitedTime) 8%, transparent)' : 'rgba(var(--accent-rgb), 0.05)')
               }}
             >
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em]">
                   <span 
                     style={{ 
                       color: isPreOrderActive 
                         ? 'var(--preOrder)' 
                         : (isLimitedTimeActive ? 'var(--limitedTime)' : 'var(--ink)')
                     }}
                   >
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

            <div className="space-y-10 order-5 lg:order-none max-lg:mt-8">
               {/* Variant Selectors */}
               {(colors.length > 0 || sizes.length > 0 || styles.length > 0) && (
                 <div className="space-y-8 pt-4">
                   {styles.length > 0 && (
                     <div className="space-y-3">
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Select Style</span>
                         <span className="text-[10px] font-medium tracking-[0.1em] text-accent/80 italic">{selectedStyle}</span>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {styles.map(styleOption => (
                           <button
                             key={styleOption}
                             onClick={() => setSelectedStyle(styleOption)}
                             className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-none border-none ${
                               selectedStyle === styleOption
                                 ? 'bg-ink text-paper shadow-md'
                                 : 'bg-accent/5 hover:bg-accent/10 text-ink opacity-70 hover:opacity-100'
                             }`}
                           >
                             {styleOption}
                           </button>
                         ))}
                       </div>
                     </div>
                   )}

                   {colors.length > 0 && (
                     <div className="space-y-3">
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Select Color</span>
                         <span className="text-[10px] font-medium tracking-[0.1em] text-accent/80 italic">{selectedColor}</span>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {colors.map(colorOption => (
                           <button
                             key={colorOption}
                             onClick={() => setSelectedColor(colorOption)}
                             className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-none border-none ${
                               selectedColor === colorOption
                                 ? 'bg-ink text-paper shadow-md'
                                 : 'bg-accent/5 hover:bg-accent/10 text-ink opacity-70 hover:opacity-100'
                             }`}
                           >
                             {colorOption}
                           </button>
                         ))}
                       </div>
                     </div>
                   )}

                   {sizes.length > 0 && (
                     <div className="space-y-3">
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Select Size</span>
                         <span className="text-[10px] font-medium tracking-[0.1em] text-accent/80 italic">{selectedSize}</span>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {sizes.map(sizeOption => (
                           <button
                             key={sizeOption}
                             onClick={() => setSelectedSize(sizeOption)}
                             className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-none border-none ${
                               selectedSize === sizeOption
                                 ? 'bg-ink text-paper shadow-md'
                                 : 'bg-accent/5 hover:bg-accent/10 text-ink opacity-70 hover:opacity-100'
                             }`}
                           >
                             {sizeOption}
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               )}

               {/* Action */}
               <div className="space-y-6 pt-6">
                  {/* Row 1: Quantity Selector */}
                  <div className="flex items-center justify-between p-4 bg-accent/5 rounded-none shadow-inner w-full border-none">
                     <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted border-none">Quantity</span>
                     <div className="flex items-center gap-6 font-bold text-sm border-none">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:opacity-40 transition-opacity p-1 border-none">－</button>
                        <span className="w-8 text-center text-xs font-extrabold border-none">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="hover:opacity-40 transition-opacity p-1 border-none">＋</button>
                     </div>
                  </div>

                  {/* Row 2: Add to Cart Button */}
                  <button 
                     disabled={!canAddToCart}
                     onClick={() => {
                       if (canAddToCart) {
                         addToCart(product, quantity, selectedColor, selectedSize, selectedStyle);
                         onCheckout();
                       }
                     }}
                     className={`w-full py-5 text-[10px] font-extrabold uppercase tracking-[0.4em] transition-all relative overflow-hidden group rounded-none shadow-xl ${
                       canAddToCart
                         ? 'bg-ink text-paper hover:bg-gold hover:text-ink shadow-lg shadow-gold/10' 
                         : 'bg-black/5 text-muted cursor-not-allowed'
                     }`}
                  >
                     <span className="relative z-10 border-none">
                       {!allVariantsSelected ? 'Select variant' :
                        isPreOrderActive 
                         ? 'Pre-order now' 
                         : isReserveOrder 
                           ? 'Reserve order' 
                           : isAvailable ? 'Add to cart' : 'Sold Out'}
                     </span>
                  </button>

                  {/* Trust & Payment Security Badges */}
                  <div className="pt-2 space-y-4 border-none">
                    {/* Security Message */}
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-[9px] font-extrabold uppercase tracking-[0.25em] text-muted border-none">
                      <Lock size={12} className="text-gold" />
                      <span>Guaranteed Safe & SSL Encrypted Checkout</span>
                    </div>

                    {/* Payment Logos Row */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-3 pt-0.5 border-none">
                      {/* Stripe */}
                      <img 
                        src="/images/stripe.png" 
                        alt="Stripe" 
                        className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 border-none" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      />

                      {/* PayPal */}
                      <img 
                        src="/images/paypal.png" 
                        alt="PayPal" 
                        className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 border-none" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      />

                      {/* Visa */}
                      <img 
                        src="/images/visa.png" 
                        alt="Visa" 
                        className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 border-none" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      />

                      {/* Mastercard */}
                      <img 
                        src="/images/mastercard.png" 
                        alt="Mastercard" 
                        className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 border-none" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      />

                      {/* Apple Pay */}
                      <img 
                        src="/images/applepay.png" 
                        alt="Apple Pay" 
                        className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 border-none" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      />

                      {/* Klarna */}
                      <img 
                        src="/images/klarna.png" 
                        alt="Klarna" 
                        className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 border-none" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      />
                    </div>

                    {/* Trust assurances info list */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1.5 text-[9px] font-bold uppercase tracking-widest text-muted/70 border-none">
                      <div className="flex items-center gap-1.5 border-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold border-none" />
                        <span>Instant Delivery</span>
                      </div>
                      <div className="flex items-center gap-1.5 border-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold border-none" />
                        <span>Buyer Protection</span>
                      </div>
                      <div className="flex items-center gap-1.5 border-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold border-none" />
                        <span>Verified Merchant</span>
                      </div>
                      <div className="flex items-center gap-1.5 border-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold border-none" />
                        <span>Zero Hidden Fees</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Product Desc - More refined */}
            <div className="pt-12 space-y-6 order-6 lg:order-none max-lg:mt-8">
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

        {/* Product Reviews */}
        <div className="pt-16 pb-8 border-t border-accent/10">
          <ProductReviews productId={product.id} />
        </div>

        {/* Customer Picture Showcase */}
        {showcaseReviews && showcaseReviews.length > 0 && (
          <div className="pt-16 pb-8">
             <div className="flex flex-col items-center mb-12 text-center">
               <h2 className="font-serif text-3xl md:text-4xl text-ink italic mb-4 tracking-tight">Customer Showcase</h2>
               <p className="text-[10px] text-muted uppercase tracking-[0.5em] font-bold opacity-80">Curated Looks</p>
             </div>
             {/* Mobile Carousel / Desktop Grid */}
             <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 md:pb-0 luxe-scrollbar md:grid md:grid-cols-4">
               {showcaseReviews.map((review, idx) => {
                 const imageUrl = review.imageUrl || review.image_url;
                 const linkUrl = review.destinationUrl || review.destination_url;
                 
                 const imageElement = (
                   <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.15, duration: 0.8 }}
                     viewport={{ once: true }}
                     className="group relative aspect-[3/4] overflow-hidden bg-accent/10 cursor-pointer h-full"
                   >
                      <img 
                        src={imageUrl} 
                        alt="Customer Showcase Selection" 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-ink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   </motion.div>
                 );

                 if (linkUrl) {
                   const isExternal = linkUrl.startsWith('http') || linkUrl.startsWith('//');
                   return (
                     <a 
                       key={review.id} 
                       href={linkUrl} 
                       target={isExternal ? "_blank" : undefined}
                       rel={isExternal ? "noopener noreferrer" : undefined}
                       className="block w-[75vw] flex-none snap-center md:w-auto md:flex-initial"
                     >
                       {imageElement}
                     </a>
                   );
                 }

                 return (
                   <div key={review.id} className="block w-[75vw] flex-none snap-center md:w-auto md:flex-initial">
                     {imageElement}
                   </div>
                 );
               })}
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
