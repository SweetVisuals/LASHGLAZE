/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, User, X, LogIn, Package, Shield, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onNavigate: () => void;
  onAdminClick: () => void;
  onCartClick: () => void;
  onTrackClick: () => void;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onAdminClick, onCartClick, onTrackClick, onProfileClick }) => {
  const { cart, isCustomerLoggedIn, loginCustomer, logoutCustomer, storeSettings, updateStoreSettings, user, isAdmin } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const currencies = [
    { symbol: '£', label: 'UK | GBP £' },
    { symbol: '€', label: 'Europe | EUR €' },
    { symbol: '$', label: 'USA | USD $' },
  ];

  const handleCurrencyChange = (symbol: string) => {
    updateStoreSettings({
      ...storeSettings,
      currency: symbol
    });
    setIsCurrencyMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[2000] bg-topbarBg text-topbarText">
      <div className="max-w-7xl mx-auto px-8 md:px-16 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8 lg:pl-10">
          <button 
            className="lg:hidden text-topbarText hover:opacity-70 transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-bold font-sans">
             <button onClick={onNavigate} className="hover:opacity-70 transition-colors relative group">
               SHOP
               <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-topbarText transition-all group-hover:w-full" />
             </button>
          </div>
        </div>

        <button 
          onClick={onNavigate}
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group"
        >
          <span className="font-serif text-2xl lg:text-3xl tracking-tight italic font-bold uppercase tracking-widest text-topbarText leading-none">Lash Glaze</span>
          <span className="text-[9px] tracking-[0.4em] font-bold mt-1 opacity-50 uppercase leading-none text-topbarText">Strip Lashes</span>
        </button>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="relative hidden lg:block">
            <button 
              onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
              className="text-[10px] uppercase font-bold tracking-[0.2em] text-topbarText flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              {currencies.find(c => c.symbol === storeSettings.currency)?.label.split('|')[1].trim() || 'GBP £'}
            </button>
            
            <AnimatePresence>
              {isCurrencyMenuOpen && (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute right-0 top-full mt-4 w-48 bg-topbarBg/95 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] z-[120] flex flex-col font-sans rounded-none overflow-hidden"
                >
                  {currencies.map((c) => (
                    <button 
                      key={c.symbol}
                      onClick={() => handleCurrencyChange(c.symbol)}
                      className={`px-5 py-3.5 text-[10px] uppercase tracking-widest text-left font-bold transition-all ${storeSettings.currency === c.symbol ? 'bg-topbarText/10 text-topbarText' : 'text-topbarText/60 hover:bg-topbarText/5 hover:text-topbarText'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            {isCustomerLoggedIn ? (
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-topbarText hover:opacity-70 transition-opacity flex items-center justify-center p-2"
              >
                <User size={20} />
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden lg:flex items-center gap-2 text-topbarText hover:opacity-70 transition-all text-[10px] uppercase font-bold tracking-widest px-6 py-2.5 bg-topbarText/5 rounded-none hover:bg-topbarText/10"
              >
                <LogIn size={14} /> Log in
              </button>
            )}

            
            {!isCustomerLoggedIn && (
               <button 
                 onClick={() => setIsAuthModalOpen(true)}
                 className="lg:hidden text-topbarText hover:opacity-70 transition-opacity flex items-center justify-center p-2"
               >
                 <User size={20} />
               </button>
            )}


            <AnimatePresence>
              {isUserMenuOpen && user && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full mt-4 w-72 bg-topbarBg/95 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] z-[2100] flex flex-col font-sans rounded-none overflow-hidden"
                >
                    <div className="p-8 border-b border-topbarText/5 bg-topbarText/5">
                      <p className="text-[10px] text-topbarText opacity-40 uppercase tracking-[0.4em] font-extrabold mb-1">
                        Active Identity
                      </p>
                      <p className="text-xs font-serif italic text-topbarText mb-1">
                        {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Aura Member'}
                      </p>
                      <p className="text-[9px] font-mono opacity-50 text-topbarText truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="flex flex-col p-2 gap-1">
                      <button onClick={() => { onProfileClick(); setIsUserMenuOpen(false); }} className="px-5 py-4 text-[11px] uppercase tracking-widest hover:bg-topbarText/10 text-left flex items-center justify-between font-bold text-topbarText transition-all group">
                        <span className="flex items-center gap-3"><User size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" /> My Profile</span>
                      </button>
                      <button onClick={() => { onTrackClick(); setIsUserMenuOpen(false); }} className="px-5 py-4 text-[11px] uppercase tracking-widest hover:bg-topbarText/10 text-left flex items-center justify-between font-bold text-topbarText transition-all group">
                        <span className="flex items-center gap-3"><Package size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" /> Order History</span>
                      </button>
                      {isAdmin && (
                        <button onClick={() => { onAdminClick(); setIsUserMenuOpen(false); }} className="px-5 py-4 text-[11px] uppercase tracking-widest bg-gold/10 hover:bg-gold/20 text-left flex items-center justify-between font-bold text-gold transition-all group mt-2">
                          <span className="flex items-center gap-3"><Shield size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" /> Go to Backend</span>
                          <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                    <div className="mt-auto border-t border-red-500/10 p-2">
                      <button onClick={logoutCustomer} className="w-full px-5 py-5 text-[11px] uppercase tracking-[0.4em] hover:bg-red-500/10 text-center font-black text-red-500/70 hover:text-red-500 transition-all">
                        Log Out
                      </button>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
            {isUserMenuOpen && <div className="fixed inset-0 z-[2050] bg-black/5" onClick={() => setIsUserMenuOpen(false)} />}
            {isCurrencyMenuOpen && <div className="fixed inset-0 z-[110]" onClick={() => setIsCurrencyMenuOpen(false)} />}
          </div>

          <button 
            onClick={onCartClick}
            className="relative text-topbarText hover:opacity-70 transition-opacity"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-none shadow-md">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-[200] bg-topbarBg p-8 lg:hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
               <div className="flex flex-col">
                  <span className="font-serif text-2xl text-topbarText italic font-bold uppercase tracking-widest leading-none">Lash Glaze</span>
                  <span className="text-[10px] tracking-[0.4em] font-bold opacity-40 uppercase leading-none mt-1 text-topbarText">Strip Lashes</span>
               </div>
               <button className="text-topbarText p-2 -mr-2 bg-topbarText/5 rounded-none" onClick={() => setIsMenuOpen(false)}><X size={20} /></button>
            </div>
            
            <nav className="flex flex-col gap-6 text-xl uppercase tracking-widest font-serif">
                <button 
                  onClick={() => { onNavigate(); setIsMenuOpen(false); }}
                  className="text-left text-topbarText hover:opacity-70 transition-colors py-4"
                >
                  Shop Lashes
                </button>
                {isCustomerLoggedIn ? (
                   <button 
                     onClick={() => { onTrackClick(); setIsMenuOpen(false); }}
                     className="text-left text-topbarText hover:opacity-70 transition-colors py-4"
                   >
                     My Orders
                   </button>
              ) : (
                 <button 
                   onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                   className="text-left text-topbarText hover:opacity-70 transition-colors py-4"
                 >
                   Sign In
                 </button>
              )}

                <button className="text-left text-topbarText hover:opacity-70 transition-colors py-4">Essentials</button>
                <button className="text-left text-topbarText hover:opacity-70 transition-colors py-4">Client Looks</button>
                <button className="text-left text-topbarText hover:opacity-70 transition-colors py-4">About Us</button>
            </nav>
            
            <div className="mt-auto pt-10 flex flex-col gap-6 text-xs uppercase tracking-widest font-bold text-topbarText/60">
               <div className="flex justify-between items-center bg-topbarText/5 p-4 rounded-none">
                  <span>Germany | EUR €</span>
                  <div className="w-1.5 h-1.5 bg-gold" />
               </div>
               {isAdmin && (
                 <button onClick={() => { onAdminClick(); setIsMenuOpen(false); }} className="text-center w-full py-5 bg-gold text-paper text-[10px] tracking-[0.2em] rounded-none shadow-xl">
                    GO TO BACKEND
                 </button>
               )}
               {isCustomerLoggedIn && (
                  <button onClick={() => { logoutCustomer(); setIsMenuOpen(false); }} className="text-center w-full py-4 text-ink text-[10px] tracking-[0.2em]">
                     Sign Out
                  </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
